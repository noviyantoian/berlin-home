import { defineMiddleware } from "astro:middleware";
import { COOKIE_NAME, readSession } from "./lib/auth";

export const onRequest = defineMiddleware((context, next) => {
  const { pathname } = context.url;
  const isAdmin = pathname.startsWith("/admin") && pathname !== "/admin/login";

  if (isAdmin) {
    const token = context.cookies.get(COOKIE_NAME)?.value;
    const session = readSession(token);
    if (!session) return context.redirect("/admin/login");
    context.locals.admin = session.user;
  }

  return next();
});
