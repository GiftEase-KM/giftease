# GiftEase Workspace

## Overview

GiftEase is a gift planning web app built on a pnpm monorepo with TypeScript. Manage recipients, occasions, and gift ideas all in one place.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (artifacts/giftease)
- **API framework**: Express 5 (artifacts/api-server)
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend libs**: react-hook-form, @hookform/resolvers, date-fns, framer-motion, lucide-react, zod

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server
│   └── giftease/           # React + Vite frontend (served at /)
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## GiftEase Features

- **Dashboard**: Summary stats (recipients, upcoming occasions, unpurchased gifts, budget), upcoming occasions, gifts to buy
- **Recipients**: Manage people you buy gifts for (name, relationship, notes)
- **Occasions**: Events with date, budget, linked recipient (birthdays, holidays, etc.)
- **Gifts**: Gift ideas with price, URL, description, purchased status, linked to recipient/occasion

## Database Schema

- `recipients` — id, name, relationship, notes, timestamps
- `occasions` — id, recipientId (FK), title, date, budget, notes, timestamps
- `gifts` — id, recipientId, occasionId, name, description, price, url, purchased, notes, timestamps

## API Endpoints

All endpoints under `/api`:
- `GET/POST /recipients`, `GET/PATCH/DELETE /recipients/:id`
- `GET/POST /occasions`, `PATCH/DELETE /occasions/:id`
- `GET/POST /gifts`, `PATCH/DELETE /gifts/:id`, `PATCH /gifts/:id/purchased`

## TypeScript & Composite Projects

- **Always typecheck from the root** — `pnpm run typecheck`
- **Codegen**: `pnpm --filter @workspace/api-spec run codegen`
- **DB push**: `pnpm --filter @workspace/db run push`

## Root Scripts

- `pnpm run build` — runs typecheck, then builds all packages
- `pnpm run typecheck` — full typecheck with project references
