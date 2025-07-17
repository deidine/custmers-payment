import pool from "./dbconnect";

 
export type AttendanceCreateDTO = {
  clientId: number;
  attendanceDate: string; // YYYY-MM-DD format
  status: 'PRESENT' | 'ABSENT' | 'CANCELLED' | 'RESCHEDULED' | 'ON_LEAVE';
  notes?: string;
  poids?: any
};

export type AttendanceUpdateDTO = {
  attendanceDate?: string;
  status?: 'PRESENT' | 'ABSENT' | 'CANCELLED' | 'RESCHEDULED' | 'ON_LEAVE';
  notes?: string;
};

// Get all attendance records for a specific client
export async function getClientAttendance(clientId: number) {
  const query = `
    SELECT 
      attendance_id AS "attendanceId",
      customer_id AS "clientId",
      attendance_date AS "date",
      status,
      notes,
      created_at AS "createdAt",
      updated_at AS "updatedAt"
    FROM public.patient_attendance
    WHERE customer_id = $1
    ORDER BY attendance_date DESC;
  `;
  try {
    const result = await pool.query(query, [clientId]);
    return result.rows;
  } catch (err: any) {
    console.error("Database error fetching client attendance:", err);
    throw err;
  }
}

// Get a single attendance record by ID
export async function getAttendanceById(attendanceId: number) {
  const query = `
    SELECT 
      attendance_id AS "attendanceId",
      customer_id AS "clientId",
      attendance_date AS "date",
      status,
      notes,
      created_at AS "createdAt",
      updated_at AS "updatedAt"
    FROM public.patient_attendance
    WHERE attendance_id = $1;
  `;
  try {
    const result = await pool.query(query, [attendanceId]);
    return result.rows[0] || null;
  } catch (err: any) {
    console.error("Database error fetching attendance by ID:", err);
    throw err;
  }
}

// Create a new attendance record
export async function createAttendance(data: AttendanceCreateDTO) {
  const { clientId, attendanceDate, status, notes, poids } = data;
  const query = `
    INSERT INTO public.patient_attendance (customer_id, attendance_date, status, notes,poids_now)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING 
      attendance_id AS "attendanceId",
      customer_id AS "clientId",
      attendance_date AS "date",
      status,
      notes,
      created_at AS "createdAt",
      updated_at AS "updatedAt";
  `;
  try {
    const result = await pool.query(query, [clientId, attendanceDate, status, notes, poids]);
    return result.rows[0];
  } catch (err: any) {
    console.error("Database error creating attendance:", err);
    throw err;
  }
}

// Update an attendance record
export async function updateAttendance(attendanceId: number, data: AttendanceUpdateDTO) {
  const updates: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (data.attendanceDate !== undefined) {
    updates.push(`attendance_date = $${paramIndex}`);
    values.push(data.attendanceDate);
    paramIndex++;
  }
  if (data.status !== undefined) {
    updates.push(`status = $${paramIndex}`);
    values.push(data.status);
    paramIndex++;
  }
  if (data.notes !== undefined) {
    updates.push(`notes = $${paramIndex}`);
    values.push(data.notes);
    paramIndex++;
  }

  updates.push(`updated_at = CURRENT_TIMESTAMP`);

  if (updates.length === 0) {
    throw new Error("No fields to update for attendance record.");
  }

  const query = `
    UPDATE public.patient_attendance
    SET ${updates.join(", ")}
    WHERE attendance_id = $${paramIndex}
    RETURNING 
      attendance_id AS "attendanceId",
      customer_id AS "clientId",
      attendance_date AS "date",
      status,
      notes,
      created_at AS "createdAt",
      updated_at AS "updatedAt";
  `;
  values.push(attendanceId);

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (err: any) {
    console.error("Database error updating attendance:", err);
    throw err;
  }
}

// Delete an attendance record
export async function deleteAttendance(attendanceId: number) {
  const query = `
    DELETE FROM public.patient_attendance
    WHERE attendance_id = $1
    RETURNING 
      attendance_id AS "attendanceId",
      customer_id AS "clientId",
      attendance_date AS "date",
      status,
      notes,
      created_at AS "createdAt",
      updated_at AS "updatedAt";
  `;
  try {
    const result = await pool.query(query, [attendanceId]);
    return result.rows[0];
  } catch (err: any) {
    console.error("Database error deleting attendance:", err);
    throw err;
  }
}