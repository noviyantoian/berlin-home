import type { APIRoute } from "astro";
import { authenticate, createSessionToken, COOKIE_NAME, COOKIE_MAX_AGE } from "../../../lib/auth";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const form = await request.formData();
  const user = String(form.get("user") || "").trim();
  const password = String(form.get("password") || "");

  let session = null;
  try {
    session = await authenticate(user, password);
  } catch {
    // The DB is only needed for non-bootstrap accounts; surface it as its own state.
    return redirect("/admin/login?error=db");
  }

  if (!session) return redirect("/admin/login?error=1");

  cookies.set(COOKIE_NAME, createSessionToken(session.username), {
    httpOnly: true,
    sameSite: "lax",
    secure: import.meta.env.PROD,
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
  return redirect("/admin");
};
