"use server";

import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type {
  InvoiceStatus,
  JobStatus,
  PaymentMethod,
  SettlementStatus,
  UserRole,
} from "@/generated/prisma/client";
import { writeAudit } from "@/lib/audit";
import {
  canManageFinance,
  canManageOperations,
  canManageUsers,
  requireUser,
} from "@/lib/auth";
import { nextDocumentNumber } from "@/lib/counters";
import { prisma, withTransaction } from "@/lib/prisma";

const required = (form: FormData, key: string) => {
  const value = String(form.get(key) ?? "").trim();
  if (!value) throw new Error(`${key} is required`);
  return value;
};
const optional = (form: FormData, key: string) =>
  String(form.get(key) ?? "").trim() || null;
const money = (form: FormData, key: string) => {
  const value = Number(form.get(key));
  if (!Number.isFinite(value) || value < 0)
    throw new Error(`${key} must be a valid positive amount`);
  return Math.round(value * 100) / 100;
};
const date = (form: FormData, key: string) => {
  const value = new Date(required(form, key));
  if (Number.isNaN(value.getTime())) throw new Error(`${key} is invalid`);
  return value;
};
const go = (path: string, message: string) => {
  revalidatePath(path);
  revalidatePath("/dashboard");
  redirect(`${path}?success=${encodeURIComponent(message)}`);
};

export async function createCustomer(form: FormData) {
  const user = await requireUser(canManageOperations);
  const customer = await withTransaction(
    "createCustomer",
    async (tx) => {
      const code = await nextDocumentNumber(
        tx,
        user.organizationId,
        "CUSTOMER",
      );
      const created = await tx.customer.create({
        data: {
          organizationId: user.organizationId,
          code,
          name: required(form, "name"),
          billingEmail: required(form, "billingEmail").toLowerCase(),
          phone: optional(form, "phone"),
          registrationNo: optional(form, "registrationNo"),
          vatNumber: optional(form, "vatNumber"),
          address: optional(form, "address"),
          paymentTerms: Number(form.get("paymentTerms") ?? 30),
        },
      });
      await writeAudit(tx, {
        organizationId: user.organizationId,
        userId: user.id,
        action: "CREATE",
        entityType: "Customer",
        entityId: created.id,
        after: { code, name: created.name },
      });
      return created;
    },
    { entityType: "Customer" },
  );
  go("/customers", `${customer.code} created`);
}

export async function updateCustomer(form: FormData) {
  const user = await requireUser(canManageOperations);
  const id = required(form, "id");
  const existing = await prisma.customer.findFirst({
    where: { id, organizationId: user.organizationId },
  });
  if (!existing) redirect("/customers?error=not-found");

  await withTransaction(
    "updateCustomer",
    async (tx) => {
      const updated = await tx.customer.update({
        where: { id },
        data: {
          name: required(form, "name"),
          billingEmail: required(form, "billingEmail").toLowerCase(),
          phone: optional(form, "phone"),
          registrationNo: optional(form, "registrationNo"),
          vatNumber: optional(form, "vatNumber"),
          address: optional(form, "address"),
          paymentTerms: Number(form.get("paymentTerms") ?? 30),
        },
      });
      await writeAudit(tx, {
        organizationId: user.organizationId,
        userId: user.id,
        action: "UPDATE",
        entityType: "Customer",
        entityId: id,
        before: { name: existing.name },
        after: { name: updated.name },
      });
    },
    { entityType: "Customer", entityId: id },
  );
  go("/customers", "Customer updated");
}

export async function setCustomerActive(form: FormData) {
  const user = await requireUser(canManageOperations);
  const id = required(form, "id");
  const isActive = required(form, "active") === "true";
  const result = await prisma.customer.updateMany({
    where: { id, organizationId: user.organizationId },
    data: { isActive },
  });
  if (!result.count) redirect("/customers?error=not-found");
  go("/customers", isActive ? "Customer restored" : "Customer archived");
}

