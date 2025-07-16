// Types existants (gardés pour la compatibilité)
export type UserCreateDTO = {}
export type UserUpdateDTO = {}
export type StaffAttendanceCreateDTO = {}
export type CustomerAttendanceCreateDTO = {}
export type SessionCreateDTO = {}
export type SessionUpdateDTO = {}
export type UserProfileDTO = {}

export type PaymentCreateDTO = {
  customerId: number
  amount: number
  paymentDate: string
  status: "PAID" | "PENDING" | "CANCELLED"
  description?: string
}

export type PaymentUpdateDTO = Partial<PaymentCreateDTO>

export type CustomerCreateDTO = {
  firstName: string
  lastName: string
  email?: string
  phoneNumber: string
  dateOfJoining?: string
}

export type CustomerUpdateDTO = Partial<CustomerCreateDTO>

// Define the structure of a payment row from the DB
export type PaymentRow = {
  payment_id: number
  customer_id: number
  amount: number
  payment_date: string
  status: "PAID" | "PENDING" | "CANCELLED"
  description: string
  created_at: string
  updated_at: string
  customer_name?: string // Added from join
}

// Define the structure of a customer row from the DB
export type CustomerRow = {
  customer_id: number
  first_name: string
  last_name: string
  email: string
  phone_number: string
  date_of_joining: string
  created_at: string
  updated_at: string
}

// NOUVEAU TYPE : Souscription
export type SubscriptionRow = {
  subscription_id: number
  customer_id: number
  plan_name: string
  price_to_pay: number
  frequency: "monthly" | "quarterly" | "annually"
  membership_start_date: string
  end_date: string | null // null pour les souscriptions en cours
  status: "active" | "expired" | "cancelled"
  next_payment_date: string | null
  created_at: string
  updated_at: string
}
