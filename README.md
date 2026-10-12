# 🎮 VÒNG BO LIÊM CHÍNH — AI SURVIVAL BATTLE ROYALE
> **Mô hình Trò Chơi:** Máy Chủ (Server) — Người Chơi (Client)  
> **Quy mô:** Hỗ trợ lên đến 50 người chơi (Client) thi đấu đồng thời trong lớp học/hội thảo.  
> **Khẩu hiệu:** *"AI Smart — Not AI Cheat"*

---

## 🚀 HƯỚNG DẪN KHỞI CHẠY (DÀNH CHO BẠN - MÁY CHỦ HOST)

### Cách 1: Chạy nhanh bằng 1 cú nhấp chuột (Khuyên dùng)
* Nhấp đúp vào file `run_game.bat` trong thư mục này.
* Trình duyệt sẽ tự động mở trang Quản Trị Máy Chủ tại: **`http://localhost:3000/host`**

### Cách 2: Chạy bằng Terminal / PowerShell
```bash
npm start
# hoặc
node server.js
```

---

## 📱 HƯỚNG DẪN THI ĐẤU DÀNH CHO NGƯỜI CHƠI (SINH VIÊN)

1. Máy tính hoặc điện thoại của sinh viên chỉ cần kết nối **chung mạng Wi-Fi** với máy chủ của bạn.
2. Sinh viên quét **Mã QR Code** to rõ trên màn hình chiếu của Máy Chủ, hoặc gõ đường link dạng:
   ```
   http://192.168.x.x:3000
   ```
3. **Bước 1 - Chuẩn bị:** Sinh viên nhập Mật danh (Tên) và chọn Nhân vật sinh tồn (Kelly Fact-Check, Chrono Phản Biện, Alok Prompt-Master).
4. **Bước 2 - Đứng ở Sảnh Chờ (Waiting Lobby):** Sinh viên bấm *"Sẵn sàng vào Sảnh Chờ"*. Màn hình của sinh viên sẽ hiển thị trạng thái **Đang đợi máy chủ bắt đầu trận đấu...** và hoàn toàn bị khóa tương tác, không thể tự chơi trước.
5. **Bước 3 - Nhảy dù đồng loạt:** Khi Máy Chủ (bạn) trên bục giảng nhấn nút **"🚀 BẮT ĐẦU TRẬN ĐẤU (START)"**, toàn bộ tối đa 50 điện thoại/máy tính của sinh viên đồng loạt đếm ngược `3... 2... 1...` và nhảy dù vào chiến trường Vòng Bo!
6. **Bước 4 - Trực tiếp:** Điểm số, máu HP và các pha Headshot/Dính bẫy của từng sinh viên sẽ được truyền thời gian thực (real-time) về màn hình máy chiếu Máy Chủ qua Bảng Xếp Hạng Giải Đấu (Live Leaderboard)!
