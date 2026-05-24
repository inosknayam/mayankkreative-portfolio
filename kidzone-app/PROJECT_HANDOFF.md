# KidZone / ResidantApp — Project Handoff Document

Use this file when starting a **new chat** so the assistant has full context for the web app, API, database, RBAC, and the planned **iOS app** (Xcode).

---

## 1. Repository overview

| Item | Location |
|------|----------|
| **Web + API app** | `/kidzone-app/` (Next.js 15, TypeScript, Tailwind v4, Prisma, MySQL) |
| **Parent repo** | `mayankkreative-portfolio` (portfolio site at repo root; KidZone is a **separate subfolder**) |
| **Git branch (feature)** | `cursor/kidzone-staff-rbac-app-f6fa` |
| **iOS app** | **Not in repo yet** — user creates in Xcode locally as `ResidantApp` (Bundle: `AspiroLiving.ResidantApp`) |

**Critical rule:** No staff names, manager names, or role permissions are hardcoded in app or API logic. Everything comes from MySQL tables `staff_roles` and `staff_users`.

---

## 2. Product purpose

Staff portal for a children’s zone / residency:

- **OTP login** via phone (Twilio SMS and/or WhatsApp)
- **Dynamic RBAC** (roles and permission levels in DB)
- **Child check-in** (records `check_in_by_id` → `staff_users.staff_id`)
- **Safe-exit check-out** (“Match Approved” records `verified_by_id` → `staff_users.staff_id`, never free text)
- **Events** with `managed_by` → `staff_users.staff_id`
- **Admin:** staff, roles, children, events (by permission level)

---

## 3. Tech stack (web)

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 + CSS variables in `src/app/globals.css` |
| ORM | Prisma 6 |
| Database | MySQL 8.x |
| Auth | JWT (`jose`) in httpOnly cookie `kz_session` |
| OTP | Twilio (`src/lib/otp.ts`) |
| Validation | Zod |

---

## 4. Database schema (Prisma)

File: `kidzone-app/prisma/schema.prisma`

### `staff_roles`
- `role_id` (PK)
- `role_name` (unique, e.g. Branch Manager, Event Lead, Caretaker)
- `permission_level` (INT: higher = more access)

### `staff_users`
- `staff_id` (PK)
- `role_id` (FK → staff_roles)
- `full_name`
- `phone_number` (unique, E.164 e.g. `+91XXXXXXXXXX`)
- `account_status` ENUM: `ACTIVE` | `INACTIVE`

### `children`
- `child_id`, `full_name`, `date_of_birth`, `guardian_name`, `guardian_phone`, `is_active`, optional photos/notes

### `attendance_log`
- `log_id`, `child_id`, optional `event_id`
- `check_in_time`, `check_in_by_id` (FK → staff_users)
- `check_out_time`, `verified_by_id` (FK → staff_users — who pressed Match Approved)
- `status`: `CHECKED_IN` | `CHECKED_OUT` | `ABSENT`

### `events`
- `event_id`, `event_name`, `event_date`, `managed_by` (FK → staff_users), `location`, `description`, `status`

### `otp_sessions`
- OTP codes for login; linked to `staff_id`

### Seed
- `npm run db:seed` — creates **roles only** (Caretaker L1, Event Lead L2, Branch Manager L3). **No staff users seeded.**

---

## 5. RBAC (permission levels)

Defined in `src/lib/rbac.ts` and enforced in `src/middleware.ts`.

| Level | Default role | Can access |
|-------|----------------|------------|
| 1 | Caretaker | Check-in, check-out, attendance log |
| 2 | Event Lead | + children registry, events |
| 3 | Branch Manager | + staff directory, roles management |

Roles are **editable in DB**; new roles can be added via `/admin/roles` without code changes.

---

## 6. UI colour palette (soft shades)

Use on web **and** iOS for consistency:

| Name | Soft | Mid | Accent | Usage |
|------|------|-----|--------|--------|
| Blue | `#DBEAFE` | `#93C5FD` | `#3B82F6` | Check-in, Event Lead |
| Pink | `#FCE7F3` | `#F9A8D4` | `#EC4899` | Check-out / safe-exit, Caretaker |
| Yellow | `#FEF9C3` | `#FDE68A` | `#F59E0B` | Children, warnings |
| Purple | `#EDE9FE` | `#C4B5FD` | `#8B5CF6` | Dashboard, Branch Manager |
| Red | `#FEE2E2` | `#FCA5A5` | `#EF4444` | Errors, deactivate |