export async function createCarrier(form: FormData) {
  const user = await requireUser(canManageOperations);
  const carrier = await withTransaction(
    "createCarrier",
    async (tx) => {
      const code = await nextDocumentNumber(tx, user.organizationId, "CARRIER");
      const created = await tx.carrier.create({
        data: {
          organizationId: user.organizationId,
          code,
          name: required(form, "name"),
          contactName: optional(form, "contactName"),
          email: optional(form, "email")?.toLowerCase(),
          phone: optional(form, "phone"),
          registrationNo: optional(form, "registrationNo"),
          vatNumber: optional(form, "vatNumber"),
          bankName: optional(form, "bankName"),
          bankAccountName: optional(form, "bankAccountName"),
          bankAccountLast4: optional(form, "bankAccountLast4")?.slice(-4),
          bankVerifiedAt: form.get("bankVerified") === "on" ? new Date() : null,
          insuranceExpiresAt: form.get("insuranceExpiresAt")
            ? date(form, "insuranceExpiresAt")
            : null,
        },
      });
      await writeAudit(tx, {
        organizationId: user.organizationId,
        userId: user.id,
        action: "CREATE",
        entityType: "Carrier",
        entityId: created.id,
        after: { code, name: created.name },
      });
      return created;
    },
    { entityType: "Carrier" },
  );
  go("/carriers", `${carrier.code} created`);
}

export async function updateCarrier(form: FormData) {
  const user = await requireUser(canManageOperations);
  const id = required(form, "id");
  const existing = await prisma.carrier.findFirst({
    where: { id, organizationId: user.organizationId },
  });
  if (!existing) redirect("/carriers?error=not-found");

  await withTransaction(
    "updateCarrier",
    async (tx) => {
      const updated = await tx.carrier.update({
        where: { id },
        data: {
          name: required(form, "name"),
          contactName: optional(form, "contactName"),
          email: optional(form, "email")?.toLowerCase(),
          phone: optional(form, "phone"),
          registrationNo: optional(form, "registrationNo"),
          vatNumber: optional(form, "vatNumber"),
          bankName: optional(form, "bankName"),
          bankAccountName: optional(form, "bankAccountName"),
          bankAccountLast4: optional(form, "bankAccountLast4")?.slice(-4),
          bankVerifiedAt:
            form.get("bankVerified") === "on"
              ? (existing.bankVerifiedAt ?? new Date())
              : null,
          insuranceExpiresAt: form.get("insuranceExpiresAt")
            ? date(form, "insuranceExpiresAt")
            : null,
        },
      });
      await writeAudit(tx, {
        organizationId: user.organizationId,
        userId: user.id,
        action: "UPDATE",
        entityType: "Carrier",
        entityId: id,
        before: {
          name: existing.name,
          bankVerified: !!existing.bankVerifiedAt,
        },
        after: { name: updated.name, bankVerified: !!updated.bankVerifiedAt },
      });
    },
    { entityType: "Carrier", entityId: id },
  );
  go("/carriers", "Carrier updated");
}

export async function setCarrierActive(form: FormData) {
  const user = await requireUser(canManageOperations);
  const id = required(form, "id");
  const isActive = required(form, "active") === "true";
  const result = await prisma.carrier.updateMany({
    where: { id, organizationId: user.organizationId },
    data: { isActive },
  });
  if (!result.count) redirect("/carriers?error=not-found");
  go("/carriers", isActive ? "Carrier restored" : "Carrier archived");
}

