/* eslint-disable jsx-a11y/alt-text */

import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { formatDate, formatMoney } from "@/lib/invoices/invoice-calculations";
import type { InvoiceDocumentData } from "@/lib/invoices/invoice-document-types";

const styles = StyleSheet.create({
  page: {
    padding: 24,
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica",
    color: "#0f172a",
  },
  section: { marginBottom: 12 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: "#dfe7f1",
    paddingBottom: 12,
    marginBottom: 12,
  },
  company: { width: "58%" },
  companyName: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 6,
    letterSpacing: 0.2,
    color: "#0f172a",
  },
  metaText: {
    fontSize: 7.5,
    color: "#475569",
    marginBottom: 2,
    lineHeight: 1.4,
  },
  invoiceBox: {
    width: "34%",
    padding: 10,
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#dfe7f1",
  },
  title: {
    fontSize: 17,
    fontWeight: 700,
    letterSpacing: 0.6,
    marginBottom: 6,
    color: "#0f172a",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    marginTop: 4,
    color: "#334155",
  },
  panel: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    padding: 10,
    backgroundColor: "#ffffff",
    minHeight: 100,
  },
  twoCol: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 12,
  },
  detailGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    flexWrap: "wrap",
  },
  detailCard: {
    flex: 1,
    minWidth: 180,
    borderWidth: 1,
    borderColor: "#dfe7f1",
    borderRadius: 9,
    padding: 8,
    backgroundColor: "#f8fafc",
  },
  detailTitle: {
    fontSize: 7,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 1.1,
    marginBottom: 6,
    fontWeight: 700,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 6,
    marginBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 3,
  },
  detailKey: {
    fontSize: 7,
    color: "#64748b",
    width: "38%",
    lineHeight: 1.3,
  },
  detailValue: {
    fontSize: 8,
    color: "#0f172a",
    width: "60%",
    lineHeight: 1.3,
    textAlign: "right",
  },
  label: {
    fontSize: 7,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 1.1,
    marginBottom: 6,
    fontWeight: 700,
  },
  value: { fontSize: 8.5, lineHeight: 1.4, color: "#334155" },
  table: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#ffffff",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f8fafc",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: "#ffffff",
  },
  cell: { fontSize: 8, color: "#0f172a" },
  totalBox: {
    width: 210,
    alignSelf: "flex-end",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 12,
    backgroundColor: "#f8fafc",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    fontSize: 8,
    color: "#334155",
  },
  totalRowStrong: {
    backgroundColor: "#0f172a",
    color: "#ffffff",
    fontWeight: 700,
  },
  footer: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: 8,
    color: "#475569",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 10,
  },
  watermark: {
    position: "absolute",
    left: 135,
    top: 220,
    fontSize: 32,
    fontWeight: 700,
    color: "rgba(15, 23, 42, 0.08)",
    transform: "rotate(-35deg)",
    letterSpacing: 5,
  },
});

