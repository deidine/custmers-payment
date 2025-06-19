import { NextRequest, NextResponse } from "next/server";
import camelcaseKeys from "camelcase-keys";
import { PaymentCreateDTO } from "@/types/payment";
import { createOrUpdatePayment, getAllPayments, getPaymentById } from "@/db/queries";

export async function POST(request: NextRequest) {
  try {
    const data = (await request.json()) as PaymentCreateDTO;
    console.log("Payment created", data);
    const response = await createOrUpdatePayment(data);
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
    console.error("Error creating payment:", error);
    return NextResponse.json(
      { error: "Error creating payment", details: error },
      { status: 500 }
    );
  }
} 
// You'll need to update this function to accept filter parameters
// import { getAllPayments } from "your-service-file";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Extract all filter parameters
    const filters = {
      // Pagination
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "10"),
      
      // Status filter
      status: searchParams.get("status") || undefined,
      
      // Date filters
      dateFrom: searchParams.get("dateFrom") || undefined,
      dateTo: searchParams.get("dateTo") || undefined,
      
      // Amount filters
      amountMin: searchParams.get("amountMin") ? parseFloat(searchParams.get("amountMin")!) : undefined,
      amountMax: searchParams.get("amountMax") ? parseFloat(searchParams.get("amountMax")!) : undefined,
      
      // Customer filter
      customerId: searchParams.get("customerId") ? parseInt(searchParams.get("customerId")!) : undefined,
      
      // Unpaid in month filter
      unpaidInMonth: searchParams.get("unpaidInMonth") || undefined,
      
      // Legacy parameter (if still needed)
      orderUuid: searchParams.get("orderUuid") || undefined,
    };

    // Remove undefined values to keep the filter object clean
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== undefined)
    );

    console.log("Applied filters:", cleanFilters);

    // Call your service function with filters
    const response = await getAllPayments( filters.page, filters.limit, cleanFilters);
    
    console.log("Payments response:", response);
    
    return NextResponse.json(camelcaseKeys(response, { deep: true }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { error: "Error fetching payments", details: error },
      { status: 500 }
    );
  }
}