export async function createJob(form: FormData) {
  const user = await requireUser(canManageOperations);
  const customerId = required(form, "customerId");
  const carrierId = required(form, "carrierId");

  const job = await withTransaction(
    "createJob",
    async (tx) => {
      const customer = await tx.customer.findFirst({
        where: {
          id: customerId,
          organizationId: user.organizationId,
          isActive: true,
        },
      });
      const carrier = await tx.carrier.findFirst({
        where: {
          id: carrierId,
          organizationId: user.organizationId,
          isActive: true,
        },
      });
      if (!customer || !carrier) throw new Error("Invalid customer or carrier");
      const jobNumber = await nextDocumentNumber(
        tx,
        user.organizationId,
        "JOB",
      );
      const settlementNumber = await nextDocumentNumber(
        tx,
        user.organizationId,
        "SETTLEMENT",
      );
      const loadDate = date(form, "loadDate");
      const carrierAmount = money(form, "carrierAmount");
      const created = await tx.job.create({
        data: {
          organizationId: user.organizationId,
          jobNumber,
          customerId,
          carrierId,
          status: "SCHEDULED",
          origin: required(form, "origin"),
          destination: required(form, "destination"),
          loadDate,
          description: required(form, "description"),
          customerReference: optional(form, "customerReference"),
          vehicleReg: optional(form, "vehicleReg"),
          driverName: optional(form, "driverName"),
          driverPhone: optional(form, "driverPhone"),
          customerAmount: money(form, "customerAmount"),
          carrierAmount,
          notes: optional(form, "notes"),
          settlement: {
            create: {
              organizationId: user.organizationId,
              carrierId,
              settlementNumber,
              amount: carrierAmount,
              dueDate: new Date(loadDate.getTime() + 7 * 86400000),
            },
          },
        },
      });
      await writeAudit(tx, {
        organizationId: user.organizationId,
        userId: user.id,
        action: "CREATE",
        entityType: "Job",
        entityId: created.id,
        after: { jobNumber, customerId, carrierId },
      });
      return created;
    },
    { entityType: "Job" },
  );
  go("/jobs", `${job.jobNumber} created`);
}

export async function updateJob(form: FormData) {
  const user = await requireUser(canManageOperations);
  const id = required(form, "id");

  await withTransaction(
    "updateJob",
    async (tx) => {
      const existing = await tx.job.findFirst({
        where: { id, organizationId: user.organizationId },
        include: { settlement: true },
      });
      if (!existing) throw new Error("Job not found");
      if (["CLOSED", "CANCELLED"].includes(existing.status))
        throw new Error("Closed jobs cannot be edited");

      const carrierId = required(form, "carrierId");
      const status = required(form, "status") as JobStatus;
      const podReceived = form.get("podReceived") === "on";
      const carrier = await tx.carrier.findFirst({
        where: { id: carrierId, organizationId: user.organizationId },
      });
      if (!carrier) throw new Error("Carrier not found");

      const updated = await tx.job.update({
        where: { id },
        data: {
          customerId: required(form, "customerId"),
          carrierId,
          status,
          origin: required(form, "origin"),
          destination: required(form, "destination"),
          loadDate: date(form, "loadDate"),
          deliveryDate:
            status === "DELIVERED" || status === "INVOICED"
              ? (existing.deliveryDate ?? new Date())
              : null,
          description: required(form, "description"),
          customerReference: optional(form, "customerReference"),
          vehicleReg: optional(form, "vehicleReg"),
          driverName: optional(form, "driverName"),
          driverPhone: optional(form, "driverPhone"),
          customerAmount: money(form, "customerAmount"),
          carrierAmount: money(form, "carrierAmount"),
          podUrl: optional(form, "podUrl"),
          podReceivedAt: podReceived
            ? (existing.podReceivedAt ?? new Date())
            : null,
          notes: optional(form, "notes"),
        },
      });
      if (existing.settlement) {
        await tx.carrierSettlement.update({
          where: { id: existing.settlement.id },
          data: {
            carrierId,
            amount: updated.carrierAmount,
            status:
              status === "DELIVERED" && podReceived && !!carrier.bankVerifiedAt
                ? "READY_TO_PAY"
                : existing.settlement.status === "PAID"
                  ? "PAID"
                  : "AWAITING_DELIVERY",
          },
        });
      }
      await writeAudit(tx, {
        organizationId: user.organizationId,
        userId: user.id,
        action: "UPDATE",
        entityType: "Job",
        entityId: id,
        before: { status: existing.status },
        after: { status: updated.status },
      });
    },
    { entityType: "Job", entityId: id },
  );
  go("/jobs", "Job updated");
}

