 
import type { UserCreateDTO, UserUpdateDTO, StaffAttendanceCreateDTO } from "@/types/user"
import type { CustomerCreateDTO, CustomerUpdateDTO, CustomerAttendanceCreateDTO } from "@/types/customer"
import type { PaymentCreateDTO, PaymentUpdateDTO } from "@/types/payment"
import pool from "./dbconnect"
import { SessionCreateDTO, SessionUpdateDTO } from "@/types/session"
import { buildInsertQuery, buildUpdateQuery } from "./helpers"
import { UserProfileDTO } from "@/types/user-profile"
// USER PROFILE QUERIES
export async function getUserProfileViewByUserUuid(userUuid: string) {
  const query = `SELECT * FROM "public"."vw_user_profiles_view" WHERE "user_uuid" = $1`;
  try {
    const result = await pool.query(query, [userUuid]);
    return result.rows[0];
  } catch (err: any) {
    console.error("Database error:", err);
    throw err;
  }
}

export async function getCustomerByPhoneNumber(phoneNumber: string) {
  const query = `SELECT * FROM "public"."customers" WHERE "phone_number" = $1`;
  try {
    const result = await pool.query(query, [phoneNumber]);
    return result.rows[0];
  } catch (err: any) {
    console.error("Database error:", err);
    throw err;
  }
}

export async function getCustomerByEmailAndPhoneNumber(
  email: string,
  phoneNumber: string
) {
  const query = `SELECT * FROM "public"."customers" 
    WHERE ($1::VARCHAR IS NULL OR $1::VARCHAR = '' OR "email" = $1) 
    AND ($2::VARCHAR IS NULL OR $2::VARCHAR = '' OR "phone_number" = $2)`;
  try {
    const result = await pool.query(query, [email, phoneNumber]);
    return result.rows[0];
  } catch (err: any) {
    console.error("Database error:", err);
    throw err;
  }
}

export async function updateUserProfileByUserUuid(
  userUuid: string,
  userProfileDto: Partial<UserProfileDTO>
): Promise<boolean | null> {
  const query = buildUpdateQuery("user_profiles", userProfileDto, {
    findBy: "user_uuid",
  });
  try {
    const result = await pool.query(query, [
      ...Object.values(userProfileDto),
      userUuid,
    ]);
    return result.rowCount > 0;
  } catch (err: any) {
    console.error("Database error:", err);
    throw err;
  }
}
export async function getUserByUserUuid(uuid: string) {
  const query = `SELECT * FROM "public"."vw_users_with_uuid" WHERE "uuid" = $1`;
  try {
    const result = await pool.query(query, [uuid]);
    return result.rows[0];
  } catch (err: any) {
    console.error("Database error:", err);
    throw err;
  }
}
export async function updateUserByUserUuid(
  uuid: string,
  userDto: Partial<UserUpdateDTO>
): Promise<boolean | null> {
  const query = buildUpdateQuery("users", userDto);
  try {
    const result = await pool.query(query, [...Object.values(userDto), uuid]);
    return result.rowCount > 0;
  } catch (err: any) {
    console.error("Database error:", err);
    throw err;
  }
}

// User (Staff) Functions
export async function getAllUsers(page = 1, limit = 10) {
  const offset = (page - 1) * limit
  const queryData = `
    SELECT 
      u.user_id,  
      u.username,  
      u.role, 
      u.is_enabled
    FROM "public"."users" u 
    ORDER BY u.updated_at DESC 
    LIMIT $1 OFFSET $2
  `
  const queryCount = `SELECT COUNT(*) AS "totalItems" FROM "public"."users"`

  try {
    // Parallel queries
    const [resultData, resultCount] = await Promise.all([
      pool.query(queryData, [limit, offset]),
      pool.query(queryCount),
    ])
    const data = resultData.rows
    const totalItems = Number.parseInt(resultCount.rows[0].totalItems, 10)
    return { data, totalItems }
  } catch (err: any) {
    console.error("Database error:", err)
    throw err
  }
}

