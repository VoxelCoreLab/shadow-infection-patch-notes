# Shadow Infection Patch Notes API

NestJS REST API for Shadow Infection patch notes. Uses Prisma with Neon PostgreSQL.

## Prerequisites

- Node.js 22+
- Neon PostgreSQL database (`DATABASE_URL`)
- Firebase Admin credentials for write endpoints (`FIREBASE_*`)

## Setup

```bash
cp .env.example .env
# set DATABASE_URL and FIREBASE_* (project id, client email, private key)

npm install
npm run db:migrate
npm run start:dev
```

Swagger UI: [http://localhost:3000/api](http://localhost:3000/api)

Write endpoints (`POST` / `PATCH` / `DELETE`) require a Firebase JWT with
custom claim `admin`. Read endpoints stay public.

## Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Apply migrations, then run production server (`dist/`) |
| `npm run start:dev` | Dev server with watch |
| `npm run start:prod` | Production server only (no migrate) |
| `npm run build` | Production build |
| `npm run format` / `format:check` | Prettier write / check |
| `npm run lint` / `lint:check` | ESLint fix / check |
| `npm test` | Unit tests (Vitest) |
| `npm run test:e2e` | End-to-end tests (Vitest) |
| `npm run db:migrate` | Create/apply migrations (dev) |
| `npm run db:deploy` | Apply migrations (prod) |
| `npm run db:studio` | Prisma Studio |

For Coolify/Railpack: leave Start / Pre-deployment empty so the detected `npm start` runs migrate + app. Set `DATABASE_URL`, `FIREBASE_*`, and `PORT=3000`.

