import { NextRequest, NextResponse } from "next/server";
import camelcaseKeys from "camelcase-keys";

import { formatError } from "@/utils/error-handlers";
import { getCustomerByEmailAndPhoneNumber } from "@/db/queries";
import { Customer } from "@/types/customer";
import { decrypt, getSessionToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const token = getSessionToken();
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let payload;
    try {
      payload = await decrypt(token);
    } catch (error) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const response = await getCustomerByEmailAndPhoneNumber(
      String(payload.username),
      ""
    );
    return NextResponse.json(
      { ...camelcaseKeys(response, { deep: true }) },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Error fetching customer", details: formatError(error) },
      { status: 500 }
    );
  }
}
