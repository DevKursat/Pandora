@echo off
TITLE Pandora Setup

ECHO Checking for Node.js...
node --version >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    ECHO Node.js not found. Please install it from https://nodejs.org/ and try again.
    pause
    exit /b
)

ECHO.
ECHO Checking for pnpm...
pnpm --version >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    ECHO pnpm not found. Attempting to install it globally using npm...
    ECHO This may require administrator privileges.
    npm install -g pnpm
) ELSE (
    ECHO pnpm is already installed.
)

ECHO.
ECHO Installing project dependencies...
pnpm install

ECHO.
ECHO ================================================
ECHO  Setup is complete!
ECHO  You can now close this window and run start.bat
ECHO ================================================
ECHO.
pause
