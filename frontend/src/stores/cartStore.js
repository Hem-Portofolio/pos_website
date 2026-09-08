import { create } from "zustand";

export const useCartStore = create((set, get) => ({
  tableId: null,
  items: [], // { menu_item_id, name, price, qty, note, image_url }
  setTable: (tableId) => set({ tableId }),
  add: (item) =>
    set((s) => {
      const idx = s.items.findIndex((x) => x.menu_item_id === item.id);
      if (idx >= 0) {
        const copy = [...s.items];
        copy[idx] = { ...copy[idx], qty: copy[idx].qty + 1 };
        return { items: copy };
      }
      return { items: [...s.items, { menu_item_id: item.id, name: item.name, price: item.price, qty: 1, note: "", image_url: item.image_url }] };
    }),
  inc: (id) => set((s) => ({ items: s.items.map((x) => (x.menu_item_id === id ? { ...x, qty: x.qty + 1 } : x)) })),
  dec: (id) => set((s) => ({ items: s.items.flatMap((x) => (x.menu_item_id === id ? (x.qty <= 1 ? [] : [{ ...x, qty: x.qty - 1 }]) : [x])) })),
  remove: (id) => set((s) => ({ items: s.items.filter((x) => x.menu_item_id !== id) })),
  setNote: (id, note) => set((s) => ({ items: s.items.map((x) => (x.menu_item_id === id ? { ...x, note } : x)) })),
  clear: () => set({ items: [], tableId: null }),
  total: () => get().items.reduce((a, b) => a + b.price * b.qty, 0),
  count: () => get().items.reduce((a, b) => a + b.qty, 0),
}));
