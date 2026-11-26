@echo off
chcp 65001 > nul
title Configurar y Subir GLOWTEX a GitHub
color 0b

echo ======================================================================
echo           CONFIGURACIÓN Y PUBLICACIÓN EN GITHUB - GLOWTEX
echo ======================================================================
echo.

:: 1. Verificar si git config ya tiene nombre y correo
for /f "tokens=*" %%i in ('git config --global user.name 2^>nul') do set GIT_NAME=%%i
for /f "tokens=*" %%i in ('git config --global user.email 2^>nul') do set GIT_EMAIL=%%i

if "%GIT_NAME%"=="" (
    echo [Paso 1/4] Configuración de identidad Git:
    set /p GIT_NAME="» Glowtex: "
    git config --global user.name "%GIT_NAME%"
) else (
    echo [✓] Nombre Git configurado: %GIT_NAME%
)

if "%GIT_EMAIL%"=="" (
    set /p GIT_EMAIL="» wendygualavisi0@gmail.com: "
    git config --global user.email "%GIT_EMAIL%"
) else (
    echo [✓] Correo Git configurado: %GIT_EMAIL%
)

echo.
echo [Paso 2/4] Preparando los archivos del proyecto...
git add .
git commit -m "Publicar plataforma GLOWTEX con ERP y CRM"
git branch -M main
echo [✓] Archivos confirmados en la rama principal (main).

echo.
echo [Paso 3/4] Conexión con tu repositorio en GitHub:
echo (Asegúrate de haber creado el repositorio vacío en https://github.com/new)
echo.
set /p GH_USER="» wendygualavisi0: "
set /p GH_REPO="» Nombre del repositorio [presiona ENTER para 'glowtex-plataforma']: "
if "%GH_REPO%"=="" set GH_REPO=glowtex-plataforma

set REPO_URL=https://github.com/%GH_USER%/%GH_REPO%.git

git remote remove origin > nul 2>&1
git remote add origin %REPO_URL%

echo.
echo [✓] Repositorio remoto vinculado: %REPO_URL%
echo.
echo [Paso 4/4] Subiendo el código a GitHub...
echo (Si es la primera vez, el sistema te pedirá autorizar tu cuenta en el navegador)
echo.
git push -u origin main

if %ERRORLEVEL% equ 0 (
    echo.
    echo ======================================================================
    echo           ¡PROYECTO SUBIDO CON ÉXITO A GITHUB!
    echo ======================================================================
    echo.
    echo Para activar tu link público gratis:
    echo 1. Entra a: https://github.com/%GH_USER%/%GH_REPO%/settings/pages
    echo 2. En 'Build and deployment' -^> 'Source', selecciona: GitHub Actions
    echo 3. Tu web se publicará automáticamente con link gratis permanente.
    echo.
) else (
    echo.
    echo [!] Hubo un aviso al subir. Verifica que el repositorio exista en tu
    echo     cuenta de GitHub y que hayas completado la autenticación.
    echo.
)

pause
