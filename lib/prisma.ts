import "server-only";

import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import type { Prisma } from "@/generated/prisma/client";
import { PrismaClient } from "@/generated/prisma/client";

export const TRANSACTION_OPTIONS = {
  maxWait: 10_000,
  timeout: 20_000,
} as const;

type TransactionMeta = {
  entityType?: string;
  entityId?: string;
};

export async function withTransaction<T>(
  actionName: string,
  operation: (tx: Prisma.TransactionClient) => Promise<T>,
  meta: TransactionMeta = {},
): Promise<T> {
  const startedAt = Date.now();

  try {
    return await prisma.$transaction(operation, TRANSACTION_OPTIONS);
  } catch (error) {
    const prismaError = error as Prisma.PrismaClientKnownRequestError & {
      code?: string;
      message?: string;
    };
    const durationMs = Date.now() - startedAt;
    const timeoutLike =
      prismaError?.code === "P2028" ||
      prismaError?.code === "ETIMEDOUT" ||
      /timeout/i.test(prismaError?.message ?? "");

    console.error("[Prisma transaction failed]", {
      action: actionName,
      durationMs,
      code: prismaError?.code ?? "UNKNOWN",
      entityType: meta.entityType ?? null,
      entityId: meta.entityId ?? null,
      message: prismaError?.message ?? "Unknown transaction error",
    });

    if (timeoutLike) {
      throw new Error(
        "The database transaction timed out while saving your changes. Please try again.",
      );
    }

    throw error;
  }
}

function parseDatabaseUrl(connectionString: string) {
  const trimmed = connectionString.trim();

  try {
    const url = new URL(trimmed);
    return {
      host: url.hostname,
      port: Number(url.port || 4000),
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: url.pathname.replace(/^\//, ""),
    };
  } catch (error) {
    const match = trimmed.match(
      /^mysql(?:2)?:\/\/(?:(.*?)(?::(.*?))?@)?([^/:]+)(?::(\d+))?\/([^?]+)(?:\?.*)?$/,
    );

    if (!match) {
      throw new Error(
        `DATABASE_URL is invalid. Use a full MySQL/TiDB DSN like mysql://user:password@host:4000/database?sslaccept=strict. Received: ${trimmed.slice(0, 80)}${trimmed.length > 80 ? "..." : ""}`,
      );
    }

    const [, rawUser, rawPassword, host, portString, database] = match;
    return {
      host,
      port: Number(portString || 4000),
      user: rawUser ? decodeURIComponent(rawUser) : "",
      password: rawPassword ? decodeURIComponent(rawPassword) : "",
      database: database.replace(/\/+$/, ""),
    };
  }
}

function createClient() {
  const connectionString = process.env.DATABASE_URL?.trim();
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not configured. Add your TiDB connection string to the deployment environment.",
    );
  }

  const parsed = parseDatabaseUrl(connectionString);
  const adapter = new PrismaMariaDb({
    host: parsed.host,
    port: parsed.port,
    user: parsed.user,
    password: parsed.password,
    database: parsed.database,
    ssl: true,
    connectionLimit: Number(process.env.DATABASE_CONNECTION_LIMIT ?? 5),
    connectTimeout: 15_000,
    acquireTimeout: 25_000,
  });

  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
