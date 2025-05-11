import "server-only";

import { compare, hash } from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { v4 as uuidv4 } from "uuid";
import { cookies } from "next/headers";

const SECRET_KEY = process.env.JWT_SECRET_KEY || "my-secret";
const key = new TextEncoder().encode(SECRET_KEY);

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(key);
}

export async function decrypt(token: string) {
  const { payload } = await jwtVerify(token, key, {
    algorithms: ["HS256"],
  });
  return payload;
}

export async function hashPassword(password: string) {
  return await hash(password, 10);
}

export async function comparePasswords(
  password: string,
  hashedPassword: string
) {
  return await compare(password, hashedPassword);
}

export function generateUUID() {
  return uuidv4();
}

export function getSessionToken() {
  const cookieStore = cookies();
  return cookieStore.get("session_token")?.value;
}

export function setSessionToken(token: string) {
  const cookieStore = cookies();
  cookieStore.set("session_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 3600, // 1 hour
    path: "/",
  });
}

export function removeSessionToken() {
  const cookieStore = cookies();
  cookieStore.delete("session_token");
}
