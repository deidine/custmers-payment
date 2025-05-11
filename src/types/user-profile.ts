import { Role } from "./user";

type UserProfile = {
  profileId: number;
  userUuid: string;
  fullName: string;
  birthDate: Date;
  address: string;
  phoneNumber: string;
  profilePictureUrl: string;
  createdAt: Date;
  updatedAt: Date;
};

export type UserProfileView = UserProfile & {
  username: string;
  role: Role;
};

export type UserProfileDTO = Omit<
  UserProfile,
  "profileId" | "createdAt" | "updatedAt"
>;
