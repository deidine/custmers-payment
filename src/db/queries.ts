 
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
      u.user_id, 
      u.uuid, 
      u.username, 
      u.password, 
      u.role, 
      u.is_enabled, 
      u.gender, 
      u.date_of_joining, 
      u.city, 
      u.state, 
      u.state_code, 
      u.street_address,
      u.phone_number,
      u.email,
      u.status,
      u.created_at, 
      u.updated_at 
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
  const paymentDate = data.payment_date ? new Date(data.payment_date) : new Date()
  const monthStart = new Date(paymentDate.getFullYear(), paymentDate.getMonth(), 1)
  const monthEnd = new Date(paymentDate.getFullYear(), paymentDate.getMonth() + 1, 0)
  // Check if a payment exists for the same customer and same month
  const checkQuery = `
    SELECT * FROM payments 
    WHERE customer_id = $1 
    AND payment_date >= $2 AND payment_date <= $3
    LIMIT 1
  `
  const checkResult = await pool.query(checkQuery, [data.customerId, monthStart, monthEnd])
console.log("monthStart,"+ data.customer_id +"monthEnd,"+JSON.stringify(monthEnd))

  if (checkResult.rows.length > 0) {
    // Update existing payment
    const existingId = checkResult.rows[0].payment_id
    const updateFields: string[] = []
    const values: any[] = []
    let index = 1

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        const snakeKey = key.replace(/[A-Z]/g, (l) => `_${l.toLowerCase()}`)
        updateFields.push(`${snakeKey} = $${index}`)
        values.push(value)
        index++
      }
    })

    values.push(existingId) // for WHERE clause
    const updateQuery = `
      UPDATE payments 
      SET ${updateFields.join(", ")}, updated_at = CURRENT_TIMESTAMP 
      WHERE payment_id = $${index}
      RETURNING *
    `
    const updateResult = await pool.query(updateQuery, values)
    return updateResult.rows[0]
  } else {
    // Insert new payment
    return await createPayment(data)
  }
}

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
