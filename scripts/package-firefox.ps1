param(
  [string]$OutputDir = "dist"
)

$ErrorActionPreference = "Stop"

$Root = Resolve-Path (Join-Path $PSScriptRoot "..")
$ManifestPath = Join-Path $Root "manifest.json"
$Manifest = Get-Content -Path $ManifestPath -Raw | ConvertFrom-Json
$Version = $Manifest.version
$PackageName = "NoShorts-$Version-firefox.zip"
$OutDir = Join-Path $Root $OutputDir
$Stage = Join-Path $OutDir "_firefox_package"
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

$FirefoxManifestPath = Join-Path $Stage "manifest.json"
$FirefoxManifest = Get-Content -Path $FirefoxManifestPath -Raw | ConvertFrom-Json
$FirefoxManifest.PSObject.Properties.Remove("minimum_chrome_version")
$FirefoxManifest.background = @{
  scripts = @(
    "src/config.js",
    "src/background.js"
  )
}
$FirefoxManifest | Add-Member -NotePropertyName "browser_specific_settings" -NotePropertyValue @{
  gecko = @{
    id = "noshorts@murillo.dev"
    strict_min_version = "140.0"
    data_collection_permissions = @{
      required = @("none")
    }
  }
  gecko_android = @{
    strict_min_version = "142.0"
  }
} -Force

$FirefoxManifest |
  ConvertTo-Json -Depth 20 |
  Set-Content -Path $FirefoxManifestPath -Encoding UTF8

Compress-Archive -Path (Join-Path $Stage "*") -DestinationPath $ZipPath -CompressionLevel Optimal
Remove-Item -Path $Stage -Recurse -Force

Write-Host "Pacote Firefox criado: $ZipPath"
