# 🎮 VÒNG BO LIÊM CHÍNH — AI SURVIVAL BATTLE ROYALE
> **Mô hình Trò Chơi:** Máy Chủ (Server) — Người Chơi (Client)  
> **Quy mô:** Hỗ trợ lên đến 50 người chơi (Client) thi đấu đồng thời trong lớp học/hội thảo.  
> **Khẩu hiệu:** *"AI Smart — Not AI Cheat"*

---

## 🌐 HƯỚNG DẪN MỞ SERVER RA INTERNET (CHO PHÉP KHÁC MẠNG / 4G TRUY CẬP)

> **⚠️ LƯU Ý VỀ VERCEL:**  
> Vercel là nền tảng **Serverless** (chỉ chạy các hàm tạm thời trong vài giây rồi tự ngắt), nên **không hỗ trợ máy chủ WebSocket liên tục** (`ws://`/`wss://`) để đồng bộ thời gian thực cho 50 người chơi.  
> Dưới đây là 2 cách chuẩn nhất, hoàn toàn **MIỄN PHÍ** để bạn đưa game lên Internet:

---

### CÁCH 1: Triển khai lên Cloud Render.com (KHUYÊN DÙNG NHẤT — 2 PHÚT)
Vì bạn đã push code lên GitHub, việc deploy lên Render.com là nhanh và mượt mà nhất:

1. Truy cập [https://render.com](https://render.com) và bấm **Sign in with GitHub**.
2. Tại trang Dashboard, bấm nút **"New +"** (góc trên bên phải) $\rightarrow$ chọn **"Web Service"**.
3. Chọn kho chứa GitHub (Repository) dự án này của bạn và bấm **Connect**.
4. Điền các mục đơn giản sau:
   - **Name:** `vong-bo-liem-chinh` (hoặc tên bạn thích).
   - **Runtime:** `Node`.
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Instance Type:** Chọn gói **Free** ($0/tháng).
5. Bấm **"Deploy Web Service"**.
6. Đợi 1-2 phút, Render sẽ cấp cho bạn đường link HTTPS chính thức:
   `https://vong-bo-liem-chinh.onrender.com`
   - **Màn hình Host của bạn:** `https://vong-bo-liem-chinh.onrender.com/host`
   - **Màn hình sinh viên:** Quét mã QR hoặc truy cập `https://vong-bo-liem-chinh.onrender.com`
   - Bất kể dùng 4G Viettel, MobiFone hay Wi-Fi ở bất cứ đâu đều thi đấu chung một phòng cực kỳ mượt mà!

---

### CÁCH 2: Mở Internet ngay từ máy tính cá nhân (Dùng `tunnel.bat`)
Nếu bạn muốn chạy server trực tiếp trên laptop của mình mà sinh viên dùng 4G vẫn kết nối được:

1. Bật máy chủ như bình thường bằng file `run_game.bat`.
2. Nhấp đúp vào file `tunnel.bat` trong thư mục này.
3. Cửa sổ sẽ hiển thị một đường link công khai dạng:
   `https://xxxx.loca.lt`
4. Bạn chỉ cần gửi đường link đó (hoặc link `/host`) cho cả lớp, mọi người ở bất kỳ mạng nào đều vào chơi được ngay lập tức!
