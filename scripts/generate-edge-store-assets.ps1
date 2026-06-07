$ErrorActionPreference = "Stop"

$Root = Resolve-Path (Join-Path $PSScriptRoot "..")
$AssetDir = Join-Path $Root "store-assets\edge"
New-Item -ItemType Directory -Force -Path $AssetDir | Out-Null

Add-Type -AssemblyName System.Drawing

function New-Canvas {
  param(
    [int]$Width,
    [int]$Height,
    [System.Drawing.Color]$Color
  )

  $Bitmap = New-Object System.Drawing.Bitmap $Width, $Height
  $Graphics = [System.Drawing.Graphics]::FromImage($Bitmap)
  $Graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $Graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $Graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $Graphics.Clear($Color)

  return @{ Bitmap = $Bitmap; Graphics = $Graphics }
}

function New-RoundedRectPath {
  param(
    [System.Drawing.RectangleF]$Rect,
    [float]$Radius
  )

  $PathObj = New-Object System.Drawing.Drawing2D.GraphicsPath
  $Diameter = [Math]::Min($Radius * 2, [Math]::Min($Rect.Width, $Rect.Height))
  $PathObj.AddArc($Rect.X, $Rect.Y, $Diameter, $Diameter, 180, 90)
  $PathObj.AddArc(($Rect.Right - $Diameter), $Rect.Y, $Diameter, $Diameter, 270, 90)
  $PathObj.AddArc(($Rect.Right - $Diameter), ($Rect.Bottom - $Diameter), $Diameter, $Diameter, 0, 90)
  $PathObj.AddArc($Rect.X, ($Rect.Bottom - $Diameter), $Diameter, $Diameter, 90, 90)
  $PathObj.CloseFigure()
  return $PathObj
}

function Draw-CenteredText {
  param(
    [System.Drawing.Graphics]$Graphics,
    [string]$Text,
    [float]$X,
    [float]$Y,
    [float]$Width,
    [float]$Height,
    [System.Drawing.Font]$Font,
    [System.Drawing.Brush]$Brush,
    [System.Drawing.StringAlignment]$Alignment = [System.Drawing.StringAlignment]::Center
  )

  $Format = New-Object System.Drawing.StringFormat
  $Format.Alignment = $Alignment
  $Format.LineAlignment = [System.Drawing.StringAlignment]::Center
  $Format.Trimming = [System.Drawing.StringTrimming]::EllipsisWord
  $Rect = New-Object System.Drawing.RectangleF $X, $Y, $Width, $Height
  $Graphics.DrawString($Text, $Font, $Brush, $Rect, $Format)
  $Format.Dispose()
}

function Draw-NoShortsMark {
  param(
    [System.Drawing.Graphics]$Graphics,
    [float]$X,
    [float]$Y,
    [float]$Size
  )

  $MainRed = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 255, 20, 16))
  $BlockPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(255, 232, 0, 0)), ([Math]::Max(3, $Size * 0.102))
  $BlockPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $BlockPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $BlockPen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
  $WhiteBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)

  $CenterX = $X + ($Size * 0.50)
  $CenterY = $Y + ($Size * 0.51)
  $IconRect = New-Object System.Drawing.RectangleF ($X + $Size * 0.315), ($Y + $Size * 0.225), ($Size * 0.39), ($Size * 0.56)
  $IconPath = New-RoundedRectPath -Rect $IconRect -Radius ($Size * 0.12)

  $Transform = $Graphics.Transform.Clone()
  $Graphics.TranslateTransform($CenterX, $CenterY)
  $Graphics.RotateTransform(-12)
  $Graphics.TranslateTransform(-$CenterX, -$CenterY)
  $Graphics.FillPath($MainRed, $IconPath)

  $Play = @(
    (New-Object System.Drawing.PointF ($X + $Size * 0.425), ($Y + $Size * 0.365)),
    (New-Object System.Drawing.PointF ($X + $Size * 0.425), ($Y + $Size * 0.655)),
    (New-Object System.Drawing.PointF ($X + $Size * 0.660), ($Y + $Size * 0.510))
  )
  $Graphics.FillPolygon($WhiteBrush, $Play)
  $Graphics.Transform = $Transform

  $RingInset = $Size * 0.085
  $RingRect = New-Object System.Drawing.RectangleF ($X + $RingInset), ($Y + $RingInset), ($Size - ($RingInset * 2)), ($Size - ($RingInset * 2))
  $Graphics.DrawEllipse($BlockPen, $RingRect)
  $Graphics.DrawLine($BlockPen, ($X + $Size * 0.235), ($Y + $Size * 0.235), ($X + $Size * 0.765), ($Y + $Size * 0.765))

  $MainRed.Dispose()
  $BlockPen.Dispose()
  $WhiteBrush.Dispose()
  $IconPath.Dispose()
  $Transform.Dispose()
}

