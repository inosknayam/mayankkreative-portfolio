# Safe Exit Hub

Child check-in and safe-exit attendance app with **dynamic staff & roles** (no hardcoded names or permissions). Staff log in via OTP (SMS/WhatsApp) tied to `staff_users.phone_number`.

## Stack

- **Backend**: Node.js + Express + MySQL
- **Frontend**: Next.js 16 + Tailwind CSS (soft pastel palette)
- **Auth**: Phone OTP → JWT session with `staff_id` and `role_name`

## Quick start

### 1. Database

```bash
mysql -u root -p < backend/database/migrations/001_staff_roles_users.sql
mysql -u root -p < backend/database/migrations/002_core_tables.sql
mysql -u root -p < backend/database/migrations/003_attendance_verified_by_fk.sql
mysql -u root -p < backend/database/migrations/004_seed_roles.sql
```

### 2. Backend

```bash
cd safe-exit-hub/backend
cp env.example .env
npm install
npm run dev
```

API runs at `http://localhost:4000`.

### 3. Frontend

```bash
cd safe-exit-hub/frontend
cp env.local.example .env.local
npm install
npm run dev
```

UI runs at `http://localhost:3001`.

## Environment

| Variable | Description |
|----------|-------------|
| `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | MySQL connection |
| `JWT_SECRET` | Token signing |
| `OTP_DEV_MODE=true` | Logs OTP to console (no real SMS) |
| `TWILIO_*` / `WHATSAPP_*` | Optional production SMS/WhatsApp |

## RBAC

- `staff_roles.permission_level`: higher = more access (manage staff ≥ 80, release child ≥ 50, check-in ≥ 30).
- All `verified_by` fields reference `staff_users.staff_id` (FK), never free-text names.

## Dev OTP login

Seed staff phone `+15550001001` (see migration seed). Request OTP, then use the code printed in the backend console when `OTP_DEV_MODE=true`.
