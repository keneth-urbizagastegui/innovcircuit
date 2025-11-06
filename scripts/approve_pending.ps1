param(
  [string]$Email = "admin@innovcircuit.com",
  [string]$Password = "password123",
  [string]$BaseUrl = "http://localhost:5173"
)

Write-Host "==> Login como ADMIN ($Email)" -ForegroundColor Cyan
$loginBody = @{ email = $Email; password = $Password } | ConvertTo-Json
try {
  $loginResp = Invoke-RestMethod -Method Post -Uri "$BaseUrl/api/v1/auth/login" -Headers @{ 'Content-Type' = 'application/json' } -Body $loginBody
  Write-Host "Login OK" -ForegroundColor Green
} catch {
  Write-Host "Login fallido: $($_.Exception.Message)" -ForegroundColor Red
  if ($_.Exception.Response) {
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $errBody = $reader.ReadToEnd()
    Write-Host $errBody
  }
  exit 1
}

$token = $loginResp.token

Write-Host "==> Obteniendo diseños PENDIENTES" -ForegroundColor Cyan
try {
  $pendientes = Invoke-RestMethod -Method Get -Uri "$BaseUrl/api/v1/admin/disenos/pendientes" -Headers @{ 'Authorization' = "Bearer $token" }
} catch {
  Write-Host "Error al listar pendientes: $($_.Exception.Message)" -ForegroundColor Red
  if ($_.Exception.Response) {
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $errBody = $reader.ReadToEnd()
    Write-Host $errBody
  }
  exit 1
}

if (-not $pendientes -or $pendientes.Count -eq 0) {
  Write-Host "No hay diseños pendientes para aprobar." -ForegroundColor Yellow
  exit 0
}

Write-Host "Se encontraron $($pendientes.Count) diseños pendientes:" -ForegroundColor Green
$pendientes | ForEach-Object {
  Write-Host ("- [{0}] {1} | proveedor: {2}" -f $_.id, $_.nombre, ($_.proveedor.nombre))
}

Write-Host "==> Aprobando diseños..." -ForegroundColor Cyan
$aprobados = @()
$fallidos = @()

foreach ($d in $pendientes) {
  try {
    $resp = Invoke-RestMethod -Method Post -Uri "$BaseUrl/api/v1/disenos/$($d.id)/aprobar" -Headers @{ 'Authorization' = "Bearer $token" }
    $aprobados += $resp.id
    Write-Host ("Aprobado: [{0}] {1}" -f $resp.id, $resp.nombre) -ForegroundColor Green
  } catch {
    $fallidos += $d.id
    Write-Host ("Fallo al aprobar [{0}] {1}: {2}" -f $d.id, $d.nombre, $_.Exception.Message) -ForegroundColor Red
  }
}

Write-Host "==> Resumen" -ForegroundColor Cyan
Write-Host ("Aprobados: {0}" -f ($aprobados -join ', ')) -ForegroundColor Green
if ($fallidos.Count -gt 0) {
  Write-Host ("Fallidos: {0}" -f ($fallidos -join ', ')) -ForegroundColor Red
}

Write-Host "==> Verificando catálogo (APROBADOS)" -ForegroundColor Cyan
try {
  $aprobadosList = Invoke-RestMethod -Method Get -Uri "$BaseUrl/api/v1/disenos" -Headers @{ 'Authorization' = "Bearer $token" }
  Write-Host "Catálogo contiene $($aprobadosList.Count) diseños aprobados." -ForegroundColor Green
  $aprobadosList | ForEach-Object {
    Write-Host ("- [{0}] {1} | estado: APROBADO | imagenUrl: {2}" -f $_.id, $_.nombre, $_.imagenUrl)
  }
} catch {
  Write-Host "Error al verificar catálogo: $($_.Exception.Message)" -ForegroundColor Red
}