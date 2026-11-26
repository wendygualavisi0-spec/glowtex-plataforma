# Script para configurar y subir GLOWTEX a GitHub
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "          CONFIGURACIÓN Y PUBLICACIÓN EN GITHUB - GLOWTEX" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Configurar identidad Git
$gitName = git config --global user.name
$gitEmail = git config --global user.email

if (-not $gitName) {
    Write-Host "[Paso 1/4] Identidad Git - Nombre no encontrado." -ForegroundColor Yellow
    $gitName = Read-Host "» Ingresa tu Nombre o Apodo"
    git config --global user.name "$gitName"
} else {
    Write-Host "[✓] Nombre Git configurado: $gitName" -ForegroundColor Green
}

if (-not $gitEmail) {
    Write-Host "[Paso 1/4] Identidad Git - Correo no encontrado." -ForegroundColor Yellow
    $gitEmail = Read-Host "» Ingresa tu Correo electrónico de GitHub"
    git config --global user.email "$gitEmail"
} else {
    Write-Host "[✓] Correo Git configurado: $gitEmail" -ForegroundColor Green
}

Write-Host ""
Write-Host "[Paso 2/4] Preparando archivos y confirmando cambios..." -ForegroundColor Yellow
git add .
git commit -m "Publicar plataforma GLOWTEX con ERP y CRM"
git branch -M main
Write-Host "[✓] Rama principal establecida en 'main'." -ForegroundColor Green

Write-Host ""
Write-Host "[Paso 3/4] Vinculación con GitHub" -ForegroundColor Yellow
Write-Host "(Asegúrate de haber creado el repositorio en https://github.com/new)" -ForegroundColor Gray
$ghUser = Read-Host "» Ingresa tu NOMBRE DE USUARIO de GitHub"
$ghRepo = Read-Host "» Nombre del repositorio [presiona ENTER para 'glowtex-plataforma']"
if ([string]::IsNullOrWhiteSpace($ghRepo)) {
    $ghRepo = "glowtex-plataforma"
}

$repoUrl = "https://github.com/$ghUser/$ghRepo.git"

git remote remove origin 2>$null
git remote add origin $repoUrl
Write-Host "[✓] Vinculado a: $repoUrl" -ForegroundColor Green

Write-Host ""
Write-Host "[Paso 4/4] Subiendo el código a GitHub..." -ForegroundColor Yellow
Write-Host "(Si es la primera vez, se abrirá tu navegador para autorizar la conexión con GitHub)" -ForegroundColor Gray
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "======================================================================" -ForegroundColor Green
    Write-Host "           ¡PROYECTO SUBIDO CON ÉXITO A GITHUB!" -ForegroundColor Green
    Write-Host "======================================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Para activar tu enlace público gratis:" -ForegroundColor Cyan
    Write-Host "1. Abre en tu navegador: https://github.com/$ghUser/$ghRepo/settings/pages"
    Write-Host "2. En 'Build and deployment' -> 'Source', selecciona: GitHub Actions"
    Write-Host "3. ¡Listo! Tu tienda y ERP estarán en línea en menos de un minuto."
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "[!] Revisa que el repositorio '$ghRepo' esté creado en GitHub y que hayas iniciado sesión." -ForegroundColor Red
}
