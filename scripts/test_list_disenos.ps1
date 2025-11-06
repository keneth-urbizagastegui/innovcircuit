param(
  [string]$Email = "cliente@innovcircuit.com",
  [string]$Password = "password123",
  [string]$BaseUrl = "http://localhost:5173"
)

Write-Host "==> Logging in as $Email" -ForegroundColor Cyan
$loginBody = @{ email = $Email; password = $Password } | ConvertTo-Json
try {
  $loginResp = Invoke-RestMethod -Method Post -Uri "$BaseUrl/api/v1/auth/login" -Headers @{ 'Content-Type' = 'application/json' } -Body $loginBody
  Write-Host "Login OK" -ForegroundColor Green
} catch {
  Write-Host "Login failed: $($_.Exception.Message)" -ForegroundColor Red
  if ($_.Exception.Response) {
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $errBody = $reader.ReadToEnd()
    Write-Host $errBody
  }
  exit 1
}

$token = $loginResp.token
Write-Host "==> Fetching approved designs" -ForegroundColor Cyan
try {
  $disenos = Invoke-RestMethod -Method Get -Uri "$BaseUrl/api/v1/disenos" -Headers @{ 'Authorization' = "Bearer $token" }
  Write-Host "Got $($disenos.Count) designs:" -ForegroundColor Green
  $disenos | ForEach-Object {
    Write-Host ("- [{0}] {1} | imagenUrl: {2}" -f $_.id, $_.nombre, $_.imagenUrl)
  }
} catch {
  Write-Host "Fetch failed: $($_.Exception.Message)" -ForegroundColor Red
  if ($_.Exception.Response) {
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $errBody = $reader.ReadToEnd()
    Write-Host $errBody
  }
  exit 1
}