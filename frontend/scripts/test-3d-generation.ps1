param([string]$BaseUrl = 'http://localhost:3000')

$ErrorActionPreference = 'Stop'
$BaseUrl = $BaseUrl.TrimEnd('/')
$headers = @{ 'X-Forwarded-For' = "10.$(Get-Random -Minimum 1 -Maximum 255).$(Get-Random -Minimum 1 -Maximum 255).$(Get-Random -Minimum 1 -Maximum 255)" }
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$login = @{ email = 'admin@local.test'; password = 'Admin123!'; selectedRole = 'developer' } | ConvertTo-Json
Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" -Method Post -ContentType 'application/json' -Headers $headers -Body $login -WebSession $session | Out-Null

$settings = Invoke-RestMethod -Uri "$BaseUrl/api/admin/tripo-settings" -Headers $headers -WebSession $session
if (-not $settings.modelVersions -or $settings.modelVersions.Count -lt 1) { throw 'Tripo model versions are unavailable' }
if ($settings.setting.keyConfigured) {
  Write-Host 'PASS Tripo settings and model-version API (generation skipped to avoid consuming external credits)'
  exit 0
}

$job = $null
try {
  $suffix = [guid]::NewGuid().ToString('N').Substring(0, 8)
  $body = @{
    nameEn = "Preview Cup $suffix"
    nameTh = "ถ้วยตัวอย่าง $suffix"
    prompt = 'A simple white ceramic coffee cup, isolated object, clean topology'
    negativePrompt = 'text, watermark, blurry'
    description = 'Automated local 3D workflow test'
  } | ConvertTo-Json
  $created = Invoke-RestMethod -Uri "$BaseUrl/api/3d/generate" -Method Post -ContentType 'application/json' -Headers $headers -Body $body -WebSession $session
  $job = $created.job
  if (-not $job.id -or -not $job.arItemId -or $job.status -ne 'preview' -or -not $job.glbUrl) { throw 'Development preview job was not persisted correctly' }
  $listed = Invoke-RestMethod -Uri "$BaseUrl/api/3d/generate" -Headers $headers -WebSession $session
  if (-not ($listed.jobs | Where-Object { $_.id -eq $job.id })) { throw 'Generated model job is missing from job history' }
  Write-Host 'PASS Tripo settings, generation persistence, AR item creation, and job history'
} finally {
  if ($job -and $job.id -match '^[0-9a-f-]{36}$' -and $job.arItemId -match '^ar-[0-9a-f-]{36}$') {
    $psql = 'C:\laragon\bin\postgresql\postgresql\bin\psql.exe'
    $sql = "DELETE FROM model_generation_jobs WHERE id='$($job.id)'::uuid; DELETE FROM ar_items WHERE id='$($job.arItemId)';"
    & $psql -h 127.0.0.1 -U postgres -d krupim_local -w -v ON_ERROR_STOP=1 -c $sql | Out-Null
  }
}
