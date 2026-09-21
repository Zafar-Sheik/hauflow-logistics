import type { Prisma } from "@/generated/prisma/client";

type CounterType = "CUSTOMER" | "CARRIER" | "JOB" | "INVOICE" | "PAYMENT" | "SETTLEMENT";

const defaults: Record<CounterType, string> = {
  CUSTOMER: "C",
  CARRIER: "S",
  JOB: "JOB-",
  INVOICE: "INV-",
  PAYMENT: "REC-",
  SETTLEMENT: "PAY-",
};

export async function nextDocumentNumber(tx: Prisma.TransactionClient, organizationId: string, type: CounterType) {
  const counter = await tx.documentCounter.upsert({
    where: { organizationId_documentType: { organizationId, documentType: type } },
    create: { organizationId, documentType: type, prefix: defaults[type], nextNumber: 2 },
    update: { nextNumber: { increment: 1 } },
  });
  return `${counter.prefix}${String(counter.nextNumber - 1).padStart(4, "0")}`;
}
