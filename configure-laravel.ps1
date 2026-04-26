$php = "C:\Users\User\AppData\Local\Microsoft\WinGet\Packages\PHP.PHP.8.3_Microsoft.Winget.Source_8wekyb3d8bbwe\php.exe"
$apiDir = "C:\Users\User\Desktop\TrotinetteApp\trotinette-api"

Set-Location $apiDir

Write-Host "=== Publishing CORS config ==="
& $php artisan config:publish cors 2>&1
Write-Host "cors publish exit: $LASTEXITCODE"

Write-Host "=== Publishing Spatie permission config ==="
& $php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider" 2>&1
Write-Host "spatie publish exit: $LASTEXITCODE"

Write-Host "=== Done ==="
