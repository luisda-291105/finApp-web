/**
 * @uso        Sección de suscripciones del dashboard: resumen mensual, filtros y estado de cada servicio
 * @funciones  PaginaDashboardSuscripciones()
 * @datos      Lista local de suscripciones de demostración (SUSCRIPCIONES_DEMO); no consulta el backend
 * @eventos    Click en los filtros y en «Pausar»/«Activar» de cada suscripción
 * @estados    suscripciones (array con el estado activa/pausada), filtro (todas/activas/pausadas)
 * @usadoPor   App.jsx (ruta /dashboard/suscripciones)
 */

import { useState } from "react";
import {
  CalendarDays,
  CirclePause,
  Clapperboard,
  Cloud,
  Dumbbell,
  Music,
  Newspaper,
  Play,
  Repeat,
  Wallet,
} from "lucide-react";
import { Card } from "../components/ui/Card";

const formatoMoneda = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const FILTROS = [
  { valor: "todas", etiqueta: "Todas" },
  { valor: "activas", etiqueta: "Activas" },
  { valor: "pausadas", etiqueta: "Pausadas" },
];

/**
 * Suscripciones de demostración: no provienen de una API ni se persisten.
 * `Icono` se guarda como componente para no repetir condicionales al renderizar.
 */
const SUSCRIPCIONES_DEMO = [
  { id: "suscripcion-netflix", nombre: "Netflix", categoria: "Entretenimiento", monto: 44900, diaCobro: 5, activa: true, Icono: Clapperboard },
  { id: "suscripcion-spotify", nombre: "Spotify", categoria: "Música", monto: 17900, diaCobro: 8, activa: true, Icono: Music },
  { id: "suscripcion-icloud", nombre: "iCloud+", categoria: "Almacenamiento", monto: 12900, diaCobro: 12, activa: true, Icono: Cloud },
  { id: "suscripcion-gimnasio", nombre: "Gimnasio", categoria: "Salud", monto: 89000, diaCobro: 15, activa: false, Icono: Dumbbell },
  { id: "suscripcion-prensa", nombre: "Prensa digital", categoria: "Noticias", monto: 29900, diaCobro: 22, activa: true, Icono: Newspaper },
];

/**
 * PaginaDashboardSuscripciones
 * Presenta las suscripciones de demostración, el gasto mensual activo y su estado.
 * Los cambios de estado viven solo en memoria: al recargar se restablece la lista demo.
 */
