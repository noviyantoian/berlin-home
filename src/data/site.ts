// Central content + WhatsApp deep links (single source of truth).

export const WA_NUMBER = "6282333078188";
export const WA_DISPLAY = "0823 3307 8188";
export const IG_URL = "https://instagram.com/";

export function waLink(text: string): string {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
}

export const WA_GENERAL = waLink(
  "Halo Berlin Home Spa, saya ingin memesan layanan pijat. Mohon info ketersediaan terapis & jadwal. Terima kasih."
);

export const navLinks = [
  { href: "#layanan", label: "Layanan" },
  { href: "#cara-kerja", label: "Cara Kerja" },
  { href: "#alasan", label: "Keunggulan" },
  { href: "#area", label: "Area" },
  { href: "#faq", label: "FAQ" },
];

// Short, keyword-aligned proof chips shown under the hero headline.
// Tokens deliberately mirror top search terms: "24 jam", outcall ("datang ke
// lokasi Anda"), "bersertifikat", "gratis transport".
export const heroChips = [
  "Buka 24 jam",
  "Datang ke lokasi Anda",
  "Terapis bersertifikat",
  "Gratis transport",
];

// English accent line — a large share of Seminyak/Canggu/Ubud searches are in
// English (outcall massage bali, 24 hour massage, canggu massage). Shown small
// under the Indonesian lead so foreign visitors grasp the offer instantly.
export const heroTaglineEn =
  "Professional mobile massage & spa — to your door, 24/7 across Bali.";

// Whitelist for dynamic-location insertion (DKI). When an ad sends visitors to
// `/?loc=Canggu` (or the keyword contains a known area), the hero echoes that
// area for tight message match. Whitelist-only + textContent keeps it XSS-safe.
export const dkiCities = [
  "Denpasar",
  "Seminyak",
  "Canggu",
  "Kuta",
  "Legian",
  "Sanur",
  "Jimbaran",
  "Nusa Dua",
  "Uluwatu",
  "Kerobokan",
  "Ubud",
  "Gianyar",
  "Tabanan",
  "Renon",
];

export type Service = {
  no: string;
  id: string;
  title: string;
  desc: string;
  duration: string;
  img: string;
  alt: string;
  benefits: string[];
  wa: string;
};

export const services: Service[] = [
  {
    no: "01",
    id: "tradisional",
    title: "Pijat Tradisional Full Body",
    desc: "Teknik pijat Jawa tradisional untuk merilekskan otot tegang dan meningkatkan kualitas tidur.",
    duration: "60 / 90 menit",
    img: "/assets/images/service-tradisional.webp",
    alt: "Tangan terapis berseragam memijat punggung klien yang tertutup handuk.",
    benefits: ["Relaksasi otot", "Tidur lebih nyenyak"],
    wa: waLink("Halo Berlin Home Spa, saya tertarik dengan layanan Pijat Tradisional Full Body. Mohon info jadwal & detailnya."),
  },
  {
    no: "02",
    id: "vitalitas",
    title: "Full Body & Vitalitas",
    desc: "Pijat seluruh tubuh dengan stimulasi titik energi untuk mengembalikan stamina dan kebugaran.",
    duration: "90 menit",
    img: "/assets/images/service-vitalitas.webp",
    alt: "Terapis berseragam spa memijat punggung klien untuk pemulihan otot.",
    benefits: ["Stamina", "Tubuh lebih bugar"],
    wa: waLink("Halo Berlin Home Spa, saya tertarik dengan layanan Full Body & Vitalitas. Mohon info jadwal & detailnya."),
  },
  {
    no: "03",
    id: "lulur",
    title: "Full Body & Lulur Scrub",
    desc: "Pijat tubuh dilanjutkan lulur scrub untuk mengangkat sel kulit mati dan mencerahkan kulit secara alami.",
    duration: "90–120 menit",
    img: "/assets/images/service-lulur.webp",
    alt: "Perawatan lulur dengan bahan scrub alami seperti beras dan kunyit di meja spa.",
    benefits: ["Kulit lebih cerah", "Eksfoliasi"],
    wa: waLink("Halo Berlin Home Spa, saya tertarik dengan layanan Full Body & Lulur Scrub. Mohon info jadwal & detailnya."),
  },
  {
    no: "04",
    id: "refleksi",
    title: "Refleksi & Full Body",
    desc: "Terapi titik saraf kaki dan tangan untuk melancarkan peredaran darah, dilanjutkan pijat seluruh tubuh.",
    duration: "90 menit",
    img: "/assets/images/service-refleksi.webp",
    alt: "Terapis melakukan terapi refleksi pada telapak kaki klien di atas handuk.",
    benefits: ["Sirkulasi darah", "Kurangi pegal"],
    wa: waLink("Halo Berlin Home Spa, saya tertarik dengan layanan Refleksi & Full Body. Mohon info jadwal & detailnya."),
  },
];

export const steps = [
  { icon: "ph:chat-circle", title: "Hubungi Admin", desc: "Chat WhatsApp, pilih layanan dan waktu yang sesuai jadwal Anda." },
  { icon: "ph:house-line", title: "Terapis Datang", desc: "Terapis tiba ke lokasi Anda, lengkap dengan perlengkapan yang higienis." },
  { icon: "ph:flower-lotus", title: "Nikmati & Pulih", desc: "Rasakan manfaat pijat profesional tanpa harus keluar rumah." },
];

