import { sql, and, or, eq, gte, lte, ilike, desc, count } from "drizzle-orm";
import { getDb } from "./db";
import { leads, type NewLead } from "./schema";

/** Real client IP behind nginx (X-Forwarded-For first hop). */
export function clientIp(headers: Headers): string | null {
  const xff = headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return headers.get("x-real-ip") || null;
}

export type Attribution = {
  source: string;
  gclid: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
};

/** Normalize traffic source from UTM/gclid/referrer. */
export function detectSource(params: URLSearchParams, referrer: string | null): Attribution {
  const gclid = params.get("gclid");
  const utmSource = params.get("utm_source");
  const utmMedium = params.get("utm_medium");
  const utmCampaign = params.get("utm_campaign");
  const med = (utmMedium || "").toLowerCase();
  const src = (utmSource || "").toLowerCase();

  let source = "direct";
  if (gclid || ["cpc", "ppc", "paid", "paidsearch", "paid_search"].includes(med) || ["adwords", "googleads", "google_ads"].includes(src)) {
    source = "cpc";
  } else if (utmSource) {
    if (["facebook", "instagram", "tiktok", "fb", "ig"].includes(src) || ["social", "paid_social"].includes(med)) source = "social";
    else source = "referral";
  } else if (referrer) {
    try {
      const host = new URL(referrer).hostname;
      if (/(^|\.)(google|bing|yahoo|duckduckgo)\./.test(host)) source = "organic";
      else if (/(^|\.)(facebook|instagram|tiktok)\.|t\.co/.test(host)) source = "social";
      else source = "referral";
    } catch { /* ignore bad referrer */ }
  }
  return { source, gclid: gclid || null, utmSource: utmSource || null, utmMedium: utmMedium || null, utmCampaign: utmCampaign || null };
}

export async function insertLead(data: NewLead) {
  const db = getDb();
  const [row] = await db.insert(leads).values(data).returning();
  return row;
}

export type Stats = { total: number; today: number; last7: number; last30: number; cpc: number };

export async function getStats(): Promise<Stats> {
  const db = getDb();
  const rows = (await db.execute(sql`
    select
      count(*) as total,
      count(*) filter (where (created_at at time zone 'Asia/Jakarta')::date = (now() at time zone 'Asia/Jakarta')::date) as today,
      count(*) filter (where created_at >= now() - interval '7 days') as last7,
      count(*) filter (where created_at >= now() - interval '30 days') as last30,
      count(*) filter (where source = 'cpc') as cpc
    from leads
  `)) as unknown as Array<Record<string, string>>;
  const r = rows[0] || {};
  return {
    total: Number(r.total ?? 0),
    today: Number(r.today ?? 0),
    last7: Number(r.last7 ?? 0),
    last30: Number(r.last30 ?? 0),
    cpc: Number(r.cpc ?? 0),
  };
}

export type LeadFilter = {
  from?: string;
  to?: string;
  city?: string;
  source?: string;
  q?: string;
  page?: number;
  perPage?: number;
};

export async function listLeads(f: LeadFilter) {
  const db = getDb();
  const page = Math.max(1, f.page || 1);
  const perPage = Math.min(100, Math.max(5, f.perPage || 20));

  const conds = [];
  if (f.from) conds.push(gte(leads.createdAt, new Date(f.from + "T00:00:00")));
  if (f.to) conds.push(lte(leads.createdAt, new Date(f.to + "T23:59:59")));
  if (f.city) conds.push(ilike(leads.city, `%${f.city}%`));
  if (f.source) conds.push(eq(leads.source, f.source));
  if (f.q) conds.push(or(ilike(leads.name, `%${f.q}%`), ilike(leads.phone, `%${f.q}%`)));
  const where = conds.length ? and(...conds) : undefined;

  const [{ c }] = await db.select({ c: count() }).from(leads).where(where);
  const total = Number(c);
  const rows = await db
    .select()
    .from(leads)
    .where(where)
    .orderBy(desc(leads.createdAt))
    .limit(perPage)
    .offset((page - 1) * perPage);

  return { rows, total, page, perPage, pages: Math.max(1, Math.ceil(total / perPage)) };
}

export type FraudRow = { ip: string; total: number; cpc: number; last24h: number; lastSeen: string };

/** IPs that submitted repeatedly from CPC traffic (likely click fraud / bots). */
export async function getFraudIps(minCpc = 3): Promise<FraudRow[]> {
  const db = getDb();
  const rows = (await db.execute(sql`
    select
      ip,
      count(*) as total,
      count(*) filter (where source = 'cpc') as cpc,
      count(*) filter (where created_at >= now() - interval '24 hours') as last24h,
      max(created_at) as last_seen
    from leads
    where ip is not null
    group by ip
    having count(*) filter (where source = 'cpc') >= ${minCpc}
    order by cpc desc, total desc
    limit 50
  `)) as unknown as Array<Record<string, string>>;
  return rows.map((r) => ({
    ip: r.ip,
    total: Number(r.total),
    cpc: Number(r.cpc),
    last24h: Number(r.last24h),
    lastSeen: String(r.last_seen),
  }));
}
