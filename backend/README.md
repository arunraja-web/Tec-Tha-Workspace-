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
- **Group Management & Founder Protection**: Active Founders automatically belong to every active group and cannot be removed or leave. Admins can voluntarily join and leave groups. Employee visibility is restricted exclusively to joined groups.
- **Real-Time Socket.IO Chat**: Supports direct 1-to-1 chat and group chat with real-time messaging, online/offline presence tracking, typing indicators, read status, unread counts, cursor pagination, message editing, soft deletion, and Cloudinary file attachments (`company-workspace/chat/`). Backend strictly authorizes group membership before allowing room joins or message delivery.
- **Task Management & Automated Workflows**: Comprehensive task module supporting creation, assignment, progress tracking (0-100%), priority levels, status transitions, review submissions, management approvals, task reopening, cancellation reasons, soft archiving/restoration, subtasks with auto-recalculated parent progress, task comments, Cloudinary file attachments (`company-workspace/tasks/`), analytics pipelines, audit history, in-app notifications, and scheduled hourly cron reminders/recurring task generation.
- **Daily Work Report Management**: Employees submit a maximum of ONE work report per working day in `COMPANY_TIMEZONE`, enforced by compound unique index `{ employee: 1, reportDate: 1 }`. Supports draft creation, task linking, Cloudinary attachment uploads (`company-workspace/work-reports/YYYY/MM/`), review workflows (`reviewed` / `needs_revision`), audit history (`WorkReportReview`), daily dashboard overviews, missing report detection, monthly analytics pipelines, notifications, activity log auditing, and daily automated scheduled reminders.
- **Leave Management & Founder-Only Approvals**: End-to-end leave module allowing employees to apply for leave (`casual`, `sick`, `annual`, `emergency`, `other`), view history, edit/cancel pending requests, and track status. Enforces strict backend authorization where **ONLY FOUNDER CAN APPROVE OR REJECT LEAVE** (`PATCH /api/leaves/:id/approve`, `/reject`). Admin accounts are strictly restricted to read-only access (returning `403 Forbidden: "Only Founder can approve leave requests."`). Features date overlap prevention, duplicate request blocking, Founder self-approval protection, automatic `Attendance` session syncing on approval, `WorkReport` missing-report exemption, audit logging (`LEAVE_CREATED`, `LEAVE_APPROVED`, etc.), notifications, search, filtering, and monthly/employee aggregation analytics.

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
| Create Meetings (`POST /api/meetings`) | ✅ | ✅ | ✅ |
| View Active Meetings (`GET /api/meetings`) | ✅ | ✅ | ✅ |
| Update Meeting (`PUT /api/meetings/:id`) | ✅ (All) | Creator Only | Creator Only |
| Toggle Meeting Status (`PATCH /api/meetings/:id/status`) | ✅ (All) | Creator Only | Creator Only |
| Deactivate Meeting (`DELETE /api/meetings/:id`) | ✅ (All) | Creator Only | Creator Only |
| Mark Daily Attendance (`POST /api/attendance`) | ✅ | ❌ | ❌ |
| Bulk Mark Attendance (`POST /api/attendance/bulk`) | ✅ | ❌ | ❌ |
| Update Attendance (`PUT/PATCH /api/attendance/*`) | ✅ | ❌ | ❌ |
| Get Daily Attendance (`GET /api/attendance`) | ✅ | ❌ | ❌ |
| View Own Attendance (`GET /api/attendance/my`) | ✅ | ✅ | ✅ |
| View Employee Calendar (`GET /api/attendance/employee/:id`) | ✅ | ✅ | Own ID Only |
| Monthly Analytics (`GET /api/attendance/analytics*`) | ✅ | ✅ | ❌ |
| Trigger Export & Download (`POST/GET /api/attendance/export*`) | ✅ | ✅ (View/Download) | ❌ |
| Create Group (`POST /api/groups`) | ✅ | ❌ | ❌ |
| View Active Groups (`GET /api/groups`) | ✅ (All) | ✅ (All) | Joined Only |
| View My Groups (`GET /api/groups/my`) | ✅ (Member) | ✅ (All) | Joined Only |
| View Group Details (`GET /api/groups/:id`) | ✅ (All) | ✅ (All) | Member Only |
| View Group Members (`GET /api/groups/:id/members`) | ✅ (All) | ✅ (All) | Member Only |
| Update Group (`PUT /api/groups/:id`) | ✅ | ❌ | ❌ |
| Deactivate/Reactivate Group (`PATCH /api/groups/:id/status`) | ✅ | ❌ | ❌ |
| Add Employee to Group (`POST /api/groups/:id/members`) | ✅ | ❌ | ❌ |
| Bulk Add Employees (`POST /api/groups/:id/members/bulk`) | ✅ | ❌ | ❌ |
| Remove Employee (`DELETE /api/groups/:id/members/:userId`) | ✅ | ❌ (Founders Protected) | ❌ |
| Admin Join Group (`POST /api/groups/:id/join`) | ✅ | ❌ | ❌ |
| Admin Leave Group (`DELETE /api/groups/:id/leave`) | ✅ | ❌ | ❌ |
| Soft Delete Group (`DELETE /api/groups/:id`) | ✅ | ❌ | ❌ |
| Create Direct Chat (`POST /api/conversations/direct`) | ✅ | ✅ | ✅ |
| View Conversations (`GET /api/conversations`) | ✅ | ✅ | ✅ |
| View Conversation Details (`GET /api/conversations/:id`) | ✅ (Member) | ✅ (Member) | Participant/Member Only |
| Mark Conversation Read (`PATCH /api/conversations/:id/read`) | ✅ (Member) | ✅ (Member) | Participant/Member Only |
| Get Messages (`GET /api/conversations/:id/messages`) | ✅ (Member) | ✅ (Member) | Participant/Member Only |
| Send Message (`POST /api/conversations/:id/messages`) | ✅ (Member) | ✅ (Member) | Participant/Member Only |
| Edit Message (`PUT /api/messages/:id`) | Sender Only | Sender Only | Sender Only |
| Soft Delete Message (`DELETE /api/messages/:id`) | Sender Only | Sender Only | Sender Only |
| Upload Chat Attachment (`POST /api/messages/attachment`) | ✅ | ✅ | ✅ |
| Create Task (`POST /api/tasks`) | ✅ | ✅ | ❌ |
| View All Tasks (`GET /api/tasks`) | ✅ | ✅ | Assigned Only (`/api/tasks/my`) |
| View Task Details (`GET /api/tasks/:id`) | ✅ | ✅ | Assigned Task Only |
| Update Task Details (`PUT /api/tasks/:id`) | ✅ | ✅ | ❌ |
| Reassign Task (`PATCH /api/tasks/:id/assign`) | ✅ | ✅ | ❌ |
| Update Task Status (`PATCH /api/tasks/:id/status`) | ✅ (Free) | ✅ (Free) | Allowed Workflow Only |
| Update Task Progress (`PATCH /api/tasks/:id/progress`) | ✅ | ✅ | ✅ (0-100%) |
| Complete Task (`PATCH /api/tasks/:id/complete`) | ✅ | ✅ | ❌ |
| Reopen / Cancel Task (`PATCH /api/tasks/:id/*`) | ✅ | ✅ | ❌ |
| Archive / Restore Task (`PATCH /api/tasks/:id/*`) | ✅ | ✅ | ❌ |
| Soft Delete Task (`DELETE /api/tasks/:id`) | ✅ | ❌ | ❌ |
| Manage Subtasks (`/api/tasks/:id/subtasks*`) | ✅ | ✅ | Status/Progress Only if Assigned |
| Manage Task Comments (`/api/tasks/:id/comments*`) | ✅ | ✅ | Own Comments & Assigned Tasks |
| Upload / Delete Attachments (`/api/tasks/:id/attachments*`) | ✅ | ✅ | Own Uploads & Assigned Tasks |
| View Company Analytics (`GET /api/tasks/analytics*`) | ✅ | ✅ | ❌ |
| View Personal Analytics (`GET /api/tasks/my/analytics`) | ✅ | ✅ | ✅ |
| Create Work Report Draft (`POST /api/work-reports`) | ❌ | ❌ | ✅ |
| View Own Work Reports (`GET /api/work-reports/my*`) | ❌ | ❌ | ✅ |
| Update Own Work Report (`PUT /api/work-reports/:id`) | ❌ | ❌ | Own Draft/Needs Revision |
| Submit Work Report (`POST /api/work-reports/:id/submit`) | ❌ | ❌ | Own Draft/Needs Revision |
| Upload Work Report Attachments (`POST /api/work-reports/:id/attachments`) | ❌ | ❌ | Own Draft/Needs Revision |
| View All Work Reports (`GET /api/work-reports`) | ✅ | ✅ | ❌ |
| View Single Work Report Details (`GET /api/work-reports/:id`) | ✅ | ✅ | Own Only |
| Review / Approve / Request Revision (`PATCH /api/work-reports/:id/review`) | ✅ | ✅ | ❌ |
| View Overview & Missing Reports (`GET /api/work-reports/overview*`, `missing`) | ✅ | ✅ | ❌ |
| View Work Report Analytics (`GET /api/work-reports/analytics*`) | ✅ | ✅ | ❌ |
| Apply for Leave (`POST /api/leaves`) | ✅ | ✅ | ✅ |
| View Own Leave History (`GET /api/leaves/my`) | ✅ | ✅ | ✅ |
| View All Leave Requests (`GET /api/leaves`, `pending`) | ✅ (Read-Only) | ✅ | ❌ |
| View Single Leave Details (`GET /api/leaves/:id`) | ✅ | ✅ | Own Only |
| Edit Pending Leave (`PUT /api/leaves/:id`) | ❌ | ❌ | Own Pending |
| Cancel Pending Leave (`PATCH /api/leaves/:id/cancel`) | ❌ | ❌ | Own Pending |
| Approve Leave Request (`PATCH /api/leaves/:id/approve`) | **❌ (403)** | **✅ (Founder Only)** | ❌ |
| Reject Leave Request (`PATCH /api/leaves/:id/reject`) | **❌ (403)** | **✅ (Founder Only)** | ❌ |
| View Leave Analytics (`GET /api/leaves/analytics*`) | ✅ | ✅ | ❌ |

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

