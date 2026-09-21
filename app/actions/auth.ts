"use server";

import { compare, hash } from "bcryptjs";
import { redirect } from "next/navigation";
import { createSession, destroySession } from "@/lib/auth";
import { prisma, withTransaction } from "@/lib/prisma";

const normalizeEmail = (value: FormDataEntryValue | null) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

export async function setupSystem(formData: FormData) {
  const companyName = String(formData.get("companyName") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const email = normalizeEmail(formData.get("email"));
  const password = String(formData.get("password") ?? "");

  if (!companyName || !name || !email.includes("@") || password.length < 10) {
    redirect("/setup?error=invalid");
  }

  const passwordHash = await hash(password, 12);
  const result = await withTransaction(
    "setupSystem",
    async (tx) => {
      if ((await tx.user.count()) > 0) return null;
      const organization = await tx.organization.create({
        data: {
          name: companyName,
          email,
          counters: {
            create: [
              { documentType: "CUSTOMER", prefix: "C", nextNumber: 1 },
              { documentType: "CARRIER", prefix: "S", nextNumber: 1 },
              { documentType: "JOB", prefix: "JOB-", nextNumber: 1 },
              { documentType: "INVOICE", prefix: "INV-", nextNumber: 1 },
              { documentType: "PAYMENT", prefix: "REC-", nextNumber: 1 },
              { documentType: "SETTLEMENT", prefix: "PAY-", nextNumber: 1 },
            ],
          },
        },
      });
      const user = await tx.user.create({
        data: {
          organizationId: organization.id,
          name,
          email,
          passwordHash,
          role: "OWNER",
        },
      });
      return { userId: user.id, organizationId: organization.id };
    },
    { entityType: "Organization" },
  );

  if (!result) redirect("/login?error=already-configured");
  await createSession(result.userId, result.organizationId);
  redirect("/dashboard");
}

export async function login(formData: FormData) {
  const email = normalizeEmail(formData.get("email"));
  const password = String(formData.get("password") ?? "");
  const user = await prisma.user.findUnique({ where: { email } });

  if (
    !user ||
    !user.isActive ||
    !(await compare(password, user.passwordHash))
  ) {
    redirect("/login?error=credentials");
  }

  await createSession(user.id, user.organizationId);
  redirect("/dashboard");
}

export async function logout() {
  await destroySession();
  redirect("/login");
}
