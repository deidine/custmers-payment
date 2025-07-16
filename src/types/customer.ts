export enum CustomerStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
}

export enum MembershipType {
  BASIC = "BASIC",
  STANDARD = "STANDARD",
  PREMIUM = "PREMIUM",
  VIP = "VIP",
}

export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
}

export type Customer = {
  customerId: number
  uuid?: string 
  profilePictureUrl?: any

  firstName: string
  lastName: string
  gender?: Gender
  dateOfBirth?: Date
  phoneNumber?: string
  email?: string
  emergencyContact?: string
  emergencyPhone?: string
  streetAddress?: string
  city?: string
  state?: string
  stateCode?: string
  membershipType: MembershipType
  membershipStartDate?: Date
  membershipEndDate?: Date
  status: CustomerStatus
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export type CustomerCreateDTO = Omit<Customer, "customerId" | "createdAt" | "updatedAt">

export type CustomerUpdateDTO = Partial<Omit<Customer, "customerId" | "createdAt" | "updatedAt">>

export type CustomerAttendance = {
  attendanceId: number
  customerId: number
  checkInTime?: Date
  checkOutTime?: Date
  date: Date
  createdAt: Date
  updatedAt: Date
}
export enum AttendanceStatus {
  PRESENT = "PRESENT",
  ABSENT = "ABSENT",
  ON_LEAVE = "ON_LEAVE",
  CANCELLED = "CANCELLED",
  RESCHEDULED = "RESCHEDULED",
}
export type CustomerAttendanceCreateDTO = Omit<CustomerAttendance, "attendanceId" | "createdAt" | "updatedAt">
