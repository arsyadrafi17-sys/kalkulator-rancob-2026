@echo off
title Build Kalkulator Rancob by.M.A.R ke File .EXE
echo ========================================================
echo   MENGEMAS KALKULATOR RANCOB by.M.A.R KE FILE .EXE
echo ========================================================
echo.

echo 1. Memeriksa dan menginstal PyInstaller serta dependensi...
pip install pyinstaller streamlit pandas numpy scipy statsmodels openpyxl

echo.
echo 2. Memulai proses kompilasi PyInstaller...
pyinstaller --noconfirm --onedir --windowed ^
    --add-data "app.py;." ^
    --copy-metadata streamlit ^
    --copy-metadata statsmodels ^
    --name "Kalkulator_Rancob_by_MAR" ^
    run_app.py

echo.
echo ========================================================
echo   SELESAI!
echo   File aplikasi .exe siap di folder:
echo   dist\Kalkulator_Rancob_by_MAR\Kalkulator_Rancob_by_MAR.exe
echo ========================================================
pause
