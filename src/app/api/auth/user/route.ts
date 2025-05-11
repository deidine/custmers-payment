import { NextRequest, NextResponse } from "next/server";
import { getSessionToken, decrypt } from "@/lib/auth";
import { TokenPayload } from "@/types/token-payload";

export async function GET(request: NextRequest) {
  const token = getSessionToken();

  if (!token) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  try {
    const payload = (await decrypt(token)) as TokenPayload;
    return NextResponse.json({ user: payload }, { status: 200 });
  } catch (error) {
    console.error("Failed to decrypt token:", error);
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
