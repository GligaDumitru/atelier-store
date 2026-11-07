# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Status

Next.js (App Router, `src/` dir) + TypeScript + Tailwind v4 + Better Auth + Drizzle ORM + Neon Postgres. The storefront UI and a DB-backed catalogue (products, categories, stock) exist. No cart, orders, checkout, payment, reviews or product variants. No auth flows or pages, and Better Auth's tables are still undefined.

## Commands

- `npm run dev` / `build` / `start` — Next.js (Turbopack)
- `npm run lint` — ESLint (flat config, `eslint.config.mjs`)
- `npm run typecheck` — `tsc --noEmit`
- `npm run db:generate` / `db:migrate` / `db:push` / `db:studio` — drizzle-kit
- `npm run db:seed` — `tsx src/db/seed.ts`, idempotent catalogue seed
- No test runner is configured.

## Next.js version caveat

`AGENTS.md` warns that this Next.js version (16.x) has breaking changes from older releases. Read the relevant guide in `node_modules/next/dist/docs/` before writing Next.js code. `next.config.ts` enables `cacheComponents` and `partialPrefetching`, and wires Tailwind through a Turbopack `@tailwindcss/turbopack` loader rule rather than a PostCSS config.

## Architecture

Auth and DB are wired together through a single chain:

- `src/db/index.ts` creates the Drizzle client using the Neon HTTP driver (`drizzle-orm/neon-http`) and throws at import time if `DATABASE_URL` is unset. It imports `* as schema` from `src/db/schema.ts`.
- `src/lib/auth.ts` builds the Better Auth server instance on top of that client with `drizzleAdapter(db, { provider: "pg" })`, email/password enabled, and the `nextCookies()` plugin (needed so server actions can set cookies).
- `src/app/api/auth/[...all]/route.ts` exposes the auth instance via `toNextJsHandler(auth)`.
- `src/lib/auth-client.ts` is the browser-side Better Auth client (uses `NEXT_PUBLIC_APP_URL` as base URL).

Better Auth's tables (user, session, account, verification) are not defined yet. Generate them with `npx @better-auth/cli generate` into `src/db/schema.ts`, then `npm run db:generate` and `npm run db:migrate` (not `db:push` — see Database conventions below). Auth will fail at runtime until that is done.

`src/lib/auth.ts` pins `baseURL` and `trustedOrigins` from `BETTER_AUTH_URL`, and throws at import if neither that nor `NEXT_PUBLIC_APP_URL` is set. Without a base URL, Better Auth derives the origin from request headers and builds its trusted-origin list from that, which weakens CSRF and redirect handling.

The Neon HTTP driver does not support interactive transactions; switch to the `neon-serverless` (WebSocket) driver in `src/db/index.ts` if transactions are needed.

## Database conventions

Follow these when extending the schema or adding queries.

- **Migrations are versioned, not pushed.** `npm run db:generate` writes SQL into `drizzle/`, `npm run db:migrate` applies it, and both the schema change and the generated SQL are committed together. Do not use `db:push` on a schema that already has migrations, and never hand-edit a migration that has been applied — generate a follow-up instead.
- **Seeds are idempotent.** `src/db/seed.ts` upserts with `onConflictDoUpdate` on a unique key for every row, so it can be re-run safely. It imports `./index` and `./schema` *lazily inside the seed function* (relative paths, after `dotenv` has run) because `src/db/index.ts` throws at import time without `DATABASE_URL`, and because the `@/*` alias only resolves inside the Next build.
- **Money is stored in minor units.** Integer `*_cents` columns, never float or `numeric`. Conversion to display units happens in the mapping layer.
- **Stock is a quantity, not a status.** `products.stock_quantity` is the single source of truth; the three-state `in-stock` / `low-stock` / `out-of-stock` label is derived in `src/lib/catalogue.ts` via `toStock()` against a `LOW_STOCK_AT` threshold. Do not add a status column alongside it.
- **Taxonomy is one self-referencing table.** `categories.parent_id` points back at `categories.id`; a row with `parent_id IS NULL` is a department. Self-relations need an explicit `relationName` on both sides of `relations()` so Drizzle can tell parent from children.
- **The UI renders against mapped types, not row types.** `src/lib/catalogue.ts` owns the `Product` / `Category` / `Stock` types the components import, and a private `toProduct()` maps DB rows onto them. Change the schema freely; absorb the difference in the mapper rather than editing components.
- **Every exported query is cached.** `cacheComponents` is enabled, so an uncached `await` makes the whole subtree dynamic. Each query in `catalogue.ts` declares `"use cache"`, `cacheLife("minutes")` (bounded because stock rides in the same entry) and `cacheTag("products", \`product:${slug}\`)`. Mutations should invalidate with `revalidateTag`. Arguments to a cached function become part of its cache key, so pass slugs and other scalars — never whole objects.
- **Ordering is explicit.** `WHERE slug IN (...)` has no ordering guarantee; `getProductsBySlugs` restores the requested order in JS. Curated homepage rows live as slug arrays in `src/lib/home-content.ts`, not as DB flags.

## Environment

Copy `.env.example` to `.env.local`. Required: `DATABASE_URL` (Neon pooled string), `BETTER_AUTH_SECRET` (`openssl rand -base64 32`), `BETTER_AUTH_URL`, `NEXT_PUBLIC_APP_URL`. `drizzle.config.ts` loads `.env.local` first, then `.env`. `.env*` is gitignored except `.env.example`.

`neon init` writes its pulled variables into `.env`, so put local overrides in `.env.local` — it wins, and the next `neon env pull` will not clobber them.

### Secret handling

- **Never commit a real secret.** `.env.example` carries unusable placeholders only; the committed file is public. Anyone who copies a plausible-looking placeholder into a deployment is running on a published secret.
- **Better Auth only fails closed on its own default secret**, and only in production. A short or low-entropy value logs a warning and runs, so the value has to be genuinely random — 32 bytes, base64. `npm run build` surfacing `should be at least 32 characters` or `appears low-entropy` means the secret never loaded.
- **Every environment gets its own secret.** Never reuse the development value in preview or production.
- **The secret is a full-trust key, not just cookie integrity.** Sessions are random tokens checked against the `session` table, so a leaked secret cannot mint one directly — but it *does* sign the HS256 email-verification and change-email tokens that the unauthenticated `GET /api/auth/verify-email` accepts. A forged token rewrites a victim's email address, and a password reset then lands in the attacker's inbox. Treat leakage as account takeover.
- **Never enable `session.cookieCache`** without reading how it works. It makes the cached session trusted without a database lookup, which turns the secret into a direct session-forgery key. The default `compact` and `jwt` strategies are signed but *not* encrypted, so the cookie holder can also read the session and user payload.
- **Rotate with `BETTER_AUTH_SECRETS`**, comma-separated `<version>:<secret>` entries. The highest-priority entry signs and the rest decrypt, so rotation is non-destructive for data at rest but **still logs every session out** — signature verification only ever uses the current key. Pending verification links break too.
- `.claude/settings.json` denies reading and editing `.env*`, including `.env.example`. Keep that rule; it means secret edits are done by hand, not by an agent.

Path alias: `@/*` maps to `src/*`.
