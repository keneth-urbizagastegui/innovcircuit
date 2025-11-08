Add-Type -AssemblyName System.Drawing

# Crear bitmap 32x32 (por defecto con canal alfa)
$bmp = New-Object -TypeName System.Drawing.Bitmap -ArgumentList 32,32
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.Clear([System.Drawing.Color]::FromArgb(0,0,0,0))

$teal = [System.Drawing.ColorTranslator]::FromHtml('#0d9488')
$orange = [System.Drawing.ColorTranslator]::FromHtml('#f97316')
$white = [System.Drawing.ColorTranslator]::FromHtml('#ffffff')

$penTeal = New-Object System.Drawing.Pen($teal, 2)
$penTeal.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
$nodeBrushWhite = New-Object System.Drawing.SolidBrush($white)
$brushOrange = New-Object System.Drawing.SolidBrush($orange)

# Líneas estilo circuito
$g.DrawLine($penTeal, 6, 20, 14, 16)
$g.DrawLine($penTeal, 26, 20, 18, 16)
$g.DrawLine($penTeal, 16, 28, 16, 18)

# Nodos
$g.FillEllipse($nodeBrushWhite, 12, 14, 4, 4)
$g.FillEllipse($nodeBrushWhite, 18, 14, 4, 4)
$g.FillEllipse($nodeBrushWhite, 14, 24, 4, 4)

# Arco de bombilla y filamento
$g.DrawArc($penTeal, 8, 6, 16, 16, 200, 140)
$g.DrawLine($penTeal, 12, 14, 20, 14)

# Chispa naranja
$points = New-Object 'System.Drawing.Point[]' 3
$points[0] = New-Object System.Drawing.Point(22,6)
$points[1] = New-Object System.Drawing.Point(24,10)
$points[2] = New-Object System.Drawing.Point(20,10)
$g.FillPolygon($brushOrange, $points)

$dir = Join-Path $PSScriptRoot '..\frontend\public'
if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }
$path = Join-Path $dir 'favicon.png'
$bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)

$penTeal.Dispose()
$nodeBrushWhite.Dispose()
$brushOrange.Dispose()
$g.Dispose()
$bmp.Dispose()

Write-Host "Favicon generado en: $path"