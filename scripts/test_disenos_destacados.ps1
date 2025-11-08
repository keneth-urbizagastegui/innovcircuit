param(
  [string]$BaseUrl = "http://localhost:8080"
)

Write-Host "==> Fetching featured designs (public)" -ForegroundColor Cyan
try {
  $resp = Invoke-RestMethod -Method Get -Uri "$BaseUrl/api/v1/disenos/destacados"
  Write-Host "Got $($resp.Count) featured designs" -ForegroundColor Green
  $first = $resp | Select-Object -First 1
  if ($null -ne $first) {
    Write-Host ("First featured provider -> descripcionTienda='{0}', bannerUrl='{1}', sitioWebUrl='{2}'" -f $first.proveedor.descripcionTienda, $first.proveedor.bannerUrl, $first.proveedor.sitioWebUrl)
  }
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