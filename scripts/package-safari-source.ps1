param(
  [string]$OutputDir = "dist"
)

$ErrorActionPreference = "Stop"

$Root = Resolve-Path (Join-Path $PSScriptRoot "..")
$ManifestPath = Join-Path $Root "manifest.json"
$Manifest = Get-Content -Path $ManifestPath -Raw | ConvertFrom-Json
$Version = $Manifest.version
$PackageName = "NoShorts-$Version-safari-source.zip"
$OutDir = Join-Path $Root $OutputDir
$Stage = Join-Path $OutDir "_safari_source_package"
$ZipPath = Join-Path $OutDir $PackageName

New-Item -ItemType Directory -Force -Path $OutDir | Out-Null
Remove-Item -Path $Stage -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path $ZipPath -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force -Path $Stage | Out-Null

$Items = @(
  "manifest.json",
  "src",
  "ui",
  "icons",
  "_locales"
)

foreach ($Item in $Items) {
  $Source = Join-Path $Root $Item
  $Destination = Join-Path $Stage $Item
  Copy-Item -Path $Source -Destination $Destination -Recurse -Force
}

$SafariManifestPath = Join-Path $Stage "manifest.json"
$SafariManifest = Get-Content -Path $SafariManifestPath -Raw | ConvertFrom-Json
$SafariManifest.PSObject.Properties.Remove("minimum_chrome_version")
$SafariManifest | Add-Member -NotePropertyName "browser_specific_settings" -NotePropertyValue @{
  safari = @{
    strict_min_version = "17.0"
  }
} -Force

$SafariManifest |
  ConvertTo-Json -Depth 20 |
  Set-Content -Path $SafariManifestPath -Encoding UTF8

Compress-Archive -Path (Join-Path $Stage "*") -DestinationPath $ZipPath -CompressionLevel Optimal
Remove-Item -Path $Stage -Recurse -Force

Write-Host "Pacote fonte Safari criado: $ZipPath"