export async function updateCustomerById(
  id: number,
  customerDto: Partial<CustomerUpdateDTO>
): Promise<boolean | null> {
  const query = buildUpdateQuery("customers", customerDto, {
    findBy: "customer_id",
  });
  try {
    const result = await pool.query(query, [...Object.values(customerDto), id]);
    return result.rowCount > 0;
  } catch (err: any) {
    console.error("Database error:", err);
    throw err;
  }
}

export async function getUserByUsername(username: string) {
  const query = `SELECT * FROM "public"."vw_users_with_uuid" WHERE "username" = $1`;
  try {
    const result = await pool.query(query, [username]);
    return result.rows[0];
  } catch (err: any) {
    console.error("Database error:", err);
    throw err;
  }
}


export async function getSessionByToken(token: string) {
  const query = `SELECT * FROM "public"."sessions" WHERE "token" = $1 AND "expires_at" > NOW()`;
  try {
    const result = await pool.query(query, [token]);
    return result.rows[0];
  } catch (err: any) {
    console.error("Database error:", err);
    throw err;
  }
}

// SESSIONS QUERIES
export async function createSession(
  sessionDto: SessionCreateDTO
): Promise<boolean | null> {
  const query = buildInsertQuery("sessions", sessionDto);
  try {
    const result = await pool.query(query, [...Object.values(sessionDto)]);
    return result.rowCount > 0;
  } catch (err: any) {
    console.error("Database error:", err);
    throw err;
  }
}

 

export async function updateSessionByToken(
  token: string,
  sessionDto: Partial<SessionUpdateDTO>
): Promise<boolean | null> {
  const query = buildUpdateQuery("sessions", sessionDto, {
    findBy: "token",
  });
  try {
    const result = await pool.query(query, [
      ...Object.values(sessionDto),
      token,
    ]);
    return result.rowCount > 0;
  } catch (err: any) {
    console.error("Database error:", err);
    throw err;
  }
}

export async function getUserById(userId: number) {
  const query = `
    SELECT 
      *
    FROM "public"."users" u 
    WHERE u.user_id = $1
  `

  try {
    const result = await pool.query(query, [userId])
    return result.rows[0] || null
  } catch (err: any) {
    console.error("Database error:", err)
    throw err
  }
}

export async function createUser(data: UserCreateDTO) {
  const {
    username,
    password,
    role = "STAFF",
    gender,
    dateOfJoining,
    city,
    state,
    stateCode,
    streetAddress,
    phoneNumber,
    email,
    status = "ACTIVE",
  } = data

  const query = `
    INSERT INTO "public"."users" (
      username, 
      password, 
      role, 
      gender, 
      date_of_joining, 
      city, 
      state, 
      state_code, 
      street_address,
      phone_number,
      email,
      status
    ) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
    RETURNING *
  `

  try {
    const result = await pool.query(query, [
      username,
      password,
      role,
      gender,
      dateOfJoining,
      city,
      state,
      stateCode,
      streetAddress,
      phoneNumber,
      email,
      status,
    ])
    return result.rows[0]
  } catch (err: any) {
    console.error("Database error:", err)
    throw err
  }
}

export async function updateUser(userId: number, data: UserUpdateDTO) {
  // Create sets for SQL update
  const updates: string[] = []
  const values: any[] = []
  let paramIndex = 1

  // Dynamically build the SET clause and values array
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      // Convert camelCase to snake_case
      const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
      updates.push(`${snakeKey} = $${paramIndex}`)
      values.push(value)
      paramIndex++
    }
  })

  // Add updated_at timestamp
  updates.push(`updated_at = CURRENT_TIMESTAMP`)

  // If no fields to update, return early
  if (updates.length === 0) {
    throw new Error("No fields to update")
  }

  // Build the query
  const query = `
    UPDATE "public"."users"
    SET ${updates.join(", ")}
    WHERE user_id = $${paramIndex}
    RETURNING *
  `

  // Add userId to values array
  values.push(userId)

  try {
    const result = await pool.query(query, values)
    return result.rows[0]
  } catch (err: any) {
    console.error("Database error:", err)
    throw err
  }
}

