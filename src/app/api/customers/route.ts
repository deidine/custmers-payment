import { NextRequest, NextResponse } from "next/server";
import camelcaseKeys from "camelcase-keys";

import { createCustomer, getAllCustomers, getCustomerByPhoneNumber } from "@/db/queries";
import { Customer, CustomerDTO } from "@/types/customer";
import { formatError } from "@/utils/error-handlers";

export async function POST(request: NextRequest) {
  try {
    const data = (await request.json()) as CustomerDTO;
      // Check if phone number already exists
      const customer = await getCustomerByPhoneNumber(data.phoneNumber);
      if (customer) {
        return NextResponse.json(
          { error: "Phone number already exists" },
          { status: 400 }
        );
      }
    
    const response = await createCustomer(data);
    if (response) {
      return NextResponse.json(
        { message: "Customer created successfully" },
        { status: 201 }
      );
    } else {
      return NextResponse.json(
        { error: "Customer not created due to conflict or constraint" },
        { status: 409 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Error creating customer", details: formatError(error) },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "10";
    if (
      isNaN(Number(page)) ||
      Number(page) < 0 ||
      isNaN(Number(limit)) ||
      Number(limit) < 0
    ) {
      return NextResponse.json(
        { error: "Invalid parameters" },
        { status: 400 }
      );
    }

    const { data, totalItems } = await getAllCustomers(
      Number(page),
      Number(limit)
    );
    const result: Customer[] =
      (camelcaseKeys(data, { deep: true }) as Customer[]) || [];
    return NextResponse.json({ result, totalItems });
  } catch (error) {
    return NextResponse.json(
      { error: "Error fetching customers", details: formatError(error) },
      { status: 500 }
    );
  }
}
