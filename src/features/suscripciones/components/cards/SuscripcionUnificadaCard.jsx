/**
 * @uso        Tarjeta unificada para cualquier suscripción, sin importar su origen
 * @funciones  SuscripcionUnificadaCard({ item, alAbrir, formatoMoneda, formatoFecha })
 * @datos      Recibe un item con `fuente` ("gmail" | "manual" | "recurrente") y los campos de la fuente de origen
 * @eventos    Click en toda la tarjeta para abrir el detalle (gmail y manual); las detectadas no son interactivas
 * @estados    Ninguno
 * @usadoPor   TodasSuscripcionesSection
 */
import { Mail, NotebookPen, Repeat, Tag } from "lucide-react";
import { Card } from "../../../../components/ui";

const ORIGENES = {
  gmail: { etiqueta: "Gmail", Icono: Mail, clases: "bg-emerald-primary/10 text-emerald-primary" },
  manual: { etiqueta: "Manual", Icono: NotebookPen, clases: "bg-amber-500/10 text-amber-800" },
  recurrente: { etiqueta: "Detectada", Icono: Repeat, clases: "bg-border-line/40 text-slate-text" },
};

const monedaRecurrente = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});
const fechaRecurrente = new Intl.DateTimeFormat("es-CO", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

function textoActividad(cantidad) {
  if (cantidad == null) return "Actividad reciente no disponible";
  if (cantidad > 20) return "Más de 20 correos recientes";
  if (cantidad >= 10) return "Entre 10 y 20 correos recientes";
  return "10 correos recientes o menos";
}

function InsigniaOrigen({ fuente }) {
  const { etiqueta, clases } = ORIGENES[fuente] || ORIGENES.recurrente;
  return (
    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${clases}`}>
      {etiqueta}
    </span>
  );
}

function InsigniaPrioridad({ prioridad }) {
  const valor = prioridad || "Media";
  return (
    <span className="shrink-0 rounded-full bg-border-line/40 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-text">
      Prioridad {valor}
    </span>
  );
}

function Encabezado({ item }) {
  const { Icono } = ORIGENES[item.fuente] || ORIGENES.recurrente;
  const nombreVisible = item.apodo || item.nombre || (item.fuente === "gmail" ? "Remitente desconocido" : "Suscripción");
  const mostrarNombreReal = Boolean(item.apodo && item.nombre);
  const subtitulo = item.fuente === "gmail"
    ? item.correoRemitente || "Dirección no disponible"
    : item.categoria || (item.fuente === "recurrente" ? item.frecuencia : "Sin categoría");

  return (
    <div className="flex min-w-0 items-start gap-3">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-primary/10 text-emerald-primary">
        <Icono className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <h3 className="truncate font-display text-lg font-semibold text-bg-dark" title={mostrarNombreReal ? item.nombre : undefined}>
          {nombreVisible}
        </h3>
        <p className={`mt-0.5 text-sm text-slate-text ${item.fuente === "gmail" ? "break-all" : "truncate"}`}>{subtitulo}</p>
      </div>
    </div>
  );
}

function CuerpoGmail({ item }) {
  const etiquetas = (item.categorias || []).map((categoria) => (categoria === "CATEGORY_PROMOTIONS" ? "Promociones" : "Actualizaciones"));
  const tieneBaja = Boolean(item.urlBaja || item.mailtoBaja);

  return (
    <div className="space-y-2 border-t border-border-line/40 pt-3">
      <p className="truncate text-xs text-slate-text" title={item.cuentaGmail}>Cuenta: {item.cuentaGmail}</p>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="flex flex-wrap items-center gap-2 text-slate-text">
          <span className="text-xs">{textoActividad(item.correosRecientes)}</span>
          {item.importancia === "Alta" && <span className="rounded-full bg-emerald-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-primary">Importante</span>}
        </span>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${tieneBaja ? "bg-emerald-primary/10 text-emerald-primary" : "bg-border-line/40 text-slate-text"}`}>
          {etiquetas.length > 0 && <Tag className="h-3 w-3" aria-hidden="true" />}
          {etiquetas.length ? etiquetas.join(" · ") : "Sin categoría"}
        </span>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className={`text-xs font-medium ${tieneBaja ? "text-emerald-primary" : "text-slate-text"}`}>
          {tieneBaja ? "Opción para anular disponible" : "Sin enlace de anulación detectado"}
        </p>
        <InsigniaPrioridad prioridad={item.prioridad} />
      </div>
    </div>
  );
}

