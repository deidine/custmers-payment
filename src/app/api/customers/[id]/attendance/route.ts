
import { createAttendance, getClientAttendance } from '@/db/patientAttendance';
import { getCustomerById } from '@/db/queries';
import { NextRequest, NextResponse } from 'next/server';
  
// GET /api/patient-attendance/[clientId] - Get all attendance for a specific client
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number.parseInt(params.id, 10);

    if (Number.isNaN(id)) {
      return NextResponse.json({ error: 'Invalid Client ID' }, { status: 400 });
    }

    // Optional: Check if client exists
    const clientExists = await getCustomerById(id);
    if (!clientExists) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const attendanceRecords = await getClientAttendance(id);
    return NextResponse.json(attendanceRecords, { status: 200 });
  } catch (error) {
    console.error('Error fetching patient attendance:', error);
    return NextResponse.json({ error: 'Failed to fetch patient attendance' }, { status: 500 });
  }
}

// POST /api/patient-attendance/[clientId] - Add a new attendance record for a client
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clientId = Number.parseInt(params.id, 10);

    if (Number.isNaN(clientId)) {
      return NextResponse.json({ error: 'Invalid Client ID' }, { status: 400 });
    }

    // Optional: Check if client exists
    const clientExists = await getCustomerById(clientId);
    if (!clientExists) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const { attendanceDate, status, notes } = await request.json();

    if (!attendanceDate || !status) {
      return NextResponse.json({ error: 'Date and Status are required' }, { status: 400 });
    }

    const newAttendance = await createAttendance({ clientId, attendanceDate, status, notes });
    return NextResponse.json(newAttendance, { status: 201 });
  } catch (error) {
    console.error('Error adding patient attendance:', error);
    return NextResponse.json({ error: 'Failed to add patient attendance' }, { status: 500 });
  }
}