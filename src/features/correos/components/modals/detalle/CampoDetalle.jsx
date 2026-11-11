/** Sección visual reutilizable de la ficha del correo. */
export default function CampoDetalle({ titulo, children, className = "" }) {
  return <section className={`min-w-0 rounded-xl border border-border-line/60 bg-white p-3 sm:p-4 ${className}`}>
    <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-text">{titulo}</h3>
    <div className="mt-1.5 break-words text-sm leading-relaxed text-bg-dark sm:mt-2">{children}</div>
  </section>;
}