### 3. Employee Meeting Endpoints (`/api/meetings`)

All routes require `protect` (authenticated user).

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/meetings` | Authenticated | Create meeting (`title`, `description`, `meetingLink`). Creator assigned automatically. |
| `GET` | `/api/meetings` | Authenticated | Get all active meetings with search, pagination, and sorting. |
| `GET` | `/api/meetings/:id` | Authenticated | Get single active meeting details. Returns 404 if missing or inactive. |
| `PUT` | `/api/meetings/:id` | Creator / Admin | Update meeting details (`title`, `description`, `meetingLink`). |
| `PATCH` | `/api/meetings/:id/status` | Creator / Admin | Activate or deactivate meeting status (`isActive: true/false`). |
| `DELETE` | `/api/meetings/:id` | Creator / Admin | Soft delete meeting (`isActive: false`). |

### 4. Attendance Management & Monthly Analytics Endpoints (`/api/attendance`)

All routes require `protect` (authenticated user) and enforce Role-Based Access Control.

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/attendance` | Admin | Get daily attendance for all active employees for `?date=YYYY-MM-DD`. |
| `POST` | `/api/attendance` | Admin | Mark single employee session attendance (`morning` / `evening`). |
| `POST` | `/api/attendance/bulk` | Admin | Bulk mark session attendance for multiple employees. |
| `PUT` | `/api/attendance/:id` | Admin | Update morning/evening status on existing attendance document. |
| `PATCH` | `/api/attendance/:id/session` | Admin | Update specific session status (`morning` / `evening`). |
| `GET` | `/api/attendance/my` | Authenticated | Employee view of their own attendance history (`?month=YYYY-MM`). |
| `GET` | `/api/attendance/employee/:employeeId` | Admin, Founder, Employee (Own ID) | Detailed monthly calendar view per employee (`?month=YYYY-MM`). |
| `GET` | `/api/attendance/analytics` | Admin, Founder | Get overall & individual employee monthly attendance analytics (`?month=YYYY-MM`). |
| `GET` | `/api/attendance/analytics/department` | Admin, Founder | Get department-level attendance analytics (`?month=YYYY-MM`). |
| `POST` | `/api/attendance/export/:month` | Admin | Manually trigger monthly Excel report generation & Cloudinary upload. |
| `GET` | `/api/attendance/exports` | Admin, Founder | View list of all completed historical monthly export reports. |
| `POST` | `/api/attendance/test-archive/:month` | Admin | Dev/Test endpoint to trigger safe monthly archiving & record deletion. |

