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
    instalarListener();

    return () => {
      const indice = capas.indexOf(capa);
      if (indice !== -1) capas.splice(indice, 1);
      if (capas.length === 0) retirarListener();
    };
  }, [activo, zIndex]);
}
