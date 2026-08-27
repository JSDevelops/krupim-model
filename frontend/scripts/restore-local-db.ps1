param(
  [Parameter(Mandatory = $true)]
  [string]$BackupFile,
  [string]$PostgresBin = 'C:\laragon\bin\postgresql\postgresql\bin',
  [string]$DatabaseName = 'krupim_local',
  [string]$UploadsArchive = '',
  [Parameter(Mandatory = $true)]
  [string]$ConfirmDatabase
)

$ErrorActionPreference = 'Stop'
if ($DatabaseName -notmatch '^[a-zA-Z0-9_]+$') {
  throw 'DatabaseName contains unsupported characters'
}
if ($ConfirmDatabase -cne $DatabaseName) {
  throw "Restore cancelled. ConfirmDatabase must exactly match '$DatabaseName'."
}

$backupPath = (Resolve-Path -LiteralPath $BackupFile).Path
if ([System.IO.Path]::GetExtension($backupPath) -ne '.dump') {
  throw 'BackupFile must be a .dump file created by db:backup'
}
$pgRestoreExe = Join-Path $PostgresBin 'pg_restore.exe'
$psqlExe = Join-Path $PostgresBin 'psql.exe'
if (-not (Test-Path -LiteralPath $pgRestoreExe -PathType Leaf)) { throw "pg_restore was not found at $pgRestoreExe" }
if (-not (Test-Path -LiteralPath $psqlExe -PathType Leaf)) { throw "psql was not found at $psqlExe" }

$exists = & $psqlExe -h 127.0.0.1 -p 5432 -U postgres -d postgres -w -tAc "SELECT 1 FROM pg_database WHERE datname='$DatabaseName'"
if ($exists -ne '1') { throw "Target database '$DatabaseName' does not exist. Run npm run db:setup first." }

Write-Host "Restoring $backupPath into $DatabaseName"
& $pgRestoreExe -h 127.0.0.1 -p 5432 -U postgres -w --clean --if-exists --no-owner --no-privileges --exit-on-error --dbname=$DatabaseName $backupPath
if ($LASTEXITCODE -ne 0) { throw 'PostgreSQL restore failed' }
Write-Host "Restore completed: $DatabaseName"

if (-not [string]::IsNullOrWhiteSpace($UploadsArchive)) {
  $archivePath = (Resolve-Path -LiteralPath $UploadsArchive).Path
  if (-not $archivePath.EndsWith('.uploads.zip', [System.StringComparison]::OrdinalIgnoreCase)) {
    throw 'UploadsArchive must be a .uploads.zip file created by db:backup'
  }
  $workspaceRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
  $uploadsDirectory = [System.IO.Path]::GetFullPath((Join-Path $workspaceRoot '.data\uploads'))
  if (-not $uploadsDirectory.StartsWith($workspaceRoot + [System.IO.Path]::DirectorySeparatorChar)) {
    throw 'Unsafe uploads restore target'
  }
  [System.IO.Directory]::CreateDirectory($uploadsDirectory) | Out-Null
  Expand-Archive -LiteralPath $archivePath -DestinationPath $uploadsDirectory -Force
  Write-Host "Upload files restored: $uploadsDirectory"
}
