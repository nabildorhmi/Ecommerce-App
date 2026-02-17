$php = "C:\Users\User\AppData\Local\Microsoft\WinGet\Packages\PHP.PHP.8.3_Microsoft.Winget.Source_8wekyb3d8bbwe\php.exe"
$apiDir = "C:\Users\User\Desktop\TrotinetteApp\trotinette-api"
Set-Location $apiDir
& $php artisan tinker --execute="echo json_encode(\Spatie\Permission\Models\Role::all()->toArray());" 2>&1
