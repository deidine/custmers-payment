import { NextRequest, NextResponse } from "next/server";

import { getSessionToken, removeSessionToken } from "@/lib/auth";
import { formatError } from "@/utils/error-handlers";
import { updateSessionByToken } from "@/db/queries";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  const token = getSessionToken();
  if (!token) {
    return NextResponse.json(
      { error: "No session token found" },
      { status: 401 }
    );
  }

  try {
    await updateSessionByToken(token, {
      expiresAt: new Date(),
    });
    removeSessionToken();
    return NextResponse.json({ message: "Logout successful" }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Error logging out", details: formatError(error) },
      { status: 500 }
    );
  }
}