CSS variables in `src/app/globals.css` (`--color-blue-soft`, etc.).

---

## 7. Web routes (pages)

| Path | Description |
|------|-------------|
| `/` | Phone login → send OTP |
| `/verify-otp` | Enter OTP |
| `/dashboard` | Stats; “Manager on Duty” / “Event Managed By” from **session** (dynamic) |
| `/check-in` | Search child, check in |
| `/check-out` | List checked-in children, **Match Approved** |
| `/attendance` | Audit log with staff names + IDs |
| `/admin/staff` | Staff CRUD (L3) |
| `/admin/roles` | Role CRUD (L3) |
| `/admin/children` | Children (L2+) |
| `/admin/events` | Events; manager dropdown from staff API (L2+) |

---

## 8. API reference

Base URL: `NEXT_PUBLIC_APP_URL` (e.g. `http://localhost:3000`)

All JSON responses: `{ success: boolean, data?: T, error?: string }`

### Public
| Method | Path | Body |
|--------|------|------|
| POST | `/api/auth/send-otp` | `{ "phone_number": "+91..." }` |
| POST | `/api/auth/verify-otp` | `{ "phone_number": "+91...", "otp_code": "123456" }` |

On success, verify-otp sets **httpOnly cookie** `kz_session` (JWT). Response `data` includes `staff_id`, `full_name`, `role_name`, `permission_level`.

### Authenticated (cookie required today)
| Method | Path | Notes |
|--------|------|--------|
| GET | `/api/me` | Current session |
| POST | `/api/logout` | Clear cookie |
| GET | `/api/dashboard/stats` | Today’s counts + duty_manager from session |
| GET/POST | `/api/staff` | L3 |
| GET/PUT/DELETE | `/api/staff/[id]` | L3; DELETE = soft deactivate |
| GET/POST | `/api/roles` | L3 for POST |
| GET/PUT/DELETE | `/api/roles/[id]` | L3 |
| GET/POST | `/api/children` | Any staff / L2+ for admin UI |
| GET/PUT | `/api/children/[id]` | |
| GET | `/api/attendance` | Query: `date`, `status`, `page`, `limit` |
| POST | `/api/attendance/check-in` | `{ child_id, event_id?, notes? }` |
| POST | `/api/attendance/check-out` | `{ log_id, notes? }` → sets `verified_by_id` |
| GET/POST | `/api/events` | POST L2+ |
| GET/PUT | `/api/events/[id]` | |

**Middleware:** `src/middleware.ts` — reads JWT from cookie only (see iOS section).

---

## 9. Environment variables

Copy `kidzone-app/.env.example` → `.env`:

```env
DATABASE_URL="mysql://user:pass@host:3306/kidzone_db"
JWT_SECRET="min-32-chars"
JWT_EXPIRY_HOURS=8
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
TWILIO_WHATSAPP_FROM="whatsapp:+14155238886"
OTP_CHANNEL="sms"          # sms | whatsapp | both
OTP_EXPIRY_MINUTES=5
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_TZ="Asia/Kolkata"
```

---

## 10. Local setup (web)

```bash
cd kidzone-app
npm install
cp .env.example .env
# edit .env

npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
# → http://localhost:3000
```

**First staff user:** `npm run db:studio` → add row in `staff_users` with `role_id` for Branch Manager (usually 3), ACTIVE, E.164 phone. Then manage others via `/admin/staff`.

**Scripts:** `db:generate`, `db:migrate`, `db:push`, `db:seed`, `db:studio`, `dev`, `build`, `lint`

---

## 11. Key source files (web)

```
kidzone-app/
├── prisma/schema.prisma
├── prisma/seed.ts
├── src/middleware.ts
├── src/lib/
│   ├── prisma.ts
│   ├── auth.ts          # JWT sign/verify, getSession, SESSION_COOKIE
│   ├── otp.ts           # Twilio
│   ├── rbac.ts          # canManageStaff, canManageEvents, getRoleColor
│   └── response.ts
├── src/app/api/         # All route handlers
├── src/components/      # Navbar, StatCard, ui/*
└── README.md
```

---

## 12. iOS app (Xcode) — user intent

User is creating a **native iOS app** with the **same features** as the web app.

### Xcode “Choose options” (filled by user)

