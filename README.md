# LogRes - Universal Login System

A comprehensive multi-mode authentication system designed for different user demographics: children, adults, and elderly users. Built with Node.js, Express, MySQL, and vanilla JavaScript frontend.

## 🌟 Features

### Multi-Mode Authentication
- **Child Mode**: Simplified interface for users under 18, requires parent account supervision
- **Adult Mode**: Full-featured access for regular users
- **Elder Mode**: Large text, high contrast, simplified operations for senior users

### Security Features
- JWT-based authentication
- Bcrypt password hashing
- Account lockout after 5 failed login attempts
- OTP-based password recovery
- Role-based access control (Admin/User)
- Parent-child account linking (Family Link)

### User Management
- User registration with mode-specific validation
- Session management with JWT tokens
- Admin dashboard for user management
- Failed attempt tracking and account locking
- Child profile management under parent accounts

### Chatbot Support
- AI-powered chatbot for user assistance
- Multi-language support (Vietnamese/English)
- Context-aware responses based on user mode

## 🏗️ Architecture

```
LogRes/
├── Backend/
│   ├── server.js          # Express server with API endpoints
│   ├── package.json       # Backend dependencies
│   ├── .env.example       # Environment variables template
│   └── node_modules/      # Backend dependencies
├── Frontend/
│   ├── index.html         # Login page
│   ├── register.html      # Registration page
│   ├── dashboard.html     # User dashboard
│   ├── admin.html         # Admin dashboard
│   ├── forgot-password.html # Password recovery
│   ├── index.js           # Login logic
│   ├── register.js        # Registration logic
│   ├── dashboard.js       # Dashboard logic
│   ├── admin.js           # Admin logic
│   ├── forgot-password.js # Password recovery logic
│   ├── style.css          # Main styles
│   └── chatbot.css        # Chatbot styles
├── database.sql           # Database schema
└── README.md             # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- Modern web browser

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd LogRes
```

2. **Database Setup**
```bash
# Import the database schema
mysql -u root -p < database.sql
```

3. **Backend Setup**
```bash
cd Backend
npm install
```

4. **Environment Configuration**
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your configuration
# - DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
# - JWT_SECRET (change this in production!)
# - PORT (default: 3000)
```

5. **Start the Backend Server**
```bash
node server.js
```

The backend will start on `http://localhost:3000`

6. **Frontend Setup**
```bash
# Open Frontend folder in your browser
# Or use a simple HTTP server:
cd Frontend
python -m http.server 8080
# or
npx http-server -p 8080
```

Access the application at `http://localhost:8080`

## 🔐 Default Credentials

### Admin Account
- **Username**: `admin`
- **Password**: `admin123`
- **Mode**: Adult
- **Role**: Admin

⚠️ **Important**: Change the default admin password immediately after first login!

## 📚 API Documentation

### Authentication Endpoints

#### POST /register
Register a new user account.

**Request Body:**
```json
{
  "username": "user@example.com",
  "password": "password123",
  "mode": "adult"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Tạo tài khoản thành công. Hãy đăng nhập."
}
```

