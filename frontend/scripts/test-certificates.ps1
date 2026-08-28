param([string]$BaseUrl = 'http://localhost:3000')

$ErrorActionPreference = 'Stop'
$BaseUrl = $BaseUrl.TrimEnd('/')
$testIp = "10.$(Get-Random -Minimum 1 -Maximum 255).$(Get-Random -Minimum 1 -Maximum 255).$(Get-Random -Minimum 1 -Maximum 255)"
$headers = @{ 'X-Forwarded-For' = $testIp }
$adminSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$adminBody = @{ email = 'admin@local.test'; password = 'Admin123!'; selectedRole = 'developer' } | ConvertTo-Json
Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" -Method Post -ContentType 'application/json' -Headers $headers -Body $adminBody -WebSession $adminSession | Out-Null

$created = $null
try {
  $email = "certificate-test-$([guid]::NewGuid().ToString('N').Substring(0, 10))@local.test"
  $accountBody = @{ name = 'Certificate Test'; email = $email; password = 'Student12345!'; role = 'student'; status = 'active'; schoolName = 'Local Test' } | ConvertTo-Json
  $created = Invoke-RestMethod -Uri "$BaseUrl/api/admin/users" -Method Post -ContentType 'application/json' -Headers $headers -Body $accountBody -WebSession $adminSession
  $psql = 'C:\laragon\bin\postgresql\postgresql\bin\psql.exe'
  $sql = "INSERT INTO learning_analytics(student_id,date,knowledge_score,skills_score,attitude_score,competency_score,overall_score) VALUES ('$($created.id)',CURRENT_DATE,80,82,84,86,84) ON CONFLICT (student_id,course_id,date) DO NOTHING;"
  & $psql -h 127.0.0.1 -U postgres -d krupim_local -w -v ON_ERROR_STOP=1 -c $sql | Out-Null
  if ($LASTEXITCODE -ne 0) { throw 'Unable to create certificate test analytics' }

  $issueBody = @{ studentId = $created.id; action = 'issue' } | ConvertTo-Json
  $issued = Invoke-RestMethod -Uri "$BaseUrl/api/admin/certificates" -Method Post -ContentType 'application/json' -Headers $headers -Body $issueBody -WebSession $adminSession
  $certificate = $issued.certificate
  if (-not $certificate.id -or -not $certificate.certificateCode) { throw 'Certificate issue failed' }

  $oldCode = $certificate.certificateCode
  $reissueBody = @{ studentId = $created.id; action = 'reissue' } | ConvertTo-Json
  $reissued = Invoke-RestMethod -Uri "$BaseUrl/api/admin/certificates" -Method Post -ContentType 'application/json' -Headers $headers -Body $reissueBody -WebSession $adminSession
  $certificate = $reissued.certificate
  if (-not $certificate.certificateCode -or $certificate.certificateCode -eq $oldCode) { throw 'Certificate reissue did not rotate code' }

  $revokeBody = @{ id = $certificate.id; action = 'revoke' } | ConvertTo-Json
  Invoke-RestMethod -Uri "$BaseUrl/api/admin/certificates" -Method Patch -ContentType 'application/json' -Headers $headers -Body $revokeBody -WebSession $adminSession | Out-Null
  $revoked = Invoke-RestMethod -Uri "$BaseUrl/api/certificates/$($certificate.certificateCode)" -Headers $headers
  if ($revoked.certificate.valid) { throw 'Revoked certificate still verifies as valid' }

  $restoreBody = @{ id = $certificate.id; action = 'restore' } | ConvertTo-Json
  Invoke-RestMethod -Uri "$BaseUrl/api/admin/certificates" -Method Patch -ContentType 'application/json' -Headers $headers -Body $restoreBody -WebSession $adminSession | Out-Null
  $restored = Invoke-RestMethod -Uri "$BaseUrl/api/certificates/$($certificate.certificateCode)" -Headers $headers
  if (-not $restored.certificate.valid) { throw 'Restored certificate does not verify as valid' }
  $adminData = Invoke-RestMethod -Uri "$BaseUrl/api/admin/certificates" -Headers $headers -WebSession $adminSession
  $history = @($adminData.events | Where-Object { $_.certificateId -eq $certificate.id })
  if ($history.Count -lt 4) { throw "Certificate history incomplete: $($history.Count) event(s)" }
  Write-Host 'PASS admin certificate issue, reissue, revoke, public verification, restore, and history'
} finally {
  if ($created -and $created.id) {
    Invoke-RestMethod -Uri "$BaseUrl/api/admin/users?id=$($created.id)" -Method Delete -Headers $headers -WebSession $adminSession | Out-Null
  }
}
