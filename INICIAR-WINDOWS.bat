@echo off
chcp 65001 >nul
title SENTINELA HMV
cd /d "%~dp0"
if not exist node_modules (
  echo Instalando dependencias do projeto...
  call npm install
  if errorlevel 1 (
    echo.
    echo Nao foi possivel instalar as dependencias. Verifique sua internet e se o Node.js esta instalado.
    pause
    exit /b 1
  )
)
echo.
echo Iniciando SENTINELA HMV em http://localhost:3000
start "" http://localhost:3000
call npm run demo
pause
