@echo off
chcp 65001 >nul
title DailyTrack - Spouštěč aplikace

cd /d "%~dp0"

echo ======================================================================
echo                     DailyTrack - Spouštěč aplikace
echo ======================================================================
echo.

:: 1. Kontrola, zda je Python nainstalován
where python >nul 2>nul
if %errorlevel% neq 0 (
    where py >nul 2>nul
    if %errorlevel% neq 0 (
        echo [CHYBA] Python nebyl na tomto pocitaci nalezen!
        echo.
        echo Pro beh aplikace je nutne mit nainstalovany Python (verze 3.10 nebo novejsi).
        echo 1. Stahnete instalator z: https://www.python.org/downloads/
        echo 2. Pri instalaci nezapomente zaskrtnout "Add Python to PATH" (Pridat Python do PATH).
        echo.
        pause
        exit /b 1
    )
    set PY_CMD=py
) else (
    set PY_CMD=python
)

:: 2. Kontrola a instalace potrebných balicku
echo Kontroluji potrebne balicky...
%PY_CMD% -c "import fastapi, uvicorn" >nul 2>nul
if %errorlevel% neq 0 (
    echo [INFO] Nektere knihovny nejsou nainstalovany. Probiha automaticka instalace...
    %PY_CMD% -m pip install -r requirements.txt
    if %errorlevel% neq 0 (
        echo [VAROVANI] Nastala chyba pri instalaci balicku. Zkousim pokracovat...
    ) else (
        echo [OK] Balicky byly uspesne nainstalovany!
    )
)

:: 3. Spusteni aplikace
echo.
echo Spoustim DailyTrack...
%PY_CMD% run.py

if %errorlevel% neq 0 (
    echo.
    echo [CHYBA] Aplikace skoncila s chybou.
    pause
)