export const features = [
  { icon: "ph:seal-check", title: "Terapis Bersertifikat", desc: "Setiap terapis melalui seleksi ketat dan pelatihan profesional di bidang spa & refleksologi." },
  { icon: "ph:shield-check", title: "Higienis & Aman", desc: "Terapis dalam kondisi sehat dan mengikuti protokol kebersihan ketat sebelum serta setelah sesi." },
  { icon: "ph:users", title: "Bebas Pilih Terapis", desc: "Pilih terapis pria atau wanita sesuai preferensi Anda. Hubungi admin untuk info ketersediaan." },
  { icon: "ph:moped", title: "Gratis Transportasi", desc: "Tanpa biaya tambahan untuk perjalanan terapis ke lokasi Anda di seluruh area Bali." },
  { icon: "ph:clock", title: "Layanan 24 Jam", desc: "Tersedia setiap hari, pagi hingga dini hari, sesuaikan dengan jadwal Anda." },
  { icon: "ph:map-pin", title: "Menjangkau Seluruh Bali", desc: "Melayani seluruh wilayah Bali, langsung ke rumah, hotel, villa, atau apartemen Anda." },
];

export type Testimonial = { name: string; role: string; quote: string };

export const testimonials: Testimonial[] = [
  { name: "Michael", role: "Villa, Seminyak", quote: "Terapisnya sangat profesional, badan terasa segar dan ringan setelah sesi. Recommended." },
  { name: "Ko Johan", role: "Rumah, Denpasar", quote: "Tidak perlu keluar rumah, terapis datang tepat waktu dan tekniknya oke banget." },
  { name: "Budi", role: "Hotel, Nusa Dua", quote: "Badan jadi lebih bugar, pasti pesan lagi. Pelayanannya memuaskan." },
  { name: "Julia", role: "Apartemen, Canggu", quote: "Profesional dan nyaman, cocok buat yang sibuk dan tidak ada waktu ke spa." },
  { name: "Shinta", role: "Rumah, Sanur", quote: "Waktu fleksibel, teknik yang tepat. Sangat membantu pemulihan setelah aktivitas padat." },
  { name: "Dini", role: "Villa, Ubud", quote: "Me-time terbaik. Setelah pijat, saya merasa lebih bertenaga dan siap beraktivitas lagi." },
];

export const regions = [
  { name: "Bali Selatan", detail: "Kuta · Legian · Seminyak · Canggu · Kerobokan · Jimbaran · Nusa Dua · Uluwatu" },
  { name: "Denpasar & Sanur", detail: "Denpasar · Sanur · Renon · Sunset Road" },
  { name: "Ubud & Gianyar", detail: "Ubud · Gianyar · Tabanan · sekitarnya" },
];

// Pilihan wilayah Bali untuk form pemesanan (disimpan di kolom `city`).
export const baliAreas = [
  "Kuta",
  "Legian",
  "Seminyak",
  "Canggu",
  "Kerobokan",
  "Denpasar",
  "Sanur",
  "Jimbaran",
  "Nusa Dua",
  "Uluwatu",
  "Ubud",
  "Gianyar",
  "Tabanan",
  "Area lain di Bali",
];

// FAQ — direct-response answers mapped to real search intents from the Ads
// search-terms report (panggilan/outcall, 24 jam, terdekat, area, gender,
// professional/therapeutic). Doubles as relevant, original content for Landing
// Page Experience and powers FAQPage structured data.
export type Faq = { q: string; a: string };

export const faqs: Faq[] = [
  {
    q: "Apakah terapis benar-benar datang ke lokasi saya?",
    a: "Ya. Berlin Home Spa adalah layanan pijat panggilan (outcall) — terapis datang langsung ke rumah, hotel, villa, atau apartemen Anda di seluruh Bali. Anda tidak perlu ke mana-mana.",
  },
  {
    q: "Area mana saja yang dilayani di Bali?",
    a: "Kami melayani seluruh Bali: Denpasar, Seminyak, Canggu, Kuta, Legian, Kerobokan, Sanur, Jimbaran, Nusa Dua, Uluwatu, Ubud, dan sekitarnya. Sebutkan lokasi Anda saat memesan, dan kami arahkan terapis terdekat.",
  },
  {
    q: "Apakah layanan tersedia 24 jam?",
    a: "Ya, kami buka 24 jam setiap hari. Anda bisa memesan pagi, siang, malam, hingga dini hari — cukup chat WhatsApp dan kami cek ketersediaan terapis saat itu juga.",
  },
  {
    q: "Layanan apa saja dan berapa lama durasinya?",
    a: "Tersedia pijat tradisional full body, full body & vitalitas, full body & lulur scrub, serta refleksi & full body. Durasi 60–120 menit sesuai pilihan, dikonfirmasi saat pemesanan.",
  },
  {
    q: "Bisa memilih terapis pria atau wanita?",
    a: "Bisa. Sampaikan preferensi Anda (pria atau wanita) saat memesan, dan kami sesuaikan dengan ketersediaan terapis di area Anda.",
  },
  {
    q: "Apakah ini layanan pijat yang profesional?",
    a: "Sepenuhnya profesional dan terapeutik. Terapis kami bersertifikat, mengikuti protokol higienis, dan berfokus pada relaksasi serta pemulihan tubuh. Ini bukan layanan dewasa.",
  },
  {
    q: "Apakah ada biaya transport?",
    a: "Tidak. Transport terapis ke lokasi Anda gratis di seluruh area layanan Bali — tanpa biaya tersembunyi. Detail layanan dikonfirmasi via WhatsApp sebelum sesi.",
  },
  {
    q: "Bagaimana cara memesan?",
    a: "Klik tombol WhatsApp, isi nama, nomor, dan wilayah Anda. Admin akan mengonfirmasi layanan, jadwal, dan terapis, lalu terapis datang ke lokasi Anda.",
  },
];
