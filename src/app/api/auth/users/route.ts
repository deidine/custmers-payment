import { getAllCustomers, getAllUsers } from "@/db/queries";
import { formatError } from "@/utils/error-handlers";
import camelcaseKeys from "camelcase-keys";
import { NextRequest, NextResponse } from "next/server";

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

    const { data, totalItems } = await getAllUsers(
      Number(page),
      Number(limit)
    );
    const result: any[] =
      (camelcaseKeys(data, { deep: true }) as any[]) || [];
    return NextResponse.json({ result, totalItems });
  } catch (error) {
    return NextResponse.json(
      { error: "Error fetching customers", details: formatError(error) },
      { status: 500 }
    );
  }
}
