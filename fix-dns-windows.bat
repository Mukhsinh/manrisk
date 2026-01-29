@echo off
echo ========================================
echo FIX DNS UNTUK SUPABASE CONNECTION
echo ========================================
echo.

echo Langkah 1: Flush DNS Cache...
ipconfig /flushdns
if %errorlevel% neq 0 (
    echo GAGAL: Tidak dapat flush DNS cache
    echo Jalankan script ini sebagai Administrator
    pause
    exit /b 1
)
echo BERHASIL: DNS cache telah di-flush
echo.

echo Langkah 2: Reset Winsock...
netsh winsock reset
if %errorlevel% neq 0 (
    echo GAGAL: Tidak dapat reset Winsock
    echo Jalankan script ini sebagai Administrator
    pause
    exit /b 1
)
echo BERHASIL: Winsock telah di-reset
echo.

echo Langkah 3: Reset IP Configuration...
netsh int ip reset
if %errorlevel% neq 0 (
    echo GAGAL: Tidak dapat reset IP configuration
    echo Jalankan script ini sebagai Administrator
    pause
    exit /b 1
)
echo BERHASIL: IP configuration telah di-reset
echo.

echo ========================================
echo SELESAI!
echo ========================================
echo.
echo LANGKAH SELANJUTNYA:
echo 1. Restart komputer Anda
echo 2. Ganti DNS server ke Google DNS (8.8.8.8) atau Cloudflare DNS (1.1.1.1)
echo    - Buka Network Settings (ncpa.cpl)
echo    - Klik kanan pada koneksi internet
echo    - Properties -^> IPv4 -^> Properties
echo    - Use the following DNS server addresses:
echo      * Preferred DNS: 8.8.8.8
echo      * Alternate DNS: 8.8.4.4
echo 3. Test koneksi: node test-supabase-connection.js
echo.
echo Tekan tombol apa saja untuk restart komputer...
pause
shutdown /r /t 30 /c "Restart untuk menerapkan perubahan DNS"
echo.
echo Restart akan dilakukan dalam 30 detik...
echo Tekan Ctrl+C untuk membatalkan
pause