export async function deleteUser(userId: number) {
  const query = `DELETE FROM "public"."users" WHERE user_id = $1 RETURNING *`

  try {
    const result = await pool.query(query, [userId])
    return result.rows[0]
  } catch (err: any) {
    console.error("Database error:", err)
    throw err
  }
}

// Customer Functions
export async function getAllCustomers(page = 1, limit = 10) {
  const offset = (page - 1) * limit
  const queryData = `
    SELECT *
    FROM "public"."customers" 
    ORDER BY updated_at DESC 
    LIMIT $1 OFFSET $2
  `
  const queryCount = `SELECT COUNT(*) AS "totalItems" FROM "public"."customers"`

  try {
    // Parallel queries
    const [resultData, resultCount] = await Promise.all([
      pool.query(queryData, [limit, offset]),
      pool.query(queryCount),
    ])
    const data = resultData.rows
    const totalItems = Number.parseInt(resultCount.rows[0].totalItems, 10)
    return { data, totalItems }
  } catch (err: any) {
    console.error("Database error:", err)
    throw err
  }
}

export async function getCustomerById(customerId: number) {
  const query = `
    SELECT * 
    FROM "public"."customers" 
    WHERE customer_id = $1
  `

  try {
    const result = await pool.query(query, [customerId])
    return result.rows[0] || null
  } catch (err: any) {
    console.error("Database error:", err)
    throw err
  }
}

export async function createCustomer(data: CustomerCreateDTO) {
  // Extract fields from data
  const columns: string[] = []
  const placeholders: string[] = []
  const values: any[] = []
  let paramIndex = 1

  // Dynamically build the query
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      // Convert camelCase to snake_case
      const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
      if (snakeKey === 'profile_picture_file') return
      if (snakeKey === 'profile_picture_preview') return
      columns.push(snakeKey)
      placeholders.push(`$${paramIndex}`)
      values.push(value)
      paramIndex++
    }
  })
console.log(placeholders,columns)
  // Build the query
  const query = `
    INSERT INTO "public"."customers" (${columns.join(", ")}) 
    VALUES (${placeholders.join(", ")}) 
    RETURNING *
  `
console.log(query,values)
  try {
    const result = await pool.query(query, values)
    return result.rows[0]
  } catch (err: any) {
    console.error("Database error:", err)
    throw err
  }
}

export async function updateCustomer(customerId: number, data: CustomerUpdateDTO) {
  // Create sets for SQL update
  const updates: string[] = []
  const values: any[] = []
  let paramIndex = 1

  // Dynamically build the SET clause and values array
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      // Convert camelCase to snake_case
      const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
      updates.push(`${snakeKey} = $${paramIndex}`)
      values.push(value)
      paramIndex++
    }
  })

  // Add updated_at timestamp
  updates.push(`updated_at = CURRENT_TIMESTAMP`)

  // If no fields to update, return early
  if (updates.length === 0) {
    throw new Error("No fields to update")
  }

  // Build the query
  const query = `
    UPDATE "public"."customers"
    SET ${updates.join(", ")}
    WHERE customer_id = $${paramIndex}
    RETURNING *
  `

  // Add customerId to values array
  values.push(customerId)

  try {
    const result = await pool.query(query, values)
    return result.rows[0]
  } catch (err: any) {
    console.error("Database error:", err)
    throw err
  }
}

export async function deleteCustomer(customerId: number) {
  const query = `DELETE FROM "public"."customers" WHERE customer_id = $1 RETURNING *`

  try {
    const result = await pool.query(query, [customerId])
    return result.rows[0]
  } catch (err: any) {
    console.error("Database error:", err)
    throw err
  }
}

// Payment Functions

type Filters = {
  status?: string
  dateFrom?: string
  dateTo?: string
  customerId?: string
  unpaidInMonth?: string
}

