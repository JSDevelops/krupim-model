param(
  [string]$PostgresBin = 'C:\laragon\bin\postgresql\postgresql\bin',
  [string]$DatabaseName = 'krupim_local'
)

$ErrorActionPreference = 'Stop'
$env:PGCLIENTENCODING = 'UTF8'
$psqlExe = Join-Path $PostgresBin 'psql.exe'
$createdbExe = Join-Path $PostgresBin 'createdb.exe'
$schemaPath = Join-Path $PSScriptRoot '..\database\schema.local.sql'

if (-not (Test-Path -LiteralPath $psqlExe)) {
  throw "PostgreSQL client not found at $psqlExe. Start/install PostgreSQL in Laragon or pass -PostgresBin."
}
if (-not (Test-Path -LiteralPath $schemaPath)) {
  throw "Schema not found at $schemaPath"
}

$ready = & (Join-Path $PostgresBin 'pg_isready.exe') -h 127.0.0.1 -p 5432
if ($LASTEXITCODE -ne 0) { throw "PostgreSQL is not ready: $ready" }

$exists = & $psqlExe -h 127.0.0.1 -U postgres -d postgres -w -tAc "SELECT 1 FROM pg_database WHERE datname='$DatabaseName'"
if ($exists -ne '1') {
  & $createdbExe -h 127.0.0.1 -U postgres -w -E UTF8 $DatabaseName
  if ($LASTEXITCODE -ne 0) { throw "Unable to create database $DatabaseName" }
}

& $psqlExe -h 127.0.0.1 -U postgres -d $DatabaseName -w -v ON_ERROR_STOP=1 -f $schemaPath
if ($LASTEXITCODE -ne 0) { throw 'Schema migration failed' }

Write-Host "Local PostgreSQL is ready: $DatabaseName"
