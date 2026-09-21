# HaulFlow Implementation and Deployment Guide

## Current production baseline

This version contains no sample or browser-persisted data. All operational records are read from and written to TiDB through Prisma. The first request to a new installation redirects to `/setup`, where the first organisation and Owner account are created.

Implemented controls include:

- HTTP-only database sessions with expiry.
- Server-side role enforcement.
- `organizationId` scoping on every business mutation.
- Atomic document numbering.
- Transactions for jobs/settlements, invoices, receipts/allocations and carrier payments.
- Audit events for protected changes.
- Archive/void/reversal workflows instead of deleting financial history.
- Last-owner protection and session invalidation when a user is deactivated.

## 1. Configure TiDB

Create a TiDB Cloud database and copy its MySQL connection string. The application accepts one `DATABASE_URL`:

```env
DATABASE_URL="mysql://USERNAME:PASSWORD@HOST:4000/DATABASE_NAME?sslaccept=strict"
DATABASE_CONNECTION_LIMIT="5"
NEXT_PUBLIC_APP_NAME="HaulFlow"
```

Keep the string server-only. Never prefix it with `NEXT_PUBLIC_` and never commit it.

## 2. Install and initialise

```bash
pnpm install
pnpm db:deploy
pnpm dev
```

Open `http://localhost:3000/setup`. Enter the legal company name and first owner credentials. The setup action is locked as soon as the first user exists.

## 3. Deploy to Vercel

1. Push the project to a private Git repository.
2. Import it into Vercel as a Next.js project.
3. Add `DATABASE_URL` and `DATABASE_CONNECTION_LIMIT` under project environment variables.
4. Use `pnpm build` as the build command.
5. Apply migrations before the first production request with `pnpm db:deploy` from an authorised release environment.
6. Deploy, then visit `/setup` once to create the owner.

The Prisma client is generated automatically during installation and again before each build.

## 4. Role permissions

| Role | Access |
| --- | --- |
| Owner | All operations, finance, users and settings |
| Admin | Operations, finance, users and settings |
| Operations | Customers, carriers and jobs |
| Finance | Invoices, receipts and carrier settlements |
| Viewer | Read-only dashboard, registers and reports |

Permissions are checked inside every server action. Hiding a button is not treated as a security boundary.

## 5. Financial workflow rules

- Creating a job also creates its linked carrier settlement.
- A job must be Delivered before it can be invoiced.
- A job can have only one invoice line in the current workflow.
- Payment capture and invoice status update occur in one transaction.
- A receipt cannot exceed the remaining invoice balance.
- Voiding a receipt restores the invoice balance.
- An invoice with an active receipt cannot be voided until the receipt is reversed.
- A carrier payment requires `READY_TO_PAY` status and verified banking details.
- Paid and invoiced jobs cannot be cancelled.
- Financial records remain visible after being voided.

## 6. Go-live checklist

- Confirm the company registration, VAT status and bank details shown on documents.
- Confirm customer and carrier opening balances before import.
- Verify Owner, Operations and Finance permissions using separate test accounts.
- Create one test job through delivery, invoice, receipt and carrier settlement.
- Reconcile dashboard totals to the test records.
- Verify TiDB automated backups and perform a restore test.
- Configure Vercel production, preview and development secrets separately.
- Configure error monitoring and database availability alerts.
- Confirm the organisation's retention rules for invoices, PODs and audit history.
- Remove test records or use a separate test database before go-live.

## 7. Operational limitations and next integrations

The system is an operational receivables/payables subledger, not a general ledger. Bank payments still occur in the bank and are recorded in HaulFlow by reference. Recommended follow-on integrations are invoice PDF/email delivery, object storage for POD files, bank statement import, and Sage/Xero/QuickBooks journal export.
