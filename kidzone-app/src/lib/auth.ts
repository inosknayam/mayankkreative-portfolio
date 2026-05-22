import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export interface StaffSession {
  staff_id: number;
  full_name: string;
  role_name: string;
  permission_level: number;
  phone_number: string;
}

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET env variable is not set");
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: StaffSession): Promise<string> {
  const expiryHours = parseInt(process.env.JWT_EXPIRY_HOURS ?? "8", 10);
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${expiryHours}h`)
    .sign(getSecret());
}

export async function verifySession(token: string): Promise<StaffSession | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as StaffSession;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<StaffSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("kz_session")?.value;
  if (!token) return null;
  return verifySession(token);
}

export const SESSION_COOKIE = "kz_session";
