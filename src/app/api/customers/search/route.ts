import { NextRequest, NextResponse } from "next/server";
import camelcaseKeys from "camelcase-keys";

import { formatError } from "@/utils/error-handlers";
import { getCustomerByEmailAndPhoneNumber } from "@/db/queries";
import { Customer } from "@/types/customer";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const email = searchParams.get("email") as string;
  const phoneNumber = searchParams.get("phoneNumber") as string;
  if (!email && !phoneNumber) {
    return NextResponse.json(
      { error: "Email or Phone number is required" },
      { status: 400 }
    );
  }

  try {
    const response = await getCustomerByEmailAndPhoneNumber(email, phoneNumber);

    const result: Customer = camelcaseKeys(response, {
      deep: true,
    }) as Customer;
    return NextResponse.json({ ...result }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Error fetching customer", details: formatError(error) },
      { status: 500 }
    );
  }
}
