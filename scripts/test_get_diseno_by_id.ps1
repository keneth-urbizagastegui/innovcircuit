param(
  [int]$Id = 1,
  [string]$BaseUrl = "http://localhost:8080"
)

Write-Host "==> Fetching design by id = $Id (public)" -ForegroundColor Cyan
try {
  $resp = Invoke-RestMethod -Method Get -Uri "$BaseUrl/api/v1/disenos/$Id"
  Write-Host "OK: Design loaded" -ForegroundColor Green
  Write-Host ("Provider fields -> descripcionTienda='{0}', bannerUrl='{1}', sitioWebUrl='{2}'" -f $resp.proveedor.descripcionTienda, $resp.proveedor.bannerUrl, $resp.proveedor.sitioWebUrl)
  $resp | ConvertTo-Json -Depth 5
} catch {
  Write-Host "Fetch failed: $($_.Exception.Message)" -ForegroundColor Red
  if ($_.Exception.Response) {
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $errBody = $reader.ReadToEnd()
    Write-Host $errBody
  }
  exit 1
}