### 5. Group Management Endpoints (`/api/groups`)

All routes require `protect` (authenticated user) and enforce Role-Based Access Control.

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/groups` | Admin | Create a new group (`name`, `description`). Active Founders automatically added. Creator Admin is not auto-added. |
| `GET` | `/api/groups` | Authenticated | List all active groups. Admin & Founder see all active groups; Employees see only joined groups. Supports search & pagination. |
| `GET` | `/api/groups/my` | Authenticated | List active groups where current user is a member. |
| `GET` | `/api/groups/:id` | Authenticated | Get single group details. Allowed for Admin, Founder, or member Employees (403 Forbidden for non-member Employees). |
| `GET` | `/api/groups/:id/members` | Authenticated | Get populated member list (`name`, `email`, `role`) for a group. Allowed for Admin, Founder, or member Employees. |
| `PUT` | `/api/groups/:id` | Admin | Update group `name` and `description` (mass assignment protected). |
| `PATCH` | `/api/groups/:id/status` | Admin | Deactivate or reactivate group (`isActive: true/false`). Reactivation auto-ensures all active Founders exist in group. |
| `POST` | `/api/groups/:id/members` | Admin | Add single employee to group. Blocked for Admin/Founder manual additions. |
| `POST` | `/api/groups/:id/members/bulk` | Admin | Bulk add multiple employees to group. Returns `{ added, alreadyMembers, failed }` summary. |
| `DELETE` | `/api/groups/:id/members/:userId` | Admin | Remove employee member from group. **Founder removal strictly prohibited** (`Founder must remain a member of every group.`). |
| `POST` | `/api/groups/:id/join` | Admin | Admin voluntarily joins group. |
| `DELETE` | `/api/groups/:id/leave` | Admin | Admin leaves group voluntarily. |
| `DELETE` | `/api/groups/:id` | Admin | Soft delete group (`isActive: false`). |

### 6. Direct & Group Conversation Endpoints (`/api/conversations`)

All routes require `protect` (authenticated user) and enforce membership authorization.

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/conversations/direct` | Authenticated | Create or get existing 1-to-1 direct conversation with `userId` (Deduplicated by sorting IDs). |
| `GET` | `/api/conversations` | Authenticated | Get all active user conversations (direct & group) with `lastMessage`, `lastMessageAt`, and `unreadCount`. |
| `GET` | `/api/conversations/:id` | Authenticated | Get single conversation details. Verifies direct participation or active Group membership (403 Forbidden for non-members). |
| `PATCH` | `/api/conversations/:id/read` | Authenticated | Mark conversation as read up to latest or target message. Resets `unreadCount`. |
| `GET` | `/api/conversations/:id/messages` | Authenticated | Get paginated message history for a conversation (`limit`, `before` message ID cursor). |
| `POST` | `/api/conversations/:id/messages` | Authenticated | Send message in a conversation. Saves to MongoDB first, updates Conversation, emits Socket.IO event, and sends notifications. |

### 7. Message & Attachment Endpoints (`/api/messages`)

