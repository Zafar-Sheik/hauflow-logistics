export const zar = new Intl.NumberFormat("en-ZA", {
  style: "currency",
  currency: "ZAR",
  maximumFractionDigits: 2,
});

export const shortDate = (value: Date | string) =>
  new Intl.DateTimeFormat("en-ZA", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));

export const statusLabel = (value: string) =>
  value.toLowerCase().replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase());