export async function archiveJob(form: FormData) {
  const user = await requireUser(canManageOperations);
  const id = required(form, "id");

  await withTransaction(
    "archiveJob",
    async (tx) => {
      const job = await tx.job.findFirst({
        where: { id, organizationId: user.organizationId },
        include: { invoiceLines: true, settlement: true },
      });
      if (!job) throw new Error("Job not found");
      if (job.invoiceLines.length || job.settlement?.status === "PAID")
        throw new Error("Invoiced or paid jobs cannot be cancelled");
      await tx.job.update({ where: { id }, data: { status: "CANCELLED" } });
      if (job.settlement)
        await tx.carrierSettlement.update({
          where: { id: job.settlement.id },
          data: { status: "VOID" },
        });
      await writeAudit(tx, {
        organizationId: user.organizationId,
        userId: user.id,
        action: "CANCEL",
        entityType: "Job",
        entityId: id,
      });
    },
    { entityType: "Job", entityId: id },
  );
  go("/jobs", "Job cancelled");
}

export async function createInvoice(form: FormData) {
  const user = await requireUser(canManageFinance);
  const jobId = required(form, "jobId");

  const invoice = await withTransaction(
    "createInvoice",
    async (tx) => {
      const job = await tx.job.findFirst({
        where: { id: jobId, organizationId: user.organizationId },
        include: { customer: true, invoiceLines: true },
      });
      if (!job || job.invoiceLines.length)
        throw new Error("Job is invalid or already invoiced");
      if (job.status !== "DELIVERED")
        throw new Error("Only delivered jobs can be invoiced");

      const invoiceNumber = await nextDocumentNumber(
        tx,
        user.organizationId,
        "INVOICE",
      );
      const issueDate = date(form, "issueDate");
      const taxRate = Number(form.get("taxRate") ?? 0);
      const subtotal = Number(job.customerAmount);
      const taxAmount = Math.round(subtotal * taxRate) / 100;
      const total = subtotal + taxAmount;
      const status = required(form, "status") as InvoiceStatus;

      const created = await tx.invoice.create({
        data: {
          organizationId: user.organizationId,
          invoiceNumber,
          customerId: job.customerId,
          status,
          issueDate,
          dueDate: date(form, "dueDate"),
          subtotal,
          taxAmount,
          total,
          notes: optional(form, "notes"),
          sentAt: status === "SENT" ? new Date() : null,
          lines: {
            create: {
              jobId,
              description: `${job.description} · ${job.origin} to ${job.destination}`,
              quantity: 1,
              unitPrice: subtotal,
              taxRate,
              lineTotal: total,
            },
          },
        },
      });
      await tx.job.update({
        where: { id: jobId },
        data: { status: "INVOICED" },
      });
      await writeAudit(tx, {
        organizationId: user.organizationId,
        userId: user.id,
        action: "CREATE",
        entityType: "Invoice",
        entityId: created.id,
        after: { invoiceNumber, total },
      });
      return created;
    },
    { entityType: "Invoice" },
  );
  go("/invoices", `${invoice.invoiceNumber} created`);
}

export async function updateInvoice(form: FormData) {
  const user = await requireUser(canManageFinance);
  const id = required(form, "id");

  await withTransaction(
    "updateInvoice",
    async (tx) => {
      const invoice = await tx.invoice.findFirst({
        where: { id, organizationId: user.organizationId },
        include: { lines: true, allocations: { include: { payment: true } } },
      });
      if (!invoice || invoice.status === "VOID")
        throw new Error("Invoice cannot be edited");
      const paid = invoice.allocations
        .filter((a) => a.payment.status === "ACTIVE")
        .reduce((sum, a) => sum + Number(a.amount), 0);
      const subtotal = money(form, "subtotal");
      const taxRate = Number(form.get("taxRate") ?? 0);
      const taxAmount = Math.round(subtotal * taxRate) / 100;
      const total = subtotal + taxAmount;
      if (total < paid)
        throw new Error(
          "Invoice total cannot be below the amount already paid",
        );
      const requested = required(form, "status") as InvoiceStatus;
      const status: InvoiceStatus =
        paid >= total ? "PAID" : paid > 0 ? "PART_PAID" : requested;

      await tx.invoice.update({
        where: { id },
        data: {
          issueDate: date(form, "issueDate"),
          dueDate: date(form, "dueDate"),
          subtotal,
          taxAmount,
          total,
          notes: optional(form, "notes"),
          status,
          sentAt:
            status === "SENT" ? (invoice.sentAt ?? new Date()) : invoice.sentAt,
        },
      });
      if (invoice.lines[0]) {
        await tx.invoiceLine.update({
          where: { id: invoice.lines[0].id },
          data: {
            description: required(form, "description"),
            unitPrice: subtotal,
            taxRate,
            lineTotal: total,
          },
        });
      }
      await writeAudit(tx, {
        organizationId: user.organizationId,
        userId: user.id,
        action: "UPDATE",
        entityType: "Invoice",
        entityId: id,
        before: { total: Number(invoice.total), status: invoice.status },
        after: { total, status },
      });
    },
    { entityType: "Invoice", entityId: id },
  );
  go("/invoices", "Invoice updated");
}

