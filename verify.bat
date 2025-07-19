@echo off
echo ================================================
echo Script de verificacion para NestJS CRM Shopify
echo ================================================
echo.

REM Verificar Node.js
echo 1. Verificando Node.js...
where node >nul 2>nul
if %errorlevel% == 0 (
    for /f "tokens=*" %%i in ('node -v') do echo [OK] Node.js instalado: %%i
) else (
    echo [ERROR] Node.js no esta instalado. Por favor instalalo primero.
    pause
    exit /b 1
)

REM Verificar npm
echo.
echo 2. Verificando npm...
where npm >nul 2>nul
if %errorlevel% == 0 (
    for /f "tokens=*" %%i in ('npm -v') do echo [OK] npm instalado: %%i
) else (
    echo [ERROR] npm no esta instalado.
    pause
    exit /b 1
)

REM Verificar Docker
echo.
echo 3. Verificando Docker...
where docker >nul 2>nul
if %errorlevel% == 0 (
    for /f "tokens=*" %%i in ('docker -v') do echo [OK] Docker instalado: %%i
) else (
    echo [ADVERTENCIA] Docker no esta instalado (opcional para desarrollo local)
)

REM Verificar Git
echo.
echo 4. Verificando Git...
where git >nul 2>nul
if %errorlevel% == 0 (
    for /f "tokens=*" %%i in ('git --version') do echo [OK] Git instalado: %%i
) else (
    echo [ERROR] Git no esta instalado.
    pause
    exit /b 1
)

REM Verificar repositorio
echo.
echo 5. Verificando repositorio...
if exist ".git" (
    echo [OK] Repositorio Git configurado
    for /f "tokens=*" %%i in ('git config --get remote.origin.url') do echo     URL: %%i
) else (
    echo [ADVERTENCIA] No es un repositorio Git. Ejecuta:
    echo     git init
    echo     git remote add origin https://github.com/luiso2/crm-shopify.git
)

REM Verificar archivos necesarios
echo.
echo 6. Verificando archivos del proyecto...
if exist "package.json" (echo [OK] package.json existe) else (echo [ERROR] package.json no encontrado)
if exist "Dockerfile" (echo [OK] Dockerfile existe) else (echo [ERROR] Dockerfile no encontrado)
if exist "tsconfig.json" (echo [OK] tsconfig.json existe) else (echo [ERROR] tsconfig.json no encontrado)
if exist "src\main.ts" (echo [OK] src\main.ts existe) else (echo [ERROR] src\main.ts no encontrado)

echo.
echo ================================================
echo Proximos pasos:
echo ================================================
echo.
echo 1. Para desarrollo local:
echo    npm install
echo    npm run start:dev
echo.
echo 2. Para construir imagen Docker:
echo    docker build -t nestjs-crm .
echo    docker run -p 3000:3000 --env-file .env nestjs-crm
echo.
echo 3. Para desplegar en EasyPanel:
echo    - Ve a tu panel de EasyPanel
echo    - Crea un nuevo servicio tipo 'App'
echo    - Usa el repositorio: https://github.com/luiso2/crm-shopify.git
echo    - Configura las variables de entorno segun el archivo .env.example
echo.
echo Todo listo para comenzar!
echo.
pause
