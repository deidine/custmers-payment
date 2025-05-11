import { NextRequest, NextResponse } from "next/server";
import camelcaseKeys from "camelcase-keys";

import { formatError } from "@/utils/error-handlers";
import { getSessionByToken } from "@/db/queries";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get("token") as string;
    if (!token) {
      return NextResponse.json(
        { error: "Required parameter 'token' not found" },
        { status: 400 }
      );
    }

    const session = await getSessionByToken(token);
    return NextResponse.json(
      { ...camelcaseKeys(session, { deep: true }) },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Error getting sessions", details: formatError(error) },
      { status: 500 }
    );
  }
}
