import { notFound } from "next/navigation";
import type { UserRole } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { decimalFrom, sumDecimals } from "./invoice-calculations";
import type {
  InvoiceDocumentData,
  InvoiceDocumentSnapshot,
} from "./invoice-document-types";

type CurrentUser = { organizationId: string; role: UserRole };

export async function getInvoiceDocumentData(
  user: CurrentUser,
  invoiceId: string,
  options: { requireDocumentAccess?: boolean } = {},
): Promise<InvoiceDocumentData> {
  if (
    options.requireDocumentAccess &&
    !["OWNER", "ADMIN", "FINANCE"].includes(user.role)
  ) {
    throw new Error(
      "You do not have permission to generate invoice documents.",
    );
  }

  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, organizationId: user.organizationId },
    include: {
      organization: true,
      customer: true,
      lines: { include: { job: true } },
      allocations: { include: { payment: true } },
    },
  });

  if (!invoice) notFound();

  const snapshot = invoice.documentSnapshot as InvoiceDocumentSnapshot | null;
  const company = snapshot?.organization ?? {
    name: invoice.organization.name,
    tradingName: invoice.organization.tradingName,
    logoUrl: invoice.organization.logoUrl,
    registrationNumber: invoice.organization.registrationNumber,
    vatNumber: invoice.organization.vatNumber,
    vatRegistered: invoice.organization.vatRegistered,
    email: invoice.organization.email,
    phone: invoice.organization.phone,
    addressLine1: invoice.organization.addressLine1,
    addressLine2: invoice.organization.addressLine2,
    city: invoice.organization.city,
    province: invoice.organization.province,
    postalCode: invoice.organization.postalCode,
    bankName: invoice.organization.bankName,
    bankAccountName: invoice.organization.bankAccountName,
    bankAccountNumber: invoice.organization.bankAccountNumber,
    bankBranchCode: invoice.organization.bankBranchCode,
    bankAccountType: invoice.organization.bankAccountType,
    paymentInstructions: invoice.organization.paymentInstructions,
    invoiceFooter: invoice.organization.invoiceFooter,
    defaultPaymentDays: invoice.organization.defaultPaymentDays,
  };

  const customer = snapshot?.customer ?? {
    name: invoice.customer.name,
    code: invoice.customer.code,
    billingEmail: invoice.customer.billingEmail,
    phone: invoice.customer.phone,
    registrationNo: invoice.customer.registrationNo,
    vatNumber: invoice.customer.vatNumber,
    address: invoice.customer.address,
    paymentTerms: invoice.customer.paymentTerms,
  };

  const paymentAllocations = invoice.allocations
    .filter((allocation) => allocation.payment.status === "ACTIVE")
    .map((allocation) => ({
      id: allocation.id,
      paymentId: allocation.paymentId,
      paymentNumber: allocation.payment.paymentNumber,
      paymentDate: allocation.payment.paymentDate,
      amount: allocation.amount.toString(),
      reference: allocation.payment.reference,
      method: allocation.payment.method,
    }));

  const paid = sumDecimals(
    paymentAllocations.map((allocation) => allocation.amount),
  );
  const outstanding = decimalFrom(invoice.total).minus(paid);
  const relatedJobs = invoice.lines
    .filter((line) => line.job)
    .map((line) => ({
      id: line.jobId ?? line.id,
      jobNumber: line.job?.jobNumber ?? "—",
      origin: line.job?.origin ?? "—",
      destination: line.job?.destination ?? "—",
      loadDate: line.job?.loadDate ?? invoice.issueDate,
      deliveryDate: line.job?.deliveryDate ?? null,
      description: line.job?.description ?? line.description,
      vehicleReg: line.job?.vehicleReg ?? null,
      driverName: line.job?.driverName ?? null,
      customerReference: line.job?.customerReference ?? null,
    }));

  const documentLines = (snapshot?.lines ??
    invoice.lines.map((line) => ({
      id: line.id,
      description: line.description,
      quantity: line.quantity.toString(),
      unitPrice: line.unitPrice.toString(),
      taxRate: line.taxRate.toString(),
      lineTotal: line.lineTotal.toString(),
      jobId: line.jobId,
      jobNumber: line.job?.jobNumber ?? null,
      jobDescription: line.job?.description ?? null,
    }))) as InvoiceDocumentData["lines"];

  const invoiceTitle: "INVOICE" | "TAX INVOICE" = company.vatRegistered
    ? "TAX INVOICE"
    : "INVOICE";

  return {
    organization: company,
    customer,
    invoice: {
      id: invoice.id,
      invoiceNumber: snapshot?.invoice.invoiceNumber ?? invoice.invoiceNumber,
      issueDate: snapshot?.invoice.issueDate ?? invoice.issueDate,
      dueDate: snapshot?.invoice.dueDate ?? invoice.dueDate,
      subtotal: snapshot?.invoice.subtotal ?? invoice.subtotal.toString(),
      taxAmount: snapshot?.invoice.taxAmount ?? invoice.taxAmount.toString(),
      total: snapshot?.invoice.total ?? invoice.total.toString(),
      notes: snapshot?.invoice.notes ?? invoice.notes,
      status: invoice.status,
      sentAt: invoice.sentAt,
      customerReference:
        snapshot?.invoice.customerReference ??
        relatedJobs[0]?.customerReference ??
        null,
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt,
      paymentTerms: customer.paymentTerms,
    },
    lines: documentLines,
    relatedJobs,
    paymentAllocations,
    paymentRecords: invoice.allocations.map((allocation) => ({
      id: allocation.id,
      paymentNumber: allocation.payment.paymentNumber,
      paymentDate: allocation.payment.paymentDate,
      amount: allocation.amount.toString(),
      reference: allocation.payment.reference,
      method: allocation.payment.method,
      status: allocation.payment.status,
    })),
    totals: {
      subtotal: invoice.subtotal.toString(),
      taxAmount: invoice.taxAmount.toString(),
      total: invoice.total.toString(),
      paid: paid.toString(),
      outstanding: outstanding.toString(),
    },
    snapshotUsed: Boolean(snapshot),
    invoiceTitle,
    isDraft: invoice.status === "DRAFT",
    isVoid: invoice.status === "VOID",
    isPaid: invoice.status === "PAID" || outstanding.lessThanOrEqualTo(0),
    isPartPaid:
      invoice.status === "PART_PAID" ||
      (paid.greaterThan(0) && outstanding.greaterThan(0)),
  };
}