export function InvoicePdfDocument({ data }: { data: InvoiceDocumentData }) {
  const companyName = data.organization.tradingName || data.organization.name;
  const watermark = data.isDraft ? "DRAFT" : data.isVoid ? "VOID" : "";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {watermark ? <Text style={styles.watermark}>{watermark}</Text> : null}
        <View style={styles.header}>
          <View style={styles.company}>
            <View
              style={{
                borderWidth: 1,
                borderColor: "#e2e8f0",
                borderRadius: 9,
                padding: 8,
                backgroundColor: "#f8fafc",
              }}>
              {data.organization.logoUrl ? (
                <Image
                  src={data.organization.logoUrl}
                  style={{ width: 150, height: 50, marginBottom: 8 }}
                />
              ) : (
                <Text style={styles.companyName}>{companyName}</Text>
              )}
              <Text style={styles.metaText}>{data.organization.name}</Text>
              {data.organization.tradingName ? (
                <Text style={styles.metaText}>
                  {data.organization.tradingName}
                </Text>
              ) : null}
              {data.organization.addressLine1 ? (
                <Text style={styles.metaText}>
                  {data.organization.addressLine1}
                </Text>
              ) : null}
              {data.organization.city ||
              data.organization.province ||
              data.organization.postalCode ? (
                <Text style={styles.metaText}>
                  {[
                    data.organization.city,
                    data.organization.province,
                    data.organization.postalCode,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                </Text>
              ) : null}
              {data.organization.email ? (
                <Text style={styles.metaText}>{data.organization.email}</Text>
              ) : null}
              {data.organization.phone ? (
                <Text style={styles.metaText}>{data.organization.phone}</Text>
              ) : null}
              {data.organization.registrationNumber ? (
                <Text style={styles.metaText}>
                  Reg. {data.organization.registrationNumber}
                </Text>
              ) : null}
              {data.organization.vatRegistered &&
              data.organization.vatNumber ? (
                <Text style={styles.metaText}>
                  VAT {data.organization.vatNumber}
                </Text>
              ) : null}
            </View>
          </View>

          <View style={styles.invoiceBox}>
            <Text style={styles.title}>{data.invoiceTitle}</Text>
            <View style={styles.row}>
              <Text>Number</Text>
              <Text>{data.invoice.invoiceNumber}</Text>
            </View>
            <View style={styles.row}>
              <Text>Issue</Text>
              <Text>{formatDate(data.invoice.issueDate)}</Text>
            </View>
            <View style={styles.row}>
              <Text>Due</Text>
              <Text>{formatDate(data.invoice.dueDate)}</Text>
            </View>
            <View style={styles.row}>
              <Text>Status</Text>
              <Text>{data.invoice.status}</Text>
            </View>
          </View>
        </View>

        <View style={styles.twoCol}>
          <View style={styles.detailCard}>
            <Text style={styles.detailTitle}>Bill To</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailKey}>Client</Text>
              <Text style={styles.detailValue}>{data.customer.name}</Text>
            </View>
            {data.customer.code ? (
              <View style={styles.detailRow}>
                <Text style={styles.detailKey}>Code</Text>
                <Text style={styles.detailValue}>{data.customer.code}</Text>
              </View>
            ) : null}
            {data.customer.billingEmail ? (
              <View style={styles.detailRow}>
                <Text style={styles.detailKey}>Email</Text>
                <Text style={styles.detailValue}>
                  {data.customer.billingEmail}
                </Text>
              </View>
            ) : null}
            {data.customer.phone ? (
              <View style={styles.detailRow}>
                <Text style={styles.detailKey}>Phone</Text>
                <Text style={styles.detailValue}>{data.customer.phone}</Text>
              </View>
            ) : null}
            {data.customer.address ? (
              <View style={styles.detailRow}>
                <Text style={styles.detailKey}>Address</Text>
                <Text style={styles.detailValue}>{data.customer.address}</Text>
              </View>
            ) : null}
            {data.customer.registrationNo ? (
              <View style={styles.detailRow}>
                <Text style={styles.detailKey}>Reg.</Text>
                <Text style={styles.detailValue}>
                  {data.customer.registrationNo}
                </Text>
              </View>
            ) : null}
            {data.customer.vatNumber ? (
              <View style={styles.detailRow}>
                <Text style={styles.detailKey}>VAT</Text>
                <Text style={styles.detailValue}>
                  {data.customer.vatNumber}
                </Text>
              </View>
            ) : null}
            {data.invoice.customerReference ? (
              <View style={styles.detailRow}>
                <Text style={styles.detailKey}>Ref.</Text>
                <Text style={styles.detailValue}>
                  {data.invoice.customerReference}
                </Text>
              </View>
            ) : null}
          </View>

          <View style={styles.detailCard}>
            <Text style={styles.detailTitle}>Job / transport</Text>
            {data.relatedJobs.length ? (
              data.relatedJobs.map((job) => (
                <View key={job.id} style={{ marginBottom: 8 }}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailKey}>Job</Text>
                    <Text style={styles.detailValue}>{job.jobNumber}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailKey}>Route</Text>
                    <Text style={styles.detailValue}>
                      {job.origin} → {job.destination}
                    </Text>
                  </View>
                  {job.loadDate ? (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailKey}>Load date</Text>
                      <Text style={styles.detailValue}>
                        {formatDate(job.loadDate)}
                      </Text>
                    </View>
                  ) : null}
                  {job.vehicleReg ? (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailKey}>Vehicle</Text>
                      <Text style={styles.detailValue}>{job.vehicleReg}</Text>
                    </View>
                  ) : null}
                  {job.driverName ? (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailKey}>Driver</Text>
                      <Text style={styles.detailValue}>{job.driverName}</Text>
                    </View>
                  ) : null}
                  {job.description ? (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailKey}>Notes</Text>
                      <Text style={styles.detailValue}>{job.description}</Text>
                    </View>
                  ) : null}
                </View>
              ))
            ) : (
              <Text style={styles.value}>—</Text>
            )}
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.cell, { width: "34%" }]}>Description</Text>
            <Text style={[styles.cell, { width: "15%" }]}>Ref</Text>
            <Text style={[styles.cell, { width: "8%" }]}>Qty</Text>
            <Text style={[styles.cell, { width: "14%" }]}>Unit price</Text>
            <Text style={[styles.cell, { width: "12%" }]}>Tax</Text>
            <Text style={[styles.cell, { width: "12%" }]}>Tax amount</Text>
            <Text style={[styles.cell, { width: "15%", textAlign: "right" }]}>
              Line total
            </Text>
          </View>
          {data.lines.map((line) => {
            const lineTax =
              Number(line.lineTotal) -
              Number(line.unitPrice) * Number(line.quantity);
            return (
              <View key={line.id} style={styles.tableRow}>
                <Text style={[styles.cell, { width: "34%" }]}>
                  {line.description}
                </Text>
                <Text style={[styles.cell, { width: "15%" }]}>
                  {line.jobNumber ?? "—"}
                </Text>
                <Text style={[styles.cell, { width: "8%" }]}>
                  {line.quantity}
                </Text>
                <Text style={[styles.cell, { width: "14%" }]}>
                  {formatMoney(line.unitPrice)}
                </Text>
                <Text style={[styles.cell, { width: "12%" }]}>
                  {line.taxRate}%
                </Text>
                <Text style={[styles.cell, { width: "12%" }]}>
                  {formatMoney(lineTax.toFixed(2))}
                </Text>
                <Text
                  style={[styles.cell, { width: "15%", textAlign: "right" }]}>
                  {formatMoney(line.lineTotal)}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.totalBox}>
          <View style={styles.totalRow}>
            <Text>Subtotal</Text>
            <Text>{formatMoney(data.totals.subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>Tax / VAT</Text>
            <Text>{formatMoney(data.totals.taxAmount)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>Amount paid</Text>
            <Text>{formatMoney(data.totals.paid)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>Outstanding</Text>
            <Text>{formatMoney(data.totals.outstanding)}</Text>
          </View>
          <View style={[styles.totalRow, styles.totalRowStrong]}>
            <Text style={{ color: "#ffffff" }}>Total</Text>
            <Text style={{ color: "#ffffff" }}>
              {formatMoney(data.totals.total)}
            </Text>
          </View>
        </View>

        <View style={styles.twoCol}>
          <View style={styles.panel}>
            <Text style={styles.label}>Banking</Text>
            {data.organization.bankName ? (
              <Text style={styles.value}>{data.organization.bankName}</Text>
            ) : null}
            {data.organization.bankAccountName ? (
              <Text style={styles.value}>
                {data.organization.bankAccountName}
              </Text>
            ) : null}
            {data.organization.bankAccountNumber ? (
              <Text style={styles.value}>
                {data.organization.bankAccountNumber}
              </Text>
            ) : null}
            {data.organization.bankBranchCode ? (
              <Text style={styles.value}>
                Branch: {data.organization.bankBranchCode}
              </Text>
            ) : null}
            {data.organization.bankAccountType ? (
              <Text style={styles.value}>
                Type: {data.organization.bankAccountType}
              </Text>
            ) : null}
          </View>
          <View style={styles.panel}>
            <Text style={styles.label}>Instructions</Text>
            <Text style={styles.value}>
              {data.organization.paymentInstructions ||
                "Please quote the invoice number when making payment."}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text>
            {data.organization.invoiceFooter || "Thank you for your business."}
          </Text>
          <Text>Invoice {data.invoice.invoiceNumber}</Text>
        </View>
      </Page>
    </Document>
  );
}
