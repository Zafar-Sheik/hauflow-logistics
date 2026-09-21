import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function Field({ name, label, defaultValue, type = "text", required = false, min, step, placeholder }: { name: string; label: string; defaultValue?: string | number | null; type?: string; required?: boolean; min?: string | number; step?: string | number; placeholder?: string }) { return <div className="space-y-2"><Label htmlFor={name}>{label}</Label><Input id={name} name={name} type={type} defaultValue={defaultValue ?? ""} required={required} min={min} step={step} placeholder={placeholder} /></div>; }

export function SelectField({ name, label, defaultValue, options, required = true }: { name: string; label: string; defaultValue?: string | null; options: { value: string; label: string }[]; required?: boolean }) { return <div className="space-y-2"><Label htmlFor={name}>{label}</Label><select id={name} name={name} defaultValue={defaultValue ?? ""} required={required} className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus:border-ring focus:ring-3 focus:ring-ring/50"><option value="" disabled>Select…</option>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div>; }

export function TextAreaField({ name, label, defaultValue, required = false, className = "" }: { name: string; label: string; defaultValue?: string | null; required?: boolean; className?: string }) { return <div className={`space-y-2 ${className}`}><Label htmlFor={name}>{label}</Label><Textarea id={name} name={name} defaultValue={defaultValue ?? ""} required={required} /></div>; }

export function CheckField({ name, label, defaultChecked = false }: { name: string; label: string; defaultChecked?: boolean }) { return <label className="flex items-center gap-2 rounded-lg border border-slate-200 p-3 text-sm"><input type="checkbox" name={name} defaultChecked={defaultChecked} className="size-4 accent-[#132238]" />{label}</label>; }