#### POST /login
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "username": "user@example.com",
  "password": "password123",
  "mode": "adult"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Đăng nhập thành công.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "user@example.com",
    "mode": "adult",
    "is_admin": false,
    "supervised": false,
    "parentId": null
  }
}
```

#### POST /logout
Logout current user (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

#### GET /me
Get current user information (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

### Password Recovery

#### POST /forgot-password
Request OTP for password recovery.

**Request Body:**
```json
{
  "username": "user@example.com",
  "mode": "adult"
}
```

#### POST /verify-otp
Verify OTP code.

**Request Body:**
```json
{
  "username": "user@example.com",
  "mode": "adult",
  "otp": "123456"
}
```

#### POST /reset-password
Reset password with OTP.

**Request Body:**
```json
{
  "username": "user@example.com",
  "mode": "adult",
  "otp": "123456",
  "newPassword": "newpassword123"
}
```

### Admin Endpoints (Admin only)

#### GET /admin/users
List all users.

**Headers:**
```
Authorization: Bearer <admin-token>
```

#### POST /admin/users/:userId/unlock
Unlock a locked user account.

#### POST /admin/users/:userId/reset-attempts
Reset failed login attempts for a user.

### Family Link Endpoints (Parents only)

#### GET /family/children
List child profiles linked to parent account.

#### POST /family/children
Add a new child profile.

**Request Body:**
```json
{
  "childName": "Child Name"
}
```

### Chatbot Endpoint

#### POST /chat
Send message to AI chatbot (requires authentication).

**Request Body:**
```json
{
  "message": "How do I reset my password?"
}
```

**Response:**
```json
{
  "success": true,
  "reply": "You can reset your password using the forgot password feature..."
}
```

## 🎨 User Modes

### Child Mode (Trẻ em)
- Requires parent account credentials
- Simplified UI with larger elements
- Limited functionality for safety
- Always marked as "supervised" session

### Adult Mode (Người lớn)
- Full access to all features
- Standard UI layout
- Can create child profiles via Family Link
- Admin access if assigned

### Elder Mode (Người cao tuổi)
- Large text and high contrast colors
- Simplified navigation
- Step-by-step guidance
- Phone-only authentication option

## 🔒 Security Considerations

### Implemented Security Measures
- ✅ Password hashing with bcrypt
- ✅ JWT token authentication
- ✅ Account lockout after failed attempts
- ✅ Role-based access control
- ✅ Input validation and sanitization
- ✅ CORS configuration
- ✅ Environment variable usage

### Recommended for Production
- 🔄 Change default JWT_SECRET
- 🔄 Implement rate limiting
- 🔄 Add HTTPS/SSL certificates
- 🔄 Implement real email/SMS for OTP
- 🔄 Add audit logging
- 🔄 Implement CSRF protection
- 🔄 Add content security policy headers
- 🔄 Regular security updates

## 🛠️ Development

### Backend Development
```bash
cd Backend
npm install
node server.js
```

### Frontend Development
```bash
cd Frontend
# Use any HTTP server
python -m http.server 8080
```

### Database Management
```bash
# Access MySQL
mysql -u root -p

# Use the database
USE universal_login;

# View users
SELECT * FROM users;
```

## 📝 Environment Variables

Create a `.env` file in the Backend directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=universal_login

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=1h

# CORS Configuration
CORS_ORIGIN=*
```

## 🧪 Testing

### Manual Testing
1. Register a new user account
2. Login with different modes
3. Test password recovery flow
4. Test admin functions (unlock users, reset attempts)
5. Test Family Link (add child profiles)
6. Test chatbot functionality

### Test Accounts
- **Admin**: admin / admin123 (adult mode)
- **Test User**: Create via registration page

## 🐛 Troubleshooting

### Common Issues

**Database Connection Failed**
- Check MySQL service is running
- Verify database credentials in `.env`
- Ensure database `universal_login` exists

**JWT Token Errors**
- Verify JWT_SECRET is set in `.env`
- Check token expiration time
- Ensure token is sent in Authorization header

**CORS Errors**
- Check CORS_ORIGIN in `.env`
- Verify frontend URL is allowed

**Account Locked**
- Use admin account to unlock via admin dashboard
- Or reset failed attempts via admin panel

## 📄 License

This project is for educational purposes. Feel free to use and modify as needed.

## 👥 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📞 Support

For issues and questions:
- Create an issue in the repository
- Check existing documentation
- Review troubleshooting section

## 🎯 Future Enhancements

- [ ] Real AI chatbot integration (OpenAI/GPT)
- [ ] Email/SMS OTP delivery
- [ ] Two-factor authentication (2FA)
- [ ] Social login (Google, Facebook)
- [ ] User profile management
- [ ] Activity audit logs
- [ ] File upload for avatars
- [ ] Dark mode support
- [ ] Mobile app version
- [ ] Internationalization (i18n)

---

**Built with ❤️ for inclusive authentication systems**
