export function Card({ className = "", ...props }) {
  return <div className={`bg-white border border-stone-200 rounded-2xl shadow-card ${className}`} {...props} />;
}
export function CardHeader({ className = "", ...props }) {
  return <div className={`p-4 sm:p-5 border-b border-stone-100 ${className}`} {...props} />;
}
export function CardBody({ className = "", ...props }) {
  return <div className={`p-4 sm:p-5 ${className}`} {...props} />;
}
