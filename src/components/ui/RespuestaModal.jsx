import clsx from "clsx";

/** Región accesible de mensajes con el contrato común de respuestas. */
export default function RespuestaModal({ respuesta, className = "" }) {
  if (!respuesta?.mensaje) return null;
  const esError = respuesta.tipo === "error";
  return (
    <div
      role={esError ? "alert" : "status"}
      data-campo={respuesta.campo || undefined}
      className={clsx(
        "rounded-xl border px-3 py-2.5 text-sm",
        esError ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-primary/20 bg-emerald-primary/10 text-emerald-900",
        className,
      )}
    >
      {respuesta.mensaje}
    </div>
  );
}
