# Virtual Company Workspace — Frontend Admin Controls & API Integration

This directory contains the production-ready React frontend for the Virtual Company Workspace, featuring comprehensive **Admin Controls** fully integrated with the backend API endpoints (`/api/users` and `/api/auth`).

---

## 🚀 Overview of Admin Controls

The Admin Control Center allows authenticated system administrators to perform full lifecycle management of company workspace accounts (`admin`, `founder`, and `employee`).

### Key Features Implemented:
- 🔍 **Real-Time Search & Filtering**: Search across `name`, `email`, and `phone` with role and account status filters.
- 📄 **Server-Side Pagination**: Navigate paginated user records with customizable page size and sorting.
- ➕ **User Creation Modal**: Restricted admin form to create new accounts with primary email, recovery email, phone, and role.
- ✏️ **User Profile Management**: Update user profile details, roles, and contact info.
- ⚡ **Instant Status Toggle**: Activate or deactivate account access inline with one click.
- 🔑 **Admin Direct Password Reset**: Instantly set new passwords for any user without email verification.
- 🗑️ **Soft Deletion**: Safely soft-delete accounts while maintaining audit trails.
- 🛡️ **Self-Lockout & Last Admin Protection**: Full UI error handling for backend protection rules.

---

## 🔗 Backend Endpoint Integration Matrix

The table below details how frontend service methods in [`src/services/userService.js`](file:///e:/virtual-company-workspace/frontend/src/services/userService.js) map directly to the backend Express API endpoints documented in [`backend/README.md`](file:///e:/virtual-company-workspace/backend/README.md):

| Feature / UI Action | Service Method | Endpoint | HTTP Method | UI Location / Component |
| :--- | :--- | :--- | :--- | :--- |
| **Get Users List** | `userService.getUsers` | `/api/users` | `GET` | [`UserManagement.jsx`](file:///e:/virtual-company-workspace/frontend/src/components/admin/UserManagement.jsx) table |
| **Create User** | `userService.createUser` | `/api/users` | `POST` | "Create New Account" Modal |
| **Get Single User** | `userService.getUserById` | `/api/users/:id` | `GET` | User Details view |
| **Update User Profile** | `userService.updateUser` | `/api/users/:id` | `PUT` | "Edit User" Modal |
| **Toggle Status** | `userService.updateUserStatus` | `/api/users/:id/status` | `PATCH` | Inline Status Badge / Edit Modal |
| **Change Role** | `userService.updateUserRole` | `/api/users/:id/role` | `PATCH` | Role selector in Edit Modal |
| **Reset User Password** | `userService.resetUserPassword` | `/api/users/:id/reset-password` | `PATCH` | "Admin Password Reset" Modal |
| **Soft Delete User** | `userService.deleteUser` | `/api/users/:id` | `DELETE` | "Confirm Account Deletion" Modal |

---

## 🔒 Security & Backend Rules Clarifications

1. **Authentication via HTTP-Only Cookies**:
   - All API requests are processed through [`src/services/api.js`](file:///e:/virtual-company-workspace/frontend/src/services/api.js) configured with `credentials: 'include'`. JWT tokens are handled automatically in secure HTTP-Only cookies.

2. **Primary Email Login Restriction**:
   - Users can log in **only** using their primary email address (`email`). Secondary emails (`secondaryEmail`) are strictly reserved for password recovery and cannot be used for authentication.

3. **Admin Self-Lockout & Last Admin Protections**:
   - If an admin attempts to deactivate their own account, demote their own role, or soft delete the last remaining active administrator, the backend returns a `400 Bad Request` with an explanatory message (e.g. `"You cannot remove or disable your own admin access."` or `"At least one active administrator must remain."`). The frontend gracefully captures and renders these alerts.

4. **Soft Deletion (`deletedAt`)**:
   - Deleting a user via `userService.deleteUser` sets `isActive: false` and logs `deletedAt` on the backend, immediately barring login access without breaking foreign key references.

---

## 📁 Key File Structure

```
frontend/src/
├── services/
│   ├── api.js                # Core Fetch wrapper sending HTTP-Only cookies
│   ├── authService.js        # Auth endpoints (/api/auth/login, /api/auth/me, logout)
│   └── userService.js        # Admin User Management API service (/api/users)
├── components/
│   └── admin/
│       └── UserManagement.jsx# Admin Controls UI (Table, Search, Filters, Modals)
└── pages/
    └── admin/
        ├── Dashboard.jsx     # Admin Control Center with Tab navigation
        └── Employees.jsx     # Dedicated Admin User Controls page
```

---

## 🛠️ Setup & Running

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run Vite development server
npm run dev

# Build for production
npm run build
```

### Environment Variables (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5000/api
```

### Default Admin Login Credentials (Auto-seeded by backend):
- **Email**: `admin@tectha.com`
- **Password**: `Admin@123`
- **Role**: `admin`
