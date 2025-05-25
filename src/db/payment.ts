
import pool from "./dbconnect"
import { getAllCustomers } from "./queries";

interface CustomerFilterParams {
  membershipType?: string;
  status?: string;
  unpaidThisMonth?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

export async function getFilteredCustomers(
  page: number = 1,
  limit: number = 10,
  filters: CustomerFilterParams
) {
  const offset = (page - 1) * limit;
  
  // Base query parts
  let whereConditions: string[] = [];
  let queryParams: any[] = [];
  let paramIndex = 1;

  // Build WHERE conditions based on filters
  if (filters.membershipType) {
    whereConditions.push(`c.membership_type = $${paramIndex}`);
    queryParams.push(filters.membershipType);
    paramIndex++;
  }

  if (filters.status) {
    whereConditions.push(`c.status = $${paramIndex}`);
    queryParams.push(filters.status);
    paramIndex++;
  }

  if (filters.dateFrom) {
    whereConditions.push(`c.created_at >= $${paramIndex}`);
    queryParams.push(filters.dateFrom);
    paramIndex++;
  }

  if (filters.dateTo) {
    whereConditions.push(`c.created_at <= $${paramIndex}`);
    queryParams.push(filters.dateTo + ' 23:59:59');
    paramIndex++;
  }

  // Handle unpaid this month filter
  if (filters.unpaidThisMonth) {
    // Get current month start and end dates
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    
    // Add condition to find customers who haven't paid this month
    whereConditions.push(`
      c.customer_id NOT IN (
        SELECT DISTINCT p.customer_id 
        FROM payments p 
        WHERE p.customer_id = c.customer_id 
        AND p.payment_date >= $${paramIndex}
        AND p.payment_date <= $${paramIndex + 1}
        AND p.status = 'COMPLETED'
      )
    `);
    queryParams.push(currentMonthStart);
    queryParams.push(currentMonthEnd + ' 23:59:59');
    paramIndex += 2;
  }

  // Construct the WHERE clause
  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

  // Main query for data
  const dataQuery = `
    SELECT 
      c.customer_id,
      c.uuid,
      c.phone_number,
      c.email,
      c.address,
      c.created_at,
      c.updated_at,
      c.first_name,
      c.last_name,
      c.gender,
      c.date_of_birth,
      c.emergency_contact,
      c.emergency_phone,
      c.street_address,
      c.city,
      c.state,
      c.state_code,
      c.membership_type,
      c.membership_start_date,
      c.membership_end_date,
      c.status,
      c.notes
    FROM customers c
    ${whereClause}
    ORDER BY c.created_at DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  // Count query for total items
  const countQuery = `
    SELECT COUNT(*) as total
    FROM customers c
    ${whereClause}
  `;

  // Add pagination parameters
  queryParams.push(limit, offset);

  try {
    // Execute both queries
    const [dataResult, countResult] = await Promise.all([
      pool.query(dataQuery, queryParams),
      pool.query(countQuery, queryParams.slice(0, -2)) // Remove limit and offset for count query
    ]);

    return {
      data: dataResult.rows,
      totalItems: parseInt(countResult.rows[0].total)
    };
  } catch (error) {
    console.error('Error in getFilteredCustomers:', error);
    throw error;
  }
}

// Alternative simpler approach if you prefer to modify the existing getAllCustomers function
export async function getAllCustomersWithFilters(
  page: number = 1,
  limit: number = 10,
  filters?: CustomerFilterParams
) {
  const offset = (page - 1) * limit;
  
  if (!filters || Object.keys(filters).length === 0) {
    // Use existing getAllCustomers logic
    return getAllCustomers(page, limit);
  }
  
  return getFilteredCustomers(page, limit, filters);
}

 