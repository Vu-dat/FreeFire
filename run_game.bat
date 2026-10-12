@echo off
chcp 65001 >nul
title VÒNG BO LIÊM CHÍNH — SERVER HOST DASHBOARD
color 0E

echo =========================================================================
echo    🔥 VÒNG BO LIÊM CHÍNH — MÁY CHỦ BATTLE ROYALE (SERVER - CLIENT) 🔥
echo =========================================================================
echo    Đang khởi động Máy Chủ trên cổng 3000...
echo    Tự động mở Trang Quản Trị Máy Chủ (Host Dashboard)...
echo =========================================================================

:: Đợi 1 giây rồi tự động mở trình duyệt trang Host
start "" "http://localhost:3000/host"

:: Khởi chạy máy chủ Node.js
node server.js

pause
