/**
 * @uso        Página de inicio del dashboard: vista de «muestras» creadas por el usuario
 * @funciones  PaginaDashboardInicio()
 * @datos      Estado local `muestras` ({ titulo, fuente, tipo }; se restaura al montar
 *             desde localStorage con la clave finapp_muestras_dashboard — JSON con
 *             try/catch y validación de array, patrón de UsuarioActivoContext, RF-15 —
 *             y se persiste al guardar con la lista completa; si el almacén no está
 *             disponible o falla, la página funciona en memoria sin persistir, AC-29)
 *             y `borrador` del formulario de creación ({ titulo, fuente, tipo }; vacío =
 *             placeholders); modal «Crear muestra» con 5 fuentes demo del propio modal,
 *             cada una con su destino de redirección (RF-05, se usará en T8), y 4 tipos
 *             de visualización (RF-06). Cada muestra se mapea al DOM según su tipo con
 *             representaciones simuladas de CSS/HTML y valores demo fijos por fuente
 *             (VALORES_DEMO): tarjeta con el título + monto es-MX, gráfica de barras con
 *             serie fija, métrica con variación demo y mapa de calor 7 × 5 con
 *             intensidades fijas; una muestra sin valor válido degrada a «Sin datos
 *             disponibles» (RF-08/RF-14; esa condición no es producible desde la UI y se
 *             cubre por prueba de unidad). Sin backend ni endpoints (TRIAL_ACTIVO, demo;
 *             la migración del localStorage al backend es deuda documentada). El estilo
 *             neutro de la lista lo sustituye la superficie mixta y la rejilla
 *             responsiva de T7; el clic con redirección llega en T8
 * @eventos    clic en «crear muestra» abre el modal; cierres por «X», Esc, clic fuera y
 *             deslizar hacia abajo (móvil) descartan el borrador (RF-11); `alCambiarBorrador`
 *             mantiene controlado el borrador; «guardar muestra» valida (completo y sin
 *             duplicado), añade al final, persiste la lista completa en localStorage y
 *             cierra restableciendo los campos (RF-07/RF-09/RF-10/RF-15)
 * @estados    muestras (carga al montar desde localStorage o lista vacía), borrador
 *             (título/fuente/tipo vacíos al iniciar), modalAbierto (booleano)
 * @usadoPor   App.jsx (ruta /dashboard)
 */

import { useState, useRef, useEffect } from "react";
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
 * (sin librerías de gráficos); cada tipo se mapea al DOM en RF-08.
 */
const TIPOS_VISUALIZACION = [
  { valor: "tarjeta", etiqueta: "Tarjeta" },
  { valor: "grafica", etiqueta: "Gráfica" },
  { valor: "metrica", etiqueta: "Métrica" },
  { valor: "mapa_calor", etiqueta: "Mapa de calor" },
];

/**
 * Valores demostrativos fijos por fuente (decisión 5 de la spec 037, AC-31): el número
 * que muestra cada muestra según su fuente, formateado con la convención del repo.
 * Números de maqueta, no datos financieros reales.
 */
const VALORES_DEMO = {
  bolsillos: 2300,
  transacciones: 5800,
  ingresos: 4250,
  gastos: 1820.75,
  tarjetas: 890.4,
};

/** Variación demostrativa del tipo métrica (decisiones 13 y 14 de la spec 037). */
const VARIACION_METRICA_DEMO = "+12.4 %";

/** Único texto de estado vacío de la spec: muestra sin valor válido (RF-14). */
const TEXTO_SIN_DATOS = "Sin datos disponibles";

/**
 * Serie fija de la gráfica demostrativa (RF-08, AC-13): 5 barras con alturas porcentuales
 * fijas sobre la caja de la gráfica y una etiqueta mínima simulada por barra.
 */
const SERIE_GRAFICA_DEMO = [
  { etiqueta: "L", altura: 35 },
  { etiqueta: "M", altura: 60 },
  { etiqueta: "X", altura: 45 },
  { etiqueta: "J", altura: 85 },
  { etiqueta: "V", altura: 55 },
];

/**
 * Intensidades simuladas del mapa de calor demostrativo (RF-08, AC-15): 7 filas de días
 * × 5 franjas horarias, con niveles de 0 a 4 fijos.
 */
const INTENSIDADES_MAPA_DEMO = [
  [1, 2, 0, 3, 4],
  [0, 1, 2, 2, 1],
  [3, 0, 1, 4, 2],
  [2, 2, 1, 0, 3],
  [1, 3, 2, 4, 0],
  [4, 1, 0, 2, 2],
  [0, 2, 3, 1, 4],
];

/** Clases de token por cada nivel de intensidad del mapa de calor (0 a 4). */
const CLASES_INTENSIDAD = [
  "bg-emerald-primary/10",
  "bg-emerald-primary/30",
  "bg-emerald-primary/50",
  "bg-emerald-primary/70",
  "bg-emerald-primary/90",
];

/** Borrador inicial del formulario: los tres campos vacíos muestran su placeholder. */
const BORRADOR_VACIO = { titulo: "", fuente: "", tipo: "" };

/**
 * Normaliza el título recortando los espacios de los extremos (decisión 12 de la spec
 * 037): el título de solo espacios queda vacío.
 */
