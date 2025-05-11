import { NextRequest, NextResponse } from "next/server";
import camelcaseKeys from "camelcase-keys";
import { PaymentDTO } from "@/types/payment";
import { createPayment, getPaymentByOrderUuid } from "@/db/queries";

export async function POST(request: NextRequest) {
  try {
    const data = (await request.json()) as PaymentDTO;
    const response = await createPayment(data);
    if (response) {
      return NextResponse.json(
        { message: "Payment created successfully" },
        { status: 201 }
      );
    } else {
      return NextResponse.json(
        { error: "Payment not created due to conflict or constraint" },
        { status: 409 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Error creating payment", details: error },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const orderUuid = searchParams.get("orderUuid") as string;
    const response = await getPaymentByOrderUuid(orderUuid);
    return NextResponse.json(camelcaseKeys(response, { deep: true }), {
      status: 200,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Error fetching payments", details: error },
      { status: 500 }
    );
  }
}
