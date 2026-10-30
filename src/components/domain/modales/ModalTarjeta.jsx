/**
 * @uso        Modal accesible de detalle de tarjeta (flip 3D + datos + log de movimientos;
 *             spec 004) que cumple las CUATRO formas de cierre de spec 010: «X» superior, Esc,
 *             clic fuera y deslizar hacia abajo (solo móvil, RF-06)
 * @funciones  ModalTarjeta({ tarjeta, onCerrar })
 * @datos      `tarjeta` (objeto de TARJETAS_DEMO o null = cerrado); movimientos desde MOVIMIENTOS_DEMO[id]
 * @eventos    onCerrar() («X» como ÚNICO control visible de cierre, Esc por el mecanismo único
 *             `useCierreConEsc`, clic en backdrop y gesto de deslizar hacia abajo en móvil);
 *             al abrir se captura el elemento activo y al cerrar se devuelve el foco con la pieza
 *             común (useRetornoDeFoco: devolución gobernada por la transición de apertura);
 *             Tab/Shift+Tab cicla dentro (trampa MANUAL conservada, RF-12)
 * @estados    Ninguno propio; animación de entrada/salida con useReducedMotion; la captura y la
 *             devolución del foco viven en useRetornoDeFoco (sin estado de React); el estado
 *             de apertura (tarjetaActiva) vive en PanelTarjetas (T7); «móvil» desde useBreakpoint
 * @usadoPor   PanelTarjetas
 */
import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import MiTarjetaVirtual from "../dashboard/MiTarjetaVirtual";
import LogMovimientos from "../dashboard/LogMovimientos";
import { MOVIMIENTOS_DEMO } from "../../../data/tarjetasDemo";
import { useCierreConEsc } from "../../../hooks/useCierreConEsc";
import { useDeslizarParaCerrar } from "../../../hooks/useDeslizarParaCerrar";
import { useRetornoDeFoco } from "../../../hooks/useRetornoDeFoco";
import ModalDetalleRegistro from "./ModalDetalleRegistro";

const SELECTOR_FOCOABLES =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * ModalTarjeta
 * - `tarjeta === null` → no renderiza nada (el padre controla el estado).
 * - Accesibilidad: role="dialog" + aria-modal + aria-labelledby al titular,
 *   foco inicial en el contenedor del diálogo (`tabIndex={-1}`, fuera del ciclo
 *   de Tab), trampa **manual** con Tab/Shift+Tab (RF-12, no se sustituye),
 *   cierre con Esc (mecanismo único `useCierreConEsc`, capa 50), «X»
 *   "Cerrar detalle de tarjeta", clic en el backdrop y, solo en móvil, gesto de
 *   deslizar hacia abajo (`useDeslizarParaCerrar`).
 * - Devolución del foco: la captura al abrir y la devolución al cerrar las gobierna
 *   `useRetornoDeFoco` por la **transición abierta → cerrada** (spec 011, RF-11/H12):
 *   el efecto de apertura ya solo restaura el scroll y nunca devuelve el foco. T7
 *   (PanelTarjetas) no necesita refs adicionales para el retorno del foco.
 * - Animación de entrada/salida con Framer Motion (fade/escala), duración 0
 *   con prefers-reduced-motion.
 * - Solo tokens de estilos (backdrop `bg-bg-dark/60`, superficie `glass-card`);
 *   sin hexadecimales nuevos.
 */
