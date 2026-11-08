import EstadoFuente from "./EstadoFuente";

export default function FuenteItem({ fuente, gmailConectado, cuentaVinculada, alAbrir }) {
  return (
    <button
      type="button"
      onClick={alAbrir}
      aria-label={`Ver fuente ${fuente.contenido || fuente.tipo}`}
      className="flex min-h-20 w-full min-w-0 items-center justify-between gap-4 rounded-xl border border-border-line/40 bg-bg-cream/60 p-4 text-left transition-colors hover:border-emerald-primary/50 hover:bg-emerald-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary"
    >
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-semibold uppercase tracking-wide text-emerald-primary">{fuente.tipo || "OTRO"}</span>
        <span className="mt-1 block break-all text-sm font-medium text-bg-dark">{fuente.contenido || "-"}</span>
        {fuente.estado !== false && gmailConectado && cuentaVinculada && (
          <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-800">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-600" aria-hidden="true" />
            Cuenta Gmail conectada
          </span>
        )}
      </span>
      <span className="flex shrink-0 items-center gap-3">
        <EstadoFuente activo={fuente.estado !== false} />
        <span aria-hidden="true" className="text-lg text-slate-text">›</span>
      </span>
    </button>
  );
}