export async function getAllPayments(
  page = 1,
  limit = 10,
  filters: Filters = {}
) {
  const offset = (page - 1) * limit

  const whereClauses: string[] = []
  const values: any[] = []
  let idx = 1

  // Add filters conditionally
  if (filters.status) {
    whereClauses.push(`p.status = $${idx++}`)
    values.push(filters.status)
  }

  if (filters.dateFrom) {
    whereClauses.push(`p.payment_date >= $${idx++}`)
    values.push(filters.dateFrom)
  }

  if (filters.dateTo) {
    whereClauses.push(`p.payment_date <= $${idx++}`)
    values.push(filters.dateTo)
  }

  if (filters.customerId) {
    whereClauses.push(`p.customer_id = $${idx++}`)
    values.push(filters.customerId)
  }

  if (filters.unpaidInMonth) {
    whereClauses.push(`p.status = 'PENDING'`)
    whereClauses.push(`TO_CHAR(p.payment_date, 'YYYY-MM') = $${idx++}`)
    values.push(filters.unpaidInMonth)
  }

  const where = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : ""

  const queryData = `
    SELECT 
      p.*,
      c.first_name || ' ' || c.last_name AS customer_name
    FROM "public"."payments" p
    LEFT JOIN "public"."customers" c ON p.customer_id = c.customer_id
    ${where}
    ORDER BY p.payment_date DESC
    LIMIT $${idx++} OFFSET $${idx}
  `

  const queryCount = `
    SELECT COUNT(*) AS "totalItems"
    FROM "public"."payments" p
    ${where}
  `

  try {
    const [resultData, resultCount] = await Promise.all([
      pool.query(queryData, [...values, limit, offset]),
      pool.query(queryCount, values),
    ])

    const data = resultData.rows
    const totalItems = Number.parseInt(resultCount.rows[0].totalItems, 10)

    return { data, totalItems }
  } catch (err: any) {
    console.error("Database error:", err)
    throw err
  }
}

export async function getPaymentById(paymentId: number) {
  const query = `
    SELECT 
      p.*,
      c.first_name || ' ' || c.last_name AS customer_name
    FROM "public"."payments" p
    LEFT JOIN "public"."customers" c ON p.customer_id = c.customer_id
    WHERE p.payment_id = $1
  `

  try {
    const result = await pool.query(query, [paymentId])
    return result.rows[0] || null
  } catch (err: any) {
    console.error("Database error:", err)
    throw err
  }
}

export async function getPaymentsByCustomerId(customerId: number) {
  const query = `
    SELECT * 
    FROM "public"."payments" 
    WHERE customer_id = $1
    ORDER BY payment_date DESC
  `

  try {
    const result = await pool.query(query, [customerId])
    return result.rows
  } catch (err: any) {
    console.error("Database error:", err)
    throw err
  }
}

export async function createPayment(data: PaymentCreateDTO) {
  // Extract fields from data
  const columns: string[] = []
  const placeholders: string[] = []
  const values: any[] = []
  let paramIndex = 1

  // Dynamically build the query
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      // Convert camelCase to snake_case
      const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
      columns.push(snakeKey)
      placeholders.push(`$${paramIndex}`)
      values.push(value)
      paramIndex++
    }
  })

  // Build the query
  const query = `
    INSERT INTO "public"."payments" (${columns.join(", ")}) 
    VALUES (${placeholders.join(", ")}) 
    RETURNING *
  `
