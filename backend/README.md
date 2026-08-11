# Virtual Company Workspace — Backend API

Production-ready, secure, scalable backend API for the Virtual Company Workspace built with **Node.js, Express.js, MongoDB, and Mongoose**.

---

## Architecture & Security Principles

- **No Public Registration**: Account creation is restricted exclusively to authenticated `admin` users (`POST /api/users`).
- **Primary Email Login**: Authentication allows **only primary email + password**. Logins via secondary email, phone, or name are strictly rejected.
- **Secondary Email Recovery**: `secondaryEmail` is strictly reserved for password recovery and cannot be used to log in.
- **HTTP-Only Cookies**: JWT tokens are issued and stored inside secure, HTTP-Only cookies (`token`).
- **Role-Based Access Control**: Enforces strict permissions across three user roles: `admin`, `founder`, and `employee`.
- **Database Unique Indexes**: Enforces uniqueness on `email`, `phone`, and a **partial unique index** on `secondaryEmail` so multiple users can have no secondary email while preventing duplicates when provided.
- **Email Conflict Prevention**: Primary and secondary emails cannot match for the same user, nor cross-overlap across different users.
- **Admin Self-Lockout Protection**: Prevents admins from demoting their own role, deactivating their own account, or deleting their own account.
- **Last Active Admin Protection**: Ensures system always has at least 1 active administrator (`At least one active administrator must remain.`).
- **Soft Deletion**: `DELETE /api/users/:id` performs soft deletion (`isActive: false`, `deletedAt: timestamp`).
- **Audit Activity Logging**: Automatically logs all admin user management operations (`ActivityLog` collection).
- **Password Security**: Passwords are standard-hashed using `bcryptjs`. Passwords or reset tokens are never exposed in API responses or logs.

---

## Roles & Permissions Matrix

| Feature / Action | Admin | Founder | Employee |
| :--- | :---: | :---: | :---: |
| Login / Logout | ✅ | ✅ | ✅ |
| View Own Profile (`/api/auth/me`) | ✅ | ✅ | ✅ |
| Change Own Password (`/api/auth/change-password`) | ✅ | ✅ | ✅ |
| Forgot / Reset Password (`/api/auth/*`) | ✅ | ✅ | ✅ |
| Create Users (`POST /api/users`) | ✅ | ❌ | ❌ |
| Get All Users (`GET /api/users`) | ✅ | ❌ | ❌ |
| Get User by ID (`GET /api/users/:id`) | ✅ | ❌ | ❌ |
| Update User Profile (`PUT /api/users/:id`) | ✅ | ❌ | ❌ |
| Change User Status (`PATCH /api/users/:id/status`) | ✅ | ❌ | ❌ |
| Change User Role (`PATCH /api/users/:id/role`) | ✅ | ❌ | ❌ |
| Admin Password Reset (`PATCH /api/users/:id/reset-password`) | ✅ | ❌ | ❌ |
| Soft Delete User (`DELETE /api/users/:id`) | ✅ | ❌ | ❌ |

---

## Complete API Endpoints Reference

### 1. Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | Authenticate user using primary email + password. Returns HTTP-only cookie. |
| `POST` | `/api/auth/logout` | Private | Clears authentication cookie. |
| `GET` | `/api/auth/me` | Private | Get authenticated user's safe profile info. |
| `POST` | `/api/auth/forgot-password` | Public | Send password reset token link to user's registered `secondaryEmail`. |
| `POST` | `/api/auth/reset-password/:token` | Public | Reset user password using valid reset token. |
| `POST` | `/api/auth/change-password` | Private | Change password for logged-in user. |

### 2. Admin User Management Endpoints (`/api/users`) — Admin Only

