$php = "C:\Users\User\AppData\Local\Microsoft\WinGet\Packages\PHP.PHP.8.3_Microsoft.Winget.Source_8wekyb3d8bbwe\php.exe"
$apiDir = "C:\Users\User\Desktop\TrotinetteApp\trotinette-api"

Set-Location $apiDir

Write-Host "=== Clearing caches ==="
& $php artisan config:clear 2>&1
& $php artisan cache:clear 2>&1

Write-Host "=== Running final migrate:fresh --seed ==="
& $php artisan migrate:fresh --seed --force 2>&1
Write-Host "migrate exit: $LASTEXITCODE"

Write-Host "=== Starting server ==="
$server = Start-Process $php -ArgumentList "artisan serve --port=8000" -PassThru -WindowStyle Hidden
Write-Host "Server PID: $($server.Id)"
Start-Sleep 3
Write-Host "Server ready"
