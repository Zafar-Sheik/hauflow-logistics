import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HaulFlow | Logistics Operations",
  description: "Manage subcontracted loads, customer invoices, receipts, and carrier settlements in one place.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
