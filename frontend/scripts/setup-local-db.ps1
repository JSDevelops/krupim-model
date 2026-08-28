param(
  [string]$PostgresBin = 'C:\laragon\bin\postgresql\postgresql\bin',
  [string]$DatabaseName = 'krupim_local'
)

$ErrorActionPreference = 'Stop'
$env:PGCLIENTENCODING = 'UTF8'
$psqlExe = Join-Path $PostgresBin 'psql.exe'
$createdbExe = Join-Path $PostgresBin 'createdb.exe'
$schemaPath = Join-Path $PSScriptRoot '..\database\schema.local.sql'
$localSeedPath = Join-Path $PSScriptRoot '..\database\seed.local.sql'
$migrationsPath = Join-Path $PSScriptRoot '..\database\migrations'

if (-not (Test-Path -LiteralPath $psqlExe)) {
  throw "PostgreSQL client not found at $psqlExe. Start/install PostgreSQL in Laragon or pass -PostgresBin."
}
if (-not (Test-Path -LiteralPath $schemaPath)) {
  throw "Schema not found at $schemaPath"
}
if (-not (Test-Path -LiteralPath $localSeedPath)) {
  throw "Local seed not found at $localSeedPath"
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

& $psqlExe -h 127.0.0.1 -U postgres -d $DatabaseName -w -v ON_ERROR_STOP=1 -f $localSeedPath
if ($LASTEXITCODE -ne 0) { throw 'Local seed failed' }

if (Test-Path -LiteralPath $migrationsPath -PathType Container) {
  $migrationFiles = Get-ChildItem -LiteralPath $migrationsPath -Filter '*.sql' -File | Sort-Object Name
  foreach ($migration in $migrationFiles) {
    if ($migration.Name -notmatch '^[0-9]{3}_[a-z0-9_-]+\.sql$') {
      throw "Invalid migration filename: $($migration.Name)"
    }
    $applied = & $psqlExe -h 127.0.0.1 -U postgres -d $DatabaseName -w -tAc "SELECT 1 FROM schema_migrations WHERE migration_name='$($migration.Name)'"
    if ($applied -eq '1') {
      Write-Host "Migration already applied: $($migration.Name)"
      continue
    }
    Write-Host "Applying migration: $($migration.Name)"
    & $psqlExe -h 127.0.0.1 -U postgres -d $DatabaseName -w -v ON_ERROR_STOP=1 -f $migration.FullName
    if ($LASTEXITCODE -ne 0) { throw "Migration failed: $($migration.Name)" }
    & $psqlExe -h 127.0.0.1 -U postgres -d $DatabaseName -w -v ON_ERROR_STOP=1 -c "INSERT INTO schema_migrations(migration_name) VALUES('$($migration.Name)')"
    if ($LASTEXITCODE -ne 0) { throw "Unable to record migration: $($migration.Name)" }
  }
}

Write-Host "Local PostgreSQL is ready: $DatabaseName"