console.log(placeholders.join(", "),columns.join(", "))
  try {
    const result = await pool.query(query, values)
    return result.rows[0]
  } catch (err: any) {
    console.error("Database error:", err)
    throw err
  }
}
 export async function createOrUpdatePayment(data: PaymentCreateDTO) {
  // 1  Work out the current month window
  const paymentDate = data.paymentDate ? new Date(data.paymentDate) : new Date();

  const monthStart = new Date(paymentDate.getFullYear(), paymentDate.getMonth(), 1);
  const monthEnd   = new Date(paymentDate.getFullYear(), paymentDate.getMonth() + 1, 0,
                               23, 59, 59, 999);

  // 2  Grab an existing row (if any) *and* include payment_date
  const findSql = `
    SELECT payment_id, amount, payment_date
    FROM   payments
    WHERE  customer_id = $1
      AND  payment_date >= $2
      AND  payment_date <= $3
    LIMIT  1
  `;
  const { rows } = await pool.query(findSql, [data.customerId, monthStart, monthEnd]);

  // 3  Update that row (incrementing amount) …
  if (rows.length) {
    const dbDate = new Date(rows[0].payment_date);
    if (dbDate >= monthStart && dbDate <= monthEnd) {
      const updateSql = `
        UPDATE payments
        SET    amount     = COALESCE(amount, 0) + $1,
               updated_at = CURRENT_TIMESTAMP
        WHERE  payment_id = $2
        RETURNING *
      `;
      const { rows: updated } = await pool.query(updateSql, [data.amount, rows[0].payment_id]);
      return updated[0];
    }
  }

  // 4  …or insert a fresh payment row
  return createPayment(data);
}

// export async function createOrUpdatePayment(data: PaymentCreateDTO) {
//   const paymentDate = data.payment_date ? new Date(data.payment_date) : new Date()
//   const monthStart = new Date(paymentDate.getFullYear(), paymentDate.getMonth(), 1)
//   const monthEnd = new Date(paymentDate.getFullYear(), paymentDate.getMonth() + 1, 0)
//   // Check if a payment exists for the same customer and same month
//   const checkQuery = `
//     SELECT payment_id, amount FROM payments 
//     WHERE customer_id = $1 
//     AND EXTRACT(YEAR FROM payment_date) = $2
//     AND EXTRACT(MONTH FROM payment_date) = $3
//     LIMIT 1
//   `
//   const checkResult = await pool.query(checkQuery, [data.customerId, paymentDate.getFullYear(), paymentDate.getMonth() + 1])

//   if (checkResult.rows[0].payment_date >= monthStart && checkResult.rows[0].payment_date <= monthEnd) {
//     // Update existing payment by incrementing the amount
//     const existingId = checkResult.rows[0].payment_id
//     const updateQuery = `
//       UPDATE payments 
//       SET amount = COALESCE(amount, 0) + $1, updated_at = CURRENT_TIMESTAMP 
//       WHERE payment_id = $2
//       RETURNING *
//     `
//     const updateResult = await pool.query(updateQuery, [data.amount, existingId])
//     return updateResult.rows[0]
//   } else {
//     // Insert new payment
//     return await createPayment(data)
//   }
// }

export async function updatePayment(paymentId: number, data: PaymentUpdateDTO) {
  // Create sets for SQL update
  const updates: string[] = []
  const values: any[] = []
  let paramIndex = 1 
  // Dynamically build the SET clause and values array
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined ) {
      // Convert camelCase to snake_case
      const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
          if (snakeKey === 'customer_name') return

      updates.push(`${snakeKey} = $${paramIndex}`)
      values.push(value)
      paramIndex++
    }
  })

  // Add updated_at timestamp
  updates.push(`updated_at = CURRENT_TIMESTAMP`)

  // If no fields to update, return early
  if (updates.length === 0) {
    throw new Error("No fields to update")
  } 
  // Build the query
  const query = `
    UPDATE "public"."payments"
    SET ${updates.join(", ")}
    WHERE payment_id = $${paramIndex}
    RETURNING *
  `

  // Add paymentId to values array
  values.push(paymentId)
  try {
    const result = await pool.query(query, values)
    return result.rows[0]
  } catch (err: any) {
    console.error("Database error:", err)
    throw err
  }
}

export async function deletePayment(paymentId: number) {
  const query = `DELETE FROM "public"."payments" WHERE payment_id = $1 RETURNING *`

  try {
    const result = await pool.query(query, [paymentId])
    return result.rows[0]
  } catch (err: any) {
    console.error("Database error:", err)
    throw err
  }
}

