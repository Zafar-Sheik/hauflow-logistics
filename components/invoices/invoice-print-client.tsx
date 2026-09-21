"use client";

import { useEffect } from "react";
import { InvoiceHtmlDocument } from "@/components/invoices/invoice-html";
import type { InvoiceDocumentData } from "@/lib/invoices/invoice-document-types";

export function InvoicePrintClient({ data }: { data: InvoiceDocumentData }) {
  useEffect(() => {
    window.print();
  }, []);

  return (
    <>
      <style>{`html, body { margin: 0; background: #fff; } body { font-family: Arial, sans-serif; } @media print { @page { size: A4; margin: 12mm; } }`}</style>
      <InvoiceHtmlDocument data={data} />
    </>
  );
}