export async function voidInvoice(form: FormData) {
  const user = await requireUser(canManageFinance);
  const id = required(form, "id");

  await withTransaction(
    "voidInvoice",
    async (tx) => {
      const invoice = await tx.invoice.findFirst({
        where: { id, organizationId: user.organizationId },
        include: { lines: true, allocations: { include: { payment: true } } },
      });
      if (!invoice) throw new Error("Invoice not found");
      if (invoice.allocations.some((a) => a.payment.status === "ACTIVE"))
        throw new Error(
          "Void the allocated receipts before voiding this invoice",
        );
      await tx.invoice.update({ where: { id }, data: { status: "VOID" } });
      const jobIds = invoice.lines.flatMap((line) =>
        line.jobId ? [line.jobId] : [],
      );
      await tx.job.updateMany({
        where: { id: { in: jobIds }, organizationId: user.organizationId },
        data: { status: "DELIVERED" },
      });
      await writeAudit(tx, {
        organizationId: user.organizationId,
        userId: user.id,
        action: "VOID",
        entityType: "Invoice",
        entityId: id,
      });
    },
    { entityType: "Invoice", entityId: id },
  );
  go("/invoices", "Invoice voided");
}

export async function createPayment(form: FormData) {
  const user = await requireUser(canManageFinance);
  const invoiceId = required(form, "invoiceId");
  const amount = money(form, "amount");

  const payment = await withTransaction(
    "createPayment",
    async (tx) => {
      const invoice = await tx.invoice.findFirst({
        where: { id: invoiceId, organizationId: user.organizationId },
        include: { allocations: { include: { payment: true } } },
      });
      if (!invoice || invoice.status === "VOID")
        throw new Error("Invoice not found");
      const alreadyPaid = invoice.allocations
        .filter((a) => a.payment.status === "ACTIVE")
        .reduce((sum, a) => sum + Number(a.amount), 0);
      const balance = Number(invoice.total) - alreadyPaid;
      if (amount <= 0 || amount > balance)
        throw new Error("Payment exceeds the invoice balance");

      const paymentNumber = await nextDocumentNumber(
        tx,
        user.organizationId,
        "PAYMENT",
      );
      const created = await tx.payment.create({
        data: {
          organizationId: user.organizationId,
          customerId: invoice.customerId,
          paymentNumber,
          paymentDate: date(form, "paymentDate"),
          amount,
          method: required(form, "method") as PaymentMethod,
          reference: required(form, "reference"),
          notes: optional(form, "notes"),
          allocations: { create: { invoiceId, amount } },
        },
      });
      const newPaid = alreadyPaid + amount;
      await tx.invoice.update({
        where: { id: invoiceId },
        data: {
          status: newPaid >= Number(invoice.total) ? "PAID" : "PART_PAID",
        },
      });
      await writeAudit(tx, {
        organizationId: user.organizationId,
        userId: user.id,
        action: "CREATE",
        entityType: "Payment",
        entityId: created.id,
        after: { paymentNumber, amount, invoiceId },
      });
      return created;
    },
    { entityType: "Payment" },
  );
  go("/payments", `${payment.paymentNumber} captured`);
}

export async function updatePayment(form: FormData) {
  const user = await requireUser(canManageFinance);
  const id = required(form, "id");
  const existing = await prisma.payment.findFirst({
    where: { id, organizationId: user.organizationId },
  });
  if (!existing || existing.status === "VOID")
    throw new Error("Receipt not found");

  await withTransaction(
    "updatePayment",
    async (tx) => {
      await tx.payment.update({
        where: { id },
        data: {
          paymentDate: date(form, "paymentDate"),
          method: required(form, "method") as PaymentMethod,
          reference: required(form, "reference"),
          notes: optional(form, "notes"),
        },
      });
      await writeAudit(tx, {
        organizationId: user.organizationId,
        userId: user.id,
        action: "UPDATE",
        entityType: "Payment",
        entityId: id,
      });
    },
    { entityType: "Payment", entityId: id },
  );
  go("/payments", "Receipt updated");
}

