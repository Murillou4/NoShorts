$ErrorActionPreference = "Stop"

$Root = Resolve-Path (Join-Path $PSScriptRoot "..")
$IconDir = Join-Path $Root "icons"
New-Item -ItemType Directory -Force -Path $IconDir | Out-Null

Add-Type -AssemblyName System.Drawing

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

function New-NoShortsIcon {
  param(
    [int]$Size,
    [string]$Path
  )

  $Bitmap = New-Object System.Drawing.Bitmap $Size, $Size
  $Graphics = [System.Drawing.Graphics]::FromImage($Bitmap)
  $Graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $Graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $Graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $Graphics.Clear([System.Drawing.Color]::Transparent)

  $MainRed = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 255, 20, 16))
  $BlockRed = [System.Drawing.Color]::FromArgb(255, 232, 0, 0)
  $BlockPen = New-Object System.Drawing.Pen $BlockRed, ([Math]::Max(2.4, $Size * 0.102))
  $BlockPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $BlockPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $BlockPen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
  $WhiteBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)

  $CenterX = $Size * 0.50
  $CenterY = $Size * 0.51

  $IconRect = New-Object System.Drawing.RectangleF ($Size * 0.315), ($Size * 0.225), ($Size * 0.39), ($Size * 0.56)
  $IconPath = New-RoundedRectPath -Rect $IconRect -Radius ($Size * 0.12)

  $Transform = $Graphics.Transform.Clone()
  $Graphics.TranslateTransform($CenterX, $CenterY)
  $Graphics.RotateTransform(-12)
  $Graphics.TranslateTransform(-$CenterX, -$CenterY)

  $Graphics.FillPath($MainRed, $IconPath)

  $Play = @(
    (New-Object System.Drawing.PointF ($Size * 0.425), ($Size * 0.365)),
    (New-Object System.Drawing.PointF ($Size * 0.425), ($Size * 0.655)),
    (New-Object System.Drawing.PointF ($Size * 0.660), ($Size * 0.510))
  )
  $Graphics.FillPolygon($WhiteBrush, $Play)
  $Graphics.Transform = $Transform

  $RingInset = $Size * 0.085
  $RingRect = New-Object System.Drawing.RectangleF $RingInset, $RingInset, ($Size - ($RingInset * 2)), ($Size - ($RingInset * 2))
  $Graphics.DrawEllipse($BlockPen, $RingRect)
  $Graphics.DrawLine($BlockPen, ($Size * 0.235), ($Size * 0.235), ($Size * 0.765), ($Size * 0.765))

  $Bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)

  $Graphics.Dispose()
  $Bitmap.Dispose()
  $MainRed.Dispose()
  $BlockPen.Dispose()
  $WhiteBrush.Dispose()
  $IconPath.Dispose()
  $Transform.Dispose()
}

foreach ($Size in @(16, 32, 48, 128)) {
  New-NoShortsIcon -Size $Size -Path (Join-Path $IconDir "icon$Size.png")
}

Write-Host "Ícones gerados em $IconDir"
