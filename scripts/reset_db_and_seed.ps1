# reset_db_and_seed.ps1
# Script para reiniciar el entorno Docker, borrar la base de datos y volver a sembrar los datos (Seed).
#
# Uso:
#   Desde la terminal (PowerShell), en la raíz del proyecto:
#   .\scripts\reset_db_and_seed.ps1
#

Write-Host "Apagando contenedores..." -ForegroundColor Yellow

# Detiene los contenedores y elimina los volúmenes asociados (-v)
# Esto borrará los datos de PostgreSQL almacenados en el volumen 'postgres_data'.
docker compose down -v

# Instrucciones adicionales si el volumen no se borra automáticamente con -v
# (Esto puede pasar si el volumen fue creado externamente o tiene otro nombre)
Write-Host "Nota: El comando 'docker compose down -v' intenta borrar los volúmenes." -ForegroundColor Cyan
Write-Host "Si persisten datos antiguos, elimina manualmente el volumen con: docker volume rm postgres_data" -ForegroundColor Cyan

Write-Host "Arrancando contenedores..." -ForegroundColor Green

# Levanta los servicios en segundo plano y reconstruye si es necesario
docker compose up -d --build

Write-Host "Seeder ejecutado, datos de prueba listos." -ForegroundColor Green
Write-Host "El backend inicializará la base de datos y ejecutará DataSeeder. Puede tardar unos segundos." -ForegroundColor Gray
