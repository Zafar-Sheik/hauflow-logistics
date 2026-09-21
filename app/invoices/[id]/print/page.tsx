import { InvoiceHtmlDocument } from "@/components/invoices/invoice-html";
import { requireUser } from "@/lib/auth";
import { getInvoiceDocumentData } from "@/lib/invoices/get-invoice-document";

export default async function InvoicePrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const data = await getInvoiceDocumentData(user, id, {
    requireDocumentAccess: true,
  });

  return <InvoicePrintView data={data} />;
}

function InvoicePrintView({
  data,
}: {
  data: Awaited<ReturnType<typeof getInvoiceDocumentData>>;
}) {
  return (
    <>
      <style>{`html, body { margin: 0; background: #fff; } body { font-family: Arial, sans-serif; } @media print { @page { size: A4; margin: 12mm; } }`}</style>
      <InvoiceHtmlDocument data={data} />
    </>
  );
}
