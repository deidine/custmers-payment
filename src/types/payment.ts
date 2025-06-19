export enum PaymentMethod {
  CASH = "CASH",
  CREDIT_CARD = "BANKILY",
  DEBIT_CARD = "SADAD",
  BANK_TRANSFER = "MASRIVY",
  ONLINE = "ONLINE",
}

 

export enum PaymentStatus {
  COMPLETED = "COMPLETED",
  PENDING = "PENDING",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
}

export type Payment = {
  paymentId: number
  payment_date: Date
  customerId: number
  amount: number
  paymentDate: Date
  paymentMethod: PaymentMethod
  invoiceNumber?: string
  receiptNumber?: string
  transactionReference?: string
  status: PaymentStatus
  notes?: string
  createdBy?: number
  createdAt: Date
  customer_id: number
  updatedAt: Date
}

export type PaymentCreateDTO = Omit<Payment, "paymentId" | "createdAt" | "updatedAt">

export type PaymentUpdateDTO = Partial<Omit<Payment, "paymentId" | "createdAt" | "updatedAt">>

export type PaymentWithCustomer = Payment & {
  customerName: string
}
