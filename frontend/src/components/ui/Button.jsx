export function Button({ variant = "primary", size = "md", className = "", ...props }) {
  const base = "inline-flex items-center justify-center font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass disabled:opacity-50 disabled:pointer-events-none";
  const variants = {
    primary: "bg-terracotta text-white hover:bg-terracotta-hover shadow-card",
    ghost: "bg-white border border-stone-200 hover:bg-stone-100 text-ink",
    brass: "bg-brass text-ink hover:brightness-95",
    subtle: "bg-stone-100 text-ink hover:bg-stone-200",
  };
  const sizes = { sm: "h-9 px-3.5 text-sm rounded-xl", md: "h-11 px-5 text-[14px] rounded-xl", lg: "h-[52px] px-7 text-[15px] rounded-2xl", icon: "h-11 w-11 rounded-xl" };
  return <button className={`${base} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`} {...props} />;
}
