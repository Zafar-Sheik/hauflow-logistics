import {
  createInvoice,
  updateInvoice,
  voidInvoice,
} from "@/app/actions/operations";
import { ConfirmAction } from "@/components/confirm-action";
import { CrudDialog } from "@/components/crud-dialog";
import { Field, SelectField, TextAreaField } from "@/components/form-fields";
import {
  EmptyState,
  Flash,
  PageHeader,
  StatusBadge,
} from "@/components/page-ui";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requireUser } from "@/lib/auth";
import { shortDate, zar } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const today = new Date();
  const defaultIssueDate = today.toISOString().slice(0, 10);
  const defaultDueDate = new Date(today.getTime() + 30 * 86400000)
    .toISOString()
    .slice(0, 10);
  const [invoices, jobs] = await Promise.all([
    prisma.invoice.findMany({
      where: { organizationId: user.organizationId },
      include: {
        customer: true,
        lines: { include: { job: true } },
        allocations: { include: { payment: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.job.findMany({
      where: {
        organizationId: user.organizationId,
        status: "DELIVERED",
        invoiceLines: { none: {} },
      },
      include: { customer: true },
      orderBy: { loadDate: "desc" },
    }),
  ]);

  const create = (
    <CrudDialog
      title="Create customer invoice"
      description="Create an invoice from one completed, uninvoiced job."
      action={createInvoice}
      triggerLabel="Create invoice">
      <SelectField
        name="jobId"
        label="Delivered job"
        options={jobs.map((job) => ({
          value: job.id,
          label: `${job.jobNumber} · ${job.customer.name} · ${zar.format(Number(job.customerAmount))}`,
        }))}
      />
      <SelectField
        name="status"
        label="Initial status"
        defaultValue="DRAFT"
        options={[
          { value: "DRAFT", label: "Draft" },
          { value: "SENT", label: "Issued / sent" },
        ]}
      />
      <Field
        name="issueDate"
        label="Issue date"
        type="date"
        defaultValue={defaultIssueDate}
        required
      />
      <Field
        name="dueDate"
        label="Due date"
        type="date"
        defaultValue={defaultDueDate}
        required
      />
      <Field
        name="taxRate"
        label="Tax rate (%)"
        type="number"
        min={0}
        step="0.01"
        defaultValue={0}
        required
      />
      <TextAreaField
        name="notes"
        label="Invoice notes"
        className="sm:col-span-2"
      />
    </CrudDialog>
  );

  return (
    <main className="mx-auto w-full max-w-[1500px] p-4 md:p-7">
      <PageHeader
        title="Customer invoices"
        description="Issue customer invoices and control every outstanding balance."
        action={jobs.length ? create : undefined}
      />
      <Flash success={params.success} error={params.error} />
      {invoices.length ? (
        <Card className="border-slate-200 shadow-none">
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Invoice</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Job</TableHead>
                  <TableHead>Issue / due</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="pr-6 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => {
                  const paid = invoice.allocations
                    .filter(
                      (allocation) => allocation.payment.status === "ACTIVE",
                    )
                    .reduce(
                      (sum, allocation) => sum + Number(allocation.amount),
                      0,
                    );
                  const line = invoice.lines[0];
                  return (
                    <TableRow key={invoice.id}>
                      <TableCell className="pl-6 font-semibold">
                        {invoice.invoiceNumber}
                      </TableCell>
                      <TableCell>{invoice.customer.name}</TableCell>
                      <TableCell>{line?.job?.jobNumber ?? "—"}</TableCell>
                      <TableCell>
                        <p>{shortDate(invoice.issueDate)}</p>
                        <p className="text-xs text-slate-500">
                          Due {shortDate(invoice.dueDate)}
                        </p>
                      </TableCell>
                      <TableCell>{zar.format(Number(invoice.total))}</TableCell>
                      <TableCell>{zar.format(paid)}</TableCell>
                      <TableCell className="font-semibold">
                        {zar.format(Number(invoice.total) - paid)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={invoice.status} />
                      </TableCell>
                      <TableCell className="pr-6">
                        <div className="flex justify-end gap-1 flex-wrap">
                          <a
                            href={`/invoices/${invoice.id}`}
                            className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50">
                            View
                          </a>
                          <a
                            href={`/api/invoices/${invoice.id}/pdf`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50">
                            PDF
                          </a>
                          <a
                            href={`/invoices/${invoice.id}/print`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50">
                            Print
                          </a>
                          {invoice.status !== "VOID" && (
                            <CrudDialog
                              mode="edit"
                              title={`Edit ${invoice.invoiceNumber}`}
                              description="Financial changes remain in the audit log."
                              action={updateInvoice}>
                              <input
                                type="hidden"
                                name="id"
                                value={invoice.id}
                              />
                              <Field
                                name="issueDate"
                                label="Issue date"
                                type="date"
                                defaultValue={invoice.issueDate
                                  .toISOString()
                                  .slice(0, 10)}
                                required
                              />
                              <Field
                                name="dueDate"
                                label="Due date"
                                type="date"
                                defaultValue={invoice.dueDate
                                  .toISOString()
                                  .slice(0, 10)}
                                required
                              />
                              <Field
                                name="subtotal"
                                label="Subtotal (R)"
                                type="number"
                                min={0}
                                step="0.01"
                                defaultValue={Number(invoice.subtotal)}
                                required
                              />
                              <Field
                                name="taxRate"
                                label="Tax rate (%)"
                                type="number"
                                min={0}
                                step="0.01"
                                defaultValue={Number(line?.taxRate ?? 0)}
                                required
                              />
                              <SelectField
                                name="status"
                                label="Issue state"
                                defaultValue={
                                  paid > 0 ? "SENT" : invoice.status
                                }
                                options={[
                                  { value: "DRAFT", label: "Draft" },
                                  { value: "SENT", label: "Issued / sent" },
                                ]}
                              />
                              <Field
                                name="description"
                                label="Line description"
                                defaultValue={line?.description}
                                required
                              />
                              <TextAreaField
                                name="notes"
                                label="Invoice notes"
                                defaultValue={invoice.notes}
                                className="sm:col-span-2"
                              />
                            </CrudDialog>
                          )}
                          {invoice.status !== "VOID" && (
                            <ConfirmAction
                              action={voidInvoice}
                              id={invoice.id}
                              title="Void this invoice?"
                              description="This keeps the invoice in the audit trail and returns its job to Delivered. Receipts must be voided first."
                              label="Void invoice"
                            />
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <EmptyState
          title="No invoices yet"
          description={
            jobs.length
              ? "A delivered job is ready to invoice."
              : "Invoices can be created after a job is marked Delivered."
          }
          action={jobs.length ? create : undefined}
        />
      )}
    </main>
  );
}
