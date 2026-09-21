import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import type { UserRole } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "haulflow_session";
const SESSION_DAYS = 14;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string, organizationId: string) {
  const token = randomBytes(32).toString("hex");
  const requestHeaders = await headers();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: {
      userId,
      organizationId,
      tokenHash: hashToken(token),
      expiresAt,
      userAgent: requestHeaders.get("user-agent")?.slice(0, 500),
      ipAddress: requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim().slice(0, 64),
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (token) await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  cookieStore.delete(COOKIE_NAME);
}

export async function getCurrentUser() {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: { include: { organization: true } } },
  });

  if (!session || session.expiresAt <= new Date() || !session.user.isActive) {
    if (session) await prisma.session.delete({ where: { id: session.id } }).catch(() => undefined);
    return null;
  }

  if (Date.now() - session.lastUsedAt.getTime() > 60 * 60 * 1000) {
    void prisma.session.update({ where: { id: session.id }, data: { lastUsedAt: new Date() } });
  }

  return session.user;
}

export async function requireUser(roles?: UserRole[]) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (roles && !roles.includes(user.role)) redirect("/dashboard?error=permission");
  return user;
}

export const canManageOperations: UserRole[] = ["OWNER", "ADMIN", "OPERATIONS"];
export const canManageFinance: UserRole[] = ["OWNER", "ADMIN", "FINANCE"];
export const canManageUsers: UserRole[] = ["OWNER", "ADMIN"];
