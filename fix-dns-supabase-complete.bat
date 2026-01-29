@echo off
echo ============================================================
echo FIX DNS UNTUK SUPABASE - SOLUSI LENGKAP
echo ============================================================
echo.

echo Langkah 1: Flush DNS Cache
ipconfig /flushdns
echo.

echo Langkah 2: Reset Winsock
netsh winsock reset
echo.

echo Langkah 3: Reset TCP/IP Stack
netsh int ip reset
echo.

echo Langkah 4: Ganti DNS ke Google DNS (8.8.8.8 dan 8.8.4.4)
echo.
echo Mencari adapter jaringan aktif...
for /f "tokens=3*" %%i in ('netsh interface show interface ^| findstr "Connected"') do (
    set adapter=%%i %%j
    echo.
    echo Mengatur DNS untuk: !adapter!
    netsh interface ip set dns name="!adapter!" static 8.8.8.8
    netsh interface ip add dns name="!adapter!" 8.8.4.4 index=2
)
echo.

echo Langkah 5: Registrasi ulang DNS
ipconfig /registerdns
echo.

echo ============================================================
echo SELESAI!
echo ============================================================
echo.
echo Silakan:
echo 1. RESTART KOMPUTER Anda
echo 2. Setelah restart, jalankan: node test-login-connection.js
echo 3. Jika masih error, coba solusi manual di bawah
echo.
echo SOLUSI MANUAL (jika masih error):
echo 1. Buka Control Panel ^> Network and Sharing Center
echo 2. Klik adapter jaringan Anda (WiFi/Ethernet)
echo 3. Klik Properties ^> Internet Protocol Version 4 (TCP/IPv4)
echo 4. Pilih "Use the following DNS server addresses"
echo 5. Preferred DNS: 8.8.8.8
echo 6. Alternate DNS: 8.8.4.4
echo 7. Klik OK dan restart komputer
echo.
pause
