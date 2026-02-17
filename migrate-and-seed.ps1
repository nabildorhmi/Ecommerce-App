$php = "C:\Users\User\AppData\Local\Microsoft\WinGet\Packages\PHP.PHP.8.3_Microsoft.Winget.Source_8wekyb3d8bbwe\php.exe"
$apiDir = "C:\Users\User\Desktop\TrotinetteApp\trotinette-api"

Set-Location $apiDir

Write-Host "=== Running migrate:fresh --seed ==="
& $php artisan migrate:fresh --seed --force 2>&1
Write-Host "migrate exit: $LASTEXITCODE"

Write-Host "=== Verifying roles in DB ==="
& $php artisan tinker --execute="echo \Spatie\Permission\Models\Role::all()->pluck('name', 'guard_name');" 2>&1