// Attendance Functions
export async function getCustomerAttendance(customerId: number, startDate?: string, endDate?: string) {
  let query = `
    SELECT * FROM "public"."customer_attendance"
    WHERE customer_id = $1
  `

  const params: any[] = [customerId]
  let paramIndex = 2

  if (startDate) {
    query += ` AND date >= $${paramIndex}`
    params.push(startDate)
    paramIndex++
  }

  if (endDate) {
    query += ` AND date <= $${paramIndex}`
    params.push(endDate)
  }

  query += ` ORDER BY date DESC`

  try {
    const result = await pool.query(query, params)
    return result.rows
  } catch (err: any) {
    console.error("Database error:", err)
    throw err
  }
}

export async function createOrUpdateCustomerAttendance(data: CustomerAttendanceCreateDTO) {
  const { customerId, date, checkInTime, checkOutTime } = data

  const query = `
    INSERT INTO "public"."customer_attendance" (
      customer_id, 
      date, 
      check_in_time, 
      check_out_time
    ) 
    VALUES ($1, $2, $3, $4) 
    ON CONFLICT (customer_id, date) 
    DO UPDATE SET 
      check_in_time = EXCLUDED.check_in_time,
      check_out_time = EXCLUDED.check_out_time,
      updated_at = CURRENT_TIMESTAMP
    RETURNING *
  `

  try {
    const result = await pool.query(query, [customerId, date, checkInTime, checkOutTime])
    return result.rows[0]
  } catch (err: any) {
    console.error("Database error:", err)
    throw err
  }
}

export async function deleteCustomerAttendance(attendanceId: number) {
  const query = `DELETE FROM "public"."customer_attendance" WHERE attendance_id = $1 RETURNING *`

  try {
    const result = await pool.query(query, [attendanceId])
    return result.rows[0]
  } catch (err: any) {
    console.error("Database error:", err)
    throw err
  }
}

export async function getStaffAttendance(userId: number, startDate?: string, endDate?: string) {
  let query = `
    SELECT * FROM "public"."staff_attendance"
    WHERE user_id = $1
  `

  const params: any[] = [userId]
  let paramIndex = 2

  if (startDate) {
    query += ` AND date >= $${paramIndex}`
    params.push(startDate)
    paramIndex++
  }

  if (endDate) {
    query += ` AND date <= $${paramIndex}`
    params.push(endDate)
  }

  query += ` ORDER BY date DESC`

  try {
    const result = await pool.query(query, params)
    return result.rows
  } catch (err: any) {
    console.error("Database error:", err)
    throw err
  }
}

export async function createOrUpdateStaffAttendance(data: StaffAttendanceCreateDTO) {
  const { userId, date, status, checkInTime, checkOutTime } = data

  const query = `
    INSERT INTO "public"."staff_attendance" (
      user_id, 
      date, 
      status, 
      check_in_time, 
      check_out_time
    ) 
    VALUES ($1, $2, $3, $4, $5) 
    ON CONFLICT (user_id, date) 
    DO UPDATE SET 
      status = EXCLUDED.status,
      check_in_time = EXCLUDED.check_in_time,
      check_out_time = EXCLUDED.check_out_time,
      updated_at = CURRENT_TIMESTAMP
    RETURNING *
  `

  try {
    const result = await pool.query(query, [userId, date, status, checkInTime, checkOutTime])
    return result.rows[0]
  } catch (err: any) {
    console.error("Database error:", err)
    throw err
  }
}

export async function deleteStaffAttendance(attendanceId: number) {
  const query = `DELETE FROM "public"."staff_attendance" WHERE attendance_id = $1 RETURNING *`

  try {
    const result = await pool.query(query, [attendanceId])
    return result.rows[0]
  } catch (err: any) {
    console.error("Database error:", err)
    throw err
  }
}


// New HR-related functions
export async function getUserAttendanceSummaries(userId: number, year?: number) {
  let query = `
    SELECT * FROM "public"."attendance_summary"
    WHERE user_id = $1
  `

  const params = [userId]

  if (year) {
    query += ` AND year = $2`
    params.push(year)
  }

  query += ` ORDER BY year DESC, month DESC`

  try {
    const result = await pool.query(query, params)
    return result.rows
  } catch (err: any) {
    console.error("Database error:", err)
    throw err
  }
}

