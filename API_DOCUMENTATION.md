# LogRes API Documentation

Complete API reference for the LogRes Universal Login System.

**Base URL**: `http://localhost:3000`

**Authentication**: Most endpoints require JWT token in Authorization header: `Bearer <token>`

---

## 📋 Table of Contents

- [Authentication](#authentication)
- [User Management](#user-management)
- [Password Recovery](#password-recovery)
- [Admin Operations](#admin-operations)
- [Family Link](#family-link)
- [Chatbot](#chatbot)
- [Health Check](#health-check)

---

## 🔐 Authentication

### Register User

Create a new user account with specified mode.

**Endpoint**: `POST /register`

**Authentication**: None required

**Request Body**:
```json
{
  "username": "string (email or phone)",
  "password": "string (min 6 characters)",
  "mode": "child | adult | elder"
}
```

**Mode Restrictions**:
- `child`: Cannot register directly. Must use parent account.
- `adult`: Email or phone number required
- `elder`: Phone number required

**Success Response** (201):
```json
{
  "success": true,
  "message": "Tạo tài khoản thành công. Hãy đăng nhập."
}
```

**Error Responses**:
- `400` - Invalid data or child mode registration
- `409` - Username already exists for this mode
- `500` - Server error

**Example**:
```bash
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "user@example.com",
    "password": "password123",
    "mode": "adult"
  }'
```

---

### Login User

Authenticate user and receive JWT token.

**Endpoint**: `POST /login`

**Authentication**: None required

**Request Body**:
```json
{
  "username": "string",
  "password": "string",
  "mode": "child | adult | elder"
}
```

**Success Response** (200):
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

**Error Responses**:
- `400` - Invalid input data
- `401` - Invalid credentials or account locked
- `403` - Account locked after 5 failed attempts
- `500` - Server error

**Special Cases**:
- Child mode requires parent account credentials
- Account locks after 5 failed password attempts
- Remaining attempts shown in error message

**Example**:
```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "user@example.com",
    "password": "password123",
    "mode": "adult"
  }'
```

---

### Get Current User

Get information about currently authenticated user.

**Endpoint**: `GET /me`

**Authentication**: Required (JWT token)

**Headers**:
```
Authorization: Bearer <token>
```

**Success Response** (200):
```json
{
  "success": true,
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

**Error Responses**:
- `401` - Invalid or expired token
- `500` - Server error

**Example**:
```bash
curl -X GET http://localhost:3000/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### Logout User

Logout current user (client-side token invalidation).

**Endpoint**: `POST /logout`

**Authentication**: Required (JWT token)

**Headers**:
```
Authorization: Bearer <token>
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Đăng xuất thành công."
}
```

**Note**: Client should remove stored token after successful logout.

**Example**:
```bash
curl -X POST http://localhost:3000/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 🔑 Password Recovery

### Request OTP

Send OTP code to user for password recovery.

**Endpoint**: `POST /forgot-password`

**Authentication**: None required

**Request Body**:
```json
{
  "username": "string",
  "mode": "child | adult | elder"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "OTP đã được gửi (giả lập)."
}
```

**Note**: In development, OTP is logged to console. In production, implement email/SMS delivery.

**Error Responses**:
- `400` - Invalid input
- `404` - User not found
- `500` - Server error

**Example**:
```bash
curl -X POST http://localhost:3000/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "username": "user@example.com",
    "mode": "adult"
  }'
```

---

### Verify OTP

Verify OTP code for password recovery.

**Endpoint**: `POST /verify-otp`

**Authentication**: None required

**Request Body**:
```json
{
  "username": "string",
  "mode": "child | adult | elder",
  "otp": "string (6 digits)"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "OTP hợp lệ."
}
```

**Error Responses**:
- `400` - Invalid OTP, expired OTP, or no OTP exists
- `404` - User not found
- `500` - Server error

**OTP Validity**: 5 minutes from generation

**Example**:
```bash
curl -X POST http://localhost:3000/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "username": "user@example.com",
    "mode": "adult",
    "otp": "123456"
  }'
```

---

### Reset Password

Reset user password with verified OTP.

**Endpoint**: `POST /reset-password`

**Authentication**: None required

**Request Body**:
```json
{
  "username": "string",
  "mode": "child | adult | elder",
  "otp": "string (6 digits)",
  "newPassword": "string (min 6 characters)"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Đặt lại mật khẩu thành công."
}
```

**Side Effects**:
- Failed attempts reset to 0
- Account unlocked if previously locked
- OTP cleared after successful reset

**Error Responses**:
- `400` - Invalid input, invalid OTP, or expired OTP
- `404` - User not found
- `500` - Server error

**Example**:
```bash
curl -X POST http://localhost:3000/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "username": "user@example.com",
    "mode": "adult",
    "otp": "123456",
    "newPassword": "newpassword123"
  }'
```

---

## 👨‍💼 Admin Operations

*All admin endpoints require admin role and valid JWT token.*

### List All Users

Get list of all users in the system.

**Endpoint**: `GET /admin/users`

**Authentication**: Required (Admin JWT token)

**Headers**:
```
Authorization: Bearer <admin-token>
```

**Success Response** (200):
```json
{
  "success": true,
  "users": [
    {
      "id": 1,
      "username": "admin@example.com",
      "mode": "adult",
      "failed_attempts": 0,
      "is_locked": false,
      "is_admin": true
    },
    {
      "id": 2,
      "username": "user@example.com",
      "mode": "adult",
      "failed_attempts": 3,
      "is_locked": false,
      "is_admin": false
    }
  ]
}
```

**Error Responses**:
- `401` - Invalid or expired token
- `403` - Not authorized (not admin)
- `500` - Server error

**Example**:
```bash
curl -X GET http://localhost:3000/admin/users \
  -H "Authorization: Bearer <admin-token>"
```

---

### Unlock User Account

Unlock a user account that was locked due to failed attempts.

**Endpoint**: `POST /admin/users/:userId/unlock`

**Authentication**: Required (Admin JWT token)

**URL Parameters**:
- `userId` (integer) - User ID to unlock

**Headers**:
```
Authorization: Bearer <admin-token>
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Đã mở khóa tài khoản."
}
```

**Error Responses**:
- `400` - Invalid user ID
- `401` - Invalid or expired token
- `403` - Not authorized (not admin)
- `404` - User not found
- `500` - Server error

**Example**:
```bash
curl -X POST http://localhost:3000/admin/users/2/unlock \
  -H "Authorization: Bearer <admin-token>"
```

---

### Reset Failed Attempts

Reset failed login attempts counter for a user.

**Endpoint**: `POST /admin/users/:userId/reset-attempts`

**Authentication**: Required (Admin JWT token)

**URL Parameters**:
- `userId` (integer) - User ID to reset

**Headers**:
```
Authorization: Bearer <admin-token>
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Đã reset số lần nhập sai."
}
```

**Error Responses**:
- `400` - Invalid user ID
- `401` - Invalid or expired token
- `403` - Not authorized (not admin)
- `404` - User not found
- `500` - Server error

**Example**:
```bash
curl -X POST http://localhost:3000/admin/users/2/reset-attempts \
  -H "Authorization: Bearer <admin-token>"
```

---

## 👨‍👩‍👧 Family Link

*Family Link endpoints require parent role (adult/elder mode, not supervised).*

### List Child Profiles

Get list of child profiles linked to parent account.

**Endpoint**: `GET /family/children`

**Authentication**: Required (Parent JWT token)

**Headers**:
```
Authorization: Bearer <parent-token>
```

**Success Response** (200):
```json
{
  "success": true,
  "children": [
    {
      "id": 3,
      "username": "Child Name 1"
    },
    {
      "id": 4,
      "username": "Child Name 2"
    }
  ]
}
```

**Error Responses**:
- `401` - Invalid or expired token
- `403` - Not authorized (child mode or supervised)
- `500` - Server error

**Example**:
```bash
curl -X GET http://localhost:3000/family/children \
  -H "Authorization: Bearer <parent-token>"
```

---

### Add Child Profile

Create a new child profile linked to parent account.

**Endpoint**: `POST /family/children`

**Authentication**: Required (Parent JWT token)

**Headers**:
```
Authorization: Bearer <parent-token>
```

**Request Body**:
```json
{
  "childName": "string (2-50 characters)"
}
```

**Success Response** (201):
```json
{
  "success": true,
  "message": "Đã thêm hồ sơ trẻ em. Bé sẽ đăng nhập bằng tài khoản phụ huynh.",
  "child": {
    "id": 5,
    "username": "Child Name"
  }
}
```

**Error Responses**:
- `400` - Invalid child name length or duplicate
- `401` - Invalid or expired token
- `403` - Not authorized (child mode or supervised)
- `409` - Child profile already exists
- `500` - Server error

**Notes**:
- Child name must be 2-50 characters
- Password is auto-generated (parent never sees it)
- Child logs in using parent credentials

**Example**:
```bash
curl -X POST http://localhost:3000/family/children \
  -H "Authorization: Bearer <parent-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "childName": "John Doe"
  }'
```

---

## 🤖 Chatbot

### Send Chat Message

Send message to AI chatbot for assistance.

**Endpoint**: `POST /chat`

**Authentication**: Required (JWT token)

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "message": "string"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "reply": "You can reset your password using the forgot password feature..."
}
```

**Error Responses**:
- `400` - Invalid message
- `401` - Invalid or expired token
- `500` - Server error

**Features**:
- Multi-language support (Vietnamese/English)
- Keyword-based responses
- Context-aware for login system

**Example**:
```bash
curl -X POST http://localhost:3000/chat \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "How do I reset my password?"
  }'
```

---

## 💚 Health Check

### Server Health

Check if server is running.

**Endpoint**: `GET /health`

**Authentication**: None required

**Success Response** (200):
```json
{
  "success": true,
  "message": "Server is running"
}
```

**Example**:
```bash
curl -X GET http://localhost:3000/health
```

---

## 📊 Error Response Format

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error message description"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `500` - Internal Server Error

---

## 🔒 Security Headers

Include these headers in your requests:

```
Content-Type: application/json
Authorization: Bearer <your-jwt-token>
```

---

## 🧪 Testing with Postman

Import the following collection structure:

```
LogRes API Collection
├── Authentication
│   ├── POST /register
│   ├── POST /login
│   ├── GET /me
│   └── POST /logout
├── Password Recovery
│   ├── POST /forgot-password
│   ├── POST /verify-otp
│   └── POST /reset-password
├── Admin Operations
│   ├── GET /admin/users
│   ├── POST /admin/users/:userId/unlock
│   └── POST /admin/users/:userId/reset-attempts
├── Family Link
│   ├── GET /family/children
│   └── POST /family/children
├── Chatbot
│   └── POST /chat
└── Health
    └── GET /health
```

---

## 📝 Rate Limiting

Currently not implemented. Recommended for production:
- 100 requests per 15 minutes per IP
- Stricter limits for authentication endpoints

---

## 🔄 Version History

- **v1.0.0** - Initial API release
  - Authentication endpoints
  - Password recovery
  - Admin operations
  - Family Link
  - Chatbot integration

---

**Last Updated**: 2026-09-26
