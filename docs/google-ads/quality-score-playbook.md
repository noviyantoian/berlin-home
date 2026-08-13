# Quality Score Playbook — Berlin Home Spa

**Tujuan:** naikkan Quality Score ke ≥7, angkat *Landing Page Experience* dari
"Below average" → "Above average", turunkan Avg CPC (baseline **Rp 11.528**).

**Basis data:** Search terms & Search keyword report, 3 Jun – 2 Jul 2026
(222 klik, 47 konversi, biaya Rp 2,56 jt, Avg CPC Rp 11.528, conv rate 21%).

---

## 1. Diagnosis

Quality Score = 3 komponen: **Expected CTR + Ad Relevance + Landing Page Experience**.

Dari report, pola jelas:

- **`Landing page exp.` = "Below average" di ~90% keyword.** Ini yang mengunci
  QS di 3–7 dan menaikkan CPC.
- **`Ad relevance` sudah banyak "Above average"** → jadi bottleneck utamanya
  **landing page**, bukan iklan.
- Penyebab LP exp rendah: **message match lemah** — kata yang diketik user
  (panggilan, 24 jam, terdekat, nama kota, "massage" versi Inggris) hampir tidak
  muncul di halaman lama; H1 lama "Pijat profesional, di tempat Anda" tidak
  memuat token "panggilan" / "24 jam" / "Bali".
- Budget bocor ke **klik salah-intent**: layanan dewasa, kota luar Bali, riset
  brand kompetitor → bounce → memperburuk sinyal LP exp + menaikkan CPC.

---

## 2. Sudah dikerjakan di landing page (deploy landing = langkah 1)

Semua ini menyerang langsung faktor *Landing Page Experience* Google:

| Perubahan | Faktor QS yang diperbaiki |
|---|---|
| H1 + eyebrow + lead di-*rewrite* memuat **pijat/massage panggilan · 24 jam · Bali · nama kota** | Relevansi / message match |
| **DKI** — hero mengikuti kota dari URL iklan (`?loc=Canggu` / `?k={keyword}`) | Message match per-kota |
| **Section FAQ baru** + **FAQPage schema** (8 Q&A sesuai intent asli) | Konten relevan & original; menurunkan bounce |
| Baris **English** di hero (untuk pencari turis Seminyak/Canggu/Ubud) | Relevansi audiens asing |
| Chip bukti (24 jam · datang ke lokasi · bersertifikat · gratis transport) | Kejelasan & transparansi |
| Framing **"profesional & terapeutik, bukan layanan dewasa"** di FAQ | Menyaring intent salah + trust |
| Area diperluas + reassurance "terapis **terdekat**" | Match intent "terdekat / near me" |
| Title/description + schema (business + areaServed kota) di-message-match | Relevansi + rich result |
| Fix **LCP** hero (teks paint langsung, animasi tak lagi menahan) | Kecepatan / mobile (faktor LP exp) |
| Link **FAQ** ditambah ke nav | Kemudahan navigasi |

> Harga **tidak** ditampilkan (sesuai keputusan). Kompensasi transparansi:
> "gratis transport, tanpa biaya tersembunyi" + FAQ biaya.

**Verifikasi teknis:** build `exit 0`; LCP ≈ hero image (bukan teks); tidak ada
error console; tidak ada horizontal scroll di 375px; DKI XSS-safe (whitelist +
textContent, fallback ke "Seluruh Bali").

---

## 3. Yang perlu KAMU kerjakan di Google Ads

Landing page hanya 1 dari 3 komponen. Agar QS ≥7 + CPC turun, lakukan ini:

### 3a. Pasang negative keywords — **dampak CPC tercepat**
Paste `negative-keywords.txt` ke level Campaign. Ini menghentikan klik dewasa /
luar-Bali / riset kompetitor yang membuang budget dan menekan relevansi.

### 3b. Pecah 1 ad group broad → ad group bertema ketat
Sekarang semua keyword menumpuk di "Ad group 1" (Broad). Itu pembunuh QS.
Pecah jadi tema, tiap tema keyword-nya rapat + iklan + landing yang cocok:

| Ad group | Keyword inti | Final URL |
|---|---|---|
| Pijat Panggilan | pijat panggilan bali/denpasar/kuta/canggu | `/?loc={keyword}` atau `/` |
| Massage 24 Jam | massage 24 jam bali, massage bali 24 jam | `/` |
| Spa/Refleksi Panggilan | spa panggilan bali, refleksi panggilan | `/` |
| Kota — Seminyak | massage/pijat panggilan seminyak | `/?loc=Seminyak` |
| Kota — Canggu | massage/pijat panggilan canggu | `/?loc=Canggu` |
| Kota — Denpasar | massage/pijat panggilan denpasar | `/?loc=Denpasar` |

