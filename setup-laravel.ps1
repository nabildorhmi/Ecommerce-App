$php = "C:\Users\User\AppData\Local\Microsoft\WinGet\Packages\PHP.PHP.8.3_Microsoft.Winget.Source_8wekyb3d8bbwe\php.exe"
$composer = "C:\Users\User\AppData\Local\Programs\composer"
$dest = "C:\Users\User\Desktop\TrotinetteApp\trotinette-api"

Write-Host "Creating Laravel project..."
& $php $composer create-project laravel/laravel $dest --no-interaction
Write-Host "Done: $LASTEXITCODE"
