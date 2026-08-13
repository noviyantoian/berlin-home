import type { APIRoute } from "astro";
import { bootstrapUsername } from "../../../../lib/auth";
import { createUser, UserError } from "../../../../lib/users";

export const prerender = false;

/** Create a dashboard account. Admin-only; enforced in src/middleware.ts. */
export const POST: APIRoute = async ({ request, redirect, locals }) => {
  const form = await request.formData();

  try {
    await createUser({
      username: String(form.get("username") || ""),
      name: String(form.get("name") || ""),
      password: String(form.get("password") || ""),
      role: String(form.get("role") || ""),
      createdBy: locals.user?.username ?? "system",
      reservedUsername: bootstrapUsername(),
    });
    return redirect("/admin/users?ok=created");
  } catch (e) {
    if (e instanceof UserError) return redirect(`/admin/users?err=${e.code}`);
    return redirect("/admin/users?err=db");
  }
};
