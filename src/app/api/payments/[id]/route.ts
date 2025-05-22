import { NextRequest, NextResponse } from "next/server";
import camelcaseKeys from "camelcase-keys";

 import { formatError } from "@/utils/error-handlers";
import { deletePayment,  updatePayment } from "@/db/queries";
import { PaymentUpdateDTO } from "@/types/payment";

 

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (Number(params.id) <= 0 || isNaN(Number(params.id))) {
      return NextResponse.json(
        { error: "Invalid customer ID" },
        { status: 400 }
      );
    }
    const data = (await request.json()) as PaymentUpdateDTO ;
    console.log(data)
    const response = await updatePayment(Number(params.id), data);
    if (response) {
      return NextResponse.json(
        { message: "Customer updated successfully" },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Error updating customer", details: formatError(error) },
      { status: 500 }
    );
  }
}

// DELETE not available - require admin provision to delete customer

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (Number(params.id) <= 0 || isNaN(Number(params.id))) {
      return NextResponse.json({ error: "Invalid custmer ID" }, { status: 400 })
    }
    console.log("custmer ID:", params.id)

    const response = await deletePayment(Number(params.id))
    if (response) {
      return NextResponse.json({ message: "custmer deleted successfully" }, { status: 200 })
    } else {
      return NextResponse.json({ error: "custmer not found" }, { status: 404 })
    }
  } catch (error) {
    return NextResponse.json({ error: "Error deleting client", details: formatError(error) }, { status: 500 })
  }
}