/**
 * @uso        Tarjeta resumida de una suscripción detectada en Gmail
 * @funciones  SuscripcionGmailCard({ suscripcion, alAbrir })
 * @datos      Presenta nombre, cuenta, remitente y actividad reciente
 * @eventos    Abre el modal con el detalle y las acciones de la suscripción
 * @estados    Ninguno
 * @usadoPor   SuscripcionesPage
 */
import { Mail, Tag } from "lucide-react";
import { Card } from "../../../../components/ui";

function textoActividad(cantidad) {
  if (cantidad == null) return "Actividad reciente no disponible";
  if (cantidad > 20) return "Más de 20 correos recientes";
  if (cantidad >= 10) return "Entre 10 y 20 correos recientes";
  return "10 correos recientes o menos";
}

/** Tarjeta breve; los detalles y las opciones de baja viven en el modal. */
export default function SuscripcionGmailCard({ suscripcion, alAbrir }) {
  const etiquetas = (suscripcion.categorias || []).map((categoria) => categoria === "CATEGORY_PROMOTIONS" ? "Promociones" : "Actualizaciones");
  const tieneBaja = Boolean(suscripcion.urlBaja || suscripcion.mailtoBaja);

  return (
    <Card como="li" className="p-4">
      <button type="button" onClick={alAbrir} aria-label={`Ver detalles de la suscripción de ${suscripcion.nombre || suscripcion.correoRemitente || "correo"}`} className="flex min-h-[172px] w-full flex-col justify-between gap-4 rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary focus-visible:ring-offset-2">
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-primary/10 text-emerald-primary"><Mail className="h-5 w-5" aria-hidden="true" /></span>
          <div className="min-w-0">
            <h3 className="truncate font-display text-lg font-semibold text-bg-dark">{suscripcion.nombre || "Remitente desconocido"}</h3>
            <p className="mt-0.5 break-all text-sm text-slate-text">{suscripcion.correoRemitente || "Dirección no disponible"}</p>
          </div>
        </div>
        <div className="space-y-2 border-t border-border-line/40 pt-3">
          <p className="truncate text-xs text-slate-text" title={suscripcion.cuentaGmail}>Cuenta: {suscripcion.cuentaGmail}</p>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-slate-text">{textoActividad(suscripcion.correosRecientes)}</span>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${tieneBaja ? "bg-emerald-primary/10 text-emerald-primary" : "bg-border-line/40 text-slate-text"}`}>
              {etiquetas.length > 0 && <Tag className="h-3 w-3" aria-hidden="true" />}
              {etiquetas.length ? etiquetas.join(" · ") : "Sin categoría"}
            </span>
          </div>
          <p className={`text-xs font-medium ${tieneBaja ? "text-emerald-primary" : "text-slate-text"}`}>{tieneBaja ? "Opción para anular disponible" : "Sin enlace de anulación detectado"}</p>
        </div>
      </button>
    </Card>
  );
}
