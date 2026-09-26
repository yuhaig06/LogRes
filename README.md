# LogRes - Hệ Thống Đăng Nhập Đa Chế Độ
# LogRes - Universal Login System

Hệ thống xác thực đa chế độ toàn diện được thiết kế cho các nhóm người dùng khác nhau: trẻ em, người lớn và người cao tuổi. Xây dựng với Node.js, Express, MySQL và frontend vanilla JavaScript.

A comprehensive multi-mode authentication system designed for different user demographics: children, adults, and elderly users. Built with Node.js, Express, MySQL, and vanilla JavaScript frontend.

---

## 🌟 Tính Năng / Features

### Xác Thực Đa Chế Độ / Multi-Mode Authentication
- **Chế độ Trẻ em / Child Mode**: Giao diện đơn giản cho người dùng dưới 18 tuổi, cần giám sát của tài khoản phụ huynh
- **Chế độ Người lớn / Adult Mode**: Truy cập đầy đủ tính năng cho người dùng thông thường
- **Chế độ Người cao tuổi / Elder Mode**: Chữ lớn, độ tương phản cao, thao tác đơn giản cho người cao tuổi

### Tính Năng Bảo Mật / Security Features
- Xác thực dựa trên JWT / JWT-based authentication
- Mã hóa mật khẩu với Bcrypt / Bcrypt password hashing
- Khóa tài khoản sau 5 lần đăng nhập thất bại / Account lockout after 5 failed login attempts
- Khôi phục mật khẩu dựa trên OTP / OTP-based password recovery
- Kiểm soát truy cập dựa trên vai trò / Role-based access control (Admin/User)
- Liên kết tài khoản phụ huynh-con / Parent-child account linking (Family Link)

### Quản Lý Người Dùng / User Management
- Đăng ký người dùng với xác thực theo chế độ / User registration with mode-specific validation
- Quản lý phiên với JWT tokens / Session management with JWT tokens
- Dashboard quản trị viên để quản lý người dùng / Admin dashboard for user management
- Theo dõi các lần thất bại và khóa tài khoản / Failed attempt tracking and account locking
- Quản lý hồ sơ trẻ em dưới tài khoản phụ huynh / Child profile management under parent accounts

### Hỗ Trợ Chatbot / Chatbot Support
- Chatbot AI hỗ trợ người dùng / AI-powered chatbot for user assistance
- Hỗ trợ đa ngôn ngữ (Tiếng Việt/Tiếng Anh) / Multi-language support (Vietnamese/English)
- Phản hồi nhận biết ngữ cảnh dựa trên chế độ người dùng / Context-aware responses based on user mode

---

## 🏗️ Kiến Trúc / Architecture

```
LogRes/
├── Backend/
│   ├── server.js          # Express server với API endpoints
│   ├── package.json       # Backend dependencies
│   ├── .env.example       # Environment variables template
│   └── node_modules/      # Backend dependencies
├── Frontend/
│   ├── index.html         # Trang đăng nhập / Login page
│   ├── register.html      # Trang đăng ký / Registration page
│   ├── dashboard.html     # Dashboard người dùng / User dashboard
│   ├── admin.html         # Dashboard quản trị / Admin dashboard
│   ├── forgot-password.html # Khôi phục mật khẩu / Password recovery
│   ├── index.js           # Logic đăng nhập / Login logic
│   ├── register.js        # Logic đăng ký / Registration logic
│   ├── dashboard.js       # Logic dashboard / Dashboard logic
│   ├── admin.js           # Logic quản trị / Admin logic
│   ├── forgot-password.js # Logic khôi phục mật khẩu / Password recovery logic
│   ├── style.css          # Styles chính / Main styles
│   ├── chatbot.css        # Styles chatbot / Chatbot styles
│   ├── logo.svg           # Logo chính / Main logo
│   ├── logo-simple.svg    # Logo đơn giản / Simplified logo
│   └── favicon.svg        # Favicon trình duyệt / Browser favicon
├── database.sql           # Schema database / Database schema
├── API_DOCUMENTATION.md   # Tài liệu API chi tiết / Detailed API documentation
├── PROJECT_REPORT.md      # Báo cáo dự án / Project report
├── LOGO_GUIDE.md          # Hướng dẫn thiết kế logo / Logo design guide
└── README.md             # File này / This file
```