| Field | Value |
|-------|--------|
| Product Name | `ResidantApp` (or `KidZoneStaff`) |
| Team | Mayank Soni (Personal Team) |
| Organization Identifier | `AspiroLiving` |
| Bundle Identifier | `AspiroLiving.ResidantApp` |
| Testing System | None |
| Storage | None |
| Host in CloudKit | Unchecked |

**Template:** iOS → App → **SwiftUI** → **Swift**

### iOS does NOT exist in this repo yet

Suggested structure when building:

```
ResidantApp/
├── App/
├── Core/
│   ├── APIClient.swift
│   ├── AuthManager.swift
│   └── KeychainHelper.swift
├── Models/
└── Features/
    ├── Login/
    ├── OTP/
    ├── Dashboard/
    ├── CheckIn/
    ├── CheckOut/
    └── Attendance/
```

### API base URL

- **Simulator:** `http://127.0.0.1:3000`
- **Device on Wi‑Fi:** `http://<Mac-LAN-IP>:3000`
- **Production:** HTTPS deployed Next.js URL

### iOS auth gap (must fix for mobile)

Web uses **httpOnly cookie** `kz_session`. iOS cannot rely on that alone.

**Required for iOS:**

1. `POST /api/auth/verify-otp` should return `token` in JSON `data` (in addition to cookie).
2. `middleware.ts` + `getSession()` should accept `Authorization: Bearer <token>`.
3. iOS stores token in **Keychain** and sends Bearer header on every API call.

Until this is implemented, iOS login will work for OTP but protected APIs return 401.

### iOS screens to mirror web

1. Login (phone)
2. OTP verify
3. Dashboard (dynamic greeting + stats)
4. Check-in
5. Check-out (Match Approved)
6. Attendance list
7. Admin tabs gated by `permission_level`

### App Transport Security

For local dev, allow HTTP exception for dev host or use HTTPS in production.

---

## 13. Workflows (business logic)

### Login
1. Staff enters E.164 phone.
2. API finds active `staff_users` row.
3. OTP created in `otp_sessions`, sent via Twilio.
4. Staff enters OTP → JWT session → dashboard.

### Check-in
- `attendance_log.check_in_by_id` = logged-in `staff_id`.
- Block duplicate CHECKED_IN same child same day.

### Check-out (safe-exit)
- Only logs with `status = CHECKED_IN`.
- `verified_by_id` = **exact** `staff_id` of staff who tapped Match Approved.
- `status` → CHECKED_OUT.

### Personalization
- “Manager on Duty”, “Event Managed By”, “Staff on Duty” = `session.full_name` / `session.role_name` from JWT — **never** hardcoded strings in UI.

---

## 14. Quality status (web)

- TypeScript: `npx tsc --noEmit` — 0 errors (when DB env present for Prisma)
- ESLint: `npm run lint` — 0 warnings/errors
- Dependencies installed in `kidzone-app/node_modules`

---

## 15. Suggested next tasks (for new chat)

### Web / API
- [ ] Add Bearer token support for iOS (`verify-otp` response + middleware + `getSession`)
- [ ] Deploy API (Vercel/Railway) with MySQL + env vars
- [ ] Add `Info.plist` / CORS if needed for mobile origin

### iOS
- [ ] Create SwiftUI project (user doing in Xcode)
- [ ] Implement `APIClient` + Keychain
- [ ] Build Login → OTP → Tab bar (Dashboard, Check-in, Check-out, Attendance)
- [ ] Hide admin features by `permission_level`
- [ ] Match soft colour palette

### Optional
- [ ] Add `kidzone-ios/` to monorepo with starter Swift files
- [ ] Push notifications for OTP (optional; SMS already via Twilio)

---

## 16. Copy-paste prompt for new chat

```
I'm building KidZone / ResidantApp — staff RBAC + child attendance.

Web API: kidzone-app/ (Next.js 15, Prisma, MySQL, Twilio OTP).
Read: kidzone-app/PROJECT_HANDOFF.md and kidzone-app/README.md

Rules:
- No hardcoded staff names or roles
- verified_by_id and check_in_by_id are FKs to staff_users.staff_id
- Soft UI colours: blue, pink, yellow, purple, red (pastels)

I'm working on [web | iOS in Xcode ResidantApp | both].
Help me with: [your task].
```

---

## 17. Contact / identifiers

- **Org ID:** AspiroLiving  
- **iOS bundle:** AspiroLiving.ResidantApp  
- **Web folder:** kidzone-app  

---

*Last updated: handoff for web app on branch `cursor/kidzone-staff-rbac-app-f6fa`; iOS not committed to repo.*
