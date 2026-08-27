param(
  [string]$BaseUrl = 'http://localhost:3000',
  [string]$MailpitUrl = 'http://127.0.0.1:8025'
)

$ErrorActionPreference = 'Stop'
$BaseUrl = $BaseUrl.TrimEnd('/')
$MailpitUrl = $MailpitUrl.TrimEnd('/')
$testIp = "10.$(Get-Random -Minimum 1 -Maximum 255).$(Get-Random -Minimum 1 -Maximum 255).$(Get-Random -Minimum 1 -Maximum 255)"
$headers = @{ 'X-Forwarded-For' = $testIp }
$adminSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$adminBody = @{ email = 'admin@local.test'; password = 'Admin123!'; selectedRole = 'developer' } | ConvertTo-Json
Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" -Method Post -ContentType 'application/json' -Headers $headers -Body $adminBody -WebSession $adminSession | Out-Null

$created = $null
$messageId = ''
try {
  $email = "mailpit-test-$([guid]::NewGuid().ToString('N').Substring(0, 10))@local.test"
  $accountBody = @{ name = 'Mailpit Test'; email = $email; password = 'Student12345!'; role = 'student'; status = 'active'; schoolName = 'Local Test' } | ConvertTo-Json
  $created = Invoke-RestMethod -Uri "$BaseUrl/api/admin/users" -Method Post -ContentType 'application/json' -Headers $headers -Body $accountBody -WebSession $adminSession
  $reset = Invoke-RestMethod -Uri "$BaseUrl/api/auth/password-reset" -Method Post -ContentType 'application/json' -Headers $headers -Body (@{ email = $email } | ConvertTo-Json)

  Start-Sleep -Milliseconds 300
  $query = [uri]::EscapeDataString("to:$email")
  $search = Invoke-RestMethod -Uri "$MailpitUrl/api/v1/search?query=$query&limit=1"
  $message = @($search.messages)[0]
  if (-not $message) { throw 'Mailpit did not receive password reset email' }
  $messageId = $message.ID
  $detail = Invoke-RestMethod -Uri "$MailpitUrl/api/v1/message/$messageId"
  $content = $detail.Text + $detail.HTML
  if ($reset.localResetToken) { throw 'SMTP mode exposed a local reset token' }
  if ($content -notmatch '/forgot-password#token=') { throw 'Password reset email does not contain a secure reset link' }
  Write-Host 'PASS Mailpit SMTP password reset delivery'
} finally {
  if ($messageId) {
    Invoke-RestMethod -Uri "$MailpitUrl/api/v1/messages" -Method Delete -ContentType 'application/json' -Body (@{ IDs = @($messageId) } | ConvertTo-Json) | Out-Null
  }
  if ($created -and $created.id) {
    Invoke-RestMethod -Uri "$BaseUrl/api/admin/users?id=$($created.id)" -Method Delete -Headers $headers -WebSession $adminSession | Out-Null
  }
}
