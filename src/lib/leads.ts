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
      count(*) filter (where (created_at at time zone 'Asia/Makassar')::date = (now() at time zone 'Asia/Makassar')::date) as today,
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

export type FraudLabel = "fraud" | "suspicious" | "low";
export type FraudRow = {
  ip: string;
  total: number;
  cpc: number;
  last24h: number;
  last1h: number;
  distinctPhone: number;
  firstSeen: string;
  lastSeen: string;
  score: number; // 0-100
  label: FraudLabel;
  reasons: string[];
};

type FraudSignals = { total: number; cpc: number; last24h: number; last1h: number; distinctPhone: number; spanSec: number };

/**
 * Explainable click-fraud score (0-100) for one IP's submission pattern.
 * Weighted heuristics: CPC repetition is the core signal, plus velocity,
 * duplicate phone, all-paid traffic, and tight bursts.
 */
function scoreIp(s: FraudSignals): { score: number; label: FraudLabel; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  if (s.cpc >= 2) {
    score += Math.min(40, Math.round((Math.min(s.cpc, 8) / 8) * 40));
    reasons.push(`${s.cpc}x dari iklan (CPC)`);
  }
  if (s.last1h >= 2) {
    score += Math.min(30, s.last1h * 10);
    reasons.push(`${s.last1h} submit dalam 1 jam`);
  }
  if (s.last24h >= 3) {
    score += 15;
    reasons.push(`${s.last24h} submit dalam 24 jam`);
  }
  if (s.total - s.distinctPhone >= 1) {
    score += 15;
    reasons.push("nomor HP berulang");
  }
  if (s.total >= 2 && s.cpc === s.total) {
    score += 10;
    reasons.push("100% trafik berbayar");
  }
  if (s.total >= 3 && s.spanSec > 0 && s.spanSec / (s.total - 1) < 120) {
    score += 10;
    reasons.push("jeda antar submit sangat rapat");
  }

  score = Math.min(100, score);
  const label: FraudLabel = score >= 70 ? "fraud" : score >= 40 ? "suspicious" : "low";
  return { score, label, reasons };
}

/** Repeat-visitor IPs (with >=1 CPC hit) scored for click-fraud likelihood, highest first. */
export async function getFraudReport(minTotal = 2): Promise<FraudRow[]> {
  const db = getDb();
  const rows = (await db.execute(sql`
    select
      ip,
      count(*) as total,
      count(*) filter (where source = 'cpc') as cpc,
      count(*) filter (where created_at >= now() - interval '24 hours') as last24h,
      count(*) filter (where created_at >= now() - interval '1 hour') as last1h,
      count(distinct phone) as distinct_phone,
      extract(epoch from (max(created_at) - min(created_at))) as span_sec,
      min(created_at) as first_seen,
      max(created_at) as last_seen
    from leads
    where ip is not null
    group by ip
    having count(*) >= ${minTotal} and count(*) filter (where source = 'cpc') >= 1
    order by count(*) filter (where source = 'cpc') desc, count(*) desc
    limit 100
  `)) as unknown as Array<Record<string, string>>;

  return rows
    .map((r) => {
      const total = Number(r.total);
      const cpc = Number(r.cpc);
      const last24h = Number(r.last24h);
      const last1h = Number(r.last1h);
      const distinctPhone = Number(r.distinct_phone);
      const spanSec = Number(r.span_sec ?? 0);
      const { score, label, reasons } = scoreIp({ total, cpc, last24h, last1h, distinctPhone, spanSec });
      return { ip: r.ip, total, cpc, last24h, last1h, distinctPhone, firstSeen: String(r.first_seen), lastSeen: String(r.last_seen), score, label, reasons };
    })
    .sort((a, b) => b.score - a.score);
}
