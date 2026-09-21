# HaulFlow

HaulFlow is a production-oriented operations and finance subledger for logistics companies that subcontract transport work to other carriers.

The application starts with an empty database. On first launch, the owner creates the company workspace and first account. No sample customers, carriers, jobs, invoices or payments are inserted.

## Included

- Secure database-backed sessions and first-run owner setup.
- Organisation-scoped role-based access: Owner, Admin, Operations, Finance and Viewer.
- Full customer and carrier CRUD with safe archive/restore workflows.
- Full job CRUD with customer rate, carrier cost, margin, delivery and POD status.
- Invoice creation, editing, issuing and auditable voiding.
- Customer receipt creation, editing, invoice allocation and auditable reversal.
- Carrier settlement creation, editing, approval, payment and voiding.
- Company/user administration, document counters and audit history.
- Live operational and profitability reporting.
- TiDB Cloud integration through Prisma 7 and the MariaDB driver adapter.
- Initial reviewed SQL migration for clean production databases.

## Stack

- Next.js 16 App Router
- React 19 and TypeScript
- Tailwind CSS 4 and Lucide React
- Prisma 7
- TiDB Cloud (MySQL compatible)
- Secure HTTP-only database sessions

## Quick start

1. Copy `.env.example` to `.env`.
2. Put your TiDB connection string in `DATABASE_URL`.
3. Install dependencies with `pnpm install`.
4. Apply the schema with `pnpm db:deploy`.
5. Run locally with `pnpm dev`.
6. Open `/setup` and create the company owner.

For a brand-new database where migrations have not previously been used, `pnpm db:deploy` applies the included initial migration. Do not run `prisma db pull` against an empty database.

## Production deployment

Deploy to Vercel or another Node.js-compatible host. Add `DATABASE_URL` and `DATABASE_CONNECTION_LIMIT` to the hosting environment. The production build command is `pnpm build` and the migration command is `pnpm db:deploy`.

Never commit `.env`, database passwords or live customer data.

See `docs/IMPLEMENTATION_GUIDE.md` for deployment, security and go-live checks.