All routes require `protect` (authenticated user).

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/messages/attachment` | Authenticated | Upload image/document attachment to Cloudinary (`company-workspace/chat/`). Max 10MB limit. |
| `PUT` | `/api/messages/:id` | Original Sender | Edit message content. Sets `isEdited: true` and `editedAt` timestamp. Emits `message_edited` via Socket.IO. |
| `DELETE` | `/api/messages/:id` | Original Sender | Soft delete message (`isDeleted: true`, `content: ""`). Emits `message_deleted` via Socket.IO. |

### 8. Socket.IO Events Reference

Real-time WebSocket connection requires JWT authentication via HTTP-only cookie or Bearer token.

| Event Name | Direction | Payload / Parameters | Description |
| :--- | :--- | :--- | :--- |
| `join_conversation` | Client -> Server | `{ conversationId }`, `ack` | Join Socket.IO room `conversation:{conversationId}` after backend authorization check. |
| `leave_conversation` | Client -> Server | `{ conversationId }`, `ack` | Leave Socket.IO room `conversation:{conversationId}`. |
| `send_message` | Client -> Server | `{ conversationId, content, messageType, attachment, replyTo }`, `ack` | Rate-limited message sending. Persists to MongoDB first before broadcasting `new_message`. |
| `typing_start` | Client -> Server | `{ conversationId }` | Rate-limited. Broadcasts `user_typing` to conversation room. |
| `typing_stop` | Client -> Server | `{ conversationId }` | Broadcasts `user_typing_stop` to conversation room. |
| `message_read` | Client -> Server | `{ conversationId, messageId }`, `ack` | Updates participant read state in DB and broadcasts `message_read` to conversation room. |
| `new_message` | Server -> Client | `Message` Document | Broadcast when a new message is saved to MongoDB. |
| `user_typing` | Server -> Client | `{ conversationId, user: { _id, name } }` | Emitted when another user starts typing. |
| `user_typing_stop` | Server -> Client | `{ conversationId, userId }` | Emitted when another user stops typing. |
| `message_edited` | Server -> Client | `Message` Document | Emitted when a message content is updated. |
| `message_deleted` | Server -> Client | `{ _id, conversation, isDeleted: true, deletedAt }` | Emitted when a message is soft-deleted. |
| `user_online` | Server -> Client | `{ userId, isOnline: true }` | Emitted when a user connects their first active socket. |
| `user_offline` | Server -> Client | `{ userId, isOnline: false, lastSeen }` | Emitted when all socket connections for a user disconnect. |

### 9. Task Management Endpoints (`/api/tasks`)

All routes require `protect` (authenticated user) and enforce Role-Based Access Control.

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/tasks` | Admin, Founder | Create a new task (`title`, `description`, `assignedTo`, `group`, `priority`, `startDate`, `dueDate`, `isRecurring`). |
| `GET` | `/api/tasks` | Authenticated | List all tasks with search, filter (`status`, `priority`, `assignedTo`, `group`, `overdue`, `isArchived`), sorting, and pagination. Admin/Founder see all; Employee sees assigned only. |
| `GET` | `/api/tasks/my` | Authenticated | Get current logged-in employee's assigned tasks (`req.user._id`). |
| `GET` | `/api/tasks/:id` | Authenticated | Get single task details. Restricted to Admin, Founder, or assigned Employee. |
| `PUT` | `/api/tasks/:id` | Admin, Founder | Update allowed task details (`title`, `description`, `assignedTo`, `group`, `priority`, `startDate`, `dueDate`). Mass assignment protected. |
| `PATCH` | `/api/tasks/:id/assign` | Admin, Founder | Dedicated task reassignment endpoint. Updates `assignedTo` and notifies assignees. |
| `PATCH` | `/api/tasks/:id/status` | Authenticated | Update task status (`todo`, `in_progress`, `in_review`, `completed`, `cancelled`). Enforces role-based workflow rules. |
| `PATCH` | `/api/tasks/:id/progress` | Authenticated | Update task progress percentage (0-100%). Automatically sets status to `in_review` when Employee hits 100%. |
| `PATCH` | `/api/tasks/:id/complete` | Admin, Founder | Mark task as completed (`status=completed`, `progress=100`, `completedAt=now`). |
| `PATCH` | `/api/tasks/:id/reopen` | Admin, Founder | Reopen task (`status=in_progress`, `completedAt=null`). |
| `PATCH` | `/api/tasks/:id/cancel` | Admin, Founder | Cancel task (`status=cancelled`, `cancelledAt=now`, required `reason`). |
| `PATCH` | `/api/tasks/:id/archive` | Admin, Founder | Soft archive task (`isArchived=true`, `archivedAt=now`). |
| `PATCH` | `/api/tasks/:id/restore` | Admin, Founder | Restore archived task (`isArchived=false`). |
| `DELETE` | `/api/tasks/:id` | Admin | Soft delete task. |
| `POST` | `/api/tasks/:id/duplicate` | Admin, Founder | Duplicate existing task into a new task instance (`status=todo`, `progress=0`). |
| `POST` | `/api/tasks/bulk` | Admin, Founder | Bulk create multiple tasks. Returns `{ created, failed, errors }`. |
| `PATCH` | `/api/tasks/bulk/assign` | Admin, Founder | Bulk assign multiple tasks to a target employee. |
| `GET` | `/api/tasks/:id/history` | Authenticated | Get complete audit history trail for a task. |
| `GET` | `/api/tasks/:id/comments` | Authenticated | Get task comments list. |
| `POST` | `/api/tasks/:id/comments` | Authenticated | Add a comment to a task. Dispatches notifications to task participants. |
| `PUT` | `/api/tasks/:id/comments/:commentId` | Authenticated | Update task comment (Author, Admin, Founder). |
| `DELETE` | `/api/tasks/:id/comments/:commentId` | Authenticated | Delete task comment (Author, Admin, Founder). |
| `POST` | `/api/tasks/:id/attachments` | Authenticated | Upload attachment file to Cloudinary (`company-workspace/tasks/`). Max 10MB limit. |
| `DELETE` | `/api/tasks/:id/attachments/:attachmentId` | Authenticated | Remove task attachment metadata and destroy asset on Cloudinary. |
| `GET` | `/api/tasks/:id/subtasks` | Authenticated | Get list of subtasks for a parent task. |
| `POST` | `/api/tasks/:id/subtasks` | Admin, Founder | Create subtask referencing parent task. |
| `PUT` | `/api/tasks/:id/subtasks/:subtaskId` | Admin, Founder | Update subtask details. Prevents circular parent relationships. |
| `PATCH` | `/api/tasks/:id/subtasks/:subtaskId/status` | Authenticated | Update subtask status or progress. Auto-recalculates parent task progress. |
| `DELETE` | `/api/tasks/:id/subtasks/:subtaskId` | Admin, Founder | Delete subtask. |
| `GET` | `/api/tasks/analytics` | Admin, Founder | Company-wide task analytics, completion percentages, average completion time, priority breakdown. Supports `?from=&to=` filters. |
| `GET` | `/api/tasks/analytics/employees` | Admin, Founder | Employee performance breakdown analytics. Supports `?from=&to=` filters. |
| `GET` | `/api/tasks/my/analytics` | Authenticated | Logged-in employee personal task performance metrics. |

