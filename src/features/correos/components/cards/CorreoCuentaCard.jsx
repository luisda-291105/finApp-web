/**
 * @uso        Tarjeta de fuente de correo o cuenta Gmail registrada
 * @funciones  CorreoCuentaCard({ fuente, seleccionada, cantidadMensajes, alAbrir })
 * @datos      Presenta la dirección/cuenta y su cantidad de mensajes consultados
 * @eventos    Click para abrir la bandeja de esa dirección
 * @estados    Ninguno
 * @usadoPor   CorreosPage
 */
/** Presenta una dirección registrada; las consultas a Gmail son automáticas para todas. */
export default function CorreoCuentaCard({
  fuente,
  seleccionada,
  cantidadMensajes,
  alAbrir,
}) {
  const esCuenta = fuente.tipoTarjeta === "CUENTA_GMAIL";
  return (
    <button
      type="button"
      onClick={alAbrir}
      aria-label={`Ver correos de ${fuente.contenido}`}
      className={`rounded-2xl border p-4 text-left transition-colors hover:border-emerald-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-accent ${seleccionada ? "border-emerald-primary bg-emerald-primary/10" : "border-border-line/40 bg-bg-cream/60"}`}
    >
      <span className="block text-xs uppercase tracking-wide text-slate-text">
        {esCuenta ? "Cuenta Gmail" : "Fuente registrada"}
      </span>
      <span className="mt-1 block break-all font-medium text-bg-dark">
        {fuente.contenido}
      </span>
      {cantidadMensajes > 0 && (
        <span className="mt-2 block text-xs text-slate-text">
          {cantidadMensajes} mensajes consultados
        </span>
      )}
      <span className="mt-2 block text-xs font-medium text-emerald-primary">
        Abrir consultas
      </span>
    </button>
  );
}
