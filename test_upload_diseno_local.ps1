Param(
  [string]$BackendUrl = 'http://localhost:8095'
)

Write-Host "== InnovCircuit: Test Subida de Diseño (multipart/form-data) ==" -ForegroundColor Cyan

# 1) Login como PROVEEDOR
$loginBody = @{ email = 'proveedor@innovcircuit.com'; password = 'password123' } | ConvertTo-Json
try {
  $loginResp = Invoke-RestMethod -Uri "$BackendUrl/api/v1/auth/login" -Method Post -ContentType 'application/json' -Body $loginBody
  $token = $loginResp.token
  Write-Host "Login OK, token obtenido." -ForegroundColor Green
} catch {
  Write-Host "Error en login: $($_.Exception.Message)" -ForegroundColor Red
  exit 1
}

# 2) Obtener categorías para elegir una válida
try {
  $cats = Invoke-RestMethod -Uri "$BackendUrl/api/v1/categorias" -Headers @{ Authorization = "Bearer $token" }
  if (-not $cats -or $cats.Count -eq 0) {
    Write-Host "No hay categorías disponibles." -ForegroundColor Yellow
    exit 1
  }
  $catId = $cats[0].id
  Write-Host "Usando categoriaId=$catId" -ForegroundColor Yellow
} catch {
  Write-Host "Error obteniendo categorías: $($_.Exception.Message)" -ForegroundColor Red
  exit 1
}

# 3) Preparar DTO y archivo
$dto = @{ nombre = 'Diseño subido por multipart'; descripcion = 'Prueba de subida desde script'; precio = 12.34; gratuito = $false; categoriaId = $catId } | ConvertTo-Json -Depth 5

# Usar un archivo existente en el repo como imagen de prueba (SVG)
$imagePath = Join-Path $PSScriptRoot 'frontend\public\vite.svg'
if (-not (Test-Path $imagePath)) {
  Write-Host "Archivo de prueba no encontrado: $imagePath" -ForegroundColor Red
  exit 1
}

# 4) Enviar multipart/form-data usando HttpClient (compatible con PowerShell 5)
try {
  # Asegurar que el ensamblado System.Net.Http esté cargado
  Add-Type -AssemblyName System.Net.Http -ErrorAction Stop
  $handler = New-Object System.Net.Http.HttpClientHandler
  $client = New-Object System.Net.Http.HttpClient($handler)
  $client.DefaultRequestHeaders.Authorization = New-Object System.Net.Http.Headers.AuthenticationHeaderValue('Bearer', $token)

  $content = New-Object System.Net.Http.MultipartFormDataContent

  # Parte JSON del DTO (como StringContent con media type application/json)
  $jsonPart = New-Object System.Net.Http.StringContent($dto, [System.Text.Encoding]::UTF8, 'application/json')
  $content.Add($jsonPart, 'disenoDTO')

  # Parte de archivo de imagen
  $fileStream = [System.IO.File]::OpenRead($imagePath)
  $fileContent = New-Object System.Net.Http.StreamContent($fileStream)
  $fileContent.Headers.ContentType = New-Object System.Net.Http.Headers.MediaTypeHeaderValue('image/svg+xml')
  $content.Add($fileContent, 'imagenFile', [System.IO.Path]::GetFileName($imagePath))

  # Parte de archivo de esquemático (.zip)
  $zipPath = Join-Path $PSScriptRoot 'test_schematic.zip'
  try {
    if (-not (Test-Path $zipPath)) {
      $tmpDir = Join-Path $PSScriptRoot 'tmp_schematic'
      if (-not (Test-Path $tmpDir)) { New-Item -ItemType Directory -Path $tmpDir | Out-Null }
      $tmpFile = Join-Path $tmpDir 'README.txt'
      Set-Content -Path $tmpFile -Value 'Archivo de prueba para esquematico.' -Encoding UTF8
      Compress-Archive -Path (Join-Path $tmpDir '*') -DestinationPath $zipPath -Force
    }
    $zipStream = [System.IO.File]::OpenRead($zipPath)
    $zipContent = New-Object System.Net.Http.StreamContent($zipStream)
    $zipContent.Headers.ContentType = New-Object System.Net.Http.Headers.MediaTypeHeaderValue('application/zip')
    $content.Add($zipContent, 'esquematicoFile', [System.IO.Path]::GetFileName($zipPath))
  } catch {
    Write-Host "No se pudo preparar el archivo zip de prueba: $($_.Exception.Message)" -ForegroundColor Yellow
  }

  $httpResponse = $client.PostAsync("$BackendUrl/api/v1/disenos", $content).Result
  $respBody = $httpResponse.Content.ReadAsStringAsync().Result
  if ($httpResponse.IsSuccessStatusCode) {
    $respObj = $respBody | ConvertFrom-Json
    Write-Host "Subida exitosa. ID=$($respObj.id) Nombre=$($respObj.nombre) ImagenUrl=$($respObj.imagenUrl) EsquematicoUrl=$($respObj.esquematicoUrl) Estado=$($respObj.estado)" -ForegroundColor Green
  } else {
    Write-Host "Error HTTP $($httpResponse.StatusCode): $respBody" -ForegroundColor Red
    exit 1
  }
} catch {
  Write-Host "Error al subir diseño: $($_.Exception.Message)" -ForegroundColor Red
  exit 1
}