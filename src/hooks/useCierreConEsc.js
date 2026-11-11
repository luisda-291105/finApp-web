/**
 * @uso        Mecanismo único de cierre por Esc para todas las superficies modales (spec 010)
 * @funciones  useCierreConEsc({ activo, zIndex, alCerrar })
 * @datos      Registro de capas a nivel de módulo: [{ orden, zIndex, alCerrar }]
 * @eventos    keydown en document → Escape cierra SOLO la capa superior (mayor zIndex; en empate, la montada más tarde)
 * @estados    Ninguno (el registro de capas vive fuera de React; `alCerrar` se lee por ref)
 * @usadoPor   DashboardUserModal, DashboardDrawer, AuthModal y ModalTarjeta (spec 010, tareas 4–8)
 */
import { useEffect, useRef } from "react";

/** Registro de capas activas (orden de montaje incremental + capa declarada por cada superficie). */
const capas = [];
let contadorOrden = 0;
let listenerInstalado = false;
let estadoScrollBloqueado = null;

/** Bloquea el documento conservando la posición y permite scroll dentro del diálogo. */
function bloquearScrollPagina() {
  if (typeof document === "undefined" || typeof window === "undefined" || estadoScrollBloqueado) return;
  const { body, documentElement } = document;
  const scrollX = window.scrollX || 0;
  const scrollY = window.scrollY || 0;
  const anchoBarra = Math.max(0, window.innerWidth - documentElement.clientWidth);
  estadoScrollBloqueado = {
    scrollX,
    scrollY,
    htmlOverflow: documentElement.style.overflow,
    bodyOverflow: body.style.overflow,
    bodyPosition: body.style.position,
    bodyTop: body.style.top,
    bodyLeft: body.style.left,
    bodyWidth: body.style.width,
    bodyPaddingRight: body.style.paddingRight,
  };

  documentElement.style.overflow = "hidden";
  body.style.overflow = "hidden";
  body.style.position = "fixed";
  body.style.top = `-${scrollY}px`;
  body.style.left = `-${scrollX}px`;
  body.style.width = "100%";
  if (anchoBarra > 0) {
    const paddingActual = Number.parseFloat(window.getComputedStyle(body).paddingRight) || 0;
    body.style.paddingRight = `${paddingActual + anchoBarra}px`;
  }
}

/** Restaura estilos y posición al cerrar la última superficie modal. */
function restaurarScrollPagina() {
  if (!estadoScrollBloqueado || typeof document === "undefined" || typeof window === "undefined") return;
  const previo = estadoScrollBloqueado;
  estadoScrollBloqueado = null;
  const { body, documentElement } = document;
  documentElement.style.overflow = previo.htmlOverflow;
  body.style.overflow = previo.bodyOverflow;
  body.style.position = previo.bodyPosition;
  body.style.top = previo.bodyTop;
  body.style.left = previo.bodyLeft;
  body.style.width = previo.bodyWidth;
  body.style.paddingRight = previo.bodyPaddingRight;
  window.scrollTo(previo.scrollX, previo.scrollY);
}

/** Devuelve la capa superior: mayor `zIndex`; en empate, la registrada más tarde (`orden`). */
function obtenerCapaSuperior() {
  let superior = null;
  for (const capa of capas) {
    if (superior === null) {
      superior = capa;
      continue;
    }
    if (capa.zIndex > superior.zIndex) {
      superior = capa;
    } else if (capa.zIndex === superior.zIndex && capa.orden > superior.orden) {
      superior = capa;
    }
  }
  return superior;
}

/** Un solo manejador global: una pulsación de Escape cierra exactamente una capa. */
function manejarTecla(evento) {
  if (evento.key !== "Escape") return;
  const superior = obtenerCapaSuperior();
  if (!superior) return;
  superior.alCerrar();
}

/** Instala el listener global con la primera capa (idempotente). */
function instalarListener() {
  if (listenerInstalado || typeof document === "undefined") return;
  document.addEventListener("keydown", manejarTecla);
  listenerInstalado = true;
}

/** Retira el listener global con la última capa (idempotente). */
function retirarListener() {
  if (!listenerInstalado || typeof document === "undefined") return;
  document.removeEventListener("keydown", manejarTecla);
  listenerInstalado = false;
}

/**
 * useCierreConEsc
 * - Registra la capa al montarse/activarse y la desregistra en el cleanup del efecto.
 * - El listener global se instala con la primera capa y se retira con la última:
 *   nunca hay listeners duplicados ni fugas, incluso con el doble montaje de
 *   efectos de React 18 (StrictMode).
 * - Esc cierra solo la capa superior (mayor `zIndex`; empate: la montada más tarde)
 *   y una pulsación provoca una única llamada de cierre.
 */
export function useCierreConEsc({ activo = true, zIndex = 0, alCerrar } = {}) {
  const refAlCerrar = useRef(alCerrar);

  useEffect(() => {
    refAlCerrar.current = alCerrar;
  }, [alCerrar]);

  useEffect(() => {
    if (!activo) return undefined;

    const capa = {
      orden: (contadorOrden += 1),
      zIndex,
      alCerrar: () => refAlCerrar.current?.(),
    };
    capas.push(capa);
    if (capas.length === 1) bloquearScrollPagina();
    instalarListener();

    return () => {
      const indice = capas.indexOf(capa);
      if (indice !== -1) capas.splice(indice, 1);
      if (capas.length === 0) {
        retirarListener();
        restaurarScrollPagina();
      }
    };
  }, [activo, zIndex]);
}
