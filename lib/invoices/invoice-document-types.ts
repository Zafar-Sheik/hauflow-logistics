export type InvoiceDocumentLine = {
  id: string;
  description: string;
  quantity: string;
  unitPrice: string;
  taxRate: string;
  lineTotal: string;
  jobId?: string | null;
  jobNumber?: string | null;
  jobDescription?: string | null;
};

export type InvoiceDocumentSnapshot = {
  organization: {
    name: string;
    tradingName?: string | null;
    logoUrl?: string | null;
    registrationNumber?: string | null;
    vatNumber?: string | null;
    vatRegistered?: boolean | null;
    email?: string | null;
    phone?: string | null;
    addressLine1?: string | null;
    addressLine2?: string | null;
    city?: string | null;
    province?: string | null;
    postalCode?: string | null;
    bankName?: string | null;
    bankAccountName?: string | null;
    bankAccountNumber?: string | null;
    bankBranchCode?: string | null;
    bankAccountType?: string | null;
    paymentInstructions?: string | null;
    invoiceFooter?: string | null;
    defaultPaymentDays?: number | null;
  };
  customer: {
    name: string;
    code: string;
    billingEmail: string;
    phone?: string | null;
    registrationNo?: string | null;
    vatNumber?: string | null;
    address?: string | null;
    paymentTerms: number;
  };
  invoice: {
    invoiceNumber: string;
    issueDate: Date | string;
    dueDate: Date | string;
    subtotal: string;
    taxAmount: string;
    total: string;
    notes?: string | null;
    status: string;
    sentAt?: Date | string | null;
    customerReference?: string | null;
  };
  lines: InvoiceDocumentLine[];
};

export type InvoiceDocumentData = {
  organization: InvoiceDocumentSnapshot["organization"];
  customer: InvoiceDocumentSnapshot["customer"];
  invoice: InvoiceDocumentSnapshot["invoice"] & {
    id: string;
    status: string;
    customerReference?: string | null;
    createdAt: Date | string;
    updatedAt: Date | string;
    paymentTerms: number;
  };
  lines: InvoiceDocumentLine[];
  relatedJobs: Array<{
    id: string;
    jobNumber: string;
    origin: string;
    destination: string;
    loadDate: Date | string;
    deliveryDate?: Date | string | null;
    description: string;
    vehicleReg?: string | null;
    driverName?: string | null;
    customerReference?: string | null;
  }>;
  paymentAllocations: Array<{
    id: string;
    paymentId: string;
    paymentNumber: string;
    paymentDate: Date | string;
    amount: string;
    reference: string;
    method: string;
  }>;
  paymentRecords: Array<{
    id: string;
    paymentNumber: string;
    paymentDate: Date | string;
    amount: string;
    reference: string;
    method: string;
    status: string;
  }>;
  totals: {
    subtotal: string;
    taxAmount: string;
    total: string;
    paid: string;
    outstanding: string;
  };
  snapshotUsed: boolean;
  invoiceTitle: "INVOICE" | "TAX INVOICE";
  isDraft: boolean;
  isVoid: boolean;
  isPaid: boolean;
  isPartPaid: boolean;
};