### 10. Daily Work Report Management Endpoints (`/api/work-reports`)

All routes require `protect` (authenticated user) and enforce Role-Based Access Control.

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/work-reports` | Employee | Create daily work report draft (`employee = req.user._id`). |
| `GET` | `/api/work-reports/my` | Employee | Get logged-in employee's work reports (`?page=1&limit=20&month=YYYY-MM&status=submitted`). |
| `GET` | `/api/work-reports/my/today` | Employee | Get today's work report in `COMPANY_TIMEZONE`. |
| `GET` | `/api/work-reports/overview` | Admin, Founder | Get daily report overview metrics (`?date=YYYY-MM-DD`). |
| `GET` | `/api/work-reports/missing` | Admin, Founder | Get employees missing reports excluding approved leave/holiday (`?date=YYYY-MM-DD`). |
| `GET` | `/api/work-reports/analytics` | Admin, Founder | Monthly work report analytics summary (`?month=YYYY-MM`). |
| `GET` | `/api/work-reports/analytics/employees` | Admin, Founder | Employee-wise monthly work report analytics breakdown (`?month=YYYY-MM`). |
| `GET` | `/api/work-reports` | Admin, Founder | List all employee work reports (`?search=kw&status=submitted&employee=ID&month=YYYY-MM`). |
| `GET` | `/api/work-reports/:id` | Employee (Own), Admin, Founder | Get single work report details with `reviewHistory`. |
| `PUT` | `/api/work-reports/:id` | Employee (Own) | Update own `draft` or `needs_revision` work report. |
| `POST` | `/api/work-reports/:id/submit` | Employee (Own) | Submit `draft` or `needs_revision` work report. Dispatches notifications to Admin/Founder. |
| `POST` | `/api/work-reports/:id/attachments` | Employee (Own) | Upload attachment file to Cloudinary (`company-workspace/work-reports/YYYY/MM/`). Max 10MB limit. |
| `DELETE` | `/api/work-reports/:id/attachments/:attachmentId` | Employee (Own), Admin, Founder | Remove attachment metadata and destroy asset on Cloudinary. |
| `PATCH` | `/api/work-reports/:id/review` | Admin, Founder | Review work report (`action: "approve"` or `"request_revision"`, comment). Self-review forbidden. |

### 11. Leave Management Endpoints (`/api/leaves`)

All routes require `protect` (authenticated user) and enforce Role-Based Access Control.

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/leaves` | Authenticated | Apply for leave request (`leaveType`, `startDate`, `endDate`, `reason`). Employee ID derived from token. |
| `GET` | `/api/leaves/my` | Authenticated | Get current authenticated user's leave history (`?page=1&limit=20&status=pending&month=YYYY-MM`). |
| `GET` | `/api/leaves/pending` | Admin, Founder | Convenience list of pending leave requests (`?page=1&limit=20`). |
| `GET` | `/api/leaves/analytics` | Admin, Founder | Overall leave analytics summary (`?month=YYYY-MM&startDate=&endDate=`). |
| `GET` | `/api/leaves/analytics/employees` | Admin, Founder | Employee-wise leave breakdown analytics (`?month=YYYY-MM`). |
| `GET` | `/api/leaves` | Admin, Founder | List all company leave requests with search (`name`/`email`/`reason`), filters (`status`, `leaveType`, `employee`, `department`, `month`, date range), sorting, and pagination. |
| `GET` | `/api/leaves/:id` | Employee (Own), Admin, Founder | Get single leave details. Employee restricted to own request. |
| `PUT` | `/api/leaves/:id` | Employee (Own) | Update pending leave request (`leaveType`, `startDate`, `endDate`, `reason`). Re-evaluates date overlaps. |
| `PATCH` | `/api/leaves/:id/cancel` | Employee (Own) | Cancel pending leave request (`status = cancelled`, `cancelledAt = now`). Notifies active Founders. |
| `PATCH` | `/api/leaves/:id/approve` | **FOUNDER ONLY** | Approve pending leave request (`comment`). Self-approval blocked. Syncs `Attendance` session status to `leave`. Re-evaluates overlap. Admin receives `403 Forbidden: "Only Founder can approve leave requests."`. |
| `PATCH` | `/api/leaves/:id/reject` | **FOUNDER ONLY** | Reject pending leave request (Required `comment`). Admin receives `403 Forbidden: "Only Founder can reject leave requests."`. |

---

