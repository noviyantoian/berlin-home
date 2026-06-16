# Berlin Home Spa — Landing Page

Landing page satu halaman untuk layanan spa & refleksi panggilan di Bali.
Dibangun dengan **Astro 5 + Tailwind CSS v4** (output statis, zero-JS by default), dioptimalkan
untuk konversi WhatsApp dan **lolos kebijakan Google Ads**.

Arah desain: **editorial-wellness** — maroon brand sebagai satu aksen tegas di atas netral paper/ink,
tipografi serif editorial (Newsreader), layout asimetris yang sengaja bukan template.

## Stack

- **Astro 5** — komponen `.astro`, build ke HTML statis murni.
- **Tailwind CSS v4** (`@tailwindcss/vite`) — utilities + design token via `@theme`.
- **astro-icon + Phosphor** (`@iconify-json/ph`) — ikon, bukan SVG hand-rolled.
- **Fontsource** — Newsreader (display) + DM Sans (body), self-host (bukan `<link>` Google Fonts).

## Struktur

```
astro.config.mjs        # Astro + plugin Tailwind + integrasi icon
src/
  pages/
    index.astro         # Halaman utama (rakit section + JSON-LD)
    privacy.astro       # Kebijakan privasi (/privacy)
  layouts/
    Base.astro          # <head> (meta/OG/font/JSON-LD/GTM) + script interaksi
  components/
    Header.astro        # nav (wordmark serif + panel mobile full-screen)
    Hero.astro          # hero editorial asimetris (foto portrait)
    TrustMarquee.astro  # ribbon maroon marquee (value props)
    Services.astro      # 1 layanan featured + 3 sisanya sebagai list
    HowItWorks.astro    # 3 langkah, numeral besar
    Features.astro      # 6 keunggulan, list hairline 2-kolom
    Testimonials.astro  # carousel scroll-snap
    Area.astro          # area & jam (split foto + info)
    FinalCta.astro      # blok penutup maroon full-bleed
    Footer.astro        # footer editorial terang
    Cta.astro           # tombol WhatsApp reusable (+ tracking)
    WaFab.astro         # tombol WhatsApp mengambang
  data/
    site.ts             # SUMBER KONTEN: layanan, keunggulan, testimoni, nomor WA, link
  styles/
    global.css          # Tailwind import + @theme token + komponen + motion
public/
  favicon.svg
  assets/images/        # WebP (di-generate AI) + hero-portrait + og.jpg
_gen/                   # Master gambar mentah + generate.py (tidak di-deploy)
_legacy-html/           # Versi statis HTML lama (arsip)
_legacy-astro-v1/       # Versi Astro pertama, pra-redesign (arsip, boleh dihapus)
```

## Menjalankan lokal

```bash
npm install
npm run dev        # http://localhost:4321
```

## Build & Deploy

```bash
npm run build      # output statis -> dist/
npm run preview    # pratinjau hasil build
```

- **Vercel/Netlify:** hubungkan repo, framework Astro terdeteksi otomatis (output `dist/`).
- **Shared hosting:** `npm run build`, lalu upload isi folder `dist/` ke `public_html`.

## Mengubah konten

Hampir semua teks/konten ada di **`src/data/site.ts`** (layanan, durasi, manfaat, testimoni, area, nomor WA, Instagram).
Ubah di sini, bukan di tiap komponen.

## Analytics & tracking konversi (GTM/GA4)

1. Buka `src/layouts/Base.astro`, cari blok komentar `Analytics:` di `<head>`.
2. Ganti `GTM-XXXXXXX` dengan **GTM ID** Anda, lalu hapus komentar pembungkusnya.
3. Setiap klik tombol WhatsApp otomatis mengirim event ke `dataLayer`:
   `event: "whatsapp_click"`, `cta_location: "<lokasi>"` (hero, header, floating, service-*, final, footer).
4. Di GTM, buat trigger Custom Event = `whatsapp_click`, kirim ke GA4 sebagai konversi.

## Nomor WhatsApp

