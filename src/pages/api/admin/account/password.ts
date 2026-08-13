import type { APIRoute } from "astro";
import { authenticate } from "../../../../lib/auth";
import { setUserPassword, UserError } from "../../../../lib/users";

export const prerender = false;

/**
 * Self-service password change for any signed-in DB account.
 * The bootstrap admin lives in env, so its password is changed on the server.
 */
export const POST: APIRoute = async ({ request, redirect, locals }) => {
  const session = locals.user;
  if (!session) return redirect("/admin/login");
  if (session.isBootstrap || session.id === null) return redirect("/admin/akun?err=bootstrap");

  const form = await request.formData();
  const current = String(form.get("current_password") || "");
  const next = String(form.get("new_password") || "");
  const confirm = String(form.get("confirm_password") || "");

  if (next !== confirm) return redirect("/admin/akun?err=mismatch");

  try {
    if (!(await authenticate(session.username, current))) return redirect("/admin/akun?err=wrong_password");
    await setUserPassword(session.id, next);
    return redirect("/admin/akun?ok=password");
  } catch (e) {
    if (e instanceof UserError) return redirect(`/admin/akun?err=${e.code}`);
    return redirect("/admin/akun?err=db");
  }
};
