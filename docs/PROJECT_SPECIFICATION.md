# HaulFlow Logistics Operations System

## 1. Product definition

HaulFlow is an operations and finance system for a logistics company that accepts transport work from customers and subcontracts some or all of that work to independent trucking companies.

The system connects both sides of every job:

1. What the customer asked the company to move.
2. Which subcontractor was assigned to complete the transport.
3. What the customer must pay the company.
4. What the company must pay the subcontractor.
5. The gross margin earned on the job.

This is not intended to replace a full general ledger in its first phase. It is an operational subledger for jobs, customer receivables, and carrier payables, with clean exports for an accountant or an accounting package.

## 2. Business problem

Without a connected system, logistics teams often track jobs in WhatsApp, invoices in Word or spreadsheets, customer payments in a bank statement, and carrier payments in a separate spreadsheet. This creates four major risks:

- A completed job is not invoiced.
- A carrier is paid before delivery documents are received.
- A customer payment is not allocated to the correct invoice.
- The business cannot see the real profit or cash exposure on a job.

HaulFlow makes the job the central record and links every operational and financial event back to it.

## 3. Goals

- Maintain one record for every subcontracted job.
- Show quoted revenue, carrier cost, and expected gross margin before work starts.
- Track a job from booking to delivery and closure.
- Create and send customer invoices from completed work.
- Capture full or partial customer payments.
- Control when carrier settlements become payable.
- Prevent duplicate document numbers and duplicate payments.
- Provide receivables, payables, margin, and cash-exposure reporting.
- Keep an audit history of financial and operational changes.

## 4. Users and permissions

| Role | Core access |
| --- | --- |
| Owner | Full access, reports, company settings, user administration, financial approvals |
| Administrator | Full operational access and configuration, excluding ownership-only actions |
| Operations | Customers, carriers, jobs, delivery progress, proof of delivery |
| Finance | Invoices, receipts, allocations, carrier settlements, statements, finance reports |
| Viewer | Read-only dashboards and reports |

Sensitive actions such as changing carrier banking details, voiding an invoice, and marking a carrier settlement as paid must be permission-controlled and written to the audit log.

## 5. Functional modules

### Dashboard

- Active jobs by status.
- Open customer receivables.
- Overdue customer invoices.
- Carrier payables awaiting approval or payment.
- Gross margin and net cash exposure.
- Action queue for delivery confirmation, invoicing, receipt capture, and carrier payment.

### Customers

- Customer profile and billing contacts.
- Registration and VAT information.
- Default payment terms.
- Customer references and rate notes.
- Open balance and invoice history.
- Customer statements.

### Carriers / subcontractors

- Company and contact details.
- Registration, VAT, insurance, and compliance details.
- Banking details with verification status.
- Vehicle and driver information in later phases.
- Jobs, outstanding settlements, and payment history.

### Jobs

- Auto-generated job number.
- Customer and carrier allocation.
- Collection and delivery locations.
- Load date, expected delivery date, and load description.
- Customer reference, driver, and vehicle details.
- Customer selling price and carrier cost.
- Live gross margin.
- Proof of delivery status and attachment.
- Job status history.

### Customer invoices

- One or more delivered jobs per invoice.
- Sequential invoice numbering.
- Issue date, due date, tax, notes, and payment details.
- Draft, sent, part-paid, paid, overdue, and void states.
- PDF generation and email delivery.
- Customer statement and aging report.

### Customer receipts

- Payment date, amount, method, and bank reference.
- Allocate one payment across one or more invoices.
- Support partial payments and overpayments/unallocated credit in a later phase.
- Update invoice balance and status in one transaction.
- Produce a customer receipt.

### Carrier settlements

- A settlement is created from the carrier cost on a job.
- It remains blocked while delivery or required documentation is outstanding.
- Finance reviews the amount, carrier banking verification, and proof of delivery.
- An approved settlement can be marked paid with a bank reference.
- Payment remittance is sent to the carrier.

### Reports