export async function voidPayment(form: FormData) {
  const user = await requireUser(canManageFinance);
  const id = required(form, "id");
  const reason = required(form, "reason");

  await withTransaction(
    "voidPayment",
    async (tx) => {
      const payment = await tx.payment.findFirst({
        where: { id, organizationId: user.organizationId },
        include: { allocations: true },
      });
      if (!payment || payment.status === "VOID")
        throw new Error("Receipt not found");
      await tx.payment.update({
        where: { id },
        data: { status: "VOID", voidedAt: new Date(), voidReason: reason },
      });

      for (const allocation of payment.allocations) {
        const invoice = await tx.invoice.findUnique({
          where: { id: allocation.invoiceId },
          include: { allocations: { include: { payment: true } } },
        });
        if (!invoice) continue;
        const paid = invoice.allocations
          .filter((a) => a.payment.status === "ACTIVE" && a.paymentId !== id)
          .reduce((sum, a) => sum + Number(a.amount), 0);
        await tx.invoice.update({
          where: { id: invoice.id },
          data: {
            status:
              paid <= 0
                ? "SENT"
                : paid >= Number(invoice.total)
                  ? "PAID"
                  : "PART_PAID",
          },
        });
      }
      await writeAudit(tx, {
        organizationId: user.organizationId,
        userId: user.id,
        action: "VOID",
        entityType: "Payment",
        entityId: id,
        after: { reason },
      });
    },
    { entityType: "Payment", entityId: id },
  );
  go("/payments", "Receipt voided and invoice balance restored");
}

export async function updateSettlement(form: FormData) {
  const user = await requireUser(canManageFinance);
  const id = required(form, "id");
  const settlement = await prisma.carrierSettlement.findFirst({
    where: { id, organizationId: user.organizationId },
  });
  if (
    !settlement ||
    settlement.status === "PAID" ||
    settlement.status === "VOID"
  )
    throw new Error("Settlement cannot be edited");

  await withTransaction(
    "updateSettlement",
    async (tx) => {
      await tx.carrierSettlement.update({
        where: { id },
        data: {
          amount: money(form, "amount"),
          dueDate: date(form, "dueDate"),
          status: required(form, "status") as SettlementStatus,
          holdReason: optional(form, "holdReason"),
        },
      });
      await writeAudit(tx, {
        organizationId: user.organizationId,
        userId: user.id,
        action: "UPDATE",
        entityType: "CarrierSettlement",
        entityId: id,
      });
    },
    { entityType: "CarrierSettlement", entityId: id },
  );
  go("/settlements", "Carrier settlement updated");
}

export async function paySettlement(form: FormData) {
  const user = await requireUser(canManageFinance);
  const id = required(form, "id");
  const reference = required(form, "paymentReference");

  await withTransaction(
    "paySettlement",
    async (tx) => {
      const settlement = await tx.carrierSettlement.findFirst({
        where: { id, organizationId: user.organizationId },
        include: { carrier: true, job: true },
      });
      if (!settlement || settlement.status !== "READY_TO_PAY")
        throw new Error("Settlement is not ready for payment");
      if (!settlement.carrier.bankVerifiedAt)
        throw new Error("Carrier banking details are not verified");
      await tx.carrierSettlement.update({
        where: { id },
        data: {
          status: "PAID",
          paidDate: date(form, "paidDate"),
          paymentReference: reference,
        },
      });
      if (settlement.job.status === "INVOICED")
        await tx.job.update({
          where: { id: settlement.jobId },
          data: { status: "CLOSED" },
        });
      await writeAudit(tx, {
        organizationId: user.organizationId,
        userId: user.id,
        action: "PAY",
        entityType: "CarrierSettlement",
        entityId: id,
        after: { reference },
      });
    },
    { entityType: "CarrierSettlement", entityId: id },
  );
  go("/settlements", "Carrier payment recorded");
}