---

## 🚀 Bắt Đầu Nhanh / Quick Start

### Điều Kiện Tiên Quyết / Prerequisites
- Node.js (v14 trở lên / v14 or higher)
- MySQL (v5.7 trở lên / v5.7 or higher)
- Trình duyệt web hiện đại / Modern web browser

### Cài Đặt / Installation

1. **Clone repository**
```bash
git clone https://github.com/yuhaig06/LogRes.git
cd LogRes
```

2. **Thiết lập Database / Database Setup**
```bash
# Import schema database
mysql -u root -p < database.sql
```

3. **Thiết lập Backend / Backend Setup**
```bash
cd Backend
npm install
```

4. **Cấu hình Environment / Environment Configuration**
```bash
# Copy file environment mẫu
cp .env.example .env

# Chỉnh sửa .env với cấu hình của bạn
# - DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
# - JWT_SECRET (thay đổi trong production!)
# - PORT (mặc định: 3000)
```

5. **Khởi động Server Backend / Start Backend Server**
```bash
node server.js
```

Backend sẽ khởi động tại `http://localhost:3000` / Backend will start on `http://localhost:3000`

6. **Thiết lập Frontend / Frontend Setup**
```bash
# Mở folder Frontend trong trình duyệt
# Hoặc sử dụng HTTP server đơn giản:
cd Frontend
python -m http.server 8080
# hoặc
npx http-server -p 8080
```

Truy cập ứng dụng tại `http://localhost:8080` / Access the application at `http://localhost:8080`

---

## 🔐 Tài Khoản Mặc Định / Default Credentials

### Tài Khoản Admin / Admin Account
- **Username**: `admin`
- **Password**: `admin123`
- **Mode**: Người lớn / Adult
- **Role**: Admin

⚠️ **Quan trọng / Important**: Thay đổi mật khẩu admin mặc định ngay sau lần đăng nhập đầu tiên! / Change the default admin password immediately after first login!

---

## 📚 Tài Liệu API / API Documentation

Vui lòng xem `API_DOCUMENTATION.md` để có tài liệu API đầy đủ chi tiết.  
Please see `API_DOCUMENTATION.md` for detailed API documentation.

### Các Endpoint Chính / Main Endpoints

#### Xác Thực / Authentication
- `POST /register` - Đăng ký người dùng mới / Register new user
- `POST /login` - Đăng nhập và nhận JWT token / Login and receive JWT token
- `POST /logout` - Đăng xuất / Logout
- `GET /me` - Lấy thông tin người dùng hiện tại / Get current user info

#### Khôi Phục Mật Khẩu / Password Recovery
- `POST /forgot-password` - Yêu cầu OTP / Request OTP
- `POST /verify-otp` - Xác minh OTP / Verify OTP
- `POST /reset-password` - Đặt lại mật khẩu / Reset password

#### Quản Trị / Admin (Chỉ Admin / Admin Only)
- `GET /admin/users` - Danh sách tất cả người dùng / List all users
- `POST /admin/users/:userId/unlock` - Mở khóa tài khoản / Unlock account
- `POST /admin/users/:userId/reset-attempts` - Reset lần thất bại / Reset failed attempts

#### Family Link (Chỉ Phụ Huynh / Parents Only)
- `GET /family/children` - Danh sách hồ sơ trẻ em / List child profiles
- `POST /family/children` - Thêm hồ sơ trẻ em mới / Add new child profile

#### Chatbot
- `POST /chat` - Gửi tin nhắn đến AI chatbot / Send message to AI chatbot

---

## 🎨 Chế Độ Người Dùng / User Modes

### Chế Độ Trẻ Em / Child Mode (Trẻ em)
- Yêu cầu thông tin tài khoản phụ huynh / Requires parent account credentials
- Giao diện đơn giản với phần tử lớn hơn / Simplified UI with larger elements
- Chức năng hạn chế cho an toàn / Limited functionality for safety
- Luôn được đánh dấu là phiên "giám sát" / Always marked as "supervised" session

