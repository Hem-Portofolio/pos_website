export const categories = [
  { id: "c1", name: "Nasi & Utama" },
  { id: "c2", name: "Mie & Sop" },
  { id: "c3", name: "Ayam & Ikan" },
  { id: "c4", name: "Minuman" },
  { id: "c5", name: "Penutup" },
];

export const menuItems = [
  { id: "m1", name: "Nasi Goreng Kampung", price: 32000, category_id: "c1", image_url: "https://images.unsplash.com/photo-1603133872875-ca2a98a0a862?w=400&q=80", is_available: true },
  { id: "m2", name: "Ayam Bakar Madu", price: 38000, category_id: "c3", image_url: "https://images.unsplash.com/photo-1534766555764-ce878a5e3a2b?w=400&q=80", is_available: true },
  { id: "m3", name: "Soto Ayam Lamongan", price: 28000, category_id: "c2", image_url: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&q=80", is_available: true },
  { id: "m4", name: "Mie Goreng Jawa", price: 27000, category_id: "c2", image_url: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&q=80", is_available: false },
  { id: "m5", name: "Ikan Gurame Asam Manis", price: 52000, category_id: "c3", image_url: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&q=80", is_available: true },
  { id: "m6", name: "Es Teh Manis", price: 8000, category_id: "c4", image_url: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80", is_available: true },
  { id: "m7", name: "Kopi Tubruk", price: 12000, category_id: "c4", image_url: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400&q=80", is_available: true },
  { id: "m8", name: "Es Pisang Ijo", price: 18000, category_id: "c5", image_url: "https://images.unsplash.com/photo-1488477181946-64290103bb53?w=400&q=80", is_available: true },
];

export const tables = [
  { id: "t1", number: 1, status: "available" }, { id: "t2", number: 2, status: "occupied" },
  { id: "t3", number: 3, status: "occupied" }, { id: "t4", number: 4, status: "available" },
  { id: "t5", number: 5, status: "reserved" }, { id: "t6", number: 6, status: "available" },
  { id: "t7", number: 7, status: "occupied" }, { id: "t8", number: 8, status: "available" },
  { id: "t9", number: 9, status: "available" }, { id: "t10", number: 10, status: "occupied" },
  { id: "t11", number: 11, status: "available" }, { id: "t12", number: 12, status: "reserved" },
];

export const ordersMock = [
  {
    id: "o1", table_id: "t2", status: "pending", total: 68000, created_at: new Date(Date.now() - 1000*60*4).toISOString(),
    items: [{ menu_item_id: "m1", qty: 1, note: "Pedas sedang", subtotal: 32000 }, { menu_item_id: "m6", qty: 2, subtotal: 16000 }],
    table_number: 2, waiter: "Sari"
  },
  {
    id: "o2", table_id: "t3", status: "cooking", total: 92000, created_at: new Date(Date.now() - 1000*60*11).toISOString(),
    items: [{ menu_item_id: "m2", qty: 2, subtotal: 76000 }],
    table_number: 3, waiter: "Budi"
  },
  {
    id: "o3", table_id: "t7", status: "ready", total: 44000, created_at: new Date(Date.now() - 1000*60*18).toISOString(),
    items: [{ menu_item_id: "m3", qty: 1, subtotal: 28000 }, { menu_item_id: "m7", qty: 1, subtotal: 12000 }],
    table_number: 7, waiter: "Sari"
  },
  {
    id: "o4", table_id: "t10", status: "pending", total: 52000, created_at: new Date(Date.now() - 1000*60*2).toISOString(),
    items: [{ menu_item_id: "m5", qty: 1, subtotal: 52000 }],
    table_number: 10, waiter: "Riko"
  },
];

export const demoUsers = [
  { role: "admin", email: "admin@warungpos.id", pass: "admin123", name: "Owner", label: "Admin" },
  { role: "user", email: "user@warungpos.id", pass: "user123", name: "Pelanggan", label: "User" },
];
