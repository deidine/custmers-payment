 import { deleteAttendance, updateAttendance } from "@/db/queries"
import { formatError } from "@/utils/error-handlers"
import camelcaseKeys from "camelcase-keys"
import { type NextRequest, NextResponse } from "next/server"
import snakecaseKeys from "snakecase-keys"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
    }

    const result = await deleteAttendance(id)

    if (!result) {
      return NextResponse.json({ error: "Attendance record not found" }, { status: 404 })
    }

    return NextResponse.json({ result: camelcaseKeys(result, { deep: true }) })
  } catch (error) {
    console.error("Error deleting attendance:", error)
    return NextResponse.json({ error: "Error deleting attendance", details: formatError(error) }, { status: 500 })
  }
}


export async function PUT(request: NextRequest,{ params }: { params: { id: string } }) {
  try {
    const data = await request.json()

    // Convert from camelCase to snake_case for database operations
    const dbData = snakecaseKeys(data)
    const id = Number.parseInt(params.id)

    const result = await updateAttendance(id,data)

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
