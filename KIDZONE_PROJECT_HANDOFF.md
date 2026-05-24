# KidZoneStaff — start here

Full handoff document for new chats:

**→ [`kidzone-app/PROJECT_HANDOFF.md`](./kidzone-app/PROJECT_HANDOFF.md)**

## iOS (Xcode)

| Field | Value |
|-------|--------|
| Product Name | `KidZoneStaff` |
| Organization Identifier | `The Funny Mouse` |
| Bundle Identifier | `TheFunnyMouse.KidZoneStaff` |
| Folder | `~/Developer/KidZoneStaff` |

## Web API

```bash
cd kidzone-app && npm install && cp .env.example .env
npm run db:migrate && npm run db:seed && npm run dev
```
