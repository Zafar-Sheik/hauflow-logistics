import { formatDate, formatMoney } from "@/lib/invoices/invoice-calculations";
/* eslint-disable @next/next/no-img-element */

import type { InvoiceDocumentData } from "@/lib/invoices/invoice-document-types";

export function InvoiceHtmlDocument({ data }: { data: InvoiceDocumentData }) {
  const lineItems = data.lines;
  const companyName = data.organization.tradingName || data.organization.name;

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        color: "#0f172a",
        background: "#fff",
        width: "100%",
        maxWidth: 960,
        margin: "0 auto",
        padding: 24,
      }}>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; }
        table { border-collapse: collapse; }
        .invoice-wrap { width: 100%; }
        .header { display: flex; justify-content: space-between; gap: 16px; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
        .company-block { max-width: 55%; }
        .company-name { font-size: 28px; font-weight: 700; }
        .company-meta { font-size: 12px; color: #475569; line-height: 1.7; }
        .meta-box { min-width: 260px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 18px; border-radius: 12px; }
        .title { font-size: 24px; font-weight: 700; letter-spacing: 0.06em; }
        .grid { display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 16px; margin-top: 22px; }
        .panel { border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; background: #fff; }
        .label { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px; }
        .value { font-size: 14px; line-height: 1.6; }
        .table-wrap { margin-top: 24px; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
        .line-table { width: 100%; }
        .line-table th { background: #f8fafc; font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: #475569; padding: 12px 10px; text-align: left; }
        .line-table td { padding: 12px 10px; border-top: 1px solid #e2e8f0; vertical-align: top; }
        .totals { margin-top: 24px; display: flex; justify-content: flex-end; }
        .totals-table { width: 320px; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
        .totals-table tr td { padding: 10px 12px; border-top: 1px solid #e2e8f0; }
        .totals-table tr td:first-child { background: #f8fafc; color: #475569; font-weight: 600; }
        .amount { text-align: right; }
        .footer { margin-top: 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .watermark { position: relative; }
        .watermark:before { content: "${data.isDraft ? "DRAFT" : data.isVoid ? "VOID" : ""}"; position: absolute; inset: 10% 20%; display: flex; align-items: center; justify-content: center; font-size: 56px; font-weight: 700; color: rgba(15, 23, 42, 0.09); letter-spacing: 0.12em; transform: rotate(-25deg); pointer-events: none; }
        @media print {
          html, body { background: #fff; }
          body { padding: 0; }
          .no-print { display: none !important; }
          .invoice-wrap { max-width: none; margin: 0; }
          @page { size: A4; margin: 12mm; }
        }
      `}</style>
      <div className="invoice-wrap watermark">
        <div className="header">
          <div className="company-block">
            {data.organization.logoUrl ? (
              <img
                src={data.organization.logoUrl}
                alt={data.organization.name}
                style={{
                  maxWidth: 180,
                  maxHeight: 64,
                  objectFit: "contain",
                  marginBottom: 12,
                }}
              />
            ) : (
              <div className="company-name">{companyName}</div>
            )}
            <div className="company-meta">
              <div>{data.organization.name}</div>
              {data.organization.tradingName ? (
                <div>{data.organization.tradingName}</div>
              ) : null}
              {data.organization.addressLine1 ? (
                <div>{data.organization.addressLine1}</div>
              ) : null}
              {[
                data.organization.city,
                data.organization.province,
                data.organization.postalCode,
              ]
                .filter(Boolean)
                .join(" ") ? (
                <div>
                  {[
                    data.organization.city,
                    data.organization.province,
                    data.organization.postalCode,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                </div>
              ) : null}
              {data.organization.email ? (
                <div>{data.organization.email}</div>
              ) : null}
              {data.organization.phone ? (
                <div>{data.organization.phone}</div>
              ) : null}
              {data.organization.registrationNumber ? (
                <div>Reg. {data.organization.registrationNumber}</div>
              ) : null}
              {data.organization.vatRegistered &&
              data.organization.vatNumber ? (
                <div>VAT {data.organization.vatNumber}</div>
              ) : null}
            </div>
          </div>
          <div className="meta-box">
            <div className="title">{data.invoiceTitle}</div>
            <div style={{ marginTop: 14, display: "grid", gap: 6 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 8,
                }}>
                <strong>Number</strong>
                <span>{data.invoice.invoiceNumber}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 8,
                }}>
                <strong>Issue date</strong>
                <span>{formatDate(data.invoice.issueDate)}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 8,
                }}>
                <strong>Due date</strong>
                <span>{formatDate(data.invoice.dueDate)}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 8,
                }}>
                <strong>Status</strong>
                <span>{data.invoice.status}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid">
          <div className="panel">
            <div className="label">Bill To</div>
            <div className="value">
              <div style={{ fontWeight: 700 }}>{data.customer.name}</div>
              {data.customer.code ? <div>{data.customer.code}</div> : null}
              {data.customer.billingEmail ? (
                <div>{data.customer.billingEmail}</div>
              ) : null}
              {data.customer.phone ? <div>{data.customer.phone}</div> : null}
              {data.customer.registrationNo ? (
                <div>Reg. {data.customer.registrationNo}</div>
              ) : null}
              {data.customer.vatNumber ? (
                <div>VAT {data.customer.vatNumber}</div>
              ) : null}
              {data.customer.address ? (
                <div style={{ whiteSpace: "pre-line" }}>
                  {data.customer.address}
                </div>
              ) : null}
              {data.invoice.customerReference ? (
                <div style={{ marginTop: 8 }}>
                  <strong>Customer ref:</strong>{" "}
                  {data.invoice.customerReference}
                </div>
              ) : null}
            </div>
          </div>
          <div className="panel">
            <div className="label">Job / transport</div>
            <div className="value">
              {data.relatedJobs.length ? (
                data.relatedJobs.map((job) => (
                  <div key={job.id} style={{ marginBottom: 12 }}>
                    <div>
                      <strong>{job.jobNumber}</strong>
                    </div>
                    <div>
                      {job.origin} → {job.destination}
                    </div>
                    {job.loadDate ? (
                      <div>{formatDate(job.loadDate)}</div>
                    ) : null}
                    {job.description ? <div>{job.description}</div> : null}
                    {job.vehicleReg ? (
                      <div>Vehicle: {job.vehicleReg}</div>
                    ) : null}
                    {job.driverName ? (
                      <div>Driver: {job.driverName}</div>
                    ) : null}
                  </div>
                ))
              ) : (
                <div>—</div>
              )}
            </div>
          </div>
        </div>

        <div className="table-wrap">
          <table className="line-table">
            <thead>
              <tr>
                <th style={{ width: "40%" }}>Description</th>
                <th>Job/ref</th>
                <th>Qty</th>
                <th>Unit price</th>
                <th>Tax rate</th>
                <th>Tax</th>
                <th style={{ textAlign: "right" }}>Line total</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((line) => (
                <tr key={line.id}>
                  <td>{line.description}</td>
                  <td>{line.jobNumber ?? "—"}</td>
                  <td>{line.quantity}</td>
                  <td>{formatMoney(line.unitPrice)}</td>
                  <td>{line.taxRate}%</td>
                  <td>
                    {formatMoney(
                      (
                        Number(line.lineTotal) -
                        Number(line.unitPrice) * Number(line.quantity)
                      ).toFixed(2),
                    )}
                  </td>
                  <td style={{ textAlign: "right", fontWeight: 600 }}>
                    {formatMoney(line.lineTotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="totals">
          <table className="totals-table">
            <tbody>
              <tr>
                <td>Subtotal</td>
                <td className="amount">{formatMoney(data.totals.subtotal)}</td>
              </tr>
              <tr>
                <td>Tax / VAT</td>
                <td className="amount">{formatMoney(data.totals.taxAmount)}</td>
              </tr>
              <tr>
                <td>Total</td>
                <td className="amount" style={{ fontWeight: 700 }}>
                  {formatMoney(data.totals.total)}
                </td>
              </tr>
              <tr>
                <td>Amount paid</td>
                <td className="amount">{formatMoney(data.totals.paid)}</td>
              </tr>
              <tr>
                <td>Outstanding</td>
                <td className="amount" style={{ fontWeight: 700 }}>
                  {formatMoney(data.totals.outstanding)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="footer">
          <div className="panel">
            <div className="label">Banking</div>
            <div className="value">
              {data.organization.bankName ? (
                <div>{data.organization.bankName}</div>
              ) : null}
              {data.organization.bankAccountName ? (
                <div>{data.organization.bankAccountName}</div>
              ) : null}
              {data.organization.bankAccountNumber ? (
                <div>{data.organization.bankAccountNumber}</div>
              ) : null}
              {data.organization.bankBranchCode ? (
                <div>Branch: {data.organization.bankBranchCode}</div>
              ) : null}
              {data.organization.bankAccountType ? (
                <div>Type: {data.organization.bankAccountType}</div>
              ) : null}
            </div>
          </div>
          <div className="panel">
            <div className="label">Payment instructions</div>
            <div className="value" style={{ whiteSpace: "pre-line" }}>
              {data.organization.paymentInstructions ||
                "Please quote the invoice number when making payment."}
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 20,
            borderTop: "1px solid #e2e8f0",
            paddingTop: 14,
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            fontSize: 12,
            color: "#475569",
          }}>
          <div style={{ whiteSpace: "pre-line" }}>
            {data.organization.invoiceFooter || "Thank you for your business."}
          </div>
          <div>Invoice {data.invoice.invoiceNumber}</div>
        </div>
      </div>
    </div>
  );
}