const ETIQUETAS_IMPORTANCIA = { Alta: "Importante", Media: "Media importancia", Baja: "Baja importancia" };
const CLASES_IMPORTANCIA = {
  Alta: "bg-emerald-primary/10 text-emerald-primary",
  Media: "bg-amber-500/10 text-amber-800",
  Baja: "bg-border-line/40 text-slate-text",
};

function CuerpoManual({ item, formatoMoneda, formatoFecha }) {
  return (
    <div className="space-y-2 border-t border-border-line/40 pt-3">
      <span className="block text-sm text-slate-text">
        Cobro: {formatoFecha.format(new Date(`${item.fechaCobro}T00:00:00`))}
      </span>
      <span className="block font-semibold tabular-nums text-bg-dark">{formatoMoneda.format(item.monto)}</span>
      <span className="flex flex-wrap items-center gap-2">
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${CLASES_IMPORTANCIA[item.importancia] || CLASES_IMPORTANCIA.Media}`}>
          {ETIQUETAS_IMPORTANCIA[item.importancia] || "Media importancia"}
        </span>
        <span className="shrink-0 rounded-full bg-border-line/40 px-2.5 py-1 text-xs font-semibold text-slate-text">
          Prioridad {item.prioridad || "Media"}
        </span>
      </span>
    </div>
  );
}

function CuerpoRecurrente({ item }) {
  return (
    <div className="space-y-2 border-t border-border-line/40 pt-3">
      <div className="flex items-center justify-between gap-2">
        <p className="font-semibold tabular-nums text-bg-dark">
          {monedaRecurrente.format(Number(item.montoPromedio || 0))}{" "}
          <span className="text-xs font-normal text-slate-text">promedio</span>
        </p>
        <span className="shrink-0 rounded-full bg-emerald-primary/10 px-2.5 py-1 text-xs font-semibold text-emerald-primary">
          {item.frecuencia}
        </span>
      </div>
      <div className="space-y-1 text-xs text-slate-text">
        <p>
          {item.cobrosDetectados} cobros registrados · último:{" "}
          {item.ultimoCobro ? fechaRecurrente.format(new Date(`${item.ultimoCobro}T00:00:00Z`)) : "sin datos"}
        </p>
        <p>
          Próximo estimado:{" "}
          {item.proximoCobro ? fechaRecurrente.format(new Date(`${item.proximoCobro}T00:00:00Z`)) : "sin fecha prevista"}
        </p>
      </div>
      <InsigniaPrioridad prioridad={item.prioridad} />
    </div>
  );
}

/** Tarjeta común; gmail y manual abren el detalle al pulsarla y las detectadas solo informan. */
export default function SuscripcionUnificadaCard({ item, alAbrir, formatoMoneda, formatoFecha }) {
  if (item.fuente === "recurrente") {
    return (
      <Card como="li" className="h-full p-4">
        <div className="flex h-full flex-col gap-3">
          <span className="flex w-full items-start justify-between gap-3">
            <Encabezado item={item} />
            <InsigniaOrigen fuente="recurrente" />
          </span>
          <CuerpoRecurrente item={item} />
        </div>
      </Card>
    );
  }

  const esManual = item.fuente === "manual";
  return (
    <Card como="li" className="h-full p-4">
      <button
        type="button"
        onClick={alAbrir}
        aria-label={esManual
          ? `Ver detalle de la suscripción ${item.apodo || item.nombre}`
          : `Ver detalles de la suscripción de ${item.nombre || item.correoRemitente || "correo"}`}
        className="flex h-full min-h-[172px] w-full flex-col justify-between gap-4 rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary focus-visible:ring-offset-2"
      >
        <span className="flex w-full items-start justify-between gap-3">
          <Encabezado item={item} />
          <InsigniaOrigen fuente={item.fuente} />
        </span>
        {esManual
          ? <CuerpoManual item={item} formatoMoneda={formatoMoneda} formatoFecha={formatoFecha} />
          : <CuerpoGmail item={item} />}
      </button>
    </Card>
  );
}