## Query Parameters Reference

### Users Query Parameters (`GET /api/users`)

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `search` | String | - | Search keyword across `name`, `email`, and `phone` (case-insensitive). |
| `role` | String | - | Filter by user role (`admin`, `founder`, `employee`). |
| `status` | String | - | Filter by active status (`active` or `inactive`). |
| `page` | Integer | `1` | Page number for pagination. |
| `limit` | Integer | `20` | Items per page (max: `100`). |
| `sortBy` | String | `createdAt` | Field to sort by (`name`, `email`, `role`, `createdAt`, `updatedAt`). |
| `sortOrder` | String | `desc` | Sort direction (`asc` or `desc`). |

### Meetings Query Parameters (`GET /api/meetings`)

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `search` | String | - | Search keyword across `title` and `description` (case-insensitive). |
| `page` | Integer | `1` | Page number for pagination. |
| `limit` | Integer | `20` | Items per page (max: `100`). |
| `sortOrder` | String | `desc` | Sort direction (`asc` or `desc`) by `createdAt`. |

### Groups Query Parameters (`GET /api/groups`)

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `search` | String | - | Search keyword across group `name` and `description` (case-insensitive). |
| `page` | Integer | `1` | Page number for pagination. |
| `limit` | Integer | `20` | Items per page (max: `100`). |

### Messages Query Parameters (`GET /api/conversations/:id/messages`)

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `limit` | Integer | `30` | Number of messages to return (max: `100`). |
| `before` | String (Mongo ID) | - | Message ID cursor for fetching older messages prior to this message timestamp. |

### Attendance Query Parameters (`GET /api/attendance/*`)

| Parameter | Endpoint | Type | Format / Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `date` | `/api/attendance` | String | `YYYY-MM-DD` | Specific daily working date (defaults to today in `COMPANY_TIMEZONE`). |
| `month` | `/api/attendance/my`, `/analytics`, `/employee/:id` | String | `YYYY-MM` | Target month string (defaults to current month in `COMPANY_TIMEZONE`). |

### Work Reports Query Parameters (`GET /api/work-reports*`)

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `search` | String | - | Search keyword across `summary`, `completedWork`, `challenges`, `nextDayPlan` (case-insensitive). |
| `status` | String | - | Filter by report status (`draft`, `submitted`, `needs_revision`, `reviewed`). |
| `date` | String | - | Filter by specific report date (`YYYY-MM-DD`). |
| `month` | String | - | Filter by month (`YYYY-MM`). |
| `employee` | String (Mongo ID) | - | Filter by employee ObjectId. |
| `department` | String | - | Filter by employee department name. |
| `page` | Integer | `1` | Page number for pagination. |
| `limit` | Integer | `20` | Items per page (max: `100`). |

### Leaves Query Parameters (`GET /api/leaves*`)

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `search` | String | - | Search keyword across employee `name`, `email`, and leave `reason` (case-insensitive). |
| `status` | String | - | Filter by status (`pending`, `approved`, `rejected`, `cancelled`). |
| `leaveType` | String | - | Filter by leave type (`casual`, `sick`, `annual`, `emergency`, `other`). |
| `month` | String | - | Filter by target month (`YYYY-MM`). |
| `startDate` | String | - | Start of date range (`YYYY-MM-DD`). |
| `endDate` | String | - | End of date range (`YYYY-MM-DD`). |
| `employee` | String (Mongo ID) | - | Filter by specific employee ObjectId. |
| `department` | String | - | Filter by employee department. |
| `page` | Integer | `1` | Page number for pagination. |
| `limit` | Integer | `20` | Items per page (max: `100`). |
| `sortBy` | String | `createdAt` | Field to sort by (`createdAt`, `startDate`, `endDate`, `status`). |
| `sortOrder` | String | `desc` | Sort order (`asc` or `desc`). |

---

## Default Seed Credentials

Upon server startup (`npm run dev`), the system automatically seeds initial accounts if they do not exist:

| Role | Primary Email | Password | Secondary Email | Phone |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | `admin@tectha.com` | `Admin@123` | `admin.recovery@tectha.com` | `9999999999` |
| **Employee** | `test@tectha.com` | `12345678` | `test.recovery@tectha.com` | `8888888888` |

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

### 4. Create Meeting Example
`POST /api/meetings`
```json
// Request Body (Authenticated Cookie or Bearer Token Required)
{
  "title": "Weekly Team Meeting",
  "description": "Discuss project progress.",
  "meetingLink": "https://meet.google.com/abc-defg-hij"
}

// Response (201 Created)
{
  "success": true,
  "message": "Meeting created successfully",
  "data": {
    "title": "Weekly Team Meeting",
    "description": "Discuss project progress.",
    "meetingLink": "https://meet.google.com/abc-defg-hij",
    "isActive": true,
    "createdBy": "66b8e4f1a2...",
    "createdAt": "2026-08-11T14:30:00.000Z",
    "id": "66b8f521b3..."
  }
}
```

### 5. Get Active Meetings Example
`GET /api/meetings?search=Team&page=1&limit=20&sortOrder=desc`
```json
// Response (200 OK)
{
  "success": true,
  "message": "Meetings retrieved successfully",
  "data": {
    "meetings": [
      {
        "id": "66b8f521b3...",
        "title": "Weekly Team Meeting",
        "description": "Discuss project progress.",
        "meetingLink": "https://meet.google.com/abc-defg-hij",
        "isActive": true,
        "createdBy": "66b8e4f1a2...",
        "createdAt": "2026-08-11T14:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "totalMeetings": 1,
      "totalPages": 1
    }
  }
}
```