### Chế Độ Người Lớn / Adult Mode (Người lớn)
- Truy cập đầy đủ tất cả tính năng / Full access to all features
- Bố cục UI tiêu chuẩn / Standard UI layout
- Có thể tạo hồ sơ trẻ em qua Family Link / Can create child profiles via Family Link
- Truy cập quản trị viên nếu được gán / Admin access if assigned

### Chế Độ Người Cao Tuổi / Elder Mode (Người cao tuổi)
- Chữ lớn và màu sắc độ tương phản cao / Large text and high contrast colors
- Điều hướng đơn giản hóa / Simplified navigation
- Hướng dẫn từng bước / Step-by-step guidance
- Tùy chọn xác thực chỉ bằng số điện thoại / Phone-only authentication option

---

## 🔒 Cân Nhắc Bảo Mật / Security Considerations

### Biện Pháp Bảo Mật Đã Triển Khai / Implemented Security Measures
- ✅ Mã hóa mật khẩu với bcrypt / Password hashing with bcrypt
- ✅ Xác thực token JWT / JWT token authentication
- ✅ Khóa tài khoản sau các lần thất bại / Account lockout after failed attempts
- ✅ Kiểm soát truy cập dựa trên vai trò / Role-based access control
- ✅ Xác thực và làm sạch đầu vào / Input validation and sanitization
- ✅ Cấu hình CORS / CORS configuration
- ✅ Sử dụng biến môi trường / Environment variable usage

### Đề Xuất Cho Production / Recommended for Production
- 🔄 Thay đổi JWT_SECRET mặc định / Change default JWT_SECRET
- 🔄 Triển khai giới hạn tốc độ / Implement rate limiting
- 🔄 Thêm chứng chỉ HTTPS/SSL / Add HTTPS/SSL certificates
- 🔄 Triển khai email/SMS thật cho OTP / Implement real email/SMS for OTP
- 🔄 Thêm ghi nhật kỳ kiểm tra / Add audit logging
- 🔄 Triển khai bảo vệ CSRF / Implement CSRF protection
- 🔄 Thêm headers chính sách bảo mật nội dung / Add content security policy headers
- 🔄 Cập nhật bảo mật thường xuyên / Regular security updates

---

## 🛠️ Phát Triển / Development

### Phát Triển Backend / Backend Development
```bash
cd Backend
npm install
node server.js
```

### Phát Triển Frontend / Frontend Development
```bash
cd Frontend
# Sử dụng bất kỳ HTTP server nào
python -m http.server 8080
```

### Quản Lý Database / Database Management
```bash
# Truy cập MySQL
mysql -u root -p

# Sử dụng database
USE universal_login;

# Xem người dùng
SELECT * FROM users;
```

---

## 📝 Biến Môi Trường / Environment Variables

Tạo file `.env` trong thư mục Backend: / Create a `.env` file in the Backend directory:

```env
# Cấu hình Server / Server Configuration
PORT=3000
NODE_ENV=development

# Cấu hình Database / Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=universal_login

# Cấu hình JWT / JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=1h

# Cấu hình CORS / CORS Configuration
CORS_ORIGIN=*
```

---

## 🧪 Kiểm Thử / Testing

### Kiểm Thử Thủ Công / Manual Testing
1. Đăng ký tài khoản người dùng mới / Register a new user account
2. Đăng nhập với các chế độ khác nhau / Login with different modes
3. Kiểm tra quy trình khôi phục mật khẩu / Test password recovery flow
4. Kiểm tra chức năng quản trị viên / Test admin functions (unlock users, reset attempts)
5. Kiểm tra Family Link (thêm hồ sơ trẻ em) / Test Family Link (add child profiles)
6. Kiểm tra chức năng chatbot / Test chatbot functionality

### Tài Khoản Kiểm Thử / Test Accounts
- **Admin**: admin / admin123 (chế độ người lớn / adult mode)
- **Test User**: Tạo qua trang đăng ký / Create via registration page

---

