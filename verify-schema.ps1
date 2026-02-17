$php = "C:\Users\User\AppData\Local\Microsoft\WinGet\Packages\PHP.PHP.8.3_Microsoft.Winget.Source_8wekyb3d8bbwe\php.exe"
$apiDir = "C:\Users\User\Desktop\TrotinetteApp\trotinette-api"
Set-Location $apiDir

Write-Host "product_translations table:"
& $php artisan tinker --execute="echo Schema::hasTable('product_translations') ? 'EXISTS' : 'MISSING';"

Write-Host "product_translations columns:"
& $php artisan tinker --execute="echo json_encode(Schema::getColumnListing('product_translations'));"

Write-Host "delivery_zones table:"
& $php artisan tinker --execute="echo Schema::hasTable('delivery_zones') ? 'EXISTS' : 'MISSING';"

Write-Host "Roles:"
& $php artisan tinker --execute="echo json_encode(\Spatie\Permission\Models\Role::all(['name','guard_name'])->toArray());"
