$Action = New-ScheduledTaskAction -Execute "python.exe" -Argument "manage.py publish_scheduled_jobs" -WorkingDirectory "$PSScriptRoot"
$Trigger = New-ScheduledTaskTrigger -Daily -At 9am
$Principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive
$Settings = New-ScheduledTaskSettingsSet
$Task = New-ScheduledTask -Action $Action -Principal $Principal -Trigger $Trigger -Settings $Settings
Register-ScheduledTask -TaskName "LifelineJobPublisher" -InputObject $Task

Write-Host "Successfully registered scheduled task 'LifelineJobPublisher' to run daily at 9am."
Write-Host "To test it, run: Start-ScheduledTask -TaskName 'LifelineJobPublisher'"
Read-Host -Prompt "Press Enter to exit"
