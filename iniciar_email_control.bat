@echo off
chcp 65001 > nul
title IUS EMAIL CONTROL — Inicializador Corporativo

echo ============================================================
echo   IUS EMAIL CONTROL — Camada Operacional Gmail
echo   Inicializando estação de trabalho local...
echo ============================================================
echo.

:: 1. Verificar Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERRO] Node.js não foi encontrado neste computador.
    echo Por favor, solicite à TI a instalação do Node.js (versão 18 ou superior).
    echo Download: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: 2. Instalar dependências se necessário
if not exist "node_modules\" (
    echo [1/3] Instalando dependências necessárias...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERRO] Falha ao instalar dependências. Verifique a conexão com a internet.
        pause
        exit /b 1
    )
)

:: 3. Compilar interface e servidor se necessário
if not exist "dist\" (
    echo [2/3] Compilando interface de usuário e servidor interno...
    call npm run build:all
    if %errorlevel% neq 0 (
        echo [ERRO] Falha na compilação do sistema.
        pause
        exit /b 1
    )
) else if not exist "dist-server\" (
    echo [2/3] Compilando servidor interno...
    call npm run build:server
    if %errorlevel% neq 0 (
        echo [ERRO] Falha na compilação do servidor.
        pause
        exit /b 1
    )
)

:: 4. Abrir navegador automaticamente
echo [3/3] Abrindo o navegador padrão...
start http://localhost:1000

echo.
echo ============================================================
echo   EMAIL CONTROL está em execução na sua máquina!
echo   Endereço local: http://localhost:1000
echo.
echo   Para conectar:
echo   1. Na tela de entrada, clique em "Continuar com Google".
echo   2. Selecione sua conta corporativa já conectada no navegador.
echo   3. Seus e-mails e análises ficam salvos apenas neste PC.
echo.
echo   Mantenha esta janela aberta enquanto utiliza o sistema.
echo ============================================================
echo.

call npm start
pause
