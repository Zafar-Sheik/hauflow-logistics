import { Prisma } from "@/generated/prisma/client";
import { zar } from "@/lib/format";

type DecimalLike = Prisma.Decimal | string | number | null | undefined;

export function decimalFrom(value: DecimalLike): Prisma.Decimal {
  if (value === null || value === undefined || value === "") {
    return new Prisma.Decimal(0);
  }
  return new Prisma.Decimal(value.toString());
}

export function sumDecimals(values: DecimalLike[]): Prisma.Decimal {
  return values.reduce<Prisma.Decimal>(
    (sum, value) => sum.add(decimalFrom(value)),
    new Prisma.Decimal(0),
  );
}

export function decimalToNumber(value: DecimalLike): number {
  return decimalFrom(value).toNumber();
}

export function formatMoney(value: DecimalLike): string {
  return zar.format(decimalToNumber(value));
}

export function formatDate(value: Date | string | null | undefined): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