Diatur sekali di `src/data/site.ts` (`WA_NUMBER`). Semua tombol memakai pesan pembuka yang sudah diisi.

## Catatan Compliance Google Ads (PENTING, kategori sensitif)

Landing page ini mengikuti PRD bagian 6 secara ketat:

- **Bahasa**: hanya kesehatan/wellness. TIDAK ada kata "sensual", "intim", "dewasa", "menemani",
  "kompanion", "khusus pria/wanita". Semua copy fokus manfaat fisik terukur.
- **Gambar (di-generate AI, fal.ai)**: terapis **berseragam spa lengkap**, klien **tertutup handuk**,
  ruangan **terang/siang**, hanya area aman (punggung/bahu/kaki/scrub), tanpa pose/pencahayaan provokatif.
- **Legitimasi**: nama brand, area, jam jelas; halaman Kebijakan Privasi; structured data
  `HealthAndBeautyBusiness` (JSON-LD); catatan "hanya layanan panggilan, tanpa lokasi fisik".
- **Tips iklan**: pilih kategori bisnis **Health & Wellness**; siapkan sertifikat terapis untuk appeal jika ditolak.

## Brand & desain

- Palet (PRD): Maroon `#BE3144` (satu aksen), paper `#FAF9F7`, ink `#1A1A1A`, WhatsApp `#25D366`.
  Token di `src/styles/global.css` (`@theme`).
- Font: Newsreader (display, italic untuk emphasis) + DM Sans (body).
- Bentuk: blok/foto sudut tajam (editorial), tombol pill. Aksen: maroon saja.
- Aksesibilitas: kontras teks >= 4.5:1, focus ring, `prefers-reduced-motion`, alt text, semantic HTML.

## Lead capture & Admin

- Tombol "Pesan" + floating WhatsApp membuka **form popup** (nama, HP, kota) -> `POST /api/lead`
  -> simpan ke Postgres + redirect ke WhatsApp dengan pesan pre-fill (`LeadModal.astro`).
- `/api/lead` menangkap IP (`X-Forwarded-For`), UTM/gclid, lalu menormalkan `source`
  (cpc / organic / social / referral / direct). Ada honeypot anti-bot.
- **Dashboard admin** `/admin` (login `/admin/login`):
  - Auth cookie session (HMAC, httpOnly, SameSite=Lax, secure).
  - Statistik: chat hari ini, 7 hari, 30 hari, total, dari iklan (CPC).
  - Tabel leads + filter (cari nama/HP, kota, source, rentang tanggal) + pagination.
  - Panel **deteksi fraud**: IP yang submit >= 3x dari trafik CPC.
- Konfigurasi: salin `.env.example` -> `.env`. Generate `ADMIN_PASSWORD_HASH` &
  `SESSION_SECRET` (perintah ada di dalam file).

## Deploy & Update (VPS)

Live: **https://berlinhomespa.com**
(pm2 `berlin-home` port 3040 · nginx + Let's Encrypt · Postgres `berlin-postgres` port 5435).

Update setelah ada perubahan (push dulu dari lokal):

```bash
ssh root@192.206.117.35 -p 2222
cd /var/www/berlin-home
git pull
npm ci                          # hanya jika dependency berubah
npm run build
npm run db:push                 # hanya jika schema (src/lib/schema.ts) berubah
pm2 restart berlin-home --update-env
```

Provisioning awal (sudah dilakukan): container `berlin-postgres`, tulis `.env`,
`npm ci && build`, `db:push`, `pm2 start dist/server/entry.mjs --node-args=--env-file=.env`,
nginx site, lalu `certbot --nginx -d berlinhomespa.com -d www.berlinhomespa.com`.

## Regenerasi gambar (opsional)

```bash
export FAL_KEY="<kunci fal.ai Anda>"
python3 _gen/generate.py                                            # 4 layanan + supplies -> _gen/*_raw.jpg
cwebp -q 82 -resize 900 0 _gen/hero_portrait_raw.jpg -o public/assets/images/hero-portrait.webp
```

---
© Berlin Home Spa. Hanya layanan panggilan, tanpa lokasi fisik.
