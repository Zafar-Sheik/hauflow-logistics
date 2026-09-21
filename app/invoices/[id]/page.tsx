import Link from "next/link";
import { InvoiceHtmlDocument } from "@/components/invoices/invoice-html";
import { requireUser } from "@/lib/auth";
import { formatDate, formatMoney } from "@/lib/invoices/invoice-calculations";
import { getInvoiceDocumentData } from "@/lib/invoices/get-invoice-document";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const data = await getInvoiceDocumentData(user, id, {
    requireDocumentAccess: true,
  });

  return (
    <main className="mx-auto w-full max-w-[1500px] p-4 md:p-7">
      <div className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
            Invoice document
          </p>
          <h1 className="mt-1 text-3xl font-semibold text-slate-900">
            {data.invoice.invoiceNumber}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={`/api/invoices/${id}/pdf`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Download PDF
          </a>
          <Link
            href={`/invoices/${id}/print`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Print
          </Link>
          <Link
            href="/invoices"
            className="inline-flex items-center justify-center rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800">
            Back to invoices
          </Link>
        </div>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
            Issue date
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-900">
            {formatDate(data.invoice.issueDate)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
            Due date
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-900">
            {formatDate(data.invoice.dueDate)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
            Total
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-900">
            {formatMoney(data.totals.total)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
            Status
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-900">
            {data.invoice.status}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <InvoiceHtmlDocument data={data} />
      </div>
    </main>
  );
}
