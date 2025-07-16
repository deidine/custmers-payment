 import { getUserAttendance, getUserById } from "@/db/queries"
import { formatError } from "@/utils/error-handlers"
import camelcaseKeys from "camelcase-keys"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
    }

    // Verify user exists
    const user = await getUserById(id)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get URL parameters
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get("startDate") || undefined
    const endDate = searchParams.get("endDate") || undefined

    // Get attendance records
    const attendanceRecords = await getUserAttendance(id, startDate, endDate)

    return NextResponse.json({
      result: camelcaseKeys(attendanceRecords, { deep: true }),
    })
  } catch (error) {
    console.error("Error fetching user attendance:", error)
    return NextResponse.json({ error: "Error fetching user attendance", details: formatError(error) }, { status: 500 })
  }
}
