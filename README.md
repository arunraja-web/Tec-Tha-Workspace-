# Virtual Company Workspace - Backend API

A production-ready, secure authentication and user-management module built with **Node.js, Express.js, MongoDB, and Mongoose**.

## Architecture & Security Principles

- **No Public Registration**: Account creation is restricted exclusively to authenticated `admin` users.
- **Primary Email Login**: Authentication allows **only primary email + password**. Logins via secondary email, phone, or name are strictly rejected.
- **Secondary Email Recovery**: `secondaryEmail` is strictly reserved for password recovery and cannot be used to log in.
- **HTTP-Only Cookies**: JWT tokens are issued and stored inside secure, HTTP-Only cookies (`token`).
- **Role-Based Authorization**: Enforces strict permissions across three user roles: `admin`, `founder`, and `employee`.
- **Password Security**: Passwords are standard-hashed using `bcryptjs` with salt rounds. Raw passwords or password reset tokens are never exposed in API responses.
- **Token Security**: Password reset tokens are single-use and stored in database as SHA-256 hashes with 15-minute expiration times.

---

## Roles & Permissions Matrix

| Feature / Action | Admin | Founder | Employee |
| :--- | :---: | :---: | :---: |
| Login / Logout | ✅ | ✅ | ✅ |
| View Own Profile (`/api/auth/me`) | ✅ | ✅ | ✅ |
| Change Own Password | ✅ | ✅ | ✅ |
| Forgot / Reset Password | ✅ | ✅ | ✅ |
| Create Users (Employees/Founders/Admins) | ✅ | ❌ | ❌ |
| View All Users List | ✅ | ❌ | ❌ |
| Update User Profile | ✅ | ❌ | ❌ |
| Activate / Deactivate User Status | ✅ | ❌ | ❌ |
| Change User Roles | ✅ | ❌ | ❌ |
| Direct Password Reset for Users | ✅ | ❌ | ❌ |
| Delete User Account | ✅ | ❌ | ❌ |

---

## API Endpoints Reference

### 1. Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Access | Rate Limited | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | Yes (5/15m) | Authenticate user using primary email + password. Returns HTTP-only cookie. |
| `POST` | `/api/auth/logout` | Private | No | Clears authentication cookie. |
| `GET` | `/api/auth/me` | Private | No | Get authenticated user's safe profile info. |
| `POST` | `/api/auth/forgot-password` | Public | Yes (3/1h) | Send password reset token link to user's registered `secondaryEmail`. |
| `POST` | `/api/auth/reset-password/:token` | Public | No | Reset user password using valid token. |
| `POST` | `/api/auth/change-password` | Private | No | Change password for logged-in user. |

### 2. User Management Endpoints (`/api/users`) — Admin Only

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/users` | Admin | Create a new user (employee, founder, or admin). |
| `GET` | `/api/users` | Admin | Get list of all users with search, role filtering, and pagination. |
| `GET` | `/api/users/:id` | Admin | Get single user details by ID. |
| `PUT` | `/api/users/:id` | Admin | Update user name, email, secondaryEmail, or phone. |
| `PATCH` | `/api/users/:id/status` | Admin | Activate or deactivate user status (`isActive: true/false`). |
| `PATCH` | `/api/users/:id/role` | Admin | Change user role (`admin`, `founder`, `employee`). |
| `PATCH` | `/api/users/:id/reset-password` | Admin | Admin direct password reset for specified user. |
| `DELETE` | `/api/users/:id` | Admin | Delete user account permanently. |

---

### Default Seed Credentials

Upon server startup (`npm run dev`), the system automatically checks and seeds the initial default accounts if they do not exist:

| Role | Primary Email | Password | Secondary Email | Phone |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | `admin@tectha.com` | `Admin@123` | `admin.recovery@tectha.com` | `9999999999` |
| **Employee** | `test@tectha.com` | `123456` | `test.recovery@tectha.com` | `8888888888` |

---

## Request & Response Examples (Postman Testing)

### 1. Login
`POST /api/auth/login`
```json
// Request Body
{
  "email": "admin@tectha.com",
  "password": "Admin@123"
}

// Success Response (200 OK)
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "66b8e3a2f1a9b2...",
      "name": "System Admin",
      "email": "admin@company.com",
      "secondaryEmail": "admin.recovery@company.com",
      "phone": "1234567890",
      "role": "admin",
      "isActive": true,
      "createdAt": "2026-08-11T00:00:00.000Z",
      "updatedAt": "2026-08-11T00:00:00.000Z"
    }
  }
}
```

### 2. Get Current User Profile
`GET /api/auth/me`
```json
// Headers / Cookie: Cookie: token=...
// Success Response (200 OK)
{
  "success": true,
  "user": {
    "id": "66b8e3a2f1a9b2...",
    "name": "System Admin",
    "email": "admin@company.com",
    "secondaryEmail": "admin.recovery@company.com",
    "phone": "1234567890",
    "role": "admin",
    "isActive": true,
    "createdAt": "2026-08-11T00:00:00.000Z",
    "updatedAt": "2026-08-11T00:00:00.000Z"
  }
}
```

### 3. Admin Creates Employee
`POST /api/users`
```json
// Request Body (Admin Cookie Required)
{
  "name": "John Doe",
  "email": "john@company.com",
  "secondaryEmail": "john.personal@gmail.com",
  "phone": "9876543210",
  "password": "TemporaryPassword123!",
  "role": "employee"
}

// Success Response (201 Created)
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user": {
      "name": "John Doe",
      "email": "john@company.com",
      "secondaryEmail": "john.personal@gmail.com",
      "phone": "9876543210",
      "role": "employee",
      "isActive": true,
      "id": "66b8e4f1a2...",
      "createdAt": "2026-08-11T00:00:00.000Z",
      "updatedAt": "2026-08-11T00:00:00.000Z"
    }
  }
}
```

### 4. Forgot Password Flow
`POST /api/auth/forgot-password`
```json
// Request Body
{
  "email": "john@company.com"
}

// Success Response (200 OK - Generic Security Message)
{
  "success": true,
  "message": "If the account exists, password reset instructions have been sent."
}
```

### 5. Reset Password
`POST /api/auth/reset-password/:token`
```json
// Request Body
{
  "password": "NewSecurePassword123!"
}

// Success Response (200 OK)
{
  "success": true,
  "message": "Password reset successful. You can now login with your new password."
}
```

---

## Setup & Execution Instructions

### Installation
```bash
cd backend
npm install
```

### Running Tests
```bash
cd backend
npm test
```

### Development Server
```bash
cd backend
npm run dev
```

