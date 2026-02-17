$php = "C:\Users\User\AppData\Local\Microsoft\WinGet\Packages\PHP.PHP.8.3_Microsoft.Winget.Source_8wekyb3d8bbwe\php.exe"
$composer = "C:\Users\User\AppData\Local\Programs\composer"
$apiDir = "C:\Users\User\Desktop\TrotinetteApp\trotinette-api"

Set-Location $apiDir

Write-Host "=== Installing laravel/sanctum ==="
& $php $composer require "laravel/sanctum" --no-interaction
Write-Host "sanctum install exit: $LASTEXITCODE"

Write-Host "=== Publishing Sanctum config ==="
& $php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
Write-Host "publish exit: $LASTEXITCODE"

Write-Host "=== Done ==="
