"use client";

import { useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function CrudDialog({ title, description, action, children, mode = "create", triggerLabel }: { title: string; description: string; action: (data: FormData) => void | Promise<void>; children: React.ReactNode; mode?: "create" | "edit"; triggerLabel?: string }) {
  const [open, setOpen] = useState(false);
  return <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild>{mode === "create" ? <Button><Plus />{triggerLabel ?? "Add record"}</Button> : <Button variant="ghost" size="icon-sm" aria-label={`Edit ${title}`}><Pencil /></Button>}</DialogTrigger><DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"><DialogHeader><DialogTitle>{title}</DialogTitle><DialogDescription>{description}</DialogDescription></DialogHeader><form action={action} className="grid gap-4 sm:grid-cols-2">{children}<DialogFooter className="sm:col-span-2"><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit">Save</Button></DialogFooter></form></DialogContent></Dialog>;
}