function Save-Png {
  param(
    [System.Drawing.Bitmap]$Bitmap,
    [string]$Path
  )

  $Bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
}

$Transparent = [System.Drawing.Color]::Transparent
$OffWhite = [System.Drawing.Color]::FromArgb(255, 249, 250, 251)
$Text = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 24, 32, 47))
$Muted = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 95, 105, 121))
$Red = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 232, 0, 0))
$Panel = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
$LinePen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(255, 220, 226, 232)), 2

$Logo = New-Canvas -Width 300 -Height 300 -Color $Transparent
Draw-NoShortsMark -Graphics $Logo.Graphics -X 15 -Y 15 -Size 270
Save-Png -Bitmap $Logo.Bitmap -Path (Join-Path $AssetDir "edge-logo-300.png")
$Logo.Graphics.Dispose()
$Logo.Bitmap.Dispose()

$Small = New-Canvas -Width 440 -Height 280 -Color $OffWhite
Draw-NoShortsMark -Graphics $Small.Graphics -X 42 -Y 54 -Size 172
$TitleFont = New-Object System.Drawing.Font "Segoe UI", 34, ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
$SubtitleFont = New-Object System.Drawing.Font "Segoe UI", 17, ([System.Drawing.FontStyle]::Regular), ([System.Drawing.GraphicsUnit]::Pixel)
Draw-CenteredText -Graphics $Small.Graphics -Text "NoShorts" -X 222 -Y 78 -Width 170 -Height 44 -Font $TitleFont -Brush $Text -Alignment ([System.Drawing.StringAlignment]::Near)
Draw-CenteredText -Graphics $Small.Graphics -Text "YouTube sem Shorts" -X 222 -Y 124 -Width 190 -Height 34 -Font $SubtitleFont -Brush $Muted -Alignment ([System.Drawing.StringAlignment]::Near)
Draw-CenteredText -Graphics $Small.Graphics -Text "Filtro Videos automatico" -X 222 -Y 160 -Width 210 -Height 30 -Font $SubtitleFont -Brush $Red -Alignment ([System.Drawing.StringAlignment]::Near)
Save-Png -Bitmap $Small.Bitmap -Path (Join-Path $AssetDir "edge-small-tile-440x280.png")
$Small.Graphics.Dispose()
$Small.Bitmap.Dispose()

$Large = New-Canvas -Width 1400 -Height 560 -Color $OffWhite
Draw-NoShortsMark -Graphics $Large.Graphics -X 84 -Y 70 -Size 420
$BigTitle = New-Object System.Drawing.Font "Segoe UI", 76, ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
$BigSub = New-Object System.Drawing.Font "Segoe UI", 34, ([System.Drawing.FontStyle]::Regular), ([System.Drawing.GraphicsUnit]::Pixel)
$BigMeta = New-Object System.Drawing.Font "Segoe UI", 25, ([System.Drawing.FontStyle]::Regular), ([System.Drawing.GraphicsUnit]::Pixel)
Draw-CenteredText -Graphics $Large.Graphics -Text "NoShorts" -X 570 -Y 138 -Width 600 -Height 86 -Font $BigTitle -Brush $Text -Alignment ([System.Drawing.StringAlignment]::Near)
Draw-CenteredText -Graphics $Large.Graphics -Text "Remove Shorts do YouTube e mantem a busca em Videos." -X 574 -Y 240 -Width 680 -Height 96 -Font $BigSub -Brush $Muted -Alignment ([System.Drawing.StringAlignment]::Near)
Draw-CenteredText -Graphics $Large.Graphics -Text "Bloqueio direto  Limpeza dinamica  Sem coleta de dados" -X 578 -Y 366 -Width 760 -Height 44 -Font $BigMeta -Brush $Red -Alignment ([System.Drawing.StringAlignment]::Near)
Save-Png -Bitmap $Large.Bitmap -Path (Join-Path $AssetDir "edge-large-tile-1400x560.png")
$Large.Graphics.Dispose()
$Large.Bitmap.Dispose()

