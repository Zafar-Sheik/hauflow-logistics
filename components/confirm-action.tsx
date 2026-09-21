"use client";

import { Archive, Ban, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";

export function ConfirmAction({ action, id, title, description, label = "Archive", restore = false, reason = false }: { action: (data: FormData) => void | Promise<void>; id: string; title: string; description: string; label?: string; restore?: boolean; reason?: boolean }) {
  const Icon = restore ? RotateCcw : label.toLowerCase().includes("void") || label.toLowerCase().includes("cancel") ? Ban : Archive;
  if (restore) return <form action={action}><input type="hidden" name="id" value={id} /><input type="hidden" name="active" value="true" /><Button type="submit" variant="ghost" size="icon-sm" aria-label={label}><Icon /></Button></form>;
  return <AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" size="icon-sm" className="text-rose-600 hover:bg-rose-50 hover:text-rose-700" aria-label={label}><Icon /></Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{title}</AlertDialogTitle><AlertDialogDescription>{description}</AlertDialogDescription></AlertDialogHeader><form action={action}><input type="hidden" name="id" value={id} />{label === "Archive" && <input type="hidden" name="active" value="false" />}{reason && <Input name="reason" placeholder="Reason (required)" required className="mb-4" />}<AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction type="submit" className="bg-rose-600 hover:bg-rose-700">{label}</AlertDialogAction></AlertDialogFooter></form></AlertDialogContent></AlertDialog>;
}
