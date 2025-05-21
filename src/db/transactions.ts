import "server-only";

import pool from "./dbconnect";

import { buildInsertQuery, buildUpdateQuery } from "./helpers";

import { UserCreateDTO } from "@/types/user";
import { UserProfileDTO } from "@/types/user-profile";


// USER & USER PROFILE
export async function createUserAndProfileTransaction(
  userDto: UserCreateDTO,
  userProfileDto: Partial<UserProfileDTO>
) {
  const client = await pool.connect();
  try {
    console.log("Starting transaction for user and user profile creation...");
    await client.query("BEGIN");

    // 1. Create new user
    const insertUserQuery = `
      INSERT INTO users (username, password,role)
      VALUES ($1, $2, $3)
      RETURNING uuid
    `;
    const { username, password, role } = userDto;
    const insertUserResult = await client.query(insertUserQuery, [
      username,
      password,
      role
    ]);

    if (insertUserResult.rowCount === 0) {
      throw new Error("Failed to insert user");
    }

    const userUuid = insertUserResult.rows[0].uuid;

    // 2. Create new user profile
    const insertUserProfileQuery = `
      INSERT INTO user_profiles (user_uuid, full_name, address, phone_number)
      VALUES ($1, $2, $3, $4)
    `;
    const { fullName, address, phoneNumber } = userProfileDto;
    const insertUserProfileResult = await client.query(insertUserProfileQuery, [
      userUuid,
      fullName,
      address,
      phoneNumber,
    ]);

    if (insertUserProfileResult.rowCount === 0) {
      throw new Error("Failed to insert user profile");
    }

    await client.query("COMMIT");
    console.log(
      "Transaction completed successfully for user and user profile creation."
    );
    return true;
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Transaction failed:", error);
    throw error;
  } finally {
    client.release();
  }
}