$Shot = New-Canvas -Width 1280 -Height 800 -Color $OffWhite
Draw-NoShortsMark -Graphics $Shot.Graphics -X 82 -Y 95 -Size 250
$ShotTitle = New-Object System.Drawing.Font "Segoe UI", 58, ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
$ShotSub = New-Object System.Drawing.Font "Segoe UI", 28, ([System.Drawing.FontStyle]::Regular), ([System.Drawing.GraphicsUnit]::Pixel)
Draw-CenteredText -Graphics $Shot.Graphics -Text "NoShorts" -X 380 -Y 128 -Width 520 -Height 70 -Font $ShotTitle -Brush $Text -Alignment ([System.Drawing.StringAlignment]::Near)
Draw-CenteredText -Graphics $Shot.Graphics -Text "Remove Shorts do YouTube em buscas, canais e paginas." -X 384 -Y 212 -Width 820 -Height 44 -Font $ShotSub -Brush $Muted -Alignment ([System.Drawing.StringAlignment]::Near)

$CardPath = New-RoundedRectPath -Rect (New-Object System.Drawing.RectangleF 384, 320, 820, 326) -Radius 18
$Shot.Graphics.FillPath($Panel, $CardPath)
$Shot.Graphics.DrawPath($LinePen, $CardPath)

$CardTitle = New-Object System.Drawing.Font "Segoe UI", 27, ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
$CardText = New-Object System.Drawing.Font "Segoe UI", 22, ([System.Drawing.FontStyle]::Regular), ([System.Drawing.GraphicsUnit]::Pixel)
Draw-CenteredText -Graphics $Shot.Graphics -Text "O que fica ativo" -X 430 -Y 350 -Width 360 -Height 36 -Font $CardTitle -Brush $Text -Alignment ([System.Drawing.StringAlignment]::Near)

$Items = @(
  "Bloqueia URLs /shorts e abas de canal",
  "Oculta cards, shelves e atalhos de Shorts",
  "Aplica automaticamente o filtro Videos na pesquisa",
  "Nao coleta dados pessoais"
)

$Y = 420
foreach ($Item in $Items) {
  $Shot.Graphics.FillEllipse($Red, 438, ($Y + 8), 14, 14)
  Draw-CenteredText -Graphics $Shot.Graphics -Text $Item -X 470 -Y $Y -Width 680 -Height 32 -Font $CardText -Brush $Text -Alignment ([System.Drawing.StringAlignment]::Near)
  $Y += 48
}

Save-Png -Bitmap $Shot.Bitmap -Path (Join-Path $AssetDir "edge-screenshot-1280x800.png")
$Shot.Graphics.Dispose()
$Shot.Bitmap.Dispose()
$CardPath.Dispose()

$TitleFont.Dispose()
$SubtitleFont.Dispose()
$BigTitle.Dispose()
$BigSub.Dispose()
$BigMeta.Dispose()
$ShotTitle.Dispose()
$ShotSub.Dispose()
$CardTitle.Dispose()
$CardText.Dispose()
$Text.Dispose()
$Muted.Dispose()
$Red.Dispose()
$Panel.Dispose()
$LinePen.Dispose()

Write-Host "Assets do Edge gerados em $AssetDir"
