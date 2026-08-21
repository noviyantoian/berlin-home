/**
 * Master switch for the lead CRM — Postgres lead storage plus the /admin
 * dashboard that reads it.
 *
 * Defaults to OFF, so a deploy that sets no CRM env at all runs as a plain
 * WhatsApp funnel: /api/lead still validates the form and builds the prefilled
 * chat link, but nothing is written to a database and /admin is a 404. That
 * also means DATABASE_URL, ADMIN_USER, ADMIN_PASSWORD_HASH and SESSION_SECRET
 * are only required while the CRM is on.
 *
 * Set CRM_ENABLED=true to bring lead capture and the dashboard back. No other
 * code change is needed — the CRM modules are all still here.
 */
const TRUTHY = new Set(["1", "true", "on", "yes"]);

export function isCrmEnabled(): boolean {
  return TRUTHY.has((process.env.CRM_ENABLED ?? "").trim().toLowerCase());
}
