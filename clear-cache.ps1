$php = "C:\Users\User\AppData\Local\Microsoft\WinGet\Packages\PHP.PHP.8.3_Microsoft.Winget.Source_8wekyb3d8bbwe\php.exe"
$apiDir = "C:\Users\User\Desktop\TrotinetteApp\trotinette-api"
Set-Location $apiDir
& $php artisan config:clear
& $php artisan cache:clear
& $php artisan route:clear
Write-Host "Done"