- Job profitability.
- Revenue and margin by customer.
- Cost and work volume by carrier.
- Customer receivables aging.
- Carrier payables aging.
- Cash exposure: open receivables less unpaid carrier obligations.
- Jobs delivered but not invoiced.
- Carrier settlements paid without a corresponding customer receipt (management risk view).

## 6. End-to-end user flow

### A. Set up master data

1. Administrator enters the logistics company's legal, contact, VAT, and banking details.
2. Operations creates the customer profile and payment terms.
3. Operations creates the carrier profile.
4. Finance verifies the carrier's banking details and records the verification date.

### B. Create and allocate a job

1. Operations selects **New job**.
2. The user selects a customer and enters collection, delivery, load date, and commodity details.
3. The user selects the subcontractor.
4. The user enters the customer rate and carrier cost.
5. The system shows the expected margin before saving.
6. The system creates both the job and its linked carrier settlement in an awaiting-delivery state.

### C. Complete the delivery

1. Operations changes the job to **In transit** when the carrier collects the load.
2. The team updates delivery information and uploads the proof of delivery.
3. The job changes to **Delivered**.
4. The linked carrier settlement becomes **Ready to pay** only when all required checks pass.

### D. Invoice the customer

1. Finance opens the delivered job and selects **Create invoice**.
2. The system copies the customer, job reference, route, and selling price onto the invoice.
3. Finance reviews tax, due date, and notes.
4. The invoice is issued as a PDF and emailed to the customer's billing contact.
5. The job changes to **Invoiced**.

### E. Capture customer payment

1. Finance selects the open invoice or starts from **Receipts**.
2. The user enters the amount received, payment date, method, and bank reference.
3. The payment is allocated to the invoice.
4. A full allocation marks the invoice **Paid**; a smaller allocation marks it **Part paid**.
5. The customer balance, dashboard, and aging report update immediately.

### F. Pay the carrier

1. Finance opens **Carrier payments**.
2. The system displays only settlements that have met the delivery and compliance rules.
3. Finance verifies the amount and banking status.
4. An authorised user records the EFT reference and marks the settlement paid.
5. The system creates a remittance record and writes an audit event.
6. When the customer invoice and carrier settlement are complete, the job can be closed.

## 7. Business rules

- A job must belong to one organisation and one customer.
- A subcontracted job must have a carrier before it can move to Scheduled.
- Customer amount and carrier amount cannot be negative.
- Margin is customer amount less carrier amount; low or negative margin should require approval in a later phase.
- An invoice cannot be issued without at least one invoice line.
- A payment allocation cannot exceed the unallocated part of the payment or the invoice balance.
- Financial allocations must be saved in a database transaction.
- A carrier settlement cannot be paid twice.
- A carrier settlement cannot be paid while the carrier's banking status is unverified.
- Paid invoices and settlements are corrected through reversals or void workflows, not deletion.
- All data access must be scoped by `organizationId`.
- Document numbers are generated by locked counters to avoid duplicates during concurrent use.

## 8. Technical architecture

| Layer | Technology | Responsibility |
| --- | --- | --- |
| Web application | Next.js 16 App Router + TypeScript | Pages, layouts, route handlers, server actions |
| Interface | Tailwind CSS 4 + reusable UI primitives | Responsive desktop and mobile operations UI |
| Icons | Lucide React | Consistent interface iconography |
| Validation | Zod | Shared server-side input contracts |
| Database access | Prisma ORM | Typed queries, transactions, migrations |
| Database | TiDB Cloud (MySQL compatible) | Relational system of record |
| Authentication | Secure cookie session with RBAC | Identity and role-based access |
| Documents | Server-side PDF generator | Invoices, receipts, remittances, statements |
| Email | Transactional email provider | Invoice and remittance delivery |
| File storage | S3-compatible object storage | Proof-of-delivery and supporting files |
| Hosting | Vercel or Node-compatible container | Next.js runtime with TiDB TLS connectivity |

### Data model summary