export default function PaginaDashboardSuscripciones() {
  const [suscripciones, setSuscripciones] = useState(SUSCRIPCIONES_DEMO);
  const [filtro, setFiltro] = useState("todas");

  const activas = suscripciones.filter((suscripcion) => suscripcion.activa);
  const totalMensual = activas.reduce((total, suscripcion) => total + suscripcion.monto, 0);
  const proximoCobro = activas.reduce(
    (proximo, suscripcion) => (proximo === null || suscripcion.diaCobro < proximo.diaCobro ? suscripcion : proximo),
    null
  );

  const visibles = suscripciones.filter((suscripcion) => {
    if (filtro === "activas") return suscripcion.activa;
    if (filtro === "pausadas") return !suscripcion.activa;
    return true;
  });

  const alternarEstado = (id) => {
    setSuscripciones((actuales) =>
      actuales.map((suscripcion) =>
        suscripcion.id === id ? { ...suscripcion, activa: !suscripcion.activa } : suscripcion
      )
    );
  };

  return (
    <section aria-labelledby="suscripciones-titulo" className="space-y-6 pt-6 pb-12">
      <header>
        <p className="text-sm font-medium text-emerald-primary">FinApp / Panel</p>
        <h1 id="suscripciones-titulo" className="mt-1 font-display text-3xl font-medium text-bg-dark">
          Suscripciones
        </h1>
        <p className="mt-1 text-sm text-slate-text">
          Revisa tus cobros recurrentes y el peso que tienen en tu presupuesto mensual.
        </p>
      </header>

      <p role="note" className="rounded-xl border border-border-line/60 bg-bg-cream/70 p-3 text-sm text-slate-text">
        Datos de demostración. Pausar o activar una suscripción no se guarda ni se envía al backend.
      </p>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <div className="flex items-center gap-2 text-emerald-primary">
            <Wallet className="h-5 w-5" aria-hidden="true" />
            <h2 className="text-sm font-medium">Gasto mensual activo</h2>
          </div>
          <p className="mt-3 font-display text-2xl font-semibold text-bg-dark" data-testid="total-mensual">
            {formatoMoneda.format(totalMensual)}
          </p>
          <p className="mt-1 text-xs text-slate-text">Suma de las suscripciones activas.</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2 text-emerald-primary">
            <Repeat className="h-5 w-5" aria-hidden="true" />
            <h2 className="text-sm font-medium">Suscripciones activas</h2>
          </div>
          <p className="mt-3 font-display text-2xl font-semibold text-bg-dark" data-testid="total-activas">
            {activas.length} de {suscripciones.length}
          </p>
          <p className="mt-1 text-xs text-slate-text">Puedes pausar las que no estés usando.</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2 text-emerald-primary">
            <CalendarDays className="h-5 w-5" aria-hidden="true" />
            <h2 className="text-sm font-medium">Próximo cobro</h2>
          </div>
          <p className="mt-3 font-display text-2xl font-semibold text-bg-dark">
            {proximoCobro ? `Día ${proximoCobro.diaCobro}` : "Sin cobros"}
          </p>
          <p className="mt-1 text-xs text-slate-text">
            {proximoCobro ? proximoCobro.nombre : "No hay suscripciones activas."}
          </p>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar suscripciones por estado">
        {FILTROS.map(({ valor, etiqueta }) => (
          <button
            key={valor}
            type="button"
            aria-pressed={filtro === valor}
            onClick={() => setFiltro(valor)}
            className={`min-h-9 rounded-full px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary ${
              filtro === valor
                ? "bg-emerald-primary text-bg-cream"
                : "text-slate-text hover:bg-emerald-primary/10 hover:text-bg-dark"
            }`}
          >
            {etiqueta}
          </button>
        ))}
      </div>

      <section aria-labelledby="lista-suscripciones-titulo" className="space-y-4">
        <h2 id="lista-suscripciones-titulo" className="font-display text-xl font-semibold text-bg-dark">
          Mis suscripciones
        </h2>

        {visibles.length === 0 ? (
          <Card className="p-8 text-center">
            <Repeat className="mx-auto h-8 w-8 text-emerald-primary" aria-hidden="true" />
            <p className="mt-3 font-medium text-bg-dark">Sin suscripciones en este filtro</p>
            <p className="mt-1 text-sm text-slate-text">Cambia el filtro para ver las demás.</p>
          </Card>
        ) : (
          <ul aria-label="Suscripciones" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visibles.map(({ id, nombre, categoria, monto, diaCobro, activa, Icono }) => (
              <Card como="li" key={id} className="flex flex-col justify-between gap-4 p-5">
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-primary/10 text-emerald-primary">
                    <Icono className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate font-display text-lg font-semibold text-bg-dark">{nombre}</h3>
                    <p className="truncate text-sm text-slate-text">{categoria}</p>
                  </div>
                </div>

                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="font-semibold text-bg-dark">{formatoMoneda.format(monto)}</p>
                    <p className="text-xs text-slate-text">Cada mes · día {diaCobro}</p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      activa ? "bg-emerald-primary/10 text-emerald-primary" : "bg-border-line/40 text-slate-text"
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${activa ? "bg-emerald-primary" : "bg-slate-text"}`} aria-hidden="true" />
                    {activa ? "Activa" : "Pausada"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => alternarEstado(id)}
                  aria-label={`${activa ? "Pausar" : "Activar"} ${nombre}`}
                  className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-emerald-primary px-3 text-sm font-medium text-emerald-primary transition-colors hover:bg-emerald-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary"
                >
                  {activa ? <CirclePause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
                  {activa ? "Pausar" : "Activar"}
                </button>
              </Card>
            ))}
          </ul>
        )}
      </section>
    </section>
  );
}