export default function ModalTarjeta({ tarjeta, onCerrar, registrada = false, triggerRef }) {
  const reducirMovimiento = useReducedMotion();
  const refDialogo = useRef(null);

  // Apertura: mover el foco al contenedor del diálogo y bloquear el scroll. La limpieza **solo**
  // restaura el scroll: nunca devuelve el foco (eso lo gobierna `useRetornoDeFoco` por la transición
  // abierta → cerrada, RF-11/H12). Así el montaje con tarjeta activa, el cambio de tarjeta sin cierre
  // y el doble montaje de `StrictMode` no disparan `focus()` sobre el activador (AC-08/AC-11).
  useEffect(() => {
    if (!tarjeta) return undefined;
    // Foco inicial en el propio contenedor del diálogo (contrato D4 / spec §7.1): con la «X»
    // presente, el `??` al primer enfocable nunca caía al contenedor. `tabIndex={-1}` lo deja
    // fuera del ciclo de Tab.
    refDialogo.current?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [tarjeta]);

  // Captura al abrir y devolución al cerrar con la pieza común (patrón M4, spec 011). La captura la
  // hace la pieza y la devolución se consume una sola vez en la transición abierta → cerrada; sin
  // `triggerRef` propio, el activador es el elemento capturado y, si falta, el respaldo estable de la
  // versión de vista (RF-05).
  useRetornoDeFoco({ activo: Boolean(tarjeta) && !registrada });

  // Esc: mecanismo único compartido por las cuatro superficies; la capa de este panel es 50
  // (plan §2.3-M1). La trampa manual de Tab/Shift+Tab se conserva (RF-12).
  useCierreConEsc({ activo: Boolean(tarjeta) && !registrada, zIndex: 50, alCerrar: onCerrar });

  // Gesto de deslizar hacia abajo (solo móvil, punteros nativos). No arranca sobre controles
  // interactivos (incluido el flip de la tarjeta) ni con el panel desplazado (CL-09).
  useDeslizarParaCerrar({ activo: Boolean(tarjeta) && !registrada, refPanel: refDialogo, alCerrar: onCerrar });

  const atraparTab = (e) => {
    if (e.key !== "Tab") return;
    const focoables = refDialogo.current?.querySelectorAll(SELECTOR_FOCOABLES);
    if (!focoables || focoables.length === 0) return;
    const primero = focoables[0];
    const ultimo = focoables[focoables.length - 1];
    if (e.shiftKey && document.activeElement === primero) {
      e.preventDefault();
      ultimo.focus();
    } else if (!e.shiftKey && document.activeElement === ultimo) {
      e.preventDefault();
      primero.focus();
    }
  };

  const transicion = reducirMovimiento ? { duration: 0 } : { duration: 0.2 };
  const numeroEnmascarado = tarjeta
    ? `•••• ${String(tarjeta.numero || "").replace(/\D/g, "").slice(-4)}`
    : "";

  if (registrada) {
    return (
      <ModalDetalleRegistro abierto={Boolean(tarjeta)} titulo={`Tarjeta de ${tarjeta?.titular || "Titular"}`} alCerrar={onCerrar} triggerRef={triggerRef} ancho="max-w-md">
        {tarjeta && <>
          <MiTarjetaVirtual titular={tarjeta.titular} numero={numeroEnmascarado} expiracion={tarjeta.expiracion} cvv="" entidad={tarjeta.entidad} colorTema={tarjeta.colorTema || "azul"} flipDeshabilitado />
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm"><div><dt className="text-xs uppercase tracking-wider text-slate-text">Titular</dt><dd>{tarjeta.titular}</dd></div><div><dt className="text-xs uppercase tracking-wider text-slate-text">Número</dt><dd className="font-mono">{numeroEnmascarado}</dd></div><div><dt className="text-xs uppercase tracking-wider text-slate-text">Expira</dt><dd>{tarjeta.expiracion}</dd></div><div><dt className="text-xs uppercase tracking-wider text-slate-text">Entidad</dt><dd>{tarjeta.entidad || "Sin entidad"}</dd></div></dl>
          <h3 className="mt-6 mb-2 font-display text-base font-semibold">Movimientos</h3><p className="rounded-xl border border-border-line/40 p-4 text-sm text-slate-text">Esta tarjeta todavía no tiene movimientos registrados.</p>
        </>}
      </ModalDetalleRegistro>
    );
  }
  return (
    <AnimatePresence>
      {tarjeta ? (
        <motion.div
          key="backdrop-modal-tarjeta"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-dark/60 backdrop-blur-sm"
          onClick={onCerrar}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={transicion}
        >
          <motion.div
            ref={refDialogo}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-tarjeta-titulo"
            tabIndex={-1}
            className="glass-card relative w-full max-w-md max-h-[85vh] overflow-y-auto p-6 outline-none"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={atraparTab}
            initial={reducirMovimiento ? false : { opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reducirMovimiento ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
            transition={transicion}
          >
            <button
              type="button"
              aria-label="Cerrar detalle de tarjeta"
              onClick={onCerrar}
              className="absolute top-4 right-4 z-10 rounded-full p-2 text-slate-text hover:text-bg-dark focus-visible:ring-2 focus-visible:ring-emerald-primary outline-none"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>

            <h2 id="modal-tarjeta-titulo" className="font-display text-xl font-semibold text-bg-dark pr-10">
              Tarjeta de {tarjeta.titular}
            </h2>

            <div className="mt-4">
              <MiTarjetaVirtual
                titular={tarjeta.titular}
                numero={tarjeta.numero}
                expiracion={tarjeta.expiracion}
                cvv={tarjeta.cvv}
                entidad={tarjeta.entidad}
                colorTema={tarjeta.colorTema}
              />
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-wider text-slate-text">Titular</dt>
                <dd className="font-medium text-bg-dark">{tarjeta.titular}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-slate-text">Número</dt>
                <dd className="font-mono font-medium text-bg-dark tabular-nums">{numeroEnmascarado}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-slate-text">Expira</dt>
                <dd className="font-mono font-medium text-bg-dark tabular-nums">{tarjeta.expiracion}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-slate-text">Entidad</dt>
                <dd className="font-medium text-bg-dark">{tarjeta.entidad}</dd>
              </div>
            </dl>

            <h3 className="mt-6 mb-2 font-display text-base font-semibold text-bg-dark">
              Movimientos de octubre 2026
            </h3>
            <LogMovimientos movimientos={MOVIMIENTOS_DEMO[tarjeta.id] ?? []} />
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}