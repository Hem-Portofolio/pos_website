export const rupiah = (n) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n || 0);

export const fmtTime = (d) =>
  new Date(d).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

export const fmtDate = (d) =>
  new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });

export function elapsedSince(iso) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  const m = Math.floor(s / 60);
  if (m < 1) return `${s}d`;
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  return `${h}j ${m % 60}m`;
}
