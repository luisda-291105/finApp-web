/**
 * @uso        Regla común de devolución de foco de las cuatro superficies modales (spec 011, M1)
 * @funciones  useRetornoDeFoco({ activo, triggerRef }); resolverControlDeVista(esMovil)
 * @datos      No transforma datos: opera sobre el DOM (disparador, elemento activo capturado y control estable de la versión de vista)
 * @eventos    Transición abierta → cerrada de la superficie (prop `activo`); intenta `focus()` sobre la cadena de candidatos al cerrar
 * @estados    Ninguno propio de React: dos refs internas (elemento previo capturado y guarda de «estuvo abierta»)
 * @usadoPor   DashboardDrawer, DashboardUserModal, AuthModal y ModalTarjeta; resolverControlDeVista lo reutiliza useFocoEnVistaDestino
 */
import { useEffect, useLayoutEffect, useRef } from "react";
import { useBreakpoint } from "./useBreakpoint";

/** Control estable de la versión móvil del dashboard (RF-05/M8). */
const SELECTOR_CONTROL_MOVIL = 'button[aria-label="Abrir menú"]';
/** Control estable de ≥768px del dashboard (RF-05/M8; el mismo de la spec 010). */
const SELECTOR_CONTROL_LATERAL = 'aside[role="navigation"] button';
/** Selectores reales de foco del «primer control enfocable» (RF-05/M4). */
const SELECTOR_ENFOCABLE =
  'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])';
/** Subárboles excluidos como destino de respaldo: la superficie que se cierra (M4). */
const SELECTOR_DIALOGO = '[role="dialog"]';
/** Subárboles no enfocables que la cadena descarta antes de intentar el foco (RF-04/AC-24). */
const SELECTOR_NO_ENFOCABLE = '[inert], [aria-hidden="true"]';

/**
 * Valida un candidato de la cadena (RF-04/RF-05): debe ser `HTMLElement`, distinto de `body`,
 * estar conectado y no vivir dentro de un subárbol `[inert]`/`[aria-hidden="true"]`. El resultado
 * efectivo del `.focus()` se comprueba aparte; `disabled` no se descarta aquí porque la cadena lo
 * intenta y, al no quedar enfocado, continúa con el siguiente (AC-24).
 */
function esCandidatoDeLaCadena(nodo) {
  return (
    nodo instanceof HTMLElement &&
    nodo !== document.body &&
    nodo.isConnected &&
    !nodo.closest(SELECTOR_NO_ENFOCABLE)
  );
}

/**
 * Valida un control del respaldo (RF-05/M4): además excluye `disabled` y los subárboles
 * `[role="dialog"]` (la superficie que se cierra y el contenedor del diálogo).
 */
function esControlDeRespaldo(nodo) {
  return esCandidatoDeLaCadena(nodo) && !nodo.disabled && !nodo.closest(SELECTOR_DIALOGO);
}

/** Devuelve el primer nodo de la lista que supera la validación de respaldo (o `null`). */
function primerControlDeRespaldo(nodos) {
  for (const nodo of nodos) {
    if (esControlDeRespaldo(nodo)) return nodo;
  }
  return null;
}

/**
 * resolverControlDeVista
 * Resolutor **puro** (sin hooks) del respaldo estable por versión de vista (RF-05/M8), en orden de
 * preferencia: (1) control estable de la versión actual; (2) el otro control estable; (3) primer
 * control enfocable de la vista. Nunca devuelve `body`, un nodo desconectado, un `disabled` ni un
 * control dentro de `[role="dialog"]`; **sin ninguno devuelve `null`** (limitación explícita,
 * AC-15/AC-23: no se inventa marcado ni se desplaza el scroll).
 *
 * @param {boolean} esMovil - Versión de vista actual (`useBreakpoint().isMobile`)
 * @returns {HTMLElement|null} Control de destino, o `null` si la vista no ofrece ninguno
 */
export function resolverControlDeVista(esMovil) {
  if (typeof document === "undefined") return null;
  const preferido = esMovil ? SELECTOR_CONTROL_MOVIL : SELECTOR_CONTROL_LATERAL;
  const alterno = esMovil ? SELECTOR_CONTROL_LATERAL : SELECTOR_CONTROL_MOVIL;
  return (
    primerControlDeRespaldo(document.querySelectorAll(preferido)) ??
    primerControlDeRespaldo(document.querySelectorAll(alterno)) ??
    primerControlDeRespaldo(document.querySelectorAll(SELECTOR_ENFOCABLE))
  );
}

/**
 * useRetornoDeFoco
 * - Captura **incondicional** del elemento activo al abrir (RF-03), sincrónica respecto al commit
 *   (`useLayoutEffect`), antes de que la trampa de la superficie enfoque el contenedor del panel.
 * - Guarda de transición `estuvoAbiertoRef`: el cierre solo actúa si la superficie llegó a abrirse;
 *   el montaje cerrado, los re-renders cerrados y el doble montaje de `StrictMode` no mueven el
 *   foco (RF-01/RF-02/CL-14). La devolución se consume en el primer cierre real.
 * - Al cerrar recorre una cadena determinista —disparador → elemento capturado → control estable de
 *   la versión de vista— y solo acepta un candidato si queda **efectivamente** enfocado
 *   (`document.activeElement === candidato`); si no, continúa (RF-04/RF-05/AC-24). Nunca deja el
 *   foco en `body` ni sobre un nodo desconectado.
 * - Sin candidato válido no hace nada: limitación explícita, sin marcado ficticio (AC-15/AC-23).
 *
 * @param {Object} props
 * @param {boolean} props.activo - Indica si la superficie está abierta (controla la transición)
 * @param {React.RefObject<HTMLElement>} [props.triggerRef] - Ref al disparador (opcional, RF-07)
 */
export function useRetornoDeFoco({ activo = false, triggerRef } = {}) {
  const { isMobile } = useBreakpoint();
  const previoRef = useRef(null);
  const estuvoAbiertoRef = useRef(false);

  // Captura SIEMPRE al abrir, sincrónica al commit y antes de que la trampa enfoque el panel (RF-03)
  useLayoutEffect(() => {
    if (!activo) return;
    previoRef.current = document.activeElement;
  }, [activo]);

  // Devolución gobernada por la transición abierta → cerrada (RF-01/RF-02)
  useEffect(() => {
    if (activo) {
      estuvoAbiertoRef.current = true;
      return;
    }
    if (!estuvoAbiertoRef.current) return;
    estuvoAbiertoRef.current = false;

    const cadena = [
      triggerRef?.current,
      previoRef.current,
      resolverControlDeVista(isMobile),
    ];

    for (const candidato of cadena) {
      if (!esCandidatoDeLaCadena(candidato)) continue;
      candidato.focus();
      if (document.activeElement === candidato) return;
    }
  }, [activo, triggerRef, isMobile]);
}