All routes require `protect` and `authorize('admin')`.

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/users` | Admin | Create new user (`admin`, `founder`, or `employee`). |
| `GET` | `/api/users` | Admin | Get all users with search, filtering, pagination, and sorting. |
| `GET` | `/api/users/:id` | Admin | Get single user details by Mongo ID. |
| `PUT` | `/api/users/:id` | Admin | Update user details (`name`, `email`, `secondaryEmail`, `phone`, `role`, `isActive`). |
| `PATCH` | `/api/users/:id/status` | Admin | Activate or deactivate user status (`isActive: true/false`). |
| `PATCH` | `/api/users/:id/role` | Admin | Change user role (`admin`, `founder`, `employee`). |
| `PATCH` | `/api/users/:id/reset-password` | Admin | Direct password reset for user by Admin. |
| `DELETE` | `/api/users/:id` | Admin | Soft delete user (`isActive: false`, `deletedAt` set). |

---

## Query Parameters (`GET /api/users`)

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `search` | String | - | Search keyword across `name`, `email`, and `phone` (case-insensitive). |
| `role` | String | - | Filter by user role (`admin`, `founder`, `employee`). |
| `status` | String | - | Filter by active status (`active` or `inactive`). |
| `page` | Integer | `1` | Page number for pagination. |
| `limit` | Integer | `20` | Items per page (max: `100`). |
| `sortBy` | String | `createdAt` | Field to sort by (`name`, `email`, `role`, `createdAt`, `updatedAt`). |
| `sortOrder` | String | `desc` | Sort direction (`asc` or `desc`). |

---

## Default Seed Credentials

Upon server startup (`npm run dev`), the system automatically seeds initial accounts if they do not exist:

| Role | Primary Email | Password | Secondary Email | Phone |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | `admin@tectha.com` | `Admin@123` | `admin.recovery@tectha.com` | `9999999999` |
| **Employee** | `test@tectha.com` | `123456` | `test.recovery@tectha.com` | `8888888888` |

---

## Request & Response Examples

### 1. Admin Creates User
`POST /api/users`
```json
// Request Body (Admin Session Cookie Required)
{
  "name": "John Doe",
  "email": "john@company.com",
  "secondaryEmail": "john.personal@gmail.com",
  "phone": "9876543210",
  "password": "SecurePassword123!",
  "role": "employee"
}

// Response (201 Created)
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user": {
      "id": "66b8e4f1a2...",
      "name": "John Doe",
      "email": "john@company.com",
      "secondaryEmail": "john.personal@gmail.com",
      "phone": "9876543210",
      "role": "employee",
      "isActive": true,
      "createdAt": "2026-08-11T00:00:00.000Z",
      "updatedAt": "2026-08-11T00:00:00.000Z"
    }
  }
}
```

### 2. Get Users with Search, Filter & Pagination
`GET /api/users?role=employee&status=active&search=john&page=1&limit=20&sortBy=createdAt&sortOrder=desc`
```json
// Response (200 OK)
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": {
    "users": [
      {
        "id": "66b8e4f1a2...",
        "name": "John Doe",
        "email": "john@company.com",
        "secondaryEmail": "john.personal@gmail.com",
        "phone": "9876543210",
        "role": "employee",
        "isActive": true,
        "createdAt": "2026-08-11T00:00:00.000Z",
        "updatedAt": "2026-08-11T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "totalUsers": 1,
      "totalPages": 1
    }
  }
}
```

### 3. Update User Status
`PATCH /api/users/:id/status`
```json
// Request Body
{
  "isActive": false
}

// Response (200 OK)
{
  "success": true,
  "message": "User account deactivated successfully",
  "data": {
    "user": {
      "id": "66b8e4f1a2...",
      "name": "John Doe",
      "role": "employee",
      "isActive": false
    }
  }
}
```

### 4. Error Response Example (Duplicate Credential / Admin Self-Lockout)
```json
// Response (400 Bad Request)
{
  "success": false,
  "message": "You cannot remove or disable your own admin access."
}
```

---

## Setup & Execution

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Run automated tests
npm test

# Run development server
npm run dev
```
