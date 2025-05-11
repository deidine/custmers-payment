export enum PaymentMethod {
  CASH = "CASH",
  CREDIT_CARD = "CREDIT_CARD",
  DEBIT_CARD = "DEBIT_CARD",
  BANK_TRANSFER = "BANK_TRANSFER",
  ONLINE = "ONLINE",
}

export enum PaymentType {
  MEMBERSHIP = "MEMBERSHIP",
  PERSONAL_TRAINING = "PERSONAL_TRAINING",
  SUPPLEMENTS = "SUPPLEMENTS",
  OTHER = "OTHER",
}

export enum PaymentStatus {
  COMPLETED = "COMPLETED",
  PENDING = "PENDING",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
}

export type Payment = {
  paymentId: number
  customerId: number
  amount: number
  paymentDate: Date
  paymentMethod: PaymentMethod
  paymentType: PaymentType
  invoiceNumber?: string
  receiptNumber?: string
  transactionReference?: string
  status: PaymentStatus
  notes?: string
  createdBy?: number
  createdAt: Date
  updatedAt: Date
}

export type PaymentCreateDTO = Omit<Payment, "paymentId" | "createdAt" | "updatedAt">

export type PaymentUpdateDTO = Partial<Omit<Payment, "paymentId" | "createdAt" | "updatedAt">>

export type PaymentWithCustomer = Payment & {
  customerName: string
}
