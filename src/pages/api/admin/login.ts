import type { APIRoute } from "astro";
import { verifyCredentials, createSessionToken, COOKIE_NAME, COOKIE_MAX_AGE } from "../../../lib/auth";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const form = await request.formData();
  const user = String(form.get("user") || "").trim();
  const password = String(form.get("password") || "");

  if (await verifyCredentials(user, password)) {
    cookies.set(COOKIE_NAME, createSessionToken(user), {
      httpOnly: true,
      sameSite: "lax",
      secure: import.meta.env.PROD,
      path: "/",
      maxAge: COOKIE_MAX_AGE,
    });
    return redirect("/admin");
  }
  return redirect("/admin/login?error=1");
};
