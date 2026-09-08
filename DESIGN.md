# DESIGN.md — Warung Modern (Operate)

## Thesis
POS yang terasa seperti buku nota dan tiket dapur — bukan dashboard SaaS. Kertas hangat, tinta pekat, aksen terracotta hanya untuk aksi.

## Palet
- Ink #0F1115 (teks, header)
- Paper #FFFDF7 (ground), Stone #E8E0D6 / #F3EFE8 (card, border)
- Terracotta #E84C2F (primary action)
- Brass #C9A86A (highlight, active)
- Sage #6B8F6B (available/done), Amber #E6A23C (waiting)
- Kontras body ≥4.5:1, large ≥3:1. Di surface berwarna, teks sekunder tint dari hue, bukan abu netral.

## Tipografi
- Display: Fraunces / Instrument Serif (nomor meja, total tabular)
- Body/UI: Inter / Geist Sans (workhorse)
- Scale: display max ~3.5rem, body 14-15px, tabular-nums untuk harga/total/timer.
- Measure 65–75ch, heading balance, tracking ≥ -0.04em.

## Material & Komponen
- Kartu: border 1px stone + shadow offset blur `0 1px 3px rgba(15,17,21,.08), 0 12px 32px rgba(15,17,21,.06)` — bukan halo.
- Ticket: perforasi (dashed) di struk, header meja seperti karcis.
- Status dot berdenyut (pending/ memasak/ siap).
- Button primary terracotta, ghost stone, brass untuk active. Target 44-48px.
- Input label di atas, bukan placeholder-only. Focus ring brass.

## Layout
- Desktop 1280+: sidebar 220px + content. Tablet: bottom nav untuk Pelayan/Kasir.
- KDS: 3 kolom kanban full-bleed, kartu besar, timer tabular.
- POS: 3 kolom (kategori | grid menu | keranjang sticky).
- Spacing: grup rapat, antar-section lega, jarak atas heading > bawah.

## Motion
- Satu momen authored: masuk KDS & drawer cart (spring exponential), bukan hover scattered.
- Realtime: pulse dot + ding (opsional) saat pesanan baru.

## Scene
- Dapur terang, layar dilihat dari jauh → kontras tinggi, type besar.
- Kasir indoor kas register → butuh total besar, tombol bayar dominan.

## Larangan (craft-floor)
- Tanpa kicker/eyebrow di atas heading.
- Tanpa gradient text, tanpa glass dekoratif, tanpa border-left tebal, tanpa hard shadow neobrutalist.
- Tanpa kartu seragam icon+heading+text sebagai struktur halaman.
