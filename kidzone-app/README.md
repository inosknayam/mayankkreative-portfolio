# KidZone Staff Portal

A fully dynamic, role-based staff management and child attendance system. **No staff names, manager identities, or permission assignments are ever hardcoded** — all personnel data lives exclusively in the MySQL database and is managed through the admin UI.

---

## Colour Palette

The UI uses soft, approachable pastel shades across five accent colours:

| Colour | Hex Range | Used For |
|--------|-----------|----------|
| Blue   | `#DBEAFE` → `#93C5FD` → `#3B82F6` | Check-In, Event Lead role |
| Pink   | `#FCE7F3` → `#F9A8D4` → `#EC4899` | Check-Out / Safe-Exit, Caretaker role |
| Yellow | `#FEF9C3` → `#FDE68A` → `#F59E0B` | Warnings, Children registry |
| Purple | `#EDE9FE` → `#C4B5FD` → `#8B5CF6` | Dashboard, Branch Manager role |
| Red    | `#FEE2E2` → `#FCA5A5` → `#EF4444` | Danger actions, alerts |

---

## Architecture

```
kidzone-app/
├── prisma/
│   ├── schema.prisma          # MySQL schema – all tables
│   └── seed.ts                # Seeds default roles only (no staff names)
├── src/
│   ├── middleware.ts           # JWT auth + RBAC route protection
│   ├── lib/
│   │   ├── prisma.ts          # Prisma client singleton
│   │   ├── auth.ts            # JWT sign/verify + session cookie
│   │   ├── otp.ts             # OTP generation + Twilio SMS/WhatsApp
│   │   ├── rbac.ts            # Permission-level helpers
│   │   └── response.ts        # Typed API response helpers
│   ├── app/
│   │   ├── page.tsx           # Login screen (phone entry)
│   │   ├── verify-otp/        # OTP verification
│   │   ├── dashboard/         # Role-aware dashboard (dynamic duty display)
│   │   ├── check-in/          # Child check-in with staff audit
│   │   ├── check-out/         # Safe-exit / "Match Approved" with staff_id audit
│   │   ├── attendance/        # Full attendance log with staff IDs
│   │   ├── admin/
│   │   │   ├── staff/         # Staff CRUD (Branch Manager only)
│   │   │   ├── roles/         # Role CRUD (Branch Manager only)
│   │   │   ├── children/      # Children registry (Event Lead+)
│   │   │   └── events/        # Event management with dynamic manager assignment
│   │   └── api/               # REST API routes
│   └── components/            # Reusable UI components
```

---

## Database Schema

### `staff_roles`
| Column | Type | Notes |
|--------|------|-------|
| `role_id` | INT PK | Auto-increment |
| `role_name` | VARCHAR(100) UNIQUE | e.g. 'Branch Manager', 'Caretaker' |
| `permission_level` | INT | 1 = lowest, higher = more access |

### `staff_users`
| Column | Type | Notes |
|--------|------|-------|
| `staff_id` | INT PK | Auto-increment |
| `role_id` | INT FK | → `staff_roles.role_id` |
| `full_name` | VARCHAR(150) | Pulled dynamically everywhere |
| `phone_number` | VARCHAR(20) UNIQUE | E.164 format; used for OTP login |
| `account_status` | ENUM('ACTIVE','INACTIVE') | Inactive preserves audit trail |

### `attendance_log`
| Column | Type | Notes |
|--------|------|-------|
| `log_id` | INT PK | |
| `child_id` | INT FK | |
| `check_in_by_id` | INT FK | → `staff_users.staff_id` |
| `check_out_time` | DATETIME | |
| `verified_by_id` | INT FK | → `staff_users.staff_id` (who pressed Match Approved) |
| `status` | ENUM | CHECKED_IN / CHECKED_OUT |

> `verified_by_id` is **always** a foreign key to `staff_users.staff_id` — never a free-text string.

---

## Authentication Flow

```
Staff enters phone number
        ↓
POST /api/auth/send-otp  →  Twilio SMS / WhatsApp OTP
        ↓
Staff enters OTP
        ↓
POST /api/auth/verify-otp  →  JWT session cookie set
        ↓
All subsequent requests authenticated via middleware
Staff identity pulled from session (staff_id, full_name, role_name, permission_level)
```

---

## Role-Based Access Control

| Feature | Caretaker (L1) | Event Lead (L2) | Branch Manager (L3) |
|---------|:--------------:|:---------------:|:-------------------:|
| Check-In / Check-Out | ✓ | ✓ | ✓ |
| Attendance Log | ✓ | ✓ | ✓ |
| Event Management | — | ✓ | ✓ |
| Children Registry | — | ✓ | ✓ |
| Staff Directory | — | — | ✓ |
| Roles Management | — | — | ✓ |

Permission levels are configurable per role — adding a new role type requires no code changes.

---

## Quick Start

### 1. Prerequisites

- Node.js 20+
- MySQL 8.x database (PlanetScale, Railway, local, etc.)
- Twilio account with an SMS/WhatsApp-enabled number

### 2. Install dependencies

```bash
cd kidzone-app
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
# Fill in DATABASE_URL, JWT_SECRET, TWILIO_* values
```

### 4. Run database migrations

```bash
npm run db:generate   # generate Prisma client
npm run db:migrate    # apply migrations
npm run db:seed       # seed default roles
```

### 5. Start development server

```bash
npm run dev
# → http://localhost:3000
```

### 6. Add your first Branch Manager via Prisma Studio

```bash
npm run db:studio
# Navigate to staff_users → Add record with role_id = 3 (Branch Manager)
```

After that, all staff management is done through the web UI at `/admin/staff`.

---

## API Reference

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/send-otp` | Public | Send OTP to phone |
| POST | `/api/auth/verify-otp` | Public | Verify OTP, set session |
| GET | `/api/me` | Any staff | Current session info |
| POST | `/api/logout` | Any staff | Clear session |
| GET/POST | `/api/staff` | Branch Manager | List / create staff |
| GET/PUT/DELETE | `/api/staff/[id]` | Branch Manager | Get / update / deactivate |
| GET/POST | `/api/roles` | Branch Manager | List / create roles |
| GET/PUT/DELETE | `/api/roles/[id]` | Branch Manager | Get / update / delete role |
| GET/POST | `/api/children` | Any staff | List / add children |
| GET/PUT | `/api/children/[id]` | Any staff | Get / update child |
| GET | `/api/attendance` | Any staff | Browse attendance logs |
| POST | `/api/attendance/check-in` | Any staff | Log child arrival |
| POST | `/api/attendance/check-out` | Any staff | Verify and release child |
| GET/POST | `/api/events` | Any / Event Lead+ | List / create events |
| GET/PUT | `/api/events/[id]` | Any / Event Lead+ | Get / update event |
| GET | `/api/dashboard/stats` | Any staff | Today's stats |

---

## Safe-Exit Audit Trail

When a staff member presses **Match Approved** on the Check-Out screen:

1. The backend receives the request authenticated with a JWT.
2. The JWT contains `staff_id` of the exact logged-in staff member.
3. `attendance_log.verified_by_id` is set to that `staff_id` — a database foreign key.
4. The full name, role, and ID of the approving staff member appear permanently in the attendance log.

This ensures accountability is always traceable to a unique `staff_id`, regardless of staff changes.
