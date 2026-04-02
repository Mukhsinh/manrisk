@echo off
echo ========================================
echo INSTALL DEPENDENCIES UNTUK PERBAIKAN
echo ========================================
echo.

echo [1/3] Installing exceljs...
call npm install exceljs

echo.
echo [2/3] Installing pdfkit...
call npm install pdfkit

echo.
echo [3/3] Verifying installation...
call npm list exceljs pdfkit

echo.
echo ========================================
echo INSTALLATION COMPLETE!
echo ========================================
echo.
echo Dependencies installed:
echo - exceljs (untuk Excel export)
echo - pdfkit (untuk PDF export)
echo.
echo Next steps:
echo 1. Test download di /risk-profile
echo 2. Update UI di /residual-risk
echo 3. Update UI di /kri
echo.
pause
