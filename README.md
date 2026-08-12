# Virtual Company Workspace (TEC THA Workspace)

A full-stack, enterprise-grade virtual company workspace application built with **Node.js, Express, MongoDB** on the backend and **React, TailwindCSS, Lucide Icons, Vite** on the frontend.

---

## 📁 Repository Structure

- [`/backend`](file:///e:/virtual-company-workspace/backend): Express REST API with MongoDB & Mongoose. Complete with user management endpoints (`/api/users`), authentication (`/api/auth`), role-based access control (`admin`, `founder`, `employee`), and automated unit tests.
  - Detailed documentation: [`backend/README.md`](file:///e:/virtual-company-workspace/backend/README.md)
- [`/frontend`](file:///e:/virtual-company-workspace/frontend): React frontend application featuring the Admin Control Center, role-based dashboards, authentication flows, and theme customization (Light/Dark modes).
  - Detailed documentation: [`frontend/README.md`](file:///e:/virtual-company-workspace/frontend/README.md)

---

## 🛠️ Quick Start

```bash
# 1. Start Backend Server (Runs on http://localhost:5000)
cd backend
npm install
npm run dev

# 2. Start Frontend Application (Runs on http://localhost:5173)
cd ../frontend
npm install
npm run dev
```

### Initial Admin Login Credentials:
- **Primary Email**: `admin@tectha.com`
- **Password**: `Admin@123`
- **Role**: `admin`
