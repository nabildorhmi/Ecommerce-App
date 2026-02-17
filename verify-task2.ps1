$php = "C:\Users\User\AppData\Local\Microsoft\WinGet\Packages\PHP.PHP.8.3_Microsoft.Winget.Source_8wekyb3d8bbwe\php.exe"
$apiDir = "C:\Users\User\Desktop\TrotinetteApp\trotinette-api"

Set-Location $apiDir

Write-Host "=== Running migrate:fresh --seed ==="
& $php artisan migrate:fresh --seed --force
Write-Host "migrate exit: $LASTEXITCODE"

Write-Host "=== Verifying product_translations table ==="
& $php artisan tinker --execute="echo Schema::hasTable('product_translations') ? 'EXISTS' : 'MISSING';"

Write-Host "=== Verifying delivery_zones table ==="
& $php artisan tinker --execute="echo Schema::hasTable('delivery_zones') ? 'EXISTS' : 'MISSING';"

Write-Host "=== Starting dev server ==="
$server = Start-Process $php -ArgumentList "artisan serve --port=8000" -PassThru -WindowStyle Hidden
Write-Host "Server PID: $($server.Id)"
Start-Sleep 3
Write-Host "Server started"
Write-Host "Server PID: $($server.Id)" | Out-File -FilePath "$apiDir\.server-pid" -Encoding UTF8
