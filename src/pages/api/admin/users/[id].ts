import type { APIRoute } from "astro";
import { deleteUser, setUserActive, setUserPassword, setUserRole, UserError } from "../../../../lib/users";

export const prerender = false;

const OK_BY_ACTION: Record<string, string> = {
  password: "password",
  role: "role",
  active: "active",
  delete: "deleted",
};

/**
 * Row actions for one account. Admin-only; enforced in src/middleware.ts.
 * Admins may not change their own role, deactivate, or delete themselves —
 * that is the one way to strand yourself out of user management.
 */
export const POST: APIRoute = async ({ params, request, redirect, locals }) => {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id < 1) return redirect("/admin/users?err=not_found");

  const form = await request.formData();
  const action = String(form.get("_action") || "");
  const isSelf = locals.user?.id === id;

  try {
    if (action === "password") {
      await setUserPassword(id, String(form.get("password") || ""));
    } else if (action === "role") {
      if (isSelf) throw new UserError("self_target");
      await setUserRole(id, String(form.get("role") || ""));
    } else if (action === "active") {
      if (isSelf) throw new UserError("self_target");
      await setUserActive(id, form.get("is_active") === "1");
    } else if (action === "delete") {
      if (isSelf) throw new UserError("self_target");
      await deleteUser(id);
    } else {
      return redirect("/admin/users?err=not_found");
    }
    return redirect(`/admin/users?ok=${OK_BY_ACTION[action]}`);
  } catch (e) {
    if (e instanceof UserError) return redirect(`/admin/users?err=${e.code}`);
    return redirect("/admin/users?err=db");
  }
};
