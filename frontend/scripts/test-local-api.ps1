param(
  [string]$BaseUrl = 'http://localhost:3000',
  [string]$AdminEmail = $(if ($env:KRUPIM_TEST_ADMIN_EMAIL) { $env:KRUPIM_TEST_ADMIN_EMAIL } else { 'admin@local.test' }),
  [string]$AdminPassword = $(if ($env:KRUPIM_TEST_ADMIN_PASSWORD) { $env:KRUPIM_TEST_ADMIN_PASSWORD } else { 'Admin123!' })
)

$ErrorActionPreference = 'Stop'
$BaseUrl = $BaseUrl.TrimEnd('/')
$testIp = "10.$(Get-Random -Minimum 1 -Maximum 255).$(Get-Random -Minimum 1 -Maximum 255).$(Get-Random -Minimum 1 -Maximum 255)"
$testHeaders = @{ 'X-Forwarded-For' = $testIp }
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$loginBody = @{ email = $AdminEmail; password = $AdminPassword; selectedRole = 'developer' } | ConvertTo-Json
$login = Invoke-WebRequest -Uri "$BaseUrl/api/auth/login" -Method POST -ContentType 'application/json' -Body $loginBody -WebSession $session -UseBasicParsing
if ([int]$login.StatusCode -ne 200) { throw 'Developer login smoke test failed' }

$paths = @(
  '/api/admin/system-settings',
  '/api/admin/audit-logs',
  '/api/admin/dashboard',
  '/api/teacher/dashboard',
  '/api/teacher/classes',
  '/api/teacher/lessons',
  '/api/teacher/assignments',
  '/api/teacher/vocabulary'
)
foreach ($path in $paths) {
  $response = Invoke-WebRequest -Uri "$BaseUrl$path" -WebSession $session -UseBasicParsing
  if ([int]$response.StatusCode -ne 200) { throw "API smoke test failed: $path" }
  Write-Host "PASS $path"
}

$requestBody = @{ email = 'nonexistent-smoke-test@local.invalid' } | ConvertTo-Json
$resetRequest = Invoke-WebRequest -Uri "$BaseUrl/api/auth/password-reset" -Method POST -ContentType 'application/json' -Headers $testHeaders -Body $requestBody -UseBasicParsing
if ([int]$resetRequest.StatusCode -ne 200) { throw 'Password reset privacy test failed' }

$invalidResetStatus = 0
try {
  $invalidBody = @{ token = ('x' * 40); newPassword = 'ValidPassword123' } | ConvertTo-Json
  Invoke-WebRequest -Uri "$BaseUrl/api/auth/password-reset" -Method PATCH -ContentType 'application/json' -Headers $testHeaders -Body $invalidBody -UseBasicParsing | Out-Null
  $invalidResetStatus = 200
} catch {
  $invalidResetStatus = [int]$_.Exception.Response.StatusCode
}
if ($invalidResetStatus -ne 400) { throw "Invalid password reset token returned $invalidResetStatus instead of 400" }
Write-Host 'PASS password-reset privacy and invalid-token checks'

$rateIp = "10.$(Get-Random -Minimum 1 -Maximum 255).$(Get-Random -Minimum 1 -Maximum 255).$(Get-Random -Minimum 1 -Maximum 255)"
$rateStatuses = @()
for ($attempt = 1; $attempt -le 9; $attempt++) {
  try {
    $badLoginBody = @{ email = 'rate-limit-test@local.invalid'; password = 'WrongPassword123!'; selectedRole = 'student' } | ConvertTo-Json
    Invoke-WebRequest -Uri "$BaseUrl/api/auth/login" -Method POST -ContentType 'application/json' -Headers @{ 'X-Forwarded-For' = $rateIp } -Body $badLoginBody -UseBasicParsing | Out-Null
    $rateStatuses += 200
  } catch {
    $rateStatuses += [int]$_.Exception.Response.StatusCode
  }
}
if ($rateStatuses[-1] -ne 429) { throw "Database rate limit returned $($rateStatuses[-1]) instead of 429" }
Write-Host 'PASS PostgreSQL-backed rate limiting'
Write-Host 'Local API smoke tests passed'
