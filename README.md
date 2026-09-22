# Shadow Infection Patch Notes API

NestJS REST API for Shadow Infection patch notes. Uses Prisma with Neon PostgreSQL.

## Prerequisites

- Node.js 22+
- Neon PostgreSQL database (`DATABASE_URL`)

## Setup

```bash
cp .env.example .env
# set DATABASE_URL to your Neon connection string

npm install
npm run db:migrate
npm run start:dev
```

Swagger UI: [http://localhost:3000/api](http://localhost:3000/api)

## Scripts

| Script | Description |
|--------|-------------|
| `npm run start:dev` | Dev server with watch |
| `npm run build` | Production build |
| `npm run format` / `format:check` | Prettier write / check |
| `npm run lint` / `lint:check` | ESLint fix / check |
| `npm test` | Unit tests (Vitest) |
| `npm run db:migrate` | Create/apply migrations (dev) |
| `npm run db:deploy` | Apply migrations (prod) |
| `npm run db:studio` | Prisma Studio |

