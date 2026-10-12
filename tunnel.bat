@echo off
chcp 65001 >nul
title MỞ KẾT NỐI INTERNET RA TOÀN CẦU (4G / KHÁC MẠNG)
color 0B

echo =========================================================================
echo    🔥 VÒNG BO LIÊM CHÍNH — MỞ RỘNG KẾT NỐI TOÀN CẦU (INTERNET) 🔥
echo =========================================================================
echo    Đang tạo đường link công khai cho cổng 3000 qua Cloud Tunnel...
echo    Sinh viên dùng 4G / Wi-Fi khác mạng ở bất kỳ đâu đều có thể truy cập!
echo =========================================================================

npx localtunnel --port 3000

pause
