# PRODUCT.md — Warung POS

## Produk
Warung POS — website Point of Sale restoran untuk operasional harian. Satu SPA melayani 4 role dalam alur: Pelayan input per meja → Dapur masak realtime → Kasir bayar → Owner kelola & laporan.

## Audience & Scene
- **Owner/Admin**: cek penjualan, kelola menu/kategori/meja/staf, lihat laporan. Pakai desktop di kantor, butuh angka jelas.
- **Kasir**: POS terminal cepat, proses pembayaran tunai/QRIS, cetak struk 58mm. Frekuensi tinggi, butuh tombol besar & total terbaca dari jarak.
- **Pelayan**: bawa tablet, pilih meja → tambah menu → kirim ke dapur. Butuh peta meja scan-able.
- **Dapur**: layar KDS di dinding dapur, kondisi terang/silau, lihat dari 2m. Realtime, timer, status cooking/ready.

## Mekanisme unik
Satu sumber truth Supabase + RLS per role, semua write lewat REST API Express, KDS subscribe Realtime channel — bukan polling.

## Mode per surface
- Semua surface: **Operate**. Keberhasilan = selesaikan tugas <3 tap, state selalu terlihat, affordance familiar.

## Janji
- Auth Supabase Auth + JWT di header `Authorization`, verifikasi di backend, RLS di DB.
- Response konsisten `{ success, data, message }`, async/await, tanpa hardcode credential.
- Modular untuk fase selanjutnya (menu, order, KDS, payment, laporan).

## Batasan
- Bahasa Indonesia penuh di UI.
- Cetak struk via browser `window.print()` dengan `@media print`.
- Frontend jalan dengan mock bila Supabase belum siap.
