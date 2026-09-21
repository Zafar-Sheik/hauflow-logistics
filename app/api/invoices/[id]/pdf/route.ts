import { renderToBuffer } from "@react-pdf/renderer";
import { InvoicePdfDocument } from "@/components/invoices/invoice-pdf-document";
import { requireUser } from "@/lib/auth";
import { getInvoiceDocumentData } from "@/lib/invoices/get-invoice-document";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await requireUser();
  const { id } = await params;
  const data = await getInvoiceDocumentData(user, id, {
    requireDocumentAccess: true,
  });
  const cleanNumber = data.invoice.invoiceNumber.replace(
    /[^a-zA-Z0-9.-]+/g,
    "-",
  );
  const pdfBuffer = await renderToBuffer(InvoicePdfDocument({ data }));

  return new Response(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${cleanNumber}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
