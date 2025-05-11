import { NextRequest, NextResponse } from "next/server";
import camelcaseKeys from "camelcase-keys";

import { formatError } from "@/utils/error-handlers";
import {
  getUserProfileViewByUserUuid,
  updateUserProfileByUserUuid,
} from "@/db/queries";
import { UserProfileDTO, UserProfileView } from "@/types/user-profile";
import { decrypt, getSessionToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  // Check session token
  const token = getSessionToken();
  if (!token) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const userUUid = searchParams.get("userUuid") as string;
  if (!userUUid) {
    return NextResponse.json(
      { error: "Required parameter 'userUuid' not found" },
      { status: 400 }
    );
  }

  try {
    const payload = await decrypt(token);
    if (payload.uuid !== userUUid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Error decrypting token", details: formatError(error) },
      { status: 500 }
    );
  }

  try {
    const response = await getUserProfileViewByUserUuid(userUUid);
    return NextResponse.json(
      { ...(camelcaseKeys(response, { deep: true }) as UserProfileView) },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Error getting user profile", details: formatError(error) },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  // Check session token
  const token = getSessionToken();
  if (!token) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const userUUid = searchParams.get("userUuid") as string;
  if (!userUUid) {
    return NextResponse.json(
      { error: "Required parameter 'userUuid' not found" },
      { status: 400 }
    );
  }

  try {
    const payload = await decrypt(token);
    if (payload.uuid !== userUUid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Error decrypting token", details: formatError(error) },
      { status: 500 }
    );
  }

  try {
    const data = await request.json();
    const userProfileDto: Partial<UserProfileDTO> = {};

    if (data.fullName) userProfileDto.fullName = data.fullName;
    if (data.birthDate) userProfileDto.birthDate = data.birthDate;
    if (data.address) userProfileDto.address = data.address;
    if (data.phoneNumber) userProfileDto.phoneNumber = data.phoneNumber;
    if (data.profilePictureUrl)
      userProfileDto.profilePictureUrl = data.profilePictureUrl;

    const response = await updateUserProfileByUserUuid(
      userUUid,
      userProfileDto
    );
    if (response) {
      return NextResponse.json(
        { message: "User profile updated successfully" },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Error updating user profile", details: formatError(error) },
      { status: 500 }
    );
  }
}
