import {
  createUser,
  updateOrganization,
  updateUser,
} from "@/app/actions/operations";
import { CrudDialog } from "@/components/crud-dialog";
import { CheckField, Field, SelectField } from "@/components/form-fields";
import { Flash, PageHeader, StatusBadge } from "@/components/page-ui";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { canManageUsers, requireUser } from "@/lib/auth";
import { shortDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";

const roles = ["OWNER", "ADMIN", "OPERATIONS", "FINANCE", "VIEWER"].map(
  (value) => ({
    value,
    label: value.toLowerCase().replace(/^./, (x) => x.toUpperCase()),
  }),
);

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const canManage = canManageUsers.includes(user.role);
  const [organization, users, counters, audit] = await Promise.all([
    prisma.organization.findUniqueOrThrow({
      where: { id: user.organizationId },
    }),
    prisma.user.findMany({
      where: { organizationId: user.organizationId },
      orderBy: { name: "asc" },
    }),
    prisma.documentCounter.findMany({
      where: { organizationId: user.organizationId },
      orderBy: { documentType: "asc" },
    }),
    prisma.auditLog.findMany({
      where: { organizationId: user.organizationId },
      include: { user: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);
  const create = (
    <CrudDialog
      title="Add user"
      description="Create a company user and assign the minimum role they need."
      action={createUser}
      triggerLabel="Add user">
      <UserFields />
    </CrudDialog>
  );
  return (
    <main className="mx-auto w-full max-w-[1480px] p-4 md:p-7">
      <PageHeader
        title="Company settings"
        description="Legal details, users, permissions, numbering and audit history."
        action={canManage ? create : undefined}
      />
      <Flash success={params.success} error={params.error} />
      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card className="border-slate-200 shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Company details</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              action={updateOrganization}
              className="grid gap-4 sm:grid-cols-2">
              <Field
                name="name"
                label="Legal company name"
                defaultValue={organization.name}
                required
              />
              <Field
                name="tradingName"
                label="Trading name"
                defaultValue={organization.tradingName}
              />
              <div className="sm:col-span-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-slate-700">
                      Company logo
                    </span>
                    <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500">
                      base64 storage
                    </span>
                  </div>

                  {organization.logoUrl ? (
                    <div className="mb-3 flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-2.5">
                      <img
                        src={organization.logoUrl}
                        alt="Current company logo"
                        className="h-16 w-16 rounded-lg border border-slate-200 bg-white object-contain"
                      />
                      <div className="text-xs text-slate-600">
                        Current logo on invoice
                      </div>
                    </div>
                  ) : null}

                  <input
                    type="file"
                    name="logoFile"
                    accept="image/*"
                    className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-slate-800"
                  />
                </div>
              </div>
              <Field
                name="logoUrl"
                label="Or paste logo URL"
                defaultValue={organization.logoUrl ?? ""}
              />
              <Field
                name="registrationNumber"
                label="Registration number"
                defaultValue={organization.registrationNumber}
              />
              <Field
                name="vatNumber"
                label="VAT number"
                defaultValue={organization.vatNumber}
              />
              <div className="sm:col-span-2 flex items-center gap-2">
                <CheckField
                  name="vatRegistered"
                  label="VAT registered"
                  defaultChecked={organization.vatRegistered}
                />
              </div>
              <Field
                name="email"
                label="Accounts email"
                type="email"
                defaultValue={organization.email}
              />
              <Field
                name="phone"
                label="Phone"
                defaultValue={organization.phone}
              />
              <Field
                name="defaultPaymentDays"
                label="Default terms (days)"
                type="number"
                min={0}
                defaultValue={organization.defaultPaymentDays}
              />
              <Field
                name="addressLine1"
                label="Address line 1"
                defaultValue={organization.addressLine1}
              />
              <Field
                name="addressLine2"
                label="Address line 2"
                defaultValue={organization.addressLine2}
              />
              <Field
                name="city"
                label="City"
                defaultValue={organization.city}
              />
              <Field
                name="province"
                label="Province"
                defaultValue={organization.province}
              />
              <Field
                name="postalCode"
                label="Postal code"
                defaultValue={organization.postalCode}
              />
              <Field
                name="bankName"
                label="Bank name"
                defaultValue={organization.bankName}
              />
              <Field
                name="bankAccountName"
                label="Bank account holder"
                defaultValue={organization.bankAccountName}
              />
              <Field
                name="bankAccountNumber"
                label="Bank account number"
                defaultValue={organization.bankAccountNumber}
              />
              <Field
                name="bankBranchCode"
                label="Branch code"
                defaultValue={organization.bankBranchCode}
              />
              <Field
                name="bankAccountType"
                label="Account type"
                defaultValue={organization.bankAccountType}
              />
              <Field
                name="paymentInstructions"
                label="Payment instructions"
                defaultValue={organization.paymentInstructions}
              />
              <Field
                name="invoiceFooter"
                label="Invoice footer"
                defaultValue={organization.invoiceFooter}
              />
              <div className="self-end">
                <Button type="submit" disabled={!canManage}>
                  Save company details
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Document numbering</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {counters.map((counter) => (
              <div
                key={counter.id}
                className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                <span className="text-sm capitalize text-slate-600">
                  {counter.documentType.toLowerCase()}
                </span>
                <span className="font-mono text-sm font-semibold">
                  {counter.prefix}
                  {String(counter.nextNumber).padStart(4, "0")}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <Card className="mt-6 border-slate-200 shadow-none">
        <CardHeader>
          <CardTitle className="text-base">Users and roles</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-6 text-right">Edit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="pl-6">
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-xs text-slate-500">{item.email}</p>
                  </TableCell>
                  <TableCell className="capitalize">
                    {item.role.toLowerCase()}
                  </TableCell>
                  <TableCell>{shortDate(item.createdAt)}</TableCell>
                  <TableCell>
                    <StatusBadge
                      status={item.isActive ? "ACTIVE" : "ARCHIVED"}
                    />
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    {canManage && (
                      <CrudDialog
                        mode="edit"
                        title={`Edit ${item.name}`}
                        description="Change access, role or reset this user's password."
                        action={updateUser}>
                        <input type="hidden" name="id" value={item.id} />
                        <UserFields user={item} />
                      </CrudDialog>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Card className="mt-6 border-slate-200 shadow-none">
        <CardHeader>
          <CardTitle className="text-base">Recent audit events</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {audit.length ? (
            audit.map((entry) => (
              <div
                key={entry.id}
                className="flex flex-col justify-between gap-1 rounded-xl border border-slate-200 p-3 text-sm sm:flex-row">
                <span>
                  <strong>{entry.action}</strong> {entry.entityType}{" "}
                  <span className="text-slate-400">
                    {entry.entityId.slice(-8)}
                  </span>
                </span>
                <span className="text-slate-500">
                  {entry.user?.name ?? "System"} · {shortDate(entry.createdAt)}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">
              Audit events will appear as records are created and changed.
            </p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

function UserFields({
  user,
}: {
  user?: { name: string; email: string; role: string; isActive: boolean };
}) {
  return (
    <>
      <Field name="name" label="Full name" defaultValue={user?.name} required />
      <Field
        name="email"
        label="Email"
        type="email"
        defaultValue={user?.email}
        required
      />
      <SelectField
        name="role"
        label="Role"
        defaultValue={user?.role ?? "VIEWER"}
        options={roles}
      />
      <Field
        name="password"
        label={user ? "New password (optional)" : "Temporary password"}
        type="password"
        required={!user}
      />
      {user && (
        <div className="self-end">
          <CheckField
            name="isActive"
            label="Account active"
            defaultChecked={user.isActive}
          />
        </div>
      )}
    </>
  );
}
