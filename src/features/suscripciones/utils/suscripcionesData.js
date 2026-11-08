import { Clapperboard, Cloud, Dumbbell, Music, Newspaper } from "lucide-react";

export const FILTROS_SUSCRIPCIONES = [
  { valor: "todas", etiqueta: "Todas" },
  { valor: "activas", etiqueta: "Activas" },
  { valor: "pausadas", etiqueta: "Pausadas" },
];

/** Datos locales de ejemplo; esta vista todavía no usa persistencia ni API. */
export const SUSCRIPCIONES_DEMO = [
  { id: "suscripcion-netflix", nombre: "Netflix", categoria: "Entretenimiento", monto: 44900, diaCobro: 5, activa: true, fuente: "Tarjeta débito ···· 4821", pagosPasados: [{ fecha: "2026-11-05", monto: 44900 }, { fecha: "2026-10-05", monto: 44900 }, { fecha: "2026-09-05", monto: 44900 }], Icono: Clapperboard },
  { id: "suscripcion-spotify", nombre: "Spotify", categoria: "Música", monto: 17900, diaCobro: 8, activa: true, fuente: "Cuenta de ahorros ···· 1034", pagosPasados: [{ fecha: "2026-10-08", monto: 17900 }, { fecha: "2026-09-08", monto: 17900 }, { fecha: "2026-08-08", monto: 17900 }], Icono: Music },
  { id: "suscripcion-icloud", nombre: "iCloud+", categoria: "Almacenamiento", monto: 12900, diaCobro: 12, activa: true, fuente: "Tarjeta crédito ···· 7712", pagosPasados: [{ fecha: "2026-10-12", monto: 12900 }, { fecha: "2026-09-12", monto: 12900 }, { fecha: "2026-08-12", monto: 12900 }], Icono: Cloud },
  { id: "suscripcion-gimnasio", nombre: "Gimnasio", categoria: "Salud", monto: 89000, diaCobro: 15, activa: false, fuente: "Tarjeta débito ···· 4821", pagosPasados: [{ fecha: "2026-10-15", monto: 89000 }, { fecha: "2026-09-15", monto: 89000 }, { fecha: "2026-08-15", monto: 89000 }], Icono: Dumbbell },
  { id: "suscripcion-prensa", nombre: "Prensa digital", categoria: "Noticias", monto: 29900, diaCobro: 22, activa: true, fuente: "Cuenta de ahorros ···· 1034", pagosPasados: [{ fecha: "2026-10-22", monto: 29900 }, { fecha: "2026-09-22", monto: 29900 }, { fecha: "2026-08-22", monto: 29900 }], Icono: Newspaper },
];

export const formatoMoneda = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export const formatoFechaPago = new Intl.DateTimeFormat("es-CO", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function filtrarSuscripciones(suscripciones, filtro) {
  if (filtro === "activas") return suscripciones.filter((item) => item.activa);
  if (filtro === "pausadas") return suscripciones.filter((item) => !item.activa);
  return suscripciones;
}

export function resumirSuscripciones(suscripciones) {
  const activas = suscripciones.filter((item) => item.activa);
  const proximoCobro = activas.reduce(
    (proximo, item) => proximo === null || item.diaCobro < proximo.diaCobro ? item : proximo,
    null,
  );
  return {
    activas,
    totalMensual: activas.reduce((total, item) => total + item.monto, 0),
    proximoCobro,
  };
}
