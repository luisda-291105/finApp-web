/**
 * @uso        Página de inicio del dashboard: vista de «muestras» creadas por el usuario
 * @funciones  PaginaDashboardInicio()
 * @datos      Estado local `muestras` (lista vacía al iniciar; se llena con el ciclo de
 *             guardado de T4 y se renderiza en T6) y `borrador` del formulario de creación
 *             ({ titulo, fuente, tipo }; vacío = placeholders); modal «Crear muestra» con
 *             5 fuentes demo del propio modal, cada una con su destino de redirección
 *             (RF-05, se usará en T8), y 4 tipos de visualización (RF-06). Sin backend ni
 *             persistencia (TRIAL_ACTIVO, demo)
 * @eventos    clic en «crear muestra» abre el modal; cierres por «X», Esc, clic fuera y
 *             deslizar hacia abajo (móvil); `alCambiarBorrador` mantiene controlado el
 *             borrador; el botón «guardar muestra» completa su ciclo en T4
 * @estados    muestras (lista vacía al iniciar), borrador (título/fuente/tipo vacíos al
 *             iniciar), modalAbierto (booleano)
 * @usadoPor   App.jsx (ruta /dashboard)
 */

import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import FocusTrap from "focus-trap-react";
import { BotonCerrar } from "../components/ui/BotonCerrar";
import { useCierreConEsc } from "../hooks/useCierreConEsc";
import { useDeslizarParaCerrar } from "../hooks/useDeslizarParaCerrar";
import { useRetornoDeFoco } from "../hooks/useRetornoDeFoco";

/**
 * Fuentes demo del selector de fuente (RF-05): lista fija de demostración que vive en el
 * propio modal de creación. Cada opción lleva asociado el destino de redirección de su
 * página del dashboard (RF-13); la redirección se usa al activar la muestra (T8).
 */
const FUENTES_DEMO = [
  { valor: "bolsillos", etiqueta: "Bolsillos", destino: "/dashboard/bolsillos" },
  { valor: "transacciones", etiqueta: "Transacciones", destino: "/dashboard/transacciones" },
  { valor: "ingresos", etiqueta: "Ingresos", destino: "/dashboard/transacciones" },
  { valor: "gastos", etiqueta: "Gastos", destino: "/dashboard/transacciones" },
  { valor: "tarjetas", etiqueta: "Tarjetas", destino: "/dashboard/tarjetas" },
];

/**
 * Tipos de visualización del selector de tipo (RF-06), todos simulados con CSS/HTML
 * (sin librerías de gráficos); el renderizado por tipo llega en T6.
 */
const TIPOS_VISUALIZACION = [
  { valor: "tarjeta", etiqueta: "Tarjeta" },
  { valor: "grafica", etiqueta: "Gráfica" },
  { valor: "metrica", etiqueta: "Métrica" },
  { valor: "mapa_calor", etiqueta: "Mapa de calor" },
];

/** Opciones de la trampa de foco (spec 010 §2.2). */
function crearOpcionesTrampa(refPanel) {
  return {
    allowOutsideClick: true,
    escapeDeactivates: false,
    initialFocus: () => refPanel.current,
    returnFocusOnDeactivate: false,
  };
}

