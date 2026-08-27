param(
  [string]$PostgresBin = 'C:\laragon\bin\postgresql\postgresql\bin',
  [string]$DatabaseName = 'krupim_local',
  [string]$OutputDirectory = ''
)

$ErrorActionPreference = 'Stop'
$pgDumpExe = Join-Path $PostgresBin 'pg_dump.exe'
if (-not (Test-Path -LiteralPath $pgDumpExe -PathType Leaf)) {
  throw "pg_dump was not found at $pgDumpExe"
}
if ($DatabaseName -notmatch '^[a-zA-Z0-9_]+$') {
  throw 'DatabaseName contains unsupported characters'
}

$workspaceRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
if ([string]::IsNullOrWhiteSpace($OutputDirectory)) {
  $backupDirectory = Join-Path $workspaceRoot 'backups'
} else {
  $backupDirectory = [System.IO.Path]::GetFullPath($OutputDirectory)
}
[System.IO.Directory]::CreateDirectory($backupDirectory) | Out-Null

$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$backupPath = Join-Path $backupDirectory "$DatabaseName-$timestamp.dump"
& $pgDumpExe -h 127.0.0.1 -p 5432 -U postgres -w --format=custom --compress=6 --no-owner --no-privileges --file=$backupPath $DatabaseName
if ($LASTEXITCODE -ne 0) {
  throw 'PostgreSQL backup failed'
}

$backup = Get-Item -LiteralPath $backupPath
Write-Host "Backup ready: $($backup.FullName)"
Write-Host "Size: $([math]::Round($backup.Length / 1MB, 2)) MB"

$uploadsDirectory = Join-Path $workspaceRoot '.data\uploads'
if ((Test-Path -LiteralPath $uploadsDirectory -PathType Container) -and (Get-ChildItem -LiteralPath $uploadsDirectory -File | Select-Object -First 1)) {
  $uploadsArchive = Join-Path $backupDirectory "$DatabaseName-$timestamp.uploads.zip"
  Compress-Archive -Path (Join-Path $uploadsDirectory '*') -DestinationPath $uploadsArchive -CompressionLevel Optimal
  $archive = Get-Item -LiteralPath $uploadsArchive
  Write-Host "Upload files backup: $($archive.FullName)"
  Write-Host "Upload size: $([math]::Round($archive.Length / 1MB, 2)) MB"
} else {
  Write-Host 'No local upload files to back up'
}
