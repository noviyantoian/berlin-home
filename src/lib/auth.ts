import crypto from "node:crypto";
import bcrypt from "bcryptjs";

export const COOKIE_NAME = "bhs_admin";
export const COOKIE_MAX_AGE = 60 * 60 * 8; // 8 hours (seconds)

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET is not set");
  return s;
}

function sign(value: string): string {
  const mac = crypto.createHmac("sha256", secret()).update(value).digest("base64url");
  return `${value}.${mac}`;
}

function unsign(signed: string): string | null {
  const i = signed.lastIndexOf(".");
  if (i < 0) return null;
  const value = signed.slice(0, i);
  const expected = sign(value);
  const a = Buffer.from(signed);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return null;
  return crypto.timingSafeEqual(a, b) ? value : null;
}

export function createSessionToken(user: string): string {
  const exp = Date.now() + COOKIE_MAX_AGE * 1000;
  return sign(`${user}|${exp}`);
}

export function readSession(token?: string | null): { user: string } | null {
  if (!token) return null;
  const value = unsign(token);
  if (!value) return null;
  const [user, expStr] = value.split("|");
  const exp = Number(expStr);
  if (!user || !exp || Date.now() > exp) return null;
  return { user };
}

/** Verify admin login. Always runs a bcrypt compare to reduce timing leaks. */
export async function verifyCredentials(user: string, password: string): Promise<boolean> {
  const expectedUser = process.env.ADMIN_USER || "admin";
  const hash = process.env.ADMIN_PASSWORD_HASH || "$2a$10$0000000000000000000000000000000000000000000000000000";
  const ok = await bcrypt.compare(password, hash);
  return ok && user === expectedUser;
}
