# KidZone project — start here

Full handoff document for new chats:

**→ [`kidzone-app/PROJECT_HANDOFF.md`](./kidzone-app/PROJECT_HANDOFF.md)**

Includes: database schema, API list, RBAC, colours, web setup, iOS/Xcode steps, Bearer-token gap for mobile, and a copy-paste prompt for your next chat.

Quick start (web):

```bash
cd kidzone-app && npm install && cp .env.example .env
npm run db:migrate && npm run db:seed && npm run dev
```
