@echo off
REM Setup Environment Variables for PunchAI MCP Server (Windows)

echo ===================================================
echo  PunchAI MCP Server - Environment Setup (Windows)
echo ===================================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Error: Node.js is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org/
    exit /b 1
)

REM Check if .env file already exists
if exist ".env" (
    echo An .env file already exists.
    set /p OVERWRITE=Do you want to overwrite it? (y/N): 
    if /i not "%OVERWRITE%"=="y" (
        echo Setup cancelled. Existing .env file preserved.
        exit /b 0
    )
)

REM Server Configuration
echo.
echo Server Configuration
echo -------------------
set /p PORT=Port number (default: 3000): 
if "%PORT%"=="" set PORT=3000

set /p NODE_ENV=Node environment (production/development, default: production): 
if "%NODE_ENV%"=="" set NODE_ENV=production

REM Security Configuration
echo.
echo Security Configuration
echo ---------------------
echo API keys are used to authenticate clients connecting to your server.

set /p GENERATE_KEY=Generate a secure random API key? (Y/n): 
if /i not "%GENERATE_KEY%"=="n" (
    REM Generate a random API key (simplified version for Windows batch)
    set API_KEY=
    for /L %%i in (1,1,32) do call :APPEND_RANDOM
    echo.
    echo Generated API key: %API_KEY%
    
    set /p ADDITIONAL_KEYS=Add additional API keys? (comma-separated, leave blank for none): 
    if not "%ADDITIONAL_KEYS%"=="" (
        set API_KEYS=%API_KEY%,%ADDITIONAL_KEYS%
    ) else (
        set API_KEYS=%API_KEY%
    )
) else (
    set /p API_KEYS=Enter API keys (comma-separated): 
)

REM Database Configuration
echo.
echo Database Configuration
echo ---------------------
set /p DB_TYPE=Database type (sqlite/postgres, default: sqlite): 
if "%DB_TYPE%"=="" set DB_TYPE=sqlite

if /i "%DB_TYPE%"=="sqlite" (
    set /p DB_PATH=SQLite database path (default: data/data.db): 
    if "%DB_PATH%"=="" set DB_PATH=data/data.db
    
    REM Create the data directory if it doesn't exist
    for /F "tokens=1* delims=/" %%a in ("%DB_PATH%") do (
        if not exist "%%a" mkdir "%%a"
    )
) else if /i "%DB_TYPE%"=="postgres" (
    set /p PG_HOST=PostgreSQL host (default: localhost): 
    if "%PG_HOST%"=="" set PG_HOST=localhost
    
    set /p PG_PORT=PostgreSQL port (default: 5432): 
    if "%PG_PORT%"=="" set PG_PORT=5432
    
    set /p PG_USER=PostgreSQL username: 
    set /p PG_PASSWORD=PostgreSQL password: 
    set /p PG_DB=PostgreSQL database name: 
)

REM Rate Limiting Configuration
echo.
echo Rate Limiting Configuration
echo -------------------------
set /p RATE_LIMIT_MAX=Maximum requests per window (default: 100): 
if "%RATE_LIMIT_MAX%"=="" set RATE_LIMIT_MAX=100

set /p RATE_LIMIT_WINDOW=Window size in milliseconds (default: 900000 - 15 minutes): 
if "%RATE_LIMIT_WINDOW%"=="" set RATE_LIMIT_WINDOW=900000

REM Create the .env file
echo # Server Configuration > .env
echo PORT=%PORT% >> .env
echo NODE_ENV=%NODE_ENV% >> .env
echo. >> .env
echo # Security >> .env
echo # Comma-separated list of valid API keys >> .env
echo API_KEYS=%API_KEYS% >> .env
echo. >> .env
echo # Database Configuration >> .env

if /i "%DB_TYPE%"=="sqlite" (
    echo # For SQLite >> .env
    echo DB_PATH=%DB_PATH% >> .env
    echo. >> .env
    echo # For PostgreSQL (if using the PostgreSQL option) >> .env
    echo # DB_TYPE=postgres >> .env
    echo # POSTGRES_HOST=localhost >> .env
    echo # POSTGRES_PORT=5432 >> .env
    echo # POSTGRES_USER=punchai >> .env
    echo # POSTGRES_PASSWORD=your-secure-password >> .env
    echo # POSTGRES_DB=punchai >> .env
) else if /i "%DB_TYPE%"=="postgres" (
    echo # For SQLite >> .env
    echo # DB_PATH=data/data.db >> .env
    echo. >> .env
    echo # For PostgreSQL >> .env
    echo DB_TYPE=postgres >> .env
    echo POSTGRES_HOST=%PG_HOST% >> .env
    echo POSTGRES_PORT=%PG_PORT% >> .env
    echo POSTGRES_USER=%PG_USER% >> .env
    echo POSTGRES_PASSWORD=%PG_PASSWORD% >> .env
    echo POSTGRES_DB=%PG_DB% >> .env
)

echo. >> .env
echo # Rate Limiting >> .env
echo # Maximum number of requests per window >> .env
echo RATE_LIMIT_MAX=%RATE_LIMIT_MAX% >> .env
echo # Window size in milliseconds >> .env
echo RATE_LIMIT_WINDOW_MS=%RATE_LIMIT_WINDOW% >> .env

echo.
echo ✅ .env file created successfully!
echo File location: %CD%\.env

echo.
echo 🚀 Next steps:
echo 1. Review your .env file to ensure all settings are correct
echo 2. Start your server with: npm start
echo 3. Keep your API keys secure and share them only with authorized clients

exit /b 0

:APPEND_RANDOM
REM Generate a random hex character and append to API_KEY
set /a rand=%random% %% 16
if %rand% LSS 10 (
    set digit=%rand%
) else (
    if %rand%==10 set digit=a
    if %rand%==11 set digit=b
    if %rand%==12 set digit=c
    if %rand%==13 set digit=d
    if %rand%==14 set digit=e
    if %rand%==15 set digit=f
)
set API_KEY=%API_KEY%%digit%
goto :eof