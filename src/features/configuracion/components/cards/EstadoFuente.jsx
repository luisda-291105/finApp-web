export default function EstadoFuente({ activo }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${activo ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"}`}>
      <span className={`h-2 w-2 rounded-full ${activo ? "animate-pulse bg-emerald-600" : "bg-slate-500"}`} aria-hidden="true" />
      {activo ? "Activa" : "Inactiva"}
    </span>
  );
}
