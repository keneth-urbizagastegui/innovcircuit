param(
  [string]$Branch = "main"
)

Write-Host "==> Publicando documentación y pruebas Bruno" -ForegroundColor Cyan

# Verificar que 'git' está disponible
try {
  git --version | Out-Null
} catch {
  Write-Host "Error: 'git' no está disponible en el PATH. Instala Git o agrega 'git' al PATH." -ForegroundColor Red
  exit 1
}

# Ir al directorio raíz del repo si el script se ejecuta desde otra carpeta
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = Resolve-Path (Join-Path $ScriptDir "..")
Set-Location $RepoRoot

Write-Host "==> Staging de cambios (git add -A)" -ForegroundColor Cyan
git add -A

$commitMessage = @"
docs(api): añadir ejemplos de endpoints admin (GET/PUT/DELETE usuarios) y proveedor (PUT/DELETE diseños) en README

tests(bruno): agregar casos para
- Listar Usuarios
- Bloquear Usuario
- Eliminar Usuario
- Editar Diseño
- Eliminar Diseño
- Config 1 - Crear Diseño Pendiente
- Config 2 - Crear Diseño para Aprobar (limpieza de duplicado y token)
- Config 3 - Aprobar Diseño (placeholder)

chore(bruno): usar placeholders de tokens y eliminar token hardcodeado y duplicación en 'Config 2 - Crear Diseño para Aprobar.bru'
"@

Write-Host "==> Commit de cambios" -ForegroundColor Cyan
git commit -m $commitMessage
if ($LASTEXITCODE -ne 0) {
  Write-Host "Advertencia: No se realizó commit (posible falta de cambios nuevos)." -ForegroundColor Yellow
}

Write-Host "==> Push a rama '$Branch'" -ForegroundColor Cyan
git push origin $Branch
if ($LASTEXITCODE -ne 0) {
  Write-Host "Error: Falló el push. Revisa tus credenciales y permisos de la rama." -ForegroundColor Red
  exit 1
}

Write-Host "✔ Publicación completada." -ForegroundColor Green