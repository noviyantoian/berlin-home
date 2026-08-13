import { MIN_PASSWORD_LENGTH } from "./users";

/**
 * Maps the stable ?ok= / ?err= codes emitted by /api/admin routes into
 * Indonesian copy. Unknown codes fall back to a generic line so a crafted
 * query string can never render arbitrary text.
 */
export const SUCCESS_MESSAGES: Record<string, string> = {
  created: "Pengguna baru berhasil dibuat.",
  password: "Password berhasil diperbarui.",
  role: "Hak akses berhasil diubah.",
  active: "Status akun berhasil diubah.",
  deleted: "Pengguna berhasil dihapus.",
};

export const ERROR_MESSAGES: Record<string, string> = {
  invalid_username: "Username harus 3–32 karakter: huruf kecil, angka, titik, garis bawah, atau strip.",
  invalid_name: "Nama tampilan minimal 2 karakter.",
  weak_password: `Password minimal ${MIN_PASSWORD_LENGTH} karakter.`,
  invalid_role: "Hak akses tidak dikenali.",
  duplicate: "Username itu sudah dipakai.",
  not_found: "Pengguna tidak ditemukan.",
  last_admin: "Ini satu-satunya admin aktif. Tunjuk admin lain dulu sebelum mengubahnya.",
  self_target: "Kamu tidak bisa mengubah hak akses, menonaktifkan, atau menghapus akunmu sendiri.",
  reserved_username: "Username itu dipakai admin utama dari konfigurasi server.",
  mismatch: "Konfirmasi password tidak cocok.",
  wrong_password: "Password saat ini salah.",
  bootstrap: "Password admin utama diatur lewat ADMIN_PASSWORD_HASH di server, bukan dari halaman ini.",
  db: "Gagal menghubungi database. Coba lagi sebentar.",
};

export function successMessage(code: string | null): string | null {
  if (!code) return null;
  return SUCCESS_MESSAGES[code] ?? "Perubahan tersimpan.";
}

export function errorMessage(code: string | null): string | null {
  if (!code) return null;
  return ERROR_MESSAGES[code] ?? "Terjadi kesalahan. Coba lagi.";
}
