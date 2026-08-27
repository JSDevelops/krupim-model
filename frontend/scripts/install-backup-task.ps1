param(
  [string]$TaskName = 'FINEModelLocalPostgresBackup',
  [ValidatePattern('^([01]\d|2[0-3]):[0-5]\d$')]
  [string]$DailyAt = '02:00'
)

$ErrorActionPreference = 'Stop'
$backupScript = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot 'backup-local-db.ps1')).Path
$powershellExe = Join-Path $PSHOME 'powershell.exe'
if (-not (Test-Path -LiteralPath $powershellExe -PathType Leaf)) {
  throw "PowerShell executable was not found at $powershellExe"
}

$timeParts = $DailyAt.Split(':')
$runAt = (Get-Date).Date.AddHours([int]$timeParts[0]).AddMinutes([int]$timeParts[1])
$arguments = "-NoProfile -ExecutionPolicy Bypass -File `"$backupScript`""
$action = New-ScheduledTaskAction -Execute $powershellExe -Argument $arguments -WorkingDirectory (Split-Path $backupScript -Parent)
$trigger = New-ScheduledTaskTrigger -Daily -At $runAt
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries

Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Settings $settings -Description 'Daily local PostgreSQL backup for FINE MODEL' -Force | Out-Null
Write-Host "Scheduled task ready: $TaskName (daily at $DailyAt)"
Write-Host "Backup script: $backupScript"
