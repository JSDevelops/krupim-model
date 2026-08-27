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

  $studentLoginBody = @{ email = $email; password = 'Student12345!'; selectedRole = 'student' } | ConvertTo-Json
  $studentLogin = Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" -Method Post -ContentType 'application/json' -Headers $headers -Body $studentLoginBody
  $studentHeaders = @{ Authorization = "Bearer $($studentLogin.access_token)"; 'X-Forwarded-For' = $testIp }
  $issued = Invoke-RestMethod -Uri "$BaseUrl/api/student/certificates" -Method Post -Headers $studentHeaders
  $certificate = $issued.certificate
  if (-not $certificate.id -or -not $certificate.certificateCode) { throw 'Certificate issue failed' }

  $revokeBody = @{ id = $certificate.id; action = 'revoke' } | ConvertTo-Json
  Invoke-RestMethod -Uri "$BaseUrl/api/admin/certificates" -Method Patch -ContentType 'application/json' -Headers $headers -Body $revokeBody -WebSession $adminSession | Out-Null
  $revoked = Invoke-RestMethod -Uri "$BaseUrl/api/certificates/$($certificate.certificateCode)" -Headers $headers
  if ($revoked.certificate.valid) { throw 'Revoked certificate still verifies as valid' }

  $restoreBody = @{ id = $certificate.id; action = 'restore' } | ConvertTo-Json
  Invoke-RestMethod -Uri "$BaseUrl/api/admin/certificates" -Method Patch -ContentType 'application/json' -Headers $headers -Body $restoreBody -WebSession $adminSession | Out-Null
  $restored = Invoke-RestMethod -Uri "$BaseUrl/api/certificates/$($certificate.certificateCode)" -Headers $headers
  if (-not $restored.certificate.valid) { throw 'Restored certificate does not verify as valid' }
  Write-Host 'PASS certificate issue, revoke, public verification, and restore'
} finally {
  if ($created -and $created.id) {
    Invoke-RestMethod -Uri "$BaseUrl/api/admin/users?id=$($created.id)" -Method Delete -Headers $headers -WebSession $adminSession | Out-Null
  }
}
