// app/api/patient-attendance/[attendanceId]/route.ts
 import { deleteAttendance, updateAttendance } from '@/db/patientAttendance';
import { NextRequest, NextResponse } from 'next/server';
 
// DELETE /api/patient-attendance/[attendanceId] - Delete an attendance record
export async function DELETE(
  request: NextRequest,
  { params }: { params: { attendanceId: string } }
) {
  try {
    const attendanceId = Number.parseInt(params.attendanceId, 10);

    if (Number.isNaN(attendanceId)) {
      return NextResponse.json({ error: 'Invalid Attendance ID' }, { status: 400 });
    }

    const deletedRecord = await deleteAttendance(attendanceId);

    if (!deletedRecord) {
      return NextResponse.json({ error: 'Attendance record not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Attendance record deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting patient attendance:', error);
    return NextResponse.json({ error: 'Failed to delete patient attendance' }, { status: 500 });
  }
}

// PUT /api/patient-attendance/[attendanceId] - Update an attendance record
export async function PUT(
  request: NextRequest,
  { params }: { params: { attendanceId: string } }
) {
  try {
    const attendanceId = Number.parseInt(params.attendanceId, 10);

    if (Number.isNaN(attendanceId)) {
      return NextResponse.json({ error: 'Invalid Attendance ID' }, { status: 400 });
    }

    const data = await request.json(); // Data can contain attendanceDate, status, notes

    const updatedRecord = await updateAttendance(attendanceId, data);

    if (!updatedRecord) {
      return NextResponse.json({ error: 'Attendance record not found' }, { status: 404 });
    }

    return NextResponse.json(updatedRecord, { status: 200 });
  } catch (error) {
    console.error('Error updating patient attendance:', error);
    return NextResponse.json({ error: 'Failed to update patient attendance' }, { status: 500 });
  }
}