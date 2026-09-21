import { AlertTriangle, ArrowDownRight, ArrowUpRight, Banknote } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState, PageHeader, StatusBadge } from "@/components/page-ui";
import { requireUser } from "@/lib/auth";
import { shortDate, zar } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const user = await requireUser();
  const [jobs, invoices, settlements] = await Promise.all([
    prisma.job.findMany({ where: { organizationId: user.organizationId }, include: { customer: true, carrier: true }, orderBy: { createdAt: "desc" } }),
    prisma.invoice.findMany({ where: { organizationId: user.organizationId, status: { not: "VOID" } }, include: { allocations: { include: { payment: true } } } }),
    prisma.carrierSettlement.findMany({ where: { organizationId: user.organizationId, status: { not: "VOID" } } }),
  ]);
  const receivables = invoices.reduce((sum, invoice) => sum + Number(invoice.total) - invoice.allocations.filter((a) => a.payment.status === "ACTIVE").reduce((paid, a) => paid + Number(a.amount), 0), 0);
  const payables = settlements.filter((s) => s.status !== "PAID").reduce((sum, s) => sum + Number(s.amount), 0);
  const revenue = invoices.reduce((sum, invoice) => sum + Number(invoice.total), 0);
  const jobCosts = jobs.reduce((sum, job) => sum + Number(job.carrierAmount), 0);
  const overdue = invoices.filter((i) => i.dueDate < new Date() && !["PAID", "VOID"].includes(i.status)).length;
  const recentJobs = jobs.slice(0, 8);
  return <main className="mx-auto w-full max-w-[1480px] p-4 md:p-7"><PageHeader title="Operations overview" description="Live jobs, customer receivables, carrier payables and margin from TiDB." /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Kpi label="Customer receivables" value={zar.format(receivables)} note={`${invoices.filter((i) => i.status !== "PAID").length} open invoices`} icon={<ArrowDownRight />} tone="teal" /><Kpi label="Carrier payables" value={zar.format(payables)} note={`${settlements.filter((s) => s.status === "READY_TO_PAY").length} ready to pay`} icon={<ArrowUpRight />} tone="amber" /><Kpi label="Gross margin" value={zar.format(revenue - jobCosts)} note="Invoiced revenue less all job costs" icon={<Banknote />} tone="navy" /><Kpi label="Overdue invoices" value={String(overdue)} note="Invoices past their due date" icon={<AlertTriangle />} tone="rose" /></div><Card className="mt-6 border-slate-200 shadow-none"><CardHeader><CardTitle className="text-base">Recent jobs</CardTitle></CardHeader><CardContent className={recentJobs.length ? "px-0" : ""}>{recentJobs.length ? <Table><TableHeader><TableRow><TableHead className="pl-6">Job</TableHead><TableHead>Customer</TableHead><TableHead>Route</TableHead><TableHead>Carrier</TableHead><TableHead>Load date</TableHead><TableHead>Status</TableHead><TableHead className="pr-6 text-right">Margin</TableHead></TableRow></TableHeader><TableBody>{recentJobs.map((job) => <TableRow key={job.id}><TableCell className="pl-6 font-semibold">{job.jobNumber}</TableCell><TableCell>{job.customer.name}</TableCell><TableCell>{job.origin} → {job.destination}</TableCell><TableCell>{job.carrier?.name ?? "Unassigned"}</TableCell><TableCell>{shortDate(job.loadDate)}</TableCell><TableCell><StatusBadge status={job.status} /></TableCell><TableCell className="pr-6 text-right font-semibold text-emerald-700">{zar.format(Number(job.customerAmount) - Number(job.carrierAmount))}</TableCell></TableRow>)}</TableBody></Table> : <EmptyState title="Your workspace is ready" description="Start by adding a customer and carrier, then create your first subcontracted job. No sample records have been added." />}</CardContent></Card></main>;
}

function Kpi({ label, value, note, icon, tone }: { label: string; value: string; note: string; icon: React.ReactNode; tone: "teal" | "amber" | "navy" | "rose" }) { const classes = { teal: "bg-emerald-50 text-emerald-700", amber: "bg-amber-50 text-amber-700", navy: "bg-[#132238] text-white", rose: "bg-rose-50 text-rose-700" }; return <Card className="border-slate-200 shadow-none"><CardContent className="flex items-start justify-between p-5"><div><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{value}</p><p className="mt-1 text-xs text-slate-500">{note}</p></div><span className={`grid size-10 place-items-center rounded-xl ${classes[tone]}`}>{icon}</span></CardContent></Card>; }
