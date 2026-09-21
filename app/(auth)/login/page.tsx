import { redirect } from "next/navigation";
import { login } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await getCurrentUser()) redirect("/dashboard");
  if ((await prisma.user.count()) === 0) redirect("/setup");
  const { error } = await searchParams;
  return <Card className="w-full max-w-md border-slate-200 shadow-xl shadow-slate-200/40"><CardHeader><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#b97808]">Secure access</p><CardTitle className="text-2xl">Sign in to HaulFlow</CardTitle><p className="text-sm text-slate-500">Use the account created by your company administrator.</p></CardHeader><CardContent><form action={login} className="space-y-4">{error && <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error === "credentials" ? "The email or password is incorrect." : "This system is already configured."}</p>}<div className="space-y-2"><Label htmlFor="email">Email address</Label><Input id="email" name="email" type="email" autoComplete="email" required /></div><div className="space-y-2"><Label htmlFor="password">Password</Label><Input id="password" name="password" type="password" autoComplete="current-password" required /></div><Button type="submit" className="w-full">Sign in</Button></form></CardContent></Card>;
}