export default function PaginaDashboardInicio() {
  // Muestras creadas por el usuario: lista vacía al iniciar; el guardado (añadir al
  // final, orden de creación) se completa en T4 y el renderizado por tipo en T6.
  const [muestras, setMuestras] = useState([]);
  // Borrador del formulario de creación: los tres campos vacíos muestran sus placeholders.
  const [borrador, setBorrador] = useState({ titulo: "", fuente: "", tipo: "" });
  const [modalAbierto, setModalAbierto] = useState(false);

  // Ref al disparador para la devolución de foco al cerrar el modal.
  const triggerRef = useRef(null);
  // Ref al contenedor del panel: foco inicial de la trampa y objetivo del gesto.
  const panelRef = useRef(null);

  const alCrearMuestra = () => setModalAbierto(true);
  const alCerrarModal = () => setModalAbierto(false);

  // Actualiza un campo del borrador del formulario de creación de muestra.
  const alCambiarBorrador = (campo, valor) =>
    setBorrador((previo) => ({ ...previo, [campo]: valor }));

  // Esc: mecanismo único compartido; la capa del modal es la del panel (60)
  useCierreConEsc({ activo: modalAbierto, zIndex: 60, alCerrar: alCerrarModal });

  // Gesto de deslizar hacia abajo (solo móvil, con punteros nativos)
  useDeslizarParaCerrar({ activo: modalAbierto, refPanel: panelRef, alCerrar: alCerrarModal });

  // Devolución de foco al disparador ("crear muestra") al cerrar el modal.
  useRetornoDeFoco({ activo: modalAbierto, triggerRef });

  const handleOverlayClick = (evento) => {
    // Solo cerrar si el click es directamente en el overlay (no en el panel)
    if (evento.target === evento.currentTarget) {
      alCerrarModal();
    }
  };

  const modalContent = (
    <FocusTrap focusTrapOptions={crearOpcionesTrampa(panelRef)}>
      <motion.div
        ref={panelRef}
        id="modal-crear-muestra-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-crear-muestra-titulo"
        tabIndex={-1}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-sm max-h-[85vh] overflow-y-auto outline-none bg-bg-cream/95 glass-surface border border-border-line/30 rounded-2xl shadow-xl z-60"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        {/* Header con el único control visible de cierre */}
        <header className="flex items-center justify-between px-5 py-4 border-b border-border-line/30">
          <h2 id="modal-crear-muestra-titulo" className="font-display text-lg font-semibold text-bg-dark">
            Crear muestra
          </h2>
          <BotonCerrar
            ariaLabel="Cerrar creación de muestra"
            alCerrar={alCerrarModal}
            className="text-slate-text hover:text-bg-dark hover:bg-emerald-primary/10 focus-visible:ring-emerald-primary"
          />
        </header>

        {/* Formulario de creación de muestra (RF-04): título, fuente y tipo */}
        <div className="px-5 py-4">
          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="muestra-titulo" className="text-sm font-medium text-bg-dark">
                Título de la muestra
              </label>
              <input
                id="muestra-titulo"
                type="text"
                maxLength={255}
                value={borrador.titulo}
                onChange={(evento) => alCambiarBorrador("titulo", evento.target.value)}
                className="w-full rounded-xl border border-border-line bg-bg-cream px-3 py-2 text-bg-dark outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="muestra-fuente" className="text-sm font-medium text-bg-dark">
                Fuente
              </label>
              <select
                id="muestra-fuente"
                value={borrador.fuente}
                onChange={(evento) => alCambiarBorrador("fuente", evento.target.value)}
                className="w-full rounded-xl border border-border-line bg-bg-cream px-3 py-2 text-bg-dark outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary cursor-pointer"
              >
                <option value="" disabled>
                  Elegir fuente
                </option>
                {FUENTES_DEMO.map((fuente) => (
                  <option key={fuente.valor} value={fuente.valor}>
                    {fuente.etiqueta}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="muestra-tipo" className="text-sm font-medium text-bg-dark">
                Tipo de visualización
              </label>
              <select
                id="muestra-tipo"
                value={borrador.tipo}
                onChange={(evento) => alCambiarBorrador("tipo", evento.target.value)}
                className="w-full rounded-xl border border-border-line bg-bg-cream px-3 py-2 text-bg-dark outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary cursor-pointer"
              >
                <option value="" disabled>
                  Elegir tipo
                </option>
                {TIPOS_VISUALIZACION.map((tipo) => (
                  <option key={tipo.valor} value={tipo.valor}>
                    {tipo.etiqueta}
                  </option>
                ))}
              </select>
            </div>

            {/* El ciclo de validación/añadir/cerrar/reset del guardado llega en T4 */}
            <button
              type="button"
              className="w-full rounded-xl bg-emerald-primary px-4 py-2.5 text-sm font-medium text-bg-cream outline-none transition-colors hover:bg-emerald-hover focus-visible:ring-2 focus-visible:ring-mint-accent cursor-pointer"
            >
              guardar muestra
            </button>
          </div>
        </div>
      </motion.div>
    </FocusTrap>
  );

  return (
    <>
      <section aria-labelledby="dashboard-title" className="space-y-6 pt-6">
        {/* Cabecera exclusiva de esta página: título "dashboard" y botón "crear muestra" a la derecha */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 id="dashboard-title" className="font-display text-3xl font-medium text-bg-dark">
            dashboard
          </h1>
          <button
            ref={triggerRef}
            type="button"
            onClick={alCrearMuestra}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-primary hover:bg-emerald-hover text-bg-cream text-sm font-medium shadow-md transition-all cursor-pointer hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-accent"
          >
            crear muestra
          </button>
        </header>

        {/* Las muestras creadas se renderizan aquí: vacío hasta la primera (T6) */}
      </section>

      {/* Portal del modal «Crear muestra» (solo cuando está abierto) */}
      {modalAbierto &&
        createPortal(
          <>
            {/* Overlay: cierra el modal al tocar/clicar fuera (allowOutsideClick deja pasar el evento) */}
            <div
              className="fixed inset-0 bg-bg-dark/80 backdrop-blur-sm z-50"
              onClick={handleOverlayClick}
              aria-hidden="true"
            />
            {/* Panel con AnimatePresence para animación de salida */}
            <AnimatePresence>{modalContent}</AnimatePresence>
          </>,
          document.body
        )}
    </>
  );
}
