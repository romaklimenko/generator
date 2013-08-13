# todo: compile solution

$sitecore_path = "E:\Inetpub\wwwroot\generator"

# clean up
Get-ChildItem (Join-Path $sitecore_path "\Website\bin") -Include *Sitecore.Analytics.DataGenerator* -Recurse | ForEach ($_) {
    Remove-Item $_.FullName
}

Remove-Item (Join-Path $sitecore_path "\Website\sitecore modules\Shell\Sitecore.Analytics.DataGenerator") -Force -Recurse -ErrorAction SilentlyContinue

# copy files
xcopy ".\Website\bin" "$(Join-Path $sitecore_path "\Website\bin\")" /E /R 
xcopy ".\Website\sitecore modules\Shell\Sitecore.Analytics.DataGenerator" "$(Join-Path $sitecore_path "\Website\sitecore modules\Shell\Sitecore.Analytics.DataGenerator\")" /E /R 
