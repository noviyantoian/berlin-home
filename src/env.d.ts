/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    /** Set by src/middleware.ts for every authenticated /admin and /api/admin request. */
    user?: import("./lib/auth").SessionUser;
  }
}
