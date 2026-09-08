export function Input({ label, error, className = "", ...props }) {
  return (
    <label className="block">
      {label && <span className="block text-xs font-semibold tracking-wide text-stone-600 mb-1.5">{label}</span>}
      <input
        className={`w-full h-11 px-3.5 rounded-xl border bg-white text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-brass focus:border-brass ${error ? "border-red-300" : "border-stone-200"} ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-600 mt-1 block">{error}</span>}
    </label>
  );
}
export function Textarea({ label, ...props }) {
  return (
    <label className="block">
      {label && <span className="block text-xs font-semibold tracking-wide text-stone-600 mb-1.5">{label}</span>}
      <textarea className="w-full min-h-[88px] p-3.5 rounded-xl border border-stone-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brass" {...props} />
    </label>
  );
}
