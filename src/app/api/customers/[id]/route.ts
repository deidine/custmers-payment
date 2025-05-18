import { NextRequest, NextResponse } from "next/server";
import camelcaseKeys from "camelcase-keys";

import { deleteCustomer, getCustomerById, updateCustomerById } from "@/db/queries";
import { Customer, CustomerUpdateDTO } from "@/types/customer";
import { formatError } from "@/utils/error-handlers";

export async function GET(
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
    const response = await getCustomerById(Number(params.id));
    return NextResponse.json(
      { ...(camelcaseKeys(response, { deep: true }) as Customer) },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Error fetching customer", details: formatError(error) },
      { status: 500 }
    );
  }
}

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
    const data = (await request.json()) as CustomerUpdateDTO;
    const response = await updateCustomerById(Number(params.id), data);
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

    const response = await deleteCustomer(Number(params.id))
    if (response) {
      return NextResponse.json({ message: "custmer deleted successfully" }, { status: 200 })
    } else {
      return NextResponse.json({ error: "custmer not found" }, { status: 404 })
    }
  } catch (error) {
    return NextResponse.json({ error: "Error deleting client", details: formatError(error) }, { status: 500 })
  }
}