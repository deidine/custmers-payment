 import { formatError } from "@/utils/error-handlers"
import camelcaseKeys from "camelcase-keys"
import snakecaseKeys from "snakecase-keys"
import { type NextRequest, NextResponse } from "next/server"
import { createOrUpdateAttendance } from "@/db/queries"

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Convert from camelCase to snake_case for database operations
    const dbData = snakecaseKeys(data)

    const result = await createOrUpdateAttendance(data)

    // Convert back to camelCase for the response
    return NextResponse.json({ result: camelcaseKeys(result, { deep: true }) })
  } catch (error) {
    console.error("Error creating/updating attendance:", error)
    return NextResponse.json(
      { error: "Error creating/updating attendance", details: formatError(error) },
      { status: 500 },
    )
  }
}