const normalizarTitulo = (titulo) => titulo.trim();

/**
 * El borrador está completo cuando el título tiene contenido tras normalizar y la
 * fuente y el tipo salieron de su placeholder (RF-09).
 */
const esBorradorCompleto = (borrador) =>
  normalizarTitulo(borrador.titulo) !== "" &&
  borrador.fuente !== "" &&
  borrador.tipo !== "";

/**
 * Detecta la muestra duplicada por el triple título (normalizado) + fuente + tipo, con
 * los valores internos de cada muestra (RF-10).
 */
const esMuestraDuplicada = (muestras, titulo, fuente, tipo) =>
  muestras.some(
    (muestra) =>
      normalizarTitulo(muestra.titulo) === titulo &&
      muestra.fuente === fuente &&
      muestra.tipo === tipo
  );

/** Clave de almacenamiento simulado de las muestras (RF-15): prefijo finapp_ del repo. */
const CLAVE_ALMACEN = "finapp_muestras_dashboard";

/**
 * Lectura segura de las muestras persistidas (RF-15, patrón de UsuarioActivoContext):
 * JSON con validación defensiva — JSON inválido o no-array devuelve null y la página
 * arranca con su estado en memoria (AC-28). Si localStorage no está disponible o la
 * lectura falla, registra el error y degrada a memoria sin crash (AC-29).
 */
const leerMuestrasPersistidas = () => {
  try {
    const guardado = localStorage.getItem(CLAVE_ALMACEN);
    if (!guardado) {
      return null;
    }
    const parseado = JSON.parse(guardado);
    return Array.isArray(parseado) ? parseado : null;
  } catch (error) {
    console.error("Error al leer muestras desde localStorage:", error);
    return null;
  }
};

/**
 * Escritura segura de la lista COMPLETA de muestras (AC-27, patrón de
 * UsuarioActivoContext): JSON bajo la clave del módulo. Si localStorage no está
 * disponible o falla la escritura, registra el error: la página sigue funcionando con
 * su estado en memoria y al recargar no hay persistencia (AC-29).
 */
const persistirMuestras = (listado) => {
  try {
    localStorage.setItem(CLAVE_ALMACEN, JSON.stringify(listado));
  } catch (error) {
    console.error("Error al guardar muestras en localStorage:", error);
  }
};

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
  // Muestras creadas por el usuario: restauradas de localStorage al montar (RF-15, en
  // el orden guardado) o lista vacía; cada guardado añade al final (orden de creación,
  // RF-07) y el renderizado por tipo llega en T6.
  const [muestras, setMuestras] = useState([]);
  // Borrador del formulario de creación: los tres campos vacíos muestran sus placeholders.
  const [borrador, setBorrador] = useState(BORRADOR_VACIO);
  const [modalAbierto, setModalAbierto] = useState(false);

  // Ref al disparador para la devolución de foco al cerrar el modal.
  const triggerRef = useRef(null);
  // Ref al contenedor del panel: foco inicial de la trampa y objetivo del gesto.
  const panelRef = useRef(null);

  // Carga inicial al montar (RF-15): restaura las muestras en el orden guardado; con
  // JSON inválido, no-array o un almacén no disponible arranca lista vacía sin crash.
  useEffect(() => {
    const persistidas = leerMuestrasPersistidas();
    if (persistidas) {
      setMuestras(persistidas);
    }
  }, []);

  const alCrearMuestra = () => setModalAbierto(true);

  // Cierre por cualquier vía (X, Esc, clic fuera o deslizar): descarta el borrador de modo
  // que la próxima apertura muestre el formulario vacío (RF-11, decisión aprobada).
  const alCerrarModal = () => {
    setModalAbierto(false);
    setBorrador(BORRADOR_VACIO);
  };

  // Actualiza un campo del borrador del formulario de creación de muestra.
  const alCambiarBorrador = (campo, valor) =>
    setBorrador((previo) => ({ ...previo, [campo]: valor }));

  // Guardar muestra (RF-07): con formulario completo y sin duplicado añade la nueva
  // muestra al final, cierra el modal y restablece los campos. Con formulario incompleto
  // (RF-09) o duplicado (RF-10) no añade, no cierra y no muestra mensajes: el borrador
  // se conserva para permitir corregir y reintentar.
  const alGuardarMuestra = () => {
    if (!esBorradorCompleto(borrador)) {
      return;
    }

    const titulo = normalizarTitulo(borrador.titulo);
    const { fuente, tipo } = borrador;
    if (esMuestraDuplicada(muestras, titulo, fuente, tipo)) {
      return;
    }

    // Añade al final en memoria y persiste la lista COMPLETA de muestras (AC-27); si
    // la escritura falla, el guardado sigue siendo válido en memoria (AC-29).
    const nuevasMuestras = [...muestras, { titulo, fuente, tipo }];
    setMuestras(nuevasMuestras);
    persistirMuestras(nuevasMuestras);
    alCerrarModal();
  };

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

            {/* Guardar: valida (completo y sin duplicado), añade al final y cierra */}
            <button
              type="button"
              onClick={alGuardarMuestra}
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