export async function createAttendanceSummary(data: any) {
  const { userId, year, month, presentDays, absentDays, leaveDays } = data

  const query = `
    INSERT INTO "public"."attendance_summary" (
      user_id, 
      year, 
      month, 
      present_days, 
      absent_days, 
      leave_days
    ) 
    VALUES ($1, $2, $3, $4, $5, $6) 
    ON CONFLICT (user_id, year, month) 
    DO UPDATE SET 
      present_days = EXCLUDED.present_days,
      absent_days = EXCLUDED.absent_days,
      leave_days = EXCLUDED.leave_days,
      updated_at = CURRENT_TIMESTAMP
    RETURNING *
  `

  try {
    const result = await pool.query(query, [userId, year, month, presentDays, absentDays, leaveDays])
    return result.rows[0]
  } catch (err: any) {
    console.error("Database error:", err)
    throw err
  }
}

export async function getUserAttendance(userId: number, startDate?: string, endDate?: string) {
  let query = `
    SELECT * FROM "public"."attendance"
    WHERE user_id = $1
  `

  const params: any[] = [userId]
  let paramIndex = 2

  if (startDate) {
    query += ` AND date >= $${paramIndex}`
    params.push(startDate)
    paramIndex++
  }

  if (endDate) {
    query += ` AND date <= $${paramIndex}`
    params.push(endDate)
  }

  query += ` ORDER BY date DESC`

  try {
    const result = await pool.query(query, params)
    return result.rows
  } catch (err: any) {
    console.error("Database error:", err)
    throw err
  }
}

export async function createOrUpdateAttendance(data: any) {
  const { userId, date, status, checkInTime, checkOutTime } = data

  const query = `
    INSERT INTO "public"."attendance" (
      user_id, 
      date, 
      status, 
      check_in_time, 
      check_out_time
    ) 
    VALUES ($1, $2, $3, $4, $5) 
    ON CONFLICT (user_id, date) 
    DO UPDATE SET 
      status = EXCLUDED.status,
      check_in_time = EXCLUDED.check_in_time,
      check_out_time = EXCLUDED.check_out_time,
      updated_at = CURRENT_TIMESTAMP
    RETURNING *
  `

  try {
    const result = await pool.query(query, [userId, date, status, checkInTime, checkOutTime])
    return result.rows[0]
  } catch (err: any) {
    console.error("Database error:", err)
    throw err
  }
}



export async function deleteAttendance(attendanceId: number) {
  const query = `DELETE FROM "public"."attendance" WHERE attendance_id = $1 RETURNING *`

  try {
    const result = await pool.query(query, [attendanceId])
    return result.rows[0]
  } catch (err: any) {
    console.error("Database error:", err)
    throw err
  }
}


export async function getUserPersonnelDetailByUserId(userId: number) {
  const query = `
    SELECT
      user_id,
      personnel_date_of_joining,
      personnel_address,
      cv_url,
      contract_url,
      salary,
      work_days,
      on_call_shifts_per_month,
      substitutes,
      loans,
      incentives,
      debts,
      records,
      blacklist_reason
    FROM "public"."user_personnel_details"
    WHERE user_id = $1
  `; 
    const result = await pool.query(query, [userId]);
    return result.rows[0] || null;
  
}
 
