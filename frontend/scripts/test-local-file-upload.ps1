param([string]$BaseUrl = 'http://localhost:3000')

$ErrorActionPreference = 'Stop'
$BaseUrl = $BaseUrl.TrimEnd('/')
$headers = @{ 'X-Forwarded-For' = '10.45.45.45' }
$adminSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$adminBody = @{ email = 'admin@local.test'; password = 'Admin123!'; selectedRole = 'developer' } | ConvertTo-Json
Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" -Method Post -ContentType 'application/json' -Headers $headers -Body $adminBody -WebSession $adminSession | Out-Null

$teacher = $null
$student = $null
$storageName = ''
$classId = [guid]::NewGuid().ToString()
$assignmentId = [guid]::NewGuid().ToString()
$psql = 'C:\laragon\bin\postgresql\postgresql\bin\psql.exe'

try {
  $suffix = [guid]::NewGuid().ToString('N').Substring(0, 10)
  $teacherEmail = "upload-teacher-$suffix@local.test"
  $studentEmail = "upload-student-$suffix@local.test"
  $teacherBody = @{ name = 'Upload Teacher'; email = $teacherEmail; password = 'Teacher12345!'; role = 'teacher'; status = 'active'; schoolName = 'Local Test' } | ConvertTo-Json
  $studentBody = @{ name = 'Upload Student'; email = $studentEmail; password = 'Student12345!'; role = 'student'; status = 'active'; schoolName = 'Local Test' } | ConvertTo-Json
  $teacher = Invoke-RestMethod -Uri "$BaseUrl/api/admin/users" -Method Post -ContentType 'application/json' -Headers $headers -Body $teacherBody -WebSession $adminSession
  $student = Invoke-RestMethod -Uri "$BaseUrl/api/admin/users" -Method Post -ContentType 'application/json' -Headers $headers -Body $studentBody -WebSession $adminSession

  $sql = "INSERT INTO classes(id,teacher_id,name) VALUES('$classId','$($teacher.id)','Upload Test'); INSERT INTO class_students(class_id,student_id) VALUES('$classId','$($student.id)'); INSERT INTO assignments(id,class_id,teacher_id,title) VALUES('$assignmentId','$classId','$($teacher.id)','Upload Assignment');"
  & $psql -h 127.0.0.1 -U postgres -d krupim_local -w -v ON_ERROR_STOP=1 -c $sql | Out-Null
  if ($LASTEXITCODE -ne 0) { throw 'Unable to prepare upload test data' }

  $studentLoginBody = @{ email = $studentEmail; password = 'Student12345!'; selectedRole = 'student' } | ConvertTo-Json
  $studentLogin = Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" -Method Post -ContentType 'application/json' -Headers @{ 'X-Forwarded-For' = '10.45.45.46' } -Body $studentLoginBody
  $uploadJson = & curl.exe --silent --show-error --fail-with-body -H "Authorization: Bearer $($studentLogin.access_token)" -H 'X-Forwarded-For: 10.45.45.47' -F "assignmentId=$assignmentId" -F 'file=@README.md;type=text/plain' "$BaseUrl/api/student/files"
  if ($LASTEXITCODE -ne 0) { throw 'Upload request failed' }
  $upload = $uploadJson | ConvertFrom-Json

  $submissionBody = @{ assignmentId = $assignmentId; attachmentName = $upload.file.name; attachmentUrl = $upload.file.url } | ConvertTo-Json
  $submission = Invoke-WebRequest -Uri "$BaseUrl/api/student/assignments" -Method Post -ContentType 'application/json' -Headers @{ Authorization = "Bearer $($studentLogin.access_token)"; 'X-Forwarded-For' = '10.45.45.48' } -Body $submissionBody -UseBasicParsing
  $teacherLoginBody = @{ email = $teacherEmail; password = 'Teacher12345!'; selectedRole = 'teacher' } | ConvertTo-Json
  $teacherLogin = Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" -Method Post -ContentType 'application/json' -Headers @{ 'X-Forwarded-For' = '10.45.45.49' } -Body $teacherLoginBody
  $download = Invoke-WebRequest -Uri "$BaseUrl$($upload.file.url)" -Headers @{ Authorization = "Bearer $($teacherLogin.access_token)"; 'X-Forwarded-For' = '10.45.45.50' } -UseBasicParsing
  if ($submission.StatusCode -ne 201 -or $download.StatusCode -ne 200) { throw 'Upload workflow status mismatch' }

  $storageName = (& $psql -h 127.0.0.1 -U postgres -d krupim_local -w -tA -c "SELECT storage_name FROM stored_files WHERE id='$($upload.file.id)';").Trim()
  $uploadRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\.data\uploads'))
  $storedPath = [IO.Path]::GetFullPath((Join-Path $uploadRoot $storageName))
  if (-not $storedPath.StartsWith($uploadRoot + [IO.Path]::DirectorySeparatorChar)) { throw 'Unsafe upload test path' }
  Invoke-RestMethod -Uri "$BaseUrl/api/teacher/classes?type=class&classId=$classId" -Method Delete -Headers @{ Authorization = "Bearer $($teacherLogin.access_token)"; 'X-Forwarded-For' = '10.45.45.51' } | Out-Null
  if (Test-Path -LiteralPath $storedPath) { throw 'Class deletion did not remove its stored assignment file' }
  $storageName = ''
  Write-Host 'PASS local upload, teacher download, and class file cleanup'
} finally {
  & $psql -h 127.0.0.1 -U postgres -d krupim_local -w -c "DELETE FROM classes WHERE id='$classId';" | Out-Null
  if ($teacher -and $teacher.id) { Invoke-RestMethod -Uri "$BaseUrl/api/admin/users?id=$($teacher.id)" -Method Delete -Headers $headers -WebSession $adminSession | Out-Null }
  if ($student -and $student.id) { Invoke-RestMethod -Uri "$BaseUrl/api/admin/users?id=$($student.id)" -Method Delete -Headers $headers -WebSession $adminSession | Out-Null }
  if ($storageName -and $storageName -match '^[0-9a-f-]{36}\.[a-z0-9]{2,5}$') {
    $uploadRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\.data\uploads'))
    $target = [IO.Path]::GetFullPath((Join-Path $uploadRoot $storageName))
    if ($target.StartsWith($uploadRoot + [IO.Path]::DirectorySeparatorChar) -and (Test-Path -LiteralPath $target)) {
      Remove-Item -LiteralPath $target -Force
    }
  }
}
