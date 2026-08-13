import { eq, and, asc, count } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { getDb } from "./db";
import { users, type User } from "./schema";

export type UserRole = "admin" | "client";

export const USER_ROLES: readonly UserRole[] = ["admin", "client"] as const;
export const ROLE_LABEL: Record<UserRole, string> = { admin: "Admin", client: "Klien" };
export const ROLE_HINT: Record<UserRole, string> = {
  admin: "Akses penuh: leads, deteksi fraud, dan kelola pengguna.",
  client: "Hanya melihat daftar leads yang masuk.",
};

export const MIN_PASSWORD_LENGTH = 8;
const BCRYPT_ROUNDS = 10;
const USERNAME_PATTERN = /^[a-z0-9][a-z0-9._-]{2,31}$/;

/** Stable codes so API routes never reflect raw DB errors back into the page. */
export type UserErrorCode =
  | "invalid_username"
  | "invalid_name"
  | "weak_password"
  | "invalid_role"
  | "duplicate"
  | "not_found"
  | "last_admin"
  | "self_target"
  | "reserved_username";

export class UserError extends Error {
  constructor(readonly code: UserErrorCode) {
    super(code);
    this.name = "UserError";
  }
}

export function isUserRole(value: string): value is UserRole {
  return (USER_ROLES as readonly string[]).includes(value);
}

export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase();
}

function assertUsername(username: string): void {
  if (!USERNAME_PATTERN.test(username)) throw new UserError("invalid_username");
}

function assertPassword(password: string): void {
  if (password.length < MIN_PASSWORD_LENGTH) throw new UserError("weak_password");
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function listUsers(): Promise<User[]> {
  const db = getDb();
  return db.select().from(users).orderBy(asc(users.createdAt));
}

export async function findUserByUsername(username: string): Promise<User | null> {
  const db = getDb();
  const [row] = await db.select().from(users).where(eq(users.username, normalizeUsername(username))).limit(1);
  return row ?? null;
}

export async function findUserById(id: number): Promise<User | null> {
  const db = getDb();
  const [row] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return row ?? null;
}

export type CreateUserInput = {
  username: string;
  name: string;
  password: string;
  role: string;
  createdBy: string;
  reservedUsername: string;
};

export async function createUser(input: CreateUserInput): Promise<User> {
  const username = normalizeUsername(input.username);
  const name = input.name.trim();

  assertUsername(username);
  if (name.length < 2 || name.length > 120) throw new UserError("invalid_name");
  assertPassword(input.password);
  if (!isUserRole(input.role)) throw new UserError("invalid_role");
  // The env bootstrap admin is resolved before the DB, so a DB row with the same
  // username would be unreachable — reject it instead of creating a dead account.
  if (username === normalizeUsername(input.reservedUsername)) throw new UserError("reserved_username");

  if (await findUserByUsername(username)) throw new UserError("duplicate");

  const db = getDb();
  const [row] = await db
    .insert(users)
    .values({
      username,
      name,
      role: input.role,
      passwordHash: await hashPassword(input.password),
      createdBy: input.createdBy,
    })
    .returning();
  return row;
}

async function requireUser(id: number): Promise<User> {
  const user = await findUserById(id);
  if (!user) throw new UserError("not_found");
  return user;
}

async function countActiveAdmins(): Promise<number> {
  const db = getDb();
  const [row] = await db
    .select({ c: count() })
    .from(users)
    .where(and(eq(users.role, "admin"), eq(users.isActive, true)));
  return Number(row?.c ?? 0);
}

/**
 * Blocks a change that would remove the last active DB admin. The env bootstrap
 * admin still exists, so this is a guardrail against accidental self-demotion
 * rather than protection from a hard lockout.
 */
async function assertNotLastAdmin(target: User): Promise<void> {
  if (target.role !== "admin" || !target.isActive) return;
  if ((await countActiveAdmins()) <= 1) throw new UserError("last_admin");
}

export async function setUserPassword(id: number, password: string): Promise<void> {
  assertPassword(password);
  await requireUser(id);
  const db = getDb();
  await db.update(users).set({ passwordHash: await hashPassword(password) }).where(eq(users.id, id));
}

export async function setUserRole(id: number, role: string): Promise<void> {
  if (!isUserRole(role)) throw new UserError("invalid_role");
  const target = await requireUser(id);
  if (target.role === role) return;
  if (role !== "admin") await assertNotLastAdmin(target);
  const db = getDb();
  await db.update(users).set({ role }).where(eq(users.id, id));
}

export async function setUserActive(id: number, isActive: boolean): Promise<void> {
  const target = await requireUser(id);
  if (target.isActive === isActive) return;
  if (!isActive) await assertNotLastAdmin(target);
  const db = getDb();
  await db.update(users).set({ isActive }).where(eq(users.id, id));
}

export async function deleteUser(id: number): Promise<void> {
  const target = await requireUser(id);
  await assertNotLastAdmin(target);
  const db = getDb();
  await db.delete(users).where(eq(users.id, id));
}

/** Best-effort last-login stamp; never blocks a successful sign-in. */
export async function touchLastLogin(id: number): Promise<void> {
  try {
    const db = getDb();
    await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, id));
  } catch {
    /* login must succeed even if the stamp fails */
  }
}