- Pindahkan converter terbukti ke **Phrase/Exact** (mis. `[massage panggilan bali]`,
  `[massage 24 jam di bali]`, `[pijat panggilan denpasar]`).
- Sisakan sedikit Broad **hanya** dengan Smart Bidding + negative list aktif.

### 3c. Wiring DKI (landing page sudah mendukung)
Halaman membaca `?loc=` dan `?k=`. Dua cara:

1. **Per kota (paling rapi):** set Final URL ad group kota ke
   `https://berlinhomespa.com/?loc=Canggu` → hero otomatis jadi
   *"Pijat & Massage Panggilan — Area Canggu, Bali"*.
2. **Otomatis dari keyword:** Final URL = `https://berlinhomespa.com/?k={keyword}`
   (ValueTrack `{keyword}` menyisipkan keyword yang match; halaman mengambil nama
   kota bila ada). Kota yang dikenali: Denpasar, Seminyak, Canggu, Kuta, Legian,
   Sanur, Jimbaran, Nusa Dua, Uluwatu, Kerobokan, Ubud, Gianyar, Tabanan, Renon.

### 3d. RSA baru (angkat Ad Relevance + Expected CTR)
Copywriting: message match + benefit + urgensi (24 jam) + trust + CTA jelas.

**Headlines (15):**
1. `{KeyWord:Pijat Panggilan Bali}`  ← DKI, biarkan menyerap keyword
2. Pijat Panggilan Bali 24 Jam
3. Massage Panggilan ke Lokasimu
4. Terapis Bersertifikat Datang
5. Gratis Transport Seluruh Bali
6. Buka 24 Jam — Pesan via WA
7. Spa & Refleksi ke Rumah/Hotel
8. Massage 24 Jam di Bali
9. Datang ke Villa & Apartemen
10. Respons Cepat, Terapis Terdekat
11. Pijat Profesional & Higienis
12. Full Body · Refleksi · Lulur
13. Pilih Terapis Pria/Wanita
14. Denpasar Seminyak Canggu Kuta
15. Booking Mudah via WhatsApp

> Pin **Headline 1** = `{KeyWord:...}` dan **Headline 2** ke posisi 1–2 agar token
> keyword selalu muncul di depan.

**Descriptions (4):**
1. Pijat & massage panggilan 24 jam di seluruh Bali. Terapis bersertifikat datang ke lokasi Anda.
2. Gratis transport, tanpa biaya tersembunyi. Pesan cepat via WhatsApp, terapis terdekat siap.
3. Untuk rumah, hotel, villa & apartemen. Denpasar, Seminyak, Canggu, Kuta, Sanur, Ubud.
4. Buka 24 jam setiap hari. Full body, refleksi, vitalitas, lulur. Profesional & higienis.

### 3e. Assets (naikkan CTR + ruang iklan)
- **Sitelinks:** Layanan · Area Layanan · Cara Pesan · FAQ
- **Callouts:** 24 Jam · Gratis Transport · Terapis Bersertifikat · Higienis · Datang ke Lokasi
- **Structured snippet** (Type = Services): Pijat Tradisional, Refleksi, Vitalitas, Lulur
- **Call/WhatsApp:** pastikan nomor `+62 823-3307-8188` konsisten dengan situs (NAP).

---

## 4. Cara ukur hasil

- QS di-refresh Google secara berkala (harian) setelah ada impresi/klik baru.
  Kolom yang dipantau: **Quality Score**, **Landing page exp.**, **Ad relevance**.
- Target: LP exp "Below" → "Average/Above" dalam 1–2 minggu setelah trafik baru
  mengenai landing yang sudah diperbaiki.
- Metrik bisnis: Avg CPC turun, CTR naik, Cost/conv turun.

---

## 5. Urutan eksekusi (prioritas dampak)

1. **Deploy landing page** (perubahan di repo ini). — prasyarat semua.
2. **Pasang negative keywords.** — efek CPC tercepat.
3. **Ganti Final URL** ke pola DKI (`?loc=` per kota / `?k={keyword}`).
4. **Pecah ad group** + set match type Phrase/Exact untuk converter.
5. **Ganti RSA** + pasang assets.
6. Pantau 1–2 minggu, iterasi negatives dari Search terms baru.
