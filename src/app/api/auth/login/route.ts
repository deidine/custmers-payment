import { NextRequest, NextResponse } from "next/server";

import { createSession, getUserByUsername } from "@/db/queries";
import {
  comparePasswords,
  encrypt,
  generateUUID,
  setSessionToken,
} from "@/lib/auth";
import { formatError } from "@/utils/error-handlers";
import { TokenPayload } from "@/types/token-payload";
import { UserView } from "@/types/user";

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();
  try {
    const user = await getUserByUsername(username);
    if (!user) {
      return NextResponse.json(
        { error: "Username not found" },
        { status: 404 }
      );
    }

    const isValidPassword = await comparePasswords(password, user.password);
    if (!user || !isValidPassword) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }
    const payload: TokenPayload = {
      uuid: user.uuid,
      username: user.username,
      role: user.role,
    };
    const token = await encrypt(payload);
    const sessionUuid = generateUUID();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour
    // Save session token in database
    await createSession({
      uuid: sessionUuid,
      userUuid: user.uuid,
      token: token,
      expiresAt: expiresAt,
    });

    setSessionToken(token);

    return NextResponse.json({ message: "Login successful" }, { status: 200 });
  } catch (error) {
    console.error("Failed to login:", error);
    return NextResponse.json(
      { error: "Failed to login", details: formatError(error) },
      { status: 500 }
    );
  }
}
