import { defineMiddleware } from "astro:middleware";
import { COOKIE_NAME, resolveSession } from "./lib/auth";

/** Reachable without a session: the login screen, its handler, and sign-out. */
const PUBLIC_PATHS = new Set(["/admin/login", "/api/admin/login", "/api/admin/logout"]);

/** Everything under these prefixes is admin-only; clients get 403 / redirect. */
const ADMIN_ONLY_PREFIXES = ["/admin/users", "/api/admin/users"];

const isApi = (pathname: string) => pathname.startsWith("/api/");
const needsSession = (pathname: string) =>
  (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) && !PUBLIC_PATHS.has(pathname);
const isAdminOnly = (pathname: string) => ADMIN_ONLY_PREFIXES.some((p) => pathname.startsWith(p));

/**
 * Whether a state-changing request came from our own pages.
 *
 * Behind nginx the Node server sees http://127.0.0.1:3040, so context.url is
 * useless here — that mismatch is exactly why astro.config.mjs disables the
 * built-in checkOrigin. Compare against the forwarded Host instead, which nginx
 * sets from the real request (`proxy_set_header Host $host`) and only routes here
 * for hosts matching server_name. A request with no Origin/Referer at all (older
 * clients, some proxies) is allowed through — the session cookie still guards it.
 */
function isSameSitePost(request: Request): boolean {
  const source = request.headers.get("origin") || request.headers.get("referer");
  if (!source) return true;

  let sourceHost: string;
  try {
    sourceHost = new URL(source).host;
  } catch {
    return false;
  }

  const forwarded = request.headers.get("x-forwarded-host")?.split(",")[0].trim();
  const host = request.headers.get("host");
  return sourceHost === forwarded || sourceHost === host;
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  const deny = (redirectTo: string) =>
    isApi(pathname) ? new Response("Forbidden", { status: 403 }) : context.redirect(redirectTo);

  // The session cookie is SameSite=Lax, so a cross-site POST would still carry it.
  if (context.request.method === "POST" && pathname.startsWith("/api/admin") && !isSameSitePost(context.request)) {
    return new Response("Forbidden", { status: 403 });
  }

  if (!needsSession(pathname)) return next();

  let session = null;
  try {
    session = await resolveSession(context.cookies.get(COOKIE_NAME)?.value);
  } catch {
    // DB unreachable while validating a non-bootstrap account — fail closed.
    return deny("/admin/login?error=db");
  }

  if (!session) {
    context.cookies.delete(COOKIE_NAME, { path: "/" });
    return deny("/admin/login");
  }

  context.locals.user = session;

  if (isAdminOnly(pathname) && session.role !== "admin") return deny("/admin?denied=1");

  return next();
});