export async function voidSettlement(form: FormData) {
  const user = await requireUser(["OWNER", "ADMIN"]);
  const id = required(form, "id");
  const settlement = await prisma.carrierSettlement.findFirst({
    where: { id, organizationId: user.organizationId },
  });
  if (!settlement) throw new Error("Settlement not found");

  await withTransaction(
    "voidSettlement",
    async (tx) => {
      await tx.carrierSettlement.update({
        where: { id },
        data: { status: "VOID", holdReason: required(form, "reason") },
      });
      await writeAudit(tx, {
        organizationId: user.organizationId,
        userId: user.id,
        action: "VOID",
        entityType: "CarrierSettlement",
        entityId: id,
      });
    },
    { entityType: "CarrierSettlement", entityId: id },
  );
  go("/settlements", "Settlement voided");
}

export async function updateOrganization(form: FormData) {
  const user = await requireUser(canManageUsers);
  const uploadedLogo = form.get("logoFile");
  let logoUrl = optional(form, "logoUrl");

  if (uploadedLogo instanceof File && uploadedLogo.size > 0) {
    if (!uploadedLogo.type.startsWith("image/")) {
      throw new Error("Logo upload must be an image file");
    }

    if (uploadedLogo.size > 2 * 1024 * 1024) {
      throw new Error("Logo file must be smaller than 2MB");
    }

    const imageBuffer = Buffer.from(await uploadedLogo.arrayBuffer());
    const mimeType = uploadedLogo.type || "image/png";
    logoUrl = `data:${mimeType};base64,${imageBuffer.toString("base64")}`;
  }

  await withTransaction(
    "updateOrganization",
    async (tx) => {
      await tx.organization.update({
        where: { id: user.organizationId },
        data: {
          name: required(form, "name"),
          tradingName: optional(form, "tradingName"),
          logoUrl,
          registrationNumber: optional(form, "registrationNumber"),
          vatNumber: optional(form, "vatNumber"),
          vatRegistered: form.get("vatRegistered") === "on",
          email: optional(form, "email")?.toLowerCase(),
          phone: optional(form, "phone"),
          addressLine1: optional(form, "addressLine1"),
          addressLine2: optional(form, "addressLine2"),
          city: optional(form, "city"),
          province: optional(form, "province"),
          postalCode: optional(form, "postalCode"),
          bankName: optional(form, "bankName"),
          bankAccountName: optional(form, "bankAccountName"),
          bankAccountNumber: optional(form, "bankAccountNumber"),
          bankBranchCode: optional(form, "bankBranchCode"),
          bankAccountType: optional(form, "bankAccountType"),
          paymentInstructions: optional(form, "paymentInstructions"),
          invoiceFooter: optional(form, "invoiceFooter"),
          defaultPaymentDays: Number(form.get("defaultPaymentDays") ?? 30),
        },
      });
      await writeAudit(tx, {
        organizationId: user.organizationId,
        userId: user.id,
        action: "UPDATE",
        entityType: "Organization",
        entityId: user.organizationId,
      });
    },
    { entityType: "Organization", entityId: user.organizationId },
  );
  go("/settings", "Company settings saved");
}

export async function createUser(form: FormData) {
  const user = await requireUser(canManageUsers);
  const email = required(form, "email").toLowerCase();
  const password = required(form, "password");
  if (password.length < 10)
    throw new Error("Password must be at least 10 characters");

  const passwordHash = await hash(password, 12);
  const created = await withTransaction(
    "createUser",
    async (tx) => {
      const record = await tx.user.create({
        data: {
          organizationId: user.organizationId,
          name: required(form, "name"),
          email,
          passwordHash,
          role: required(form, "role") as UserRole,
        },
      });
      await writeAudit(tx, {
        organizationId: user.organizationId,
        userId: user.id,
        action: "CREATE",
        entityType: "User",
        entityId: record.id,
        after: { email, role: record.role },
      });
      return record;
    },
    { entityType: "User" },
  );
  go("/settings", `${created.name} added`);
}

