import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { findUserByUsername, normalizeUsername, touchLastLogin, type UserRole } from "./users";

export const COOKIE_NAME = "bhs_admin";
export const COOKIE_MAX_AGE = 60 * 60 * 8; // 8 hours (seconds)

/** bcrypt compare target for unknown users, so login timing looks the same either way. */
const DUMMY_HASH = "$2a$10$0000000000000000000000000000000000000000000000000000";

export type SessionUser = {
  id: number | null; // null for the env bootstrap admin (no DB row)
  username: string;
  name: string;
  role: UserRole;
  isBootstrap: boolean;
};

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

/** Username of the env bootstrap admin — always reachable, even with the DB down. */
export function bootstrapUsername(): string {
  return normalizeUsername(process.env.ADMIN_USER || "admin");
}

function bootstrapSession(): SessionUser {
  return { id: null, username: bootstrapUsername(), name: "Admin utama", role: "admin", isBootstrap: true };
}

export function createSessionToken(username: string): string {
  const exp = Date.now() + COOKIE_MAX_AGE * 1000;
  return sign(`${username}|${exp}`);
}

/** Verify the cookie signature and expiry. Says nothing about the account still being valid. */
function readToken(token?: string | null): { username: string } | null {
  if (!token) return null;
  const value = unsign(token);
  if (!value) return null;
  const [username, expStr] = value.split("|");
  const exp = Number(expStr);
  if (!username || !exp || Date.now() > exp) return null;
  return { username };
}

/**
 * Check a sign-in. The env admin is matched first so the panel stays reachable
 * before any DB user exists; everyone else is looked up in `users`.
 * A bcrypt compare always runs to keep timing uniform.
 */
export async function authenticate(rawUsername: string, password: string): Promise<SessionUser | null> {
  const username = normalizeUsername(rawUsername);

  if (username === bootstrapUsername()) {
    const ok = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH || DUMMY_HASH);
    return ok && !!process.env.ADMIN_PASSWORD_HASH ? bootstrapSession() : null;
  }

  const user = await findUserByUsername(username);
  const ok = await bcrypt.compare(password, user?.passwordHash || DUMMY_HASH);
  if (!ok || !user || !user.isActive) return null;

  await touchLastLogin(user.id);
  return { id: user.id, username: user.username, name: user.name, role: user.role as UserRole, isBootstrap: false };
}

/**
 * Resolve a cookie into a live session. DB users are re-checked on every request
 * so deactivation, deletion, and role changes take effect immediately instead of
 * lingering until the 8-hour token expires.
 */
export async function resolveSession(token?: string | null): Promise<SessionUser | null> {
  const claim = readToken(token);
  if (!claim) return null;
  if (claim.username === bootstrapUsername()) return bootstrapSession();

  const user = await findUserByUsername(claim.username);
  if (!user || !user.isActive) return null;
  return { id: user.id, username: user.username, name: user.name, role: user.role as UserRole, isBootstrap: false };
}
