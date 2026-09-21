"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return <main className="grid min-h-[calc(100vh-4rem)] place-items-center p-6"><div className="max-w-lg rounded-2xl border border-rose-200 bg-white p-8 text-center shadow-sm"><h1 className="text-xl font-semibold text-slate-950">We couldn’t complete that action</h1><p className="mt-2 text-sm text-slate-600">{error.message || "The request failed. No partial financial change was saved."}</p><Button onClick={reset} className="mt-5">Try again</Button></div></main>;
}
