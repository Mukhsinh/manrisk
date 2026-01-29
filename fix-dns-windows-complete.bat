@echo off
echo ========================================
echo FIX DNS WINDOWS - SOLUSI LOGIN ERROR
echo ========================================
echo.
echo Script ini akan:
echo 1. Ganti DNS ke Google DNS (8.8.8.8)
echo 2. Flush DNS cache
echo 3. Reset Winsock
echo 4. Renew IP address
echo.
echo PENTING: Jalankan sebagai Administrator!
echo.
pause

echo.
echo [1/5] Mendeteksi adapter jaringan...
echo.

REM Detect active network adapter
for /f "tokens=1,2,3*" %%i in ('netsh interface show interface ^| findstr /C:"Connected"') do (
    set "ADAPTER=%%l"
    echo Adapter ditemukan: %%l
)

if not defined ADAPTER (
    echo ERROR: Tidak dapat mendeteksi adapter jaringan aktif
    echo Silakan jalankan manual:
    echo   netsh interface ip set dns "Nama Adapter Anda" static 8.8.8.8
    pause
    exit /b 1
)

echo.
echo [2/5] Mengatur DNS ke Google DNS (8.8.8.8 dan 8.8.4.4)...
netsh interface ip set dns "%ADAPTER%" static 8.8.8.8
netsh interface ip add dns "%ADAPTER%" 8.8.4.4 index=2
echo DNS berhasil diubah!

echo.
echo [3/5] Flush DNS cache...
ipconfig /flushdns
ipconfig /registerdns
echo DNS cache berhasil di-flush!

echo.
echo [4/5] Reset Winsock...
netsh winsock reset
netsh int ip reset
echo Winsock berhasil di-reset!

echo.
echo [5/5] Renew IP address...
ipconfig /release
ipconfig /renew
echo IP address berhasil di-renew!

echo.
echo ========================================
echo SELESAI!
echo ========================================
echo.
echo Langkah selanjutnya:
echo 1. Restart browser Anda
echo 2. Clear browser cache (Ctrl + Shift + Delete)
echo 3. Akses aplikasi: http://localhost:3002
echo 4. Coba login lagi
echo.
echo Jika masih error, restart komputer Anda.
echo.
pause