- `Organization` owns every tenant record.
- `User` belongs to an organisation and has one role.
- `Customer` and `Carrier` are master data.
- `Job` links the customer, subcontractor, route, sell price, and carrier cost.
- `Invoice` contains one or more `InvoiceLine` records; a line can reference a job.
- `Payment` is linked to invoices through `PaymentAllocation`.
- `CarrierSettlement` links one payable to one job and carrier.
- `DocumentCounter` controls sequential references.
- `AuditLog` records protected changes.

## 9. Delivery phases

### Phase 0 — Discovery and control design

- Confirm legal invoice requirements, VAT status, numbering formats, payment approval rules, and carrier document requirements.
- Map current spreadsheets, invoice templates, and the bank reconciliation process.
- Finalise acceptance criteria and permission matrix.

### Phase 1 — Operational MVP

- Responsive dashboard.
- Customer and carrier master data.
- Job creation and job status tracking.
- Customer rate, carrier cost, and margin.
- Proof-of-delivery flag.
- Search and core operational reporting.

### Phase 2 — Finance workflow

- Customer invoices and PDF documents.
- Email delivery.
- Customer payments and allocations.
- Carrier settlement review and payment capture.
- Receivables and payables aging.
- Audit history.

### Phase 3 — Production hardening

- Authentication, role-based permissions, password reset, and session management.
- Validation, idempotency, transaction boundaries, and concurrency testing.
- Backup policy, monitoring, error reporting, and security review.
- Data import from existing spreadsheets.
- User acceptance testing and staff training.

### Phase 4 — Automation and scale

- Customer and carrier self-service portals.
- WhatsApp/email job notifications.
- Driver mobile proof-of-delivery capture with photos and signature.
- GPS/telematics integration.
- Automatic invoice reminders.
- Bank feed import and payment matching.
- Accounting export/integration with Sage, Xero, or QuickBooks.
- Recurring route/rate cards and quotation workflow.

## 10. Deliverables

- Product and workflow specification.
- Technical architecture and relational data model.
- Next.js 16 TypeScript application.
- Responsive Tailwind CSS interface using Lucide icons.
- Dashboard, jobs, customers, carriers, invoices, receipts, settlements, reports, and settings views.
- Clean first-run setup with an empty TiDB database and real CRUD workflows.
- TiDB-compatible Prisma schema.
- Environment variable template.
- Deployment and setup instructions.
- Verification checklist and phased production backlog.

## 11. Future features

### Operations

- Quotes and rate approvals before creating a job.
- Multi-stop and split-load jobs.
- Vehicles, trailers, drivers, licences, and expiry reminders.
- Live tracking and ETA alerts.
- Proof-of-delivery upload, OCR, and automatic matching.
- Incident, damage, and insurance claim workflow.

### Finance

- VAT configuration and tax reports.
- Credit notes, debit notes, refunds, and write-offs.
- Bank statement import and automated reconciliation.
- Carrier advances, deductions, fuel levies, tolls, and accessorial charges.
- Multi-currency and exchange rates.
- Sage/Xero/QuickBooks journal export.

### Collaboration

- Customer portal for bookings, PODs, invoices, and statements.
- Carrier portal for job acceptance, status updates, documents, and remittances.
- Configurable email, SMS, and WhatsApp notifications.
- Approval queues for low-margin jobs and large payments.

### Intelligence

- Customer and route profitability trends.
- Carrier on-time performance and incident scorecards.
- Cash-flow forecasting.
- Recommended carrier based on route, cost, availability, and performance.
- Duplicate invoice and payment anomaly detection.

## 12. Acceptance criteria for the MVP

- A user can create a job with customer, carrier, route, dates, sell price, and carrier cost.
- The application immediately displays the expected gross margin.
- The job appears in the dashboard and job register.
- An invoice displays total, paid amount, outstanding balance, due date, and status.
- A partial receipt changes the invoice to Part paid; a full receipt changes it to Paid.
- A carrier settlement can only be marked paid from Ready to pay.
- Dashboard totals update after receipt or settlement actions.
- Tables remain usable on small screens through horizontal scrolling.
- The TiDB schema enforces organisation scoping, key relationships, and unique document references.
