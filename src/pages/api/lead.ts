import type { APIRoute } from "astro";
import { clientIp, detectSource, insertLead } from "../../lib/leads";
import { WA_NUMBER } from "../../data/site";

export const prerender = false;

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json" } });

const waUrl = (text: string) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;

export const POST: APIRoute = async ({ request }) => {
  let body: Record<string, string> = {};
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "Permintaan tidak valid." }, 400);
  }

  const name = String(body.name || "").trim().slice(0, 120);
  const phone = String(body.phone || "").trim().slice(0, 40);
  const city = String(body.city || "").trim().slice(0, 120);
  const service = String(body.service || "").trim().slice(0, 120);

  if (!name || !phone || !city) {
    return json({ ok: false, error: "Mohon lengkapi nama, nomor HP, dan kota." }, 422);
  }
  if (phone.replace(/\D/g, "").length < 8) {
    return json({ ok: false, error: "Nomor HP tidak valid." }, 422);
  }

  const intent = service ? `Saya tertarik dengan layanan ${service}.` : "Saya ingin memesan layanan pijat.";
  const text = `Halo Berlin Home Spa, saya ${name} (${phone}) dari ${city}. ${intent} Mohon info ketersediaan terapis & jadwal. Terima kasih.`;
  const url = waUrl(text);

  // Honeypot: bots fill the hidden field. Let them "succeed" but never store.
  if (body.website) return json({ ok: true, waUrl: url });

  const params = new URLSearchParams(String(body.query || ""));
  const attr = detectSource(params, body.referrer || null);

  try {
    await insertLead({
      name,
      phone,
      city,
      ip: clientIp(request.headers),
      userAgent: request.headers.get("user-agent") || null,
      source: attr.source,
      gclid: attr.gclid,
      utmSource: attr.utmSource,
      utmMedium: attr.utmMedium,
      utmCampaign: attr.utmCampaign,
      referrer: body.referrer || null,
      page: (body.page || "").slice(0, 255) || null,
    });
  } catch (e) {
    // Never block the customer from reaching WhatsApp on a DB hiccup.
    console.error("[lead] insert failed:", e);
  }

  return json({ ok: true, waUrl: url });
};
