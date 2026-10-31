/**
 * @uso        Cierre por deslizar hacia abajo, solo en móvil y con eventos de puntero nativos (spec 010)
 * @funciones  useDeslizarParaCerrar({ activo, refPanel, alCerrar })
 * @datos      refPanel (panel que recibe el gesto); versión de vista desde useBreakpoint().isMobile
 * @eventos    pointerdown/pointermove/pointerup/pointercancel en el panel → alCerrar() al superar el umbral
 * @estados    Ninguno (la posición del puntero vive en variables locales del efecto)
 * @usadoPor   DashboardUserModal, AuthModal y ModalTarjeta (spec 010, tareas 4, 7 y 8; NO el menú, DP-08)
 */
import { useEffect, useRef } from "react";
import { useBreakpoint } from "./useBreakpoint";

/** Umbral mínimo de desplazamiento vertical para cerrar (px). */
const UMBRAL_DESLIZAMIENTO = 96;
/** El desplazamiento vertical debe superar en este factor al horizontal para contar como gesto. */
const FACTOR_DIRECCION_VERTICAL = 1.5;
/** El gesto no arranca si empieza sobre un control interactivo. */
const SELECTOR_CONTROL_INTERACTIVO =
  'button, a, input, select, textarea, label, [role="button"], [contenteditable="true"]';

/**
 * Devuelve `true` si el objetivo o alguno de sus ancestros hasta el panel (incluido)
 * tiene contenido desplazado: en ese caso el arrastre pertenece al scroll (CL-09).
 */
function hayDesplazamientoInterno(objetivo, panel) {
  let nodo = objetivo instanceof Element ? objetivo : null;
  while (nodo) {
    if (nodo.scrollTop > 0) return true;
    if (nodo === panel) break;
    nodo = nodo.parentElement;
  }
  return false;
}

/**
 * useDeslizarParaCerrar
 * - Solo móvil: reutiliza el corte único de 768px vía `useBreakpoint().isMobile`
 *   (RF-20); en ≥768px no registra nada.
 * - Eventos de puntero nativos, sin `setPointerCapture` y sin el gesto de arrastre de
 *   Framer Motion (DP-13). Acepta solo el puntero primario y uno a la vez.
 * - Cierra cuando el desplazamiento hacia abajo supera 96px y es predominantemente
 *   vertical (|dy| > |dx| · 1.5); un arrastre corto u horizontal no cierra.
 * - No arranca si el gesto empieza sobre un control interactivo ni si el panel ya
 *   tiene scroll interno desplazado.
 * - No aplica `transform` ni transición alguna: no introduce movimiento nuevo, así
 *   que respeta `prefers-reduced-motion` por construcción (RF-21).
 */
export function useDeslizarParaCerrar({ activo = true, refPanel, alCerrar } = {}) {
  const { isMobile } = useBreakpoint();
  const refAlCerrar = useRef(alCerrar);

  useEffect(() => {
    refAlCerrar.current = alCerrar;
  }, [alCerrar]);

  useEffect(() => {
    if (!activo || !isMobile) return undefined;
    const panel = refPanel?.current;
    if (!panel) return undefined;

    let idPuntero = null;
    let inicioX = 0;
    let inicioY = 0;
    let ultimoX = 0;
    let ultimoY = 0;

    const alPulsarPuntero = (evento) => {
      if (evento.isPrimary === false) return;
      if (idPuntero !== null) return;
      if (evento.target?.closest?.(SELECTOR_CONTROL_INTERACTIVO)) return;
      if (hayDesplazamientoInterno(evento.target, panel)) return;
      idPuntero = evento.pointerId;
      inicioX = evento.clientX;
      inicioY = evento.clientY;
      ultimoX = evento.clientX;
      ultimoY = evento.clientY;
    };

    const alMoverPuntero = (evento) => {
      if (idPuntero === null || evento.pointerId !== idPuntero) return;
      ultimoX = evento.clientX;
      ultimoY = evento.clientY;
    };

    const alSoltarPuntero = (evento) => {
      if (idPuntero === null || evento.pointerId !== idPuntero) return;
      const x = typeof evento.clientX === "number" ? evento.clientX : ultimoX;
      const y = typeof evento.clientY === "number" ? evento.clientY : ultimoY;
      idPuntero = null;

      const desplazamientoX = x - inicioX;
      const desplazamientoY = y - inicioY;
      if (desplazamientoY < UMBRAL_DESLIZAMIENTO) return;
      if (Math.abs(desplazamientoY) <= Math.abs(desplazamientoX) * FACTOR_DIRECCION_VERTICAL) return;
      refAlCerrar.current?.();
    };

    const alCancelarPuntero = (evento) => {
      if (idPuntero !== null && evento.pointerId === idPuntero) idPuntero = null;
    };

    panel.addEventListener("pointerdown", alPulsarPuntero);
    panel.addEventListener("pointermove", alMoverPuntero);
    panel.addEventListener("pointerup", alSoltarPuntero);
    panel.addEventListener("pointercancel", alCancelarPuntero);

    return () => {
      panel.removeEventListener("pointerdown", alPulsarPuntero);
      panel.removeEventListener("pointermove", alMoverPuntero);
      panel.removeEventListener("pointerup", alSoltarPuntero);
      panel.removeEventListener("pointercancel", alCancelarPuntero);
    };
  }, [activo, isMobile, refPanel]);
}
