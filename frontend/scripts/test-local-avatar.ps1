param([string]$BaseUrl = 'http://localhost:3000')

$ErrorActionPreference = 'Stop'
$BaseUrl = $BaseUrl.TrimEnd('/')
$headers = @{ 'X-Forwarded-For' = '10.46.46.46' }
$adminSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$adminBody = @{ email = 'admin@local.test'; password = 'Admin123!'; selectedRole = 'developer' } | ConvertTo-Json
Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" -Method Post -ContentType 'application/json' -Headers $headers -Body $adminBody -WebSession $adminSession | Out-Null

$created = $null
try {
  $suffix = [guid]::NewGuid().ToString('N').Substring(0, 10)
  $email = "avatar-test-$suffix@local.test"
  $accountBody = @{ name = 'Avatar Test'; email = $email; password = 'Student12345!'; role = 'student'; status = 'active'; schoolName = 'Local Test' } | ConvertTo-Json
  $created = Invoke-RestMethod -Uri "$BaseUrl/api/admin/users" -Method Post -ContentType 'application/json' -Headers $headers -Body $accountBody -WebSession $adminSession
  $loginBody = @{ email = $email; password = 'Student12345!'; selectedRole = 'student' } | ConvertTo-Json
  $studentSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession
  Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" -Method Post -ContentType 'application/json' -Headers @{ 'X-Forwarded-For' = '10.46.46.47' } -Body $loginBody -WebSession $studentSession | Out-Null
  $authHeaders = @{ 'X-Forwarded-For' = '10.46.46.48' }
  $dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII='

  $first = Invoke-RestMethod -Uri "$BaseUrl/api/profile/avatar" -Method Post -ContentType 'application/json' -Headers $authHeaders -Body (@{ dataUrl = $dataUrl } | ConvertTo-Json) -WebSession $studentSession
  $firstImage = Invoke-WebRequest -Uri "$BaseUrl$($first.avatarUrl)" -Headers $authHeaders -WebSession $studentSession -UseBasicParsing
  if ($firstImage.StatusCode -ne 200 -or -not $firstImage.Headers['Content-Type'].StartsWith('image/png')) { throw 'Avatar download failed' }

  $second = Invoke-RestMethod -Uri "$BaseUrl/api/profile/avatar" -Method Post -ContentType 'application/json' -Headers $authHeaders -Body (@{ dataUrl = $dataUrl } | ConvertTo-Json) -WebSession $studentSession
  $oldStatus = 0
  try { Invoke-WebRequest -Uri "$BaseUrl$($first.avatarUrl)" -Headers $authHeaders -WebSession $studentSession -UseBasicParsing | Out-Null; $oldStatus = 200 } catch { $oldStatus = [int]$_.Exception.Response.StatusCode }
  if ($oldStatus -ne 404) { throw "Replaced avatar returned $oldStatus instead of 404" }

  Invoke-RestMethod -Uri "$BaseUrl/api/profile/avatar" -Method Delete -Headers $authHeaders -WebSession $studentSession | Out-Null
  $removedStatus = 0
  try { Invoke-WebRequest -Uri "$BaseUrl$($second.avatarUrl)" -Headers $authHeaders -WebSession $studentSession -UseBasicParsing | Out-Null; $removedStatus = 200 } catch { $removedStatus = [int]$_.Exception.Response.StatusCode }
  if ($removedStatus -ne 404) { throw "Removed avatar returned $removedStatus instead of 404" }
  Write-Host 'PASS local avatar upload, replacement cleanup, and removal'
} finally {
  if ($created -and $created.id) { Invoke-RestMethod -Uri "$BaseUrl/api/admin/users?id=$($created.id)" -Method Delete -Headers $headers -WebSession $adminSession | Out-Null }
}