### 6. Mark Single & Bulk Attendance Example
`POST /api/attendance`
```json
// Single Marking Request Body (Admin Session Cookie Required)
{
  "employeeId": "66b8e4f1a2...",
  "date": "2026-08-11",
  "session": "morning",
  "status": "present"
}

// Bulk Marking Request Body: POST /api/attendance/bulk
{
  "date": "2026-08-11",
  "session": "morning",
  "attendance": [
    { "employeeId": "66b8e4f1a2...", "status": "present" },
    { "employeeId": "66b8e4f1b3...", "status": "absent" }
  ]
}

// Bulk Response (200 OK)
{
  "success": true,
  "message": "Morning attendance saved successfully",
  "data": {
    "total": 2,
    "successful": 2,
    "failed": 0,
    "failureDetails": []
  }
}
```

### 7. Monthly Analytics Response Example
`GET /api/attendance/analytics?month=2026-08`
```json
// Response (200 OK)
{
  "success": true,
  "message": "Attendance monthly analytics retrieved successfully",
  "data": {
    "month": "2026-08",
    "summary": {
      "totalEmployees": 20,
      "workingDays": 22,
      "totalPresent": 380,
      "totalAbsent": 20,
      "totalLeave": 10,
      "totalHoliday": 30,
      "overallAttendancePercentage": 95.00
    },
    "employees": [
      {
        "employee": {
          "_id": "66b8e4f1a2...",
          "name": "John Doe",
          "email": "john@company.com",
          "department": "Engineering"
        },
        "morning": { "present": 20, "absent": 1, "leave": 1, "holiday": 0 },
        "evening": { "present": 19, "absent": 2, "leave": 1, "holiday": 0 },
        "totalPresent": 39,
        "totalAbsent": 3,
        "totalLeave": 2,
        "totalHoliday": 0,
        "attendancePercentage": 92.86
      }
    ]
  }
}
```

### 8. Create Group Example
`POST /api/groups`
```json
// Request Body (Admin Session Cookie Required)
{
  "name": "Development Team",
  "description": "MERN stack development team"
}

// Response (201 Created)
{
  "success": true,
  "message": "Group created successfully",
  "data": {
    "name": "Development Team",
    "description": "MERN stack development team",
    "createdBy": "66b8e4f1a2...",
    "members": [
      "66b8e4f1a3...",
      "66b8e4f1a4..."
    ],
    "isActive": true,
    "createdAt": "2026-08-12T04:00:00.000Z",
    "updatedAt": "2026-08-12T04:00:00.000Z",
    "id": "66b8f990c4..."
  }
}
```

### 9. Bulk Add Group Members Example
`POST /api/groups/:id/members/bulk`
```json
// Request Body (Admin Session Cookie Required)
{
  "userIds": [
    "66b8e4f1a5...",
    "66b8e4f1a6..."
  ]
}

// Response (200 OK)
{
  "success": true,
  "message": "Members added successfully",
  "data": {
    "added": 2,
    "alreadyMembers": 0,
    "failed": 0
  }
}
```

### 10. Send Message Example
`POST /api/conversations/:id/messages`
```json
// Request Body (Authenticated Session Cookie Required)
{
  "content": "Hello team, project API design is complete!",
  "messageType": "text"
}

// Response (201 Created)
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "id": "66b91122a1...",
    "conversation": "66b90f44b2...",
    "sender": {
      "id": "66b8e4f1a2...",
      "name": "John Employee",
      "email": "john@company.com",
      "role": "employee"
    },
    "content": "Hello team, project API design is complete!",
    "messageType": "text",
    "isEdited": false,
    "isDeleted": false,
    "createdAt": "2026-08-12T04:30:00.000Z",
    "updatedAt": "2026-08-12T04:30:00.000Z"
  }
}
```

### 11. Upload Chat Attachment Example
`POST /api/messages/attachment`
```json
// FormData Body: file = project_report.pdf
// Response (200 OK)
{
  "success": true,
  "message": "File uploaded to Cloudinary successfully",
  "data": {
    "fileName": "project_report.pdf",
    "fileUrl": "https://res.cloudinary.com/.../company-workspace/chat/1723437000_project_report.pdf",
    "publicId": "company-workspace/chat/1723437000_project_report.pdf",
    "fileType": "file",
    "fileSize": 245890
  }
}
```

### 12. Task Creation Example
`POST /api/tasks`
```json
// Request Body (Admin / Founder Session Cookie Required)
{
  "title": "Develop JWT Authentication",
  "description": "Implement authentication endpoints with HTTP-only cookies",
  "assignedTo": "66b8e4f1a2...",
  "group": "66b8f990c4...",
  "priority": "high",
  "startDate": "2026-08-12",
  "dueDate": "2026-08-20"
}

// Response (201 Created)
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "id": "66c10ab2e9...",
    "title": "Develop JWT Authentication",
    "description": "Implement authentication endpoints with HTTP-only cookies",
    "assignedTo": {
      "id": "66b8e4f1a2...",
      "name": "John Doe",
      "email": "john@company.com",
      "role": "employee"
    },
    "assignedBy": {
      "id": "66b8e4f1a1...",
      "name": "System Admin",
      "email": "admin@tectha.com",
      "role": "admin"
    },
    "group": {
      "id": "66b8f990c4...",
      "name": "Engineering Team"
    },
    "status": "todo",
    "priority": "high",
    "progress": 0,
    "startDate": "2026-08-12T00:00:00.000Z",
    "dueDate": "2026-08-20T00:00:00.000Z",
    "isArchived": false,
    "attachments": [],
    "createdAt": "2026-08-12T05:00:00.000Z",
    "updatedAt": "2026-08-12T05:00:00.000Z"
  }
}
```

