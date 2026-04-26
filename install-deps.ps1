$php = "C:\Users\User\AppData\Local\Microsoft\WinGet\Packages\PHP.PHP.8.3_Microsoft.Winget.Source_8wekyb3d8bbwe\php.exe"
$composer = "C:\Users\User\AppData\Local\Programs\composer"
$apiDir = "C:\Users\User\Desktop\TrotinetteApp\trotinette-api"

Set-Location $apiDir

Write-Host "=== Installing Sanctum (install:api) ==="
& $php artisan install:api --no-interaction
Write-Host "install:api exit: $LASTEXITCODE"

Write-Host "=== Installing spatie/laravel-permission ==="
& $php $composer require "spatie/laravel-permission:^6" --no-interaction
Write-Host "spatie exit: $LASTEXITCODE"

Write-Host "=== Installing dev dependencies ==="
& $php $composer require --dev "laravel/pint" --no-interaction
Write-Host "pint exit: $LASTEXITCODE"

Write-Host "=== All dependencies installed ==="
