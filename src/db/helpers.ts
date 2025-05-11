import snakecaseKeys from "snakecase-keys";

// Define type
// type SelectQueryOptions = {
//   tableName: string;
//   columns?: string[];
//   orderBy?: string;
//   orderDir?: "ASC" | "DESC";
//   limit?: number;
//   offset?: number;
//   conditions?: { [key: string]: any };
// };

export function sanitizeInput(input: string) {
  return input
    .trim()
    .replace(
      /[^a-zA-Z0-9ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯăâêôơêùýỳỷỹỵ ]/g,
      ""
    );
}

// export function buildSelectQuery({
//   tableName,
//   columns = ["*"],
//   orderBy,
//   orderDir = "ASC",
//   limit,
//   offset,
//   conditions = {},
// }: SelectQueryOptions) {
//   const columnsPart = columns.join(", ");

//   // Xây dựng phần WHERE từ điều kiện
//   const whereClause = Object.keys(conditions)
//     .map((key, index) => `"${key}" = $${index + 1}`)
//     .join(" AND ");
//   let currentIndex = Object.keys(conditions).length + 1;

//   let query = `SELECT ${columnsPart} FROM "${tableName}"`;
//   query += whereClause ? ` WHERE ${whereClause}` : "";
//   query += orderBy ? ` ORDER BY "${orderBy}" ${orderDir}` : "";
//   query += limit ? ` LIMIT $${currentIndex++}` : "";
//   query += ` OFFSET $${currentIndex++}`;
//   return query;
// }

export function buildInsertQuery(tableName: string, dtoObject: any) {
  const snakeDtoObject = snakecaseKeys(dtoObject, { deep: true });
  const keys = Object.keys(snakeDtoObject);
  const values = Object.values(snakeDtoObject);
  return `INSERT INTO "public"."${tableName}" (${keys
    .map((key) => `"${key}"`)
    .join(", ")}) VALUES (${values
    .map((_, index) => "$" + (index + 1))
    .join(", ")}) RETURNING *`;
}

export function buildUpdateQuery(
  tableName: string,
  dtoObject: any,
  option?: {
    timezone?: string;
    findBy?: string;
  }
) {
  const key = option?.findBy || "uuid"; // Mặc định tìm theo uuid
  const { timezone } = option || {}; // Timezone mặc định là Asia/Ho_Chi_Minh đã cấu hình trong postgresql.conf
  const snakeDtoObject = snakecaseKeys(dtoObject, { deep: true });
  const keys = Object.keys(snakeDtoObject);
  return `UPDATE "public"."${tableName}"
    SET ${keys.map((key, index) => `"${key}" = $${index + 1}`).join(", ")}, 
    "updated_at" = CURRENT_TIMESTAMP ${
      timezone ? `AT TIME ZONE '${timezone}'` : ""
    }
    WHERE "${key}" = $${keys.length + 1} RETURNING *`;
}

export function buildDeleteQuery(
  tableName: string,
  options?: { findBy?: string }
) {
  return `DELETE FROM "public"."${tableName}" WHERE "${
    options?.findBy || "uuid"
  }" = $1`;
}