### 13. Task Analytics Example
`GET /api/tasks/analytics`
```json
// Response (200 OK)
{
  "success": true,
  "message": "Company task analytics retrieved successfully",
  "data": {
    "totalTasks": 50,
    "todo": 8,
    "inProgress": 12,
    "inReview": 5,
    "completed": 20,
    "cancelled": 5,
    "overdue": 4,
    "completionPercentage": 40,
    "averageCompletionTime": 14.5,
    "priorityBreakdown": {
      "low": 10,
      "medium": 20,
      "high": 15,
      "urgent": 5
    }
  }
}
```

### 14. Create & Submit Work Report Example
`POST /api/work-reports`
```json
// Create Draft Request Body (Employee Session Cookie Required)
{
  "summary": "Worked on backend API design and JWT middleware",
  "completedWork": "Built work report endpoints, controllers, and schemas",
  "challenges": "Handled timezone calculations for company timezone",
  "nextDayPlan": "Integrate frontend components",
  "tasks": ["66c10ab2e9..."]
}

// Response (201 Created)
{
  "success": true,
  "message": "Work report draft created successfully",
  "data": {
    "id": "66c20ff1a3...",
    "employee": {
      "id": "66b8e4f1a2...",
      "name": "John Doe",
      "email": "john@company.com",
      "role": "employee",
      "department": "Engineering"
    },
    "reportDate": "2026-08-12T00:00:00.000Z",
    "summary": "Worked on backend API design and JWT middleware",
    "completedWork": "Built work report endpoints, controllers, and schemas",
    "challenges": "Handled timezone calculations for company timezone",
    "nextDayPlan": "Integrate frontend components",
    "tasks": [
      {
        "id": "66c10ab2e9...",
        "title": "Develop JWT Authentication",
        "status": "in_progress",
        "progress": 60
      }
    ],
    "attachments": [],
    "status": "draft",
    "createdAt": "2026-08-12T05:30:00.000Z",
    "updatedAt": "2026-08-12T05:30:00.000Z"
  }
}
```

### 15. Admin / Founder Review Work Report Example
`PATCH /api/work-reports/:id/review`
```json
// Review Request Body (Admin / Founder Session Cookie Required)
{
  "action": "approve",
  "comment": "Great work on the backend architecture."
}

// Response (200 OK)
{
  "success": true,
  "message": "Work report approved successfully",
  "data": {
    "id": "66c20ff1a3...",
    "status": "reviewed",
    "reviewedBy": {
      "id": "66b8e4f1a1...",
      "name": "System Admin",
      "email": "admin@tectha.com",
      "role": "admin"
    },
    "reviewedAt": "2026-08-12T05:45:00.000Z",
    "reviewComment": "Great work on the backend architecture."
  }
}
```

### 16. Work Report Daily Overview Example
`GET /api/work-reports/overview?date=2026-08-12`
```json
// Response (200 OK)
{
  "success": true,
  "message": "Daily work report overview fetched successfully",
  "data": {
    "date": "2026-08-12",
    "totalEmployees": 20,
    "expectedReports": 19,
    "submitted": 15,
    "draft": 2,
    "needsRevision": 1,
    "reviewed": 12,
    "missing": 1
  }
}
```

### 17. Apply for Leave Example
`POST /api/leaves`
```json
// Request Body (Authenticated Employee Cookie Required)
{
  "leaveType": "casual",
  "startDate": "2026-08-18",
  "endDate": "2026-08-19",
  "reason": "Personal family work and relocation"
}

// Response (201 Created)
{
  "success": true,
  "message": "Leave request submitted successfully",
  "data": {
    "id": "6a7bc179382e6ea218e6f615",
    "employee": {
      "id": "6a7bc179382e6ea218e6f610",
      "name": "John Employee",
      "email": "john@company.com",
      "role": "employee",
      "department": "Engineering"
    },
    "leaveType": "casual",
    "startDate": "2026-08-17T18:30:00.000Z",
    "endDate": "2026-08-19T18:29:59.999Z",
    "reason": "Personal family work and relocation",
    "status": "pending",
    "reviewedBy": null,
    "reviewedAt": null,
    "reviewComment": "",
    "cancelledAt": null,
    "createdAt": "2026-08-12T06:00:00.000Z",
    "updatedAt": "2026-08-12T06:00:00.000Z"
  }
}
```

### 18. Founder Approve Leave Example
`PATCH /api/leaves/:id/approve`
```json
// Request Body (Founder Session Cookie Required)
{
  "comment": "Approved. Have a great break!"
}

// Response (200 OK)
{
  "success": true,
  "message": "Leave request approved successfully",
  "data": {
    "id": "6a7bc179382e6ea218e6f615",
    "status": "approved",
    "reviewedBy": {
      "id": "6a7bc179382e6ea218e6f600",
      "name": "Jane Founder",
      "email": "founder@company.com",
      "role": "founder"
    },
    "reviewedAt": "2026-08-12T06:05:00.000Z",
    "reviewComment": "Approved. Have a great break!"
  }
}
```

### 19. Admin Attempting Leave Approval Error Example
`PATCH /api/leaves/:id/approve`
```json
// Response (403 Forbidden - Admin Restricted)
{
  "success": false,
  "message": "Only Founder can approve leave requests."
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