## 🐛 Khắc Phục Sự Cố / Troubleshooting

### Vấn Đề Thường Gặp / Common Issues

**Kết Nối Database Thất Bại / Database Connection Failed**
- Kiểm tra dịch vụ MySQL đang chạy / Check MySQL service is running
- Xác minh thông tin đăng nhập database trong `.env` / Verify database credentials in `.env`
- Đảm bảo database `universal_login` tồn tại / Ensure database `universal_login` exists

**Lỗi Token JWT / JWT Token Errors**
- Xác minh JWT_SECRET được đặt trong `.env` / Verify JWT_SECRET is set in `.env`
- Kiểm tra thời gian hết hạn token / Check token expiration time
- Đảm bảo token được gửi trong Authorization header / Ensure token is sent in Authorization header

**Lỗi CORS / CORS Errors**
- Kiểm tra CORS_ORIGIN trong `.env` / Check CORS_ORIGIN in `.env`
- Xác minh URL frontend được phép / Verify frontend URL is allowed

**Tài Khoản Bị Khóa / Account Locked**
- Sử dụng tài khoản admin để mở khóa qua dashboard quản trị / Use admin account to unlock via admin dashboard
- Hoặc reset các lần thất bại qua panel quản trị / Or reset failed attempts via admin panel

---

## 📄 Giấy Phép / License

Dự án này dành cho mục đích giáo dục. Vui lòng sử dụng và sửa đổi theo nhu cầu.  
This project is for educational purposes. Feel free to use and modify as needed.

---

## 👥 Đóng Góp / Contributing

Đóng góp được chào đón! Vui lòng làm theo các bước sau:  
Contributions are welcome! Please follow these steps:
1. Fork repository
2. Tạo nhánh tính năng / Create feature branch
3. Commit thay đổi của bạn / Commit your changes
4. Push đến nhánh / Push to the branch
5. Mở Pull Request

---

## 📞 Hỗ Trợ / Support

Đối với vấn đề và câu hỏi: / For issues and questions:
- Tạo issue trong repository / Create an issue in the repository
- Kiểm tra tài liệu hiện có / Check existing documentation
- Xem phần khắc phục sự cố / Review troubleshooting section

---

## 🎯 Cải Tiến Tương Lai / Future Enhancements

- [ ] Tích hợp AI chatbot thật (OpenAI/GPT) / Real AI chatbot integration
- [ ] Gửi OTP qua Email/SMS / Email/SMS OTP delivery
- [ ] Xác thực hai yếu tố (2FA) / Two-factor authentication
- [ ] Đăng nhập xã hội (Google, Facebook) / Social login
- [ ] Quản lý hồ sơ người dùng / User profile management
- [ ] Ghi nhật ký hoạt động / Activity audit logs
- [ ] Tải lên avatar / File upload for avatars
- [ ] Hỗ trợ chế độ tối / Dark mode support
- [ ] Phiên bản ứng dụng di động / Mobile app version
- [ ] Quốc tế hóa (i18n) / Internationalization

---

## 🎨 Thiết Kế Logo / Logo Design

Logo LogRes sử dụng biểu tượng chìa khóa thông minh cách điệu kết hợp chữ cái L và R với gradient từ Xanh dương đậm (#0A4DA0) đến Xanh ngọc (#00B4D8). Xem `LOGO_GUIDE.md` để biết chi tiết thiết kế.

The LogRes logo features a stylized smart key icon combining L and R letters with a gradient from Deep Blue (#0A4DA0) to Cyan (#00B4D8). See `LOGO_GUIDE.md` for design details.

---

## 📊 Báo Cáo Dự Án / Project Report

Vui lòng xem `PROJECT_REPORT.md` để có báo cáo chi tiết về dự án cho portfolio/CV.  
Please see `PROJECT_REPORT.md` for detailed project report for portfolio/CV.

---

**Xây dựng với ❤️ cho các hệ thống xác thực bao trùm / Built with ❤️ for inclusive authentication systems**

**GitHub Repository**: https://github.com/yuhaig06/LogRes

**Live Demo**: [Coming Soon / Sắp Ra Mắt]
