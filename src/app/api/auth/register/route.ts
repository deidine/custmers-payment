import { NextRequest, NextResponse } from "next/server";

import { formatError } from "@/utils/error-handlers";
import { generateUUID, hashPassword } from "@/lib/auth";
import { UserCreateDTO } from "@/types/user";
import {
  getUserByUsername,
} from "@/db/queries";
import { createUserAndProfileTransaction } from "@/db/transactions";
import { UserProfileDTO } from "@/types/user-profile";

export async function POST(request: NextRequest) {
  const { username, password, fullName, address, phoneNumber } =
    await request.json();
  // Check required fields
  if (!username || !password || !fullName || !address || !phoneNumber) {
    return NextResponse.json(
      {
        error:
          "Username, password, name, address and phone number are required",
      },
      { status: 400 }
    );
  }

  // Check if user already exists
  const user = await getUserByUsername(username);
  if (user) {
    return NextResponse.json(
      { error: "Username already exists" },
      { status: 400 }
    );
  }


  const hashedPassword = await hashPassword(password);
  const uuid = generateUUID();
  try {
    // Create new user
    const userDto: UserCreateDTO = {
      uuid,
      username,
      password: hashedPassword,
    };
    const userProfileDto: Partial<UserProfileDTO> = {
      fullName,
      address,
      phoneNumber,
    };
    const userCreateResponse = await createUserAndProfileTransaction(
      userDto,
      userProfileDto
    );

    if (userCreateResponse ) {
      return NextResponse.json(
        { message: "Registration successful" },
        { status: 200 }
      );
    } else {
      throw new Error("Failed to register");
    }
  } catch (error) {
    console.error("Failed to register:", error);
    return NextResponse.json(
      { error: "Failed to register", details: formatError(error) },
      { status: 500 }
    );
  }
}
