export type Role = "ADMIN" | "MANAGER" | "TRAINER" | "STAFF"

export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  ON_LEAVE = "ON_LEAVE",
}

export enum AttendanceStatus {
  PRESENT = "PRESENT",
  ABSENT = "ABSENT",
  ON_LEAVE = "ON_LEAVE",
}

export type User = {
  userId: number
  uuid?: string
  username: string
  password: string
  role?: Role
  isEnabled: boolean
  gender?: Gender
  dateOfJoining?: Date
  city?: string
  state?: string
  stateCode?: string
  streetAddress?: string
  phoneNumber?: string
  email?: string
  status?: UserStatus
  createdAt: Date
  updatedAt: Date
}

export type UserView = Omit<User, "userId">

export type UserCreateDTO = {
  uuid?: string
  username: string
  password: string
  role?: Role
  gender?: Gender
  dateOfJoining?: Date | string
  city?: string
  state?: string
  stateCode?: string
  streetAddress?: string
  phoneNumber?: string
  email?: string
  status?: UserStatus
}

export type UserUpdateDTO = {
  username?: string
  password?: string
  role?: Role
  isEnabled?: boolean
  gender?: Gender
  dateOfJoining?: Date | string
  city?: string
  state?: string
  stateCode?: string
  streetAddress?: string
  phoneNumber?: string
  email?: string
  status?: UserStatus
}

// Type guard
export function isUser(data: any): data is User {
  return (
    data !== null &&
    typeof data === "object" &&
    "userId" in data &&
    "username" in data &&
    "password" in data &&
    "createdAt" in data &&
    "updatedAt" in data
  )
}

// HR related types
export type StaffAttendance = {
  attendanceId: number
  userId: number
  date: Date
  status: AttendanceStatus
  checkInTime?: Date
  checkOutTime?: Date
  createdAt: Date
  updatedAt: Date
}

export type StaffAttendanceCreateDTO = Omit<StaffAttendance, "attendanceId" | "createdAt" | "updatedAt">
