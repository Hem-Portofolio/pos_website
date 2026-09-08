const map = {
  pending: "bg-amber/15 text-[#8A5A00] border-amber/30",
  cooking: "bg-terracotta/10 text-terracotta border-terracotta/20",
  ready: "bg-sage/15 text-[#2F5D2F] border-sage/30",
  paid: "bg-stone-100 text-stone-600 border-stone-200",
  available: "bg-sage/15 text-[#2F5D2F] border-sage/30",
  occupied: "bg-terracotta/10 text-terracotta border-terracotta/20",
  reserved: "bg-brass/20 text-[#6B4F1D] border-brass/40",
};

export function Badge({ status, children, className = "" }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border tabular ${map[status] || "bg-stone-100 border-stone-200"} ${className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${status === "cooking" || status === "pending" ? "animate-pulse" : ""}`} style={{ background: "currentColor" }} />
      {children || status}
    </span>
  );
}
