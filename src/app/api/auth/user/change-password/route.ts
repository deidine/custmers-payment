import { NextRequest, NextResponse } from "next/server";
import {
  comparePasswords,
  decrypt,
  getSessionToken,
  hashPassword,
  removeSessionToken,
} from "@/lib/auth";
import { TokenPayload } from "@/types/token-payload";
import {
  getUserByUserUuid,
  updateSessionByToken,
  updateUserByUserUuid,
} from "@/db/queries";

export async function POST(request: NextRequest) {
  const token = getSessionToken();
  if (!token) {
    return NextResponse.json(
      { error: "No session token found" },
      { status: 401 }
    );
  }

  const { oldPassword, newPassword } = await request.json();
  if (!oldPassword || !newPassword) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    const payload = (await decrypt(token)) as TokenPayload;
    const user = await getUserByUserUuid(payload.uuid);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check old password match
    if (!(await comparePasswords(oldPassword, user.password))) {
      return NextResponse.json(
        { error: "Old password incorrect" },
        { status: 400 }
      );
    }

    if (oldPassword === newPassword) {
      return NextResponse.json(
        { error: "New password must be different from the old password" },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(newPassword);
    await updateUserByUserUuid(payload.uuid, { password: hashedPassword });

    // Invalidate the session token - force user to re-login
    await updateSessionByToken(token, {
      expiresAt: new Date(),
    });
    removeSessionToken();
    return NextResponse.json(
      { message: "Password changed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
