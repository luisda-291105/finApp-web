/**
 * @uso        Modal accesible de detalle de tarjeta (flip 3D + datos + log de movimientos, spec 004)
 * @funciones  ModalTarjeta({ tarjeta, onCerrar })
 * @datos      `tarjeta` (objeto de TARJETAS_DEMO o null = cerrado); movimientos desde MOVIMIENTOS_DEMO[id]
 * @eventos    onCerrar() (Esc, backdrop o botón de cierre); Tab/Shift+Tab cicla dentro (focus trap)
 * @estados    Ninguno propio; animación de entrada/salida con useReducedMotion; el estado
 *             de apertura (tarjetaActiva) vive en PanelTarjetas (T7)
 * @usadoPor   PanelTarjetas (spec 004)
 */
import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import MiTarjetaVirtual from "./MiTarjetaVirtual";
import LogMovimientos from "./LogMovimientos";
import { MOVIMIENTOS_DEMO } from "../data/tarjetasDemo";

const SELECTOR_FOCOABLES =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * ModalTarjeta
 * - `tarjeta === null` → no renderiza nada (el padre controla el estado).
 * - Accesibilidad: role="dialog" + aria-modal + aria-labelledby al titular,
 *   foco inicial dentro del diálogo, focus trap manual con Tab/Shift+Tab,
 *   cierre con Esc, botón "Cerrar detalle de tarjeta" y clic en el backdrop.
 * - Devolución del foco: el propio modal guarda `document.activeElement` al
 *   abrirse y lo restaura al desmontar; T7 (PanelTarjetas) no necesita refs
 *   adicionales para el retorno del foco.
 * - Animación de entrada/salida con Framer Motion (fade/escala), duración 0
 *   con prefers-reduced-motion.
 * - Solo tokens de estilos (backdrop `bg-bg-dark/60`, superficie `glass-card`);
 *   sin hexadecimales nuevos.
 */
export default function ModalTarjeta({ tarjeta, onCerrar }) {
  const reducirMovimiento = useReducedMotion();
  const refDialogo = useRef(null);
  const refActivador = useRef(null);

  // Al abrir: guardar el activador, mover el foco dentro y bloquear el scroll.
  // Al cerrar (desmontaje del contenido): restaurar scroll y devolver el foco.
  useEffect(() => {
    if (!tarjeta) return undefined;
    refActivador.current = document.activeElement;
    const dialogo = refDialogo.current;
    const primerFocoable = dialogo?.querySelector(SELECTOR_FOCOABLES);
    (primerFocoable ?? dialogo)?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      refActivador.current?.focus?.();
    };
  }, [tarjeta]);

  // Cierre con Escape (listener en document mientras el modal esté abierto)
  useEffect(() => {
    if (!tarjeta) return undefined;
    const alPulsarTecla = (e) => {
      if (e.key === "Escape") onCerrar();
    };
    document.addEventListener("keydown", alPulsarTecla);
    return () => document.removeEventListener("keydown", alPulsarTecla);
  }, [tarjeta, onCerrar]);

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
    ? `•••• ${tarjeta.numero.replace(/\s/g, "").slice(-4)}`
    : "";

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
