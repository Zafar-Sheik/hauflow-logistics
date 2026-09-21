import { redirect } from "next/navigation";
import { setupSystem } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SetupPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if ((await prisma.user.count()) > 0) redirect("/login");
  const { error } = await searchParams;
  return <Card className="w-full max-w-xl border-slate-200 shadow-xl shadow-slate-200/40"><CardHeader><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#b97808]">First-run setup</p><CardTitle className="text-2xl">Create your company workspace</CardTitle><p className="text-sm text-slate-500">This creates the organisation and its first owner account. No sample records will be added.</p></CardHeader><CardContent><form action={setupSystem} className="grid gap-4 sm:grid-cols-2">{error && <p className="sm:col-span-2 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">Complete every field. The password must contain at least 10 characters.</p>}<div className="space-y-2 sm:col-span-2"><Label htmlFor="companyName">Legal company name</Label><Input id="companyName" name="companyName" required /></div><div className="space-y-2"><Label htmlFor="name">Owner name</Label><Input id="name" name="name" autoComplete="name" required /></div><div className="space-y-2"><Label htmlFor="email">Owner email</Label><Input id="email" name="email" type="email" autoComplete="email" required /></div><div className="space-y-2 sm:col-span-2"><Label htmlFor="password">Owner password</Label><Input id="password" name="password" type="password" minLength={10} autoComplete="new-password" required /><p className="text-xs text-slate-500">Use at least 10 characters.</p></div><Button type="submit" className="sm:col-span-2">Create workspace</Button></form></CardContent></Card>;
}
