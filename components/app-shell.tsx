"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, CircleDollarSign, FileText, LayoutDashboard, LogOut, Receipt, Settings, Truck, WalletCards, Waypoints } from "lucide-react";
import { logout } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

const items = [
  ["/dashboard", "Overview", LayoutDashboard], ["/jobs", "Jobs", Waypoints],
  ["/customers", "Customers", Building2], ["/carriers", "Carriers", Truck],
  ["/invoices", "Invoices", FileText], ["/payments", "Receipts", CircleDollarSign],
  ["/settlements", "Carrier payments", WalletCards], ["/reports", "Reports", Receipt],
  ["/settings", "Settings", Settings],
] as const;

export function AppShell({ children, user }: { children: React.ReactNode; user: { name: string; role: string; organization: { name: string } } }) {
  const pathname = usePathname();
  return <SidebarProvider>
    <Sidebar collapsible="offcanvas" className="border-r-0">
      <SidebarHeader className="border-b border-white/10 bg-[#0c1a2b] p-5 text-white"><Link href="/dashboard" className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-[#efb343] text-[#0c1a2b]"><Truck className="size-5" /></span><span className="min-w-0"><span className="block text-base font-semibold">HaulFlow</span><span className="block truncate text-xs text-slate-400">{user.organization.name}</span></span></Link></SidebarHeader>
      <SidebarContent className="bg-[#0c1a2b] px-3 py-5 text-slate-300"><SidebarGroup><SidebarGroupContent><SidebarMenu className="gap-1">{items.map(([href, label, Icon]) => <SidebarMenuItem key={href}><SidebarMenuButton asChild isActive={pathname === href || pathname.startsWith(`${href}/`)} className="h-10 text-slate-300 hover:bg-white/10 hover:text-white data-[active=true]:bg-white/12 data-[active=true]:text-white"><Link href={href}><Icon /><span>{label}</span></Link></SidebarMenuButton></SidebarMenuItem>)}</SidebarMenu></SidebarGroupContent></SidebarGroup></SidebarContent>
      <SidebarFooter className="border-t border-white/10 bg-[#0c1a2b] p-3 text-white"><div className="flex items-center gap-3 rounded-xl p-2"><span className="grid size-9 place-items-center rounded-full bg-[#1d334d] text-sm font-semibold">{user.name.slice(0, 2).toUpperCase()}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{user.name}</span><span className="block text-xs capitalize text-slate-400">{user.role.toLowerCase()}</span></span><form action={logout}><Button type="submit" variant="ghost" size="icon-sm" className="text-slate-400 hover:bg-white/10 hover:text-white" aria-label="Sign out"><LogOut /></Button></form></div></SidebarFooter>
    </Sidebar>
    <SidebarInset className="min-w-0 bg-[#f4f7fa]"><header className="sticky top-0 z-30 flex h-16 items-center border-b border-slate-200 bg-white/95 px-4 backdrop-blur md:px-7"><SidebarTrigger /><div className="mx-4 h-7 w-px bg-slate-200" /><span className="text-sm font-medium text-slate-600">Operations & finance</span></header>{children}</SidebarInset>
  </SidebarProvider>;
}