export async function createOrUpdateUserPersonnelDetail(
  userId: number,
  data: any  
) {
  // Check if a record exists to decide between INSERT or UPDATE
  const existingPersonnel = await pool.query('SELECT user_id FROM public.user_personnel_details WHERE user_id = $1', [userId]);

  if (existingPersonnel.rows.length > 0) {
    // UPDATE operation
    const query = `
      UPDATE public.user_personnel_details
      SET
        personnel_date_of_joining = $1,
        personnel_address = $2,
        cv_url = $3,
        contract_url = $4,
        salary = $5,
        on_call_shifts_per_month = $6,
        blacklist_reason = $7,
        work_days = $8,
        substitutes = $9,
        loans = $10,
        incentives = $11,
        debts = $12,
        records = $13
      WHERE user_id = $14
      RETURNING *;
    `;
    const values = [
      data.personnel_date_of_joining,
      data.personnel_address,
      data.cv_url,
      data.contract_url,
      data.salary,
      data.on_call_shifts_per_month,
      data.blacklist_reason,
      JSON.stringify(data.workDays), // Store JSONB as string
      JSON.stringify(data.substitutes),
      JSON.stringify(data.loans),
      JSON.stringify(data.incentives),
      JSON.stringify(data.debts),
      JSON.stringify(data.records),
      userId,
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  } else {
    // INSERT operation
    const query = `
      INSERT INTO public.user_personnel_details (
        user_id,
        personnel_date_of_joining,
        personnel_address,
        cv_url,
        contract_url,
        salary,
        on_call_shifts_per_month,
        blacklist_reason,
        work_days,
        substitutes,
        loans,
        incentives,
        debts,
        records
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *;
    `;
    const values = [
      userId,
      data.personnel_date_of_joining,
      data.personnel_address,
      data.cv_url,
      data.contract_url,
      data.salary,
      data.on_call_shifts_per_month,
      data.blacklist_reason,
      JSON.stringify(data.workDays),
      JSON.stringify(data.substitutes),
      JSON.stringify(data.loans),
      JSON.stringify(data.incentives),
      JSON.stringify(data.debts),
      JSON.stringify(data.records),
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  }
}
export async function deleteUserPersonnelDetail(userId: number) {
  const query = `DELETE FROM "public"."user_personnel_details" WHERE user_id = $1 RETURNING *`;
  try {
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  } catch (err: any) {
    console.error("Database error:", err);
    throw err;
  }
}

export async function getAllUsersPhoneNames(userId: number) {
 
  const queryData = `
    SELECT 
      u.user_id,  
      u.username,  
      u.role,
    u.is_enabled,
      u.full_name,
      u.phone_number 
    FROM "public"."users" u 
    ORDER BY u.updated_at DESC
  `
  const queryCount = `SELECT COUNT(*) AS "totalItems" FROM "public"."users"`
  const curentUser = `
    SELECT 
    *
    FROM "public"."users" u 
    WHERE u.user_id = $1
  `
  try {  
    const [resultData, resultCount, currentUser] = await Promise.all([
      pool.query(queryData ),
      pool.query(queryCount),
      pool.query(curentUser, [userId]),
    ])
    const allUsers = resultData.rows
    const totalItems = Number.parseInt(resultCount.rows[0].totalItems, 10)
    const dataCurrentUser = currentUser.rows[0]
    return { allUsers, totalItems,dataCurrentUser }
  } catch (err: any) {
    console.error("Database error:", err)
    throw err
  }
}


export async function updateAttendance(attendanceId: number, data: Partial<any>) {
  const updates: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const value = (data as any)[key]; 
      let dbColumnName: string;
      switch (key) {
        case 'userId':
          dbColumnName = 'user_id';
          break;
        case 'checkInTime':
          dbColumnName = 'check_in_time';
          break;
        case 'checkOutTime':
          dbColumnName = 'check_out_time';
          break; 
        default: 
          dbColumnName = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
          break;
      }
      
      updates.push(`${dbColumnName} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }
  }
  updates.push(`updated_at = CURRENT_TIMESTAMP`);
  if (updates.length === 1 && updates[0] === 'updated_at = CURRENT_TIMESTAMP') {
    throw new Error("No specific fields provided for attendance update.");
  }
  values.push(attendanceId);
  const query = `
    UPDATE "public"."attendance"
    SET ${updates.join(", ")}
    WHERE attendance_id = $${paramIndex}
    RETURNING *;
  `;
  try {
    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      throw new Error(`Attendance record with ID ${attendanceId} not found.`);
    }
    return result.rows[0];
  } catch (err: any) {
    console.error("Database error updating attendance record:", err);
    throw err;
  }
}