export async function updateUser(form: FormData) {
  const actor = await requireUser(canManageUsers);
  const id = required(form, "id");
  if (id === actor.id && form.get("isActive") !== "on")
    throw new Error("You cannot deactivate your own account");

  const existing = await prisma.user.findFirst({
    where: { id, organizationId: actor.organizationId },
  });
  if (!existing) throw new Error("User not found");

  const data: {
    name: string;
    email: string;
    role: UserRole;
    isActive: boolean;
    passwordHash?: string;
  } = {
    name: required(form, "name"),
    email: required(form, "email").toLowerCase(),
    role: required(form, "role") as UserRole,
    isActive: form.get("isActive") === "on",
  };

  if (existing.role === "OWNER" && (data.role !== "OWNER" || !data.isActive)) {
    const owners = await prisma.user.count({
      where: {
        organizationId: actor.organizationId,
        role: "OWNER",
        isActive: true,
      },
    });
    if (owners <= 1)
      throw new Error("The last active owner cannot be demoted or deactivated");
  }

  const password = String(form.get("password") ?? "");
  if (password) {
    if (password.length < 10)
      throw new Error("Password must be at least 10 characters");
    data.passwordHash = await hash(password, 12);
  }

  await withTransaction(
    "updateUser",
    async (tx) => {
      await tx.user.update({ where: { id }, data });
      if (!data.isActive)
        await tx.session.deleteMany({ where: { userId: id } });
      await writeAudit(tx, {
        organizationId: actor.organizationId,
        userId: actor.id,
        action: "UPDATE",
        entityType: "User",
        entityId: id,
        before: {
          email: existing.email,
          role: existing.role,
          isActive: existing.isActive,
        },
        after: { email: data.email, role: data.role, isActive: data.isActive },
      });
    },
    { entityType: "User", entityId: id },
  );
  go("/settings", "User updated");
}

export async function issueInvoice(form: FormData) {
  const user = await requireUser(["OWNER", "ADMIN", "FINANCE"]);
  const id = required(form, "id");

  const invoice = await prisma.invoice.findFirst({
    where: { id, organizationId: user.organizationId },
    include: {
      organization: true,
      customer: true,
      lines: { include: { job: true } },
      allocations: { include: { payment: true } },
    },
  });

  if (!invoice) throw new Error("Invoice not found");
  if (invoice.status === "VOID")
    throw new Error("Voided invoices cannot be issued");
  if (invoice.status !== "DRAFT") throw new Error("Invoice is already issued");

  const snapshot = {
    organization: {
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
    },
    customer: {
      name: invoice.customer.name,
      code: invoice.customer.code,
      billingEmail: invoice.customer.billingEmail,
      phone: invoice.customer.phone,
      registrationNo: invoice.customer.registrationNo,
      vatNumber: invoice.customer.vatNumber,
      address: invoice.customer.address,
      paymentTerms: invoice.customer.paymentTerms,
    },
    invoice: {
      invoiceNumber: invoice.invoiceNumber,
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
      subtotal: invoice.subtotal.toString(),
      taxAmount: invoice.taxAmount.toString(),
      total: invoice.total.toString(),
      notes: invoice.notes,
      status: invoice.status,
      sentAt: invoice.sentAt,
    },
    lines: invoice.lines.map((line) => ({
      id: line.id,
      description: line.description,
      quantity: line.quantity.toString(),
      unitPrice: line.unitPrice.toString(),
      taxRate: line.taxRate.toString(),
      lineTotal: line.lineTotal.toString(),
      jobId: line.jobId,
      jobNumber: line.job?.jobNumber ?? null,
    })),
  };

  await withTransaction(
    "issueInvoice",
    async (tx) => {
      await tx.invoice.update({
        where: { id },
        data: {
          status: "SENT",
          sentAt: new Date(),
          documentSnapshot: snapshot,
        },
      });
      await writeAudit(tx, {
        organizationId: user.organizationId,
        userId: user.id,
        action: "ISSUE",
        entityType: "Invoice",
        entityId: id,
        after: { invoiceNumber: invoice.invoiceNumber, status: "SENT" },
      });
    },
    { entityType: "Invoice", entityId: id },
  );

  go("/invoices", `Invoice ${invoice.invoiceNumber} issued`);
}
