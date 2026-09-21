import type { Prisma } from "@/generated/prisma/client";

export async function writeAudit(
  tx: Prisma.TransactionClient,
  input: {
    organizationId: string;
    userId?: string;
    action: string;
    entityType: string;
    entityId: string;
    before?: Prisma.InputJsonValue;
    after?: Prisma.InputJsonValue;
  },
) {
  await tx.auditLog.create({
    data: {
      organizationId: input.organizationId,
      userId: input.userId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      beforeJson: input.before,
      afterJson: input.after,
    },
  });
}
