/**
 * @uso        Página de inicio del dashboard: vista de «muestras» creadas por el usuario
 * @funciones  PaginaDashboardInicio()
 * @datos      Estado local `muestras` que se carga y persiste en el backend según la sesión activa
 *             y `borrador` del formulario de creación ({ titulo, fuente, tipo }; vacío =
 *             placeholders); modal «Crear muestra» con 5 fuentes demo del propio modal,
 *             cada una con su destino de redirección (RF-05, se usará en T8), y 4 tipos
 *             de visualización (RF-06). Cada muestra se mapea al DOM según su tipo con
 *             representaciones simuladas de CSS/HTML y valores demo fijos por fuente
 *             (VALORES_DEMO): tarjeta con el título + monto es-MX, gráfica de barras con
 *             serie fija, métrica con variación demo y mapa de calor 7 × 5 con
 *             intensidades fijas; una muestra sin valor válido degrada a «Sin datos
 *             disponibles» (RF-08/RF-14). Los valores son demostrativos; el registro se
 *             guarda en backend por usuario. El estilo
 *             neutro de la lista lo sustituye la superficie mixta y la rejilla
 *             responsiva de T7; el clic con redirección llega en T8
 * @eventos    clic en «crear muestra» abre el modal; cierres por «X», Esc, clic fuera y
 *             deslizar hacia abajo (móvil) descartan el borrador (RF-11); `alCambiarBorrador`
 *             mantiene controlado el borrador; «guardar muestra» valida (completo y sin
 *             duplicado), crea o actualiza en backend y
 *             cierra restableciendo los campos (RF-07/RF-09/RF-10/RF-15)
 * @estados    muestras (carga desde el backend para el usuario activo), borrador
 *             (título/fuente/tipo vacíos al iniciar), modalAbierto (booleano)
 * @usadoPor   App.jsx (ruta /dashboard)
 */

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import FocusTrap from "focus-trap-react";
import { BotonCerrar } from "../components/ui/BotonCerrar";
import { useCierreConEsc } from "../hooks/useCierreConEsc";
import { useDeslizarParaCerrar } from "../hooks/useDeslizarParaCerrar";
import { useRetornoDeFoco } from "../hooks/useRetornoDeFoco";
import { useTema } from "../context/TemaContext";
import { useUsuarioActivo } from "../context/UsuarioActivoContext";
import { actualizarMuestra, crearMuestra, eliminarMuestra, listarMuestras } from "../services/muestraServicio";

/**
 * Fuentes demo del selector de fuente (RF-05): lista fija de demostración que vive en el
 * propio modal de creación. Cada opción lleva asociado el destino de redirección de su
 * página del dashboard (RF-13); la redirección se usa al activar la muestra (T8).
 */
const FUENTES_DEMO = [
  { valor: "bolsillos", etiqueta: "Grupos", destino: "/dashboard/grupos" },
  { valor: "contabilidad", etiqueta: "Contabilidad", destino: "/dashboard/contabilidad" },
  { valor: "ingresos", etiqueta: "Ingresos", destino: "/dashboard/contabilidad" },
  { valor: "gastos", etiqueta: "Gastos", destino: "/dashboard/contabilidad" },
  { valor: "tarjetas", etiqueta: "Tarjetas", destino: "/dashboard/tarjetas" },
];

const SEGMENTOS_CONTABLES = [
  { valor: "todos", etiqueta: "Todos los movimientos" },
  { valor: "ingresos", etiqueta: "Ingresos" },
  { valor: "gastos", etiqueta: "Gastos" },
  { valor: "otros", etiqueta: "Otros (ahorros)" },
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
  contabilidad: 3473000,
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
const BORRADOR_VACIO = { titulo: "", fuente: "", tipo: "", segmentoContable: "todos" };

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

const normalizarFuente = (fuente) => fuente === "transacciones" ? "contabilidad" : fuente;

/**
 * Detecta la muestra duplicada por el triple título (normalizado) + fuente + tipo, con
 * los valores internos de cada muestra (RF-10).
 */
const esMuestraDuplicada = (muestras, titulo, fuente, tipo, segmentoContable) =>
  muestras.some(
    (muestra) =>
      normalizarTitulo(muestra.titulo) === titulo &&
      normalizarFuente(muestra.fuente) === fuente &&
      muestra.tipo === tipo &&
      (fuente !== "contabilidad" || (muestra.segmentoContable || "todos") === segmentoContable)
  );

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
  const { tema } = useTema();
  const { usuario } = useUsuarioActivo();
  const temaOscuro = tema === "oscuro";
  // Muestras guardadas en el backend para el usuario activo; cada guardado añade al final.
  const [muestras, setMuestras] = useState([]);
  const [cargandoMuestras, setCargandoMuestras] = useState(true);
  const [guardandoMuestra, setGuardandoMuestra] = useState(false);
  const [eliminandoMuestra, setEliminandoMuestra] = useState(false);
  const [errorPersistencia, setErrorPersistencia] = useState("");
  // Borrador del formulario de creación: los tres campos vacíos muestran sus placeholders.
  const [borrador, setBorrador] = useState(BORRADOR_VACIO);
  const [modalAbierto, setModalAbierto] = useState(false);
  // Muestra seleccionada para ver en el modal de detalle (null = cerrado).
  const [muestraDetalle, setMuestraDetalle] = useState(null);
  // Índice que se actualizará al guardar desde el formulario (null = creación).
  const [indiceMuestraEditando, setIndiceMuestraEditando] = useState(null);
  const [confirmarEliminacion, setConfirmarEliminacion] = useState(false);

  // Ref al disparador para la devolución de foco al cerrar el modal.
  const triggerRef = useRef(null);
  // Ref al contenedor del panel: foco inicial de la trampa y objetivo del gesto.
  const panelRef = useRef(null);
  // Ref al panel del modal de detalle.
  const panelDetalleRef = useRef(null);
  // Navegación programática del router (RF-13, T8).
  const navigate = useNavigate();
  const exigirUsuario = () => {
    if (usuario?.idUsuario) return true;
    navigate("/", { replace: true });
    return false;
  };

  /**
   * Formatea un monto numérico con la convención del repo:
   * `$` + toLocaleString("es-MX", { minimumFractionDigits: 2 }) (RF-08, AC-31).
   */
  const formatearMonto = (valor) =>
    `$${valor.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`;
  const clasesTextoMuestra = temaOscuro ? "text-bg-cream" : "text-bg-dark";
  const clasesEtiquetaMuestra = temaOscuro ? "text-bg-cream/70" : "text-slate-text";

  const renderContenidoVisual = (muestra) => {
    const fuenteDemo = FUENTES_DEMO.find((f) => f.valor === normalizarFuente(muestra.fuente));
    const valor = muestra.valor ?? (fuenteDemo ? VALORES_DEMO[fuenteDemo.valor] : null);
    const tipoValido = ["tarjeta", "grafica", "metrica", "mapa_calor"].includes(muestra.tipo);

    if (!valor || !tipoValido) {
      return <p className={`text-sm ${clasesEtiquetaMuestra}`}>{TEXTO_SIN_DATOS}</p>;
    }

    const valorFormateado = formatearMonto(valor);
    return (
      <>
        {muestra.tipo === "tarjeta" && <p className={`text-2xl font-bold ${clasesTextoMuestra}`}>{valorFormateado}</p>}
        {muestra.tipo === "grafica" && (
          <div role="img" aria-label="Gráfica de demostración con serie fija" className="flex h-24 items-end gap-1">
            {(muestra.serie || SERIE_GRAFICA_DEMO).map((barra, i) => (
              <div key={i} data-testid="barra-grafica" className="w-full rounded-t-sm bg-emerald-primary" style={{ height: `${barra.altura}%` }} title={barra.etiqueta}>
                <span className={`mt-1 block text-center text-xs ${clasesEtiquetaMuestra}`}>{barra.etiqueta}</span>
              </div>
            ))}
          </div>
        )}
        {muestra.tipo === "metrica" && (
          <div className="flex items-baseline gap-1">
            <span className={`text-3xl font-bold ${clasesTextoMuestra}`}>{valorFormateado}</span>
            <span className="text-sm font-medium text-emerald-primary">{muestra.variacion || VARIACION_METRICA_DEMO}</span>
          </div>
        )}
        {muestra.tipo === "mapa_calor" && (
          <div role="img" aria-label="Mapa de calor de demostración (7 días × 5 franjas)" className="grid h-24 grid-cols-5 grid-rows-7 gap-1" data-testid="mapa-calor">
            {(muestra.intensidades || INTENSIDADES_MAPA_DEMO).flatMap((fila, filaIdx) =>
              fila.map((intensidad, colIdx) => (
                <div key={`${filaIdx}-${colIdx}`} data-testid="celda-mapa-calor" className={`min-h-0 rounded-sm ${CLASES_INTENSIDAD[intensidad]}`} />
              ))
            )}
          </div>
        )}
      </>
    );
  };

  /**
   * Navega a la página del dashboard correspondiente a la fuente de la muestra
   * (RF-13, AC-21/22/23, T8).
   */
  const alActivarMuestra = (fuente) => {
    const fuenteDemo = FUENTES_DEMO.find((f) => f.valor === normalizarFuente(fuente));
    if (fuenteDemo) {
      navigate(fuenteDemo.destino);
    }
  };

  /**
   * Renderiza una muestra según su tipo de visualización (RF-08, T6).
   * Aplica la regla de superficie mixta: las 3 primeras posiciones son translúcidas
   * (`glass-surface`), el resto sólidas con tokens de la paleta (RF-16, T7).
   * Cada muestra es un botón accesible activable con clic o teclado (RF-13, T8).
   */
  const renderMuestra = (muestra, indice) => {
    const { titulo, fuente, tipo } = muestra;
    const fuenteNormalizada = normalizarFuente(fuente);
    const fuenteDemo = FUENTES_DEMO.find((f) => f.valor === fuenteNormalizada);
    const valor = muestra.valor ?? (fuenteDemo ? VALORES_DEMO[fuenteDemo.valor] : null);
    const esTranslucida = indice < 3;
    const tipoValido = ["tarjeta", "grafica", "metrica", "mapa_calor"].includes(tipo);
    const etiquetaFuente = fuenteDemo?.etiqueta || fuente;
    const nombreSegmento = fuenteNormalizada === "contabilidad"
      ? SEGMENTOS_CONTABLES.find((segmento) => segmento.valor === muestra.segmentoContable)?.etiqueta
      : null;
    const nombreAccesible = `${titulo}, fuente ${etiquetaFuente}${nombreSegmento ? `, ${nombreSegmento}` : ""}, tipo ${tipo}`;
    const clasesSuperficie = temaOscuro
      ? esTranslucida
        ? "glass-surface border border-border-line/50 bg-bg-dark/90"
        : "border border-border-line/50 bg-bg-dark"
      : esTranslucida
        ? "glass-surface border border-border-line/30 bg-bg-cream/95"
        : "border border-border-line/20 bg-bg-cream/90";
    const clasesBadge = temaOscuro ? "bg-mint-accent/15 text-bg-cream" : "bg-emerald-primary/10 text-slate-text";

    // Render defensivo: muestra sin valor válido, fuente desconocida o tipo no conocido (RF-14, AC-26).
    if (!valor || !fuenteDemo || !tipoValido) {
      const etiquetaTipo = TIPOS_VISUALIZACION.find((opcion) => opcion.valor === tipo)?.etiqueta || tipo;
      return (
        <li key={indice} className={`mb-4 overflow-hidden rounded-2xl shadow-sm ${clasesSuperficie}`}>
          <button
            type="button"
            onClick={() => alAbrirDetalle(muestra)}
            className="w-full flex flex-col text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-primary"
            aria-label={nombreAccesible}
          >
            <header className="flex items-center justify-between gap-3 border-b border-border-line/20 px-4 py-3">
              <h2 className={`font-display font-semibold ${clasesTextoMuestra}`}>{titulo}</h2>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${clasesBadge}`}>
                {etiquetaTipo}
              </span>
            </header>
            <div className="flex min-h-28 items-center px-4 py-4">
              {renderContenidoVisual(muestra)}
            </div>
            <footer className="grid grid-cols-2 gap-3 border-t border-border-line/20 px-4 py-3">
              <div>
                <p className={`text-[0.65rem] font-medium uppercase tracking-wide ${clasesEtiquetaMuestra}`}>Fuente</p>
                <p className={`text-sm ${clasesTextoMuestra}`}>{etiquetaFuente}{nombreSegmento ? ` · ${nombreSegmento}` : ""}</p>
              </div>
              <div>
                <p className={`text-[0.65rem] font-medium uppercase tracking-wide ${clasesEtiquetaMuestra}`}>Valor</p>
                <p className={`text-sm ${clasesTextoMuestra}`}>{TEXTO_SIN_DATOS}</p>
              </div>
            </footer>
          </button>
        </li>
      );
    }

    const etiquetaTipo = TIPOS_VISUALIZACION.find((opcion) => opcion.valor === tipo)?.etiqueta || tipo;

    return (
      <li key={indice} className={`mb-4 overflow-hidden rounded-2xl shadow-sm ${clasesSuperficie}`}>
        <button
          type="button"
          onClick={() => alAbrirDetalle(muestra)}
          className="w-full flex flex-col text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-primary"
          aria-label={nombreAccesible}
        >
          <header className="flex items-center justify-between gap-3 border-b border-border-line/20 px-4 py-3">
              <h2 className={`font-display font-semibold ${clasesTextoMuestra}`}>{titulo}</h2>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${clasesBadge}`}>
              {etiquetaTipo}
            </span>
          </header>
          <div className="flex min-h-28 flex-col justify-center gap-2 px-4 py-4">
            {renderContenidoVisual(muestra)}
          </div>
          <footer className="grid grid-cols-2 gap-3 border-t border-border-line/20 px-4 py-3">
            <div>
              <p className={`text-[0.65rem] font-medium uppercase tracking-wide ${clasesEtiquetaMuestra}`}>Fuente</p>
              <p className={`text-sm ${clasesTextoMuestra}`}>{etiquetaFuente}{nombreSegmento ? ` · ${nombreSegmento}` : ""}</p>
            </div>
            <div>
              <p className={`text-[0.65rem] font-medium uppercase tracking-wide ${clasesEtiquetaMuestra}`}>Valor</p>
              <p className={`text-sm ${clasesTextoMuestra}`}>{formatearMonto(valor)}</p>
            </div>
          </footer>
        </button>
      </li>
    );
  };

  // Las muestras se consultan desde el backend con la sesión activa; localStorage no es fuente de verdad.
  useEffect(() => {
    let vigente = true;
    if (!usuario?.idUsuario) {
      navigate("/", { replace: true });
      return () => { vigente = false; };
    }
    setCargandoMuestras(true);
    setErrorPersistencia("");
    listarMuestras()
      .then((guardadas) => { if (vigente) setMuestras(guardadas); })
      .catch((error) => { if (vigente) setErrorPersistencia(error?.message || "No se pudieron cargar las muestras."); })
      .finally(() => { if (vigente) setCargandoMuestras(false); });
    return () => { vigente = false; };
  }, [usuario?.idUsuario, navigate]);

  const alCrearMuestra = () => {
    if (!exigirUsuario()) return;
    setErrorPersistencia("");
    setIndiceMuestraEditando(null);
    setErrorPersistencia("");
    setConfirmarEliminacion(false);
    setBorrador(BORRADOR_VACIO);
    setMuestraDetalle(null);
    setModalAbierto(true);
  };

  // Cierre por cualquier vía (X, Esc, clic fuera o deslizar): descarta el borrador de modo
  // que la próxima apertura muestre el formulario vacío (RF-11, decisión aprobada).
  const alCerrarModal = () => {
    setModalAbierto(false);
    setBorrador(BORRADOR_VACIO);
    setIndiceMuestraEditando(null);
  };

  // Abre el modal de detalle con la muestra indicada.
  const alAbrirDetalle = (muestra) => { setErrorPersistencia(""); setMuestraDetalle(muestra); };

  // Cierra el modal de detalle.
  const alCerrarDetalle = () => {
    setMuestraDetalle(null);
    setConfirmarEliminacion(false);
    setErrorPersistencia("");
  };

  // Actualiza un campo del borrador del formulario de creación de muestra.
  const alCambiarBorrador = (campo, valor) => {
    setErrorPersistencia("");
    setBorrador((previo) => ({ ...previo, [campo]: valor }));
  };

  // Guardar muestra (RF-07): con formulario completo y sin duplicado añade la nueva
  // muestra al final, cierra el modal y restablece los campos. Con formulario incompleto
  // (RF-09) o duplicado (RF-10) no añade, no cierra y no muestra mensajes: el borrador
  // se conserva para permitir corregir y reintentar.
  const alGuardarMuestra = async () => {
    if (!exigirUsuario()) return;
    if (guardandoMuestra) return;
    if (!esBorradorCompleto(borrador)) {
      return;
    }

    const titulo = normalizarTitulo(borrador.titulo);
    const { tipo } = borrador;
    const fuente = normalizarFuente(borrador.fuente);
    const segmentoContable = borrador.segmentoContable || "todos";
    const muestrasParaComparar = indiceMuestraEditando === null
      ? muestras
      : muestras.filter((_, indice) => indice !== indiceMuestraEditando);
    if (esMuestraDuplicada(muestrasParaComparar, titulo, fuente, tipo, segmentoContable)) {
      return;
    }

    setErrorPersistencia("");
    setGuardandoMuestra(true);
    try {
      const guardada = indiceMuestraEditando === null
        ? await crearMuestra({ titulo, fuente, tipo, segmentoContable })
        : await actualizarMuestra(muestras[indiceMuestraEditando]?.id, { titulo, fuente, tipo, segmentoContable });
      setMuestras((actuales) => indiceMuestraEditando === null
        ? [...actuales, guardada]
        : actuales.map((muestra, indice) => indice === indiceMuestraEditando ? guardada : muestra));
      alCerrarModal();
    } catch (error) {
      setErrorPersistencia(error?.message || "No se pudo guardar la muestra. Intenta de nuevo.");
    } finally {
      setGuardandoMuestra(false);
    }
  };

  const alEditarMuestra = () => {
    if (!exigirUsuario()) return;
    setErrorPersistencia("");
    const indice = muestras.indexOf(muestraDetalle);
    if (indice < 0) return;
    setIndiceMuestraEditando(indice);
    setBorrador({
      titulo: muestraDetalle.titulo,
      fuente: normalizarFuente(muestraDetalle.fuente),
      tipo: muestraDetalle.tipo,
      segmentoContable: muestraDetalle.segmentoContable || "todos",
    });
    setConfirmarEliminacion(false);
    setMuestraDetalle(null);
    setModalAbierto(true);
  };

  const alEliminarMuestra = async () => {
    if (!exigirUsuario()) return;
    if (!confirmarEliminacion || !muestraDetalle) {
      setConfirmarEliminacion(true);
      return;
    }
    setErrorPersistencia("");
    setEliminandoMuestra(true);
    try {
      await eliminarMuestra(muestraDetalle.id);
      setMuestras((actuales) => actuales.filter((muestra) => muestra.id !== muestraDetalle.id));
      setConfirmarEliminacion(false);
      setMuestraDetalle(null);
    } catch (error) {
      setErrorPersistencia(error?.message || "No se pudo eliminar la muestra. Intenta de nuevo.");
    } finally {
      setEliminandoMuestra(false);
    }
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
            {indiceMuestraEditando === null ? "Crear muestra" : "Editar muestra"}
          </h2>
          <BotonCerrar
            ariaLabel={indiceMuestraEditando === null ? "Cerrar creación de muestra" : "Cerrar edición de muestra"}
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
                placeholder="Ej. Mis gastos de la semana"
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

            {normalizarFuente(borrador.fuente) === "contabilidad" && (
              <div className="flex flex-col gap-1.5">
                <label htmlFor="muestra-segmento-contable" className="text-sm font-medium text-bg-dark">
                  Qué mostrar de Contabilidad
                </label>
                <select
                  id="muestra-segmento-contable"
                  value={borrador.segmentoContable || "todos"}
                  onChange={(evento) => alCambiarBorrador("segmentoContable", evento.target.value)}
                  className="w-full rounded-xl border border-border-line bg-bg-cream px-3 py-2 text-bg-dark outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary cursor-pointer"
                >
                  {SEGMENTOS_CONTABLES.map((segmento) => (
                    <option key={segmento.valor} value={segmento.valor}>{segmento.etiqueta}</option>
                  ))}
                </select>
              </div>
            )}

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
              disabled={guardandoMuestra}
              className="w-full rounded-xl bg-emerald-primary px-4 py-2.5 text-sm font-medium text-bg-cream outline-none transition-colors hover:bg-emerald-hover focus-visible:ring-2 focus-visible:ring-mint-accent cursor-pointer"
            >
              {guardandoMuestra ? "Guardando…" : indiceMuestraEditando === null ? "guardar muestra" : "guardar cambios"}
            </button>
            {errorPersistencia && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{errorPersistencia}</p>}
          </div>
        </div>
      </motion.div>
    </FocusTrap>
  );

  // Cierre del overlay del modal de detalle.
  const handleOverlayClickDetalle = (evento) => {
    if (evento.target === evento.currentTarget) {
      alCerrarDetalle();
    }
  };

  // Modal de detalle de una muestra (solo lectura). Se abre al clic en una muestra.
  const modalDetalleContent = (
    <motion.div
      ref={panelDetalleRef}
      id="modal-detalle-muestra-panel"
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md max-h-[85vh] overflow-y-auto outline-none bg-bg-cream/95 glass-surface border border-border-line/30 rounded-2xl shadow-xl z-60"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <header className="flex items-center justify-between px-5 py-4 border-b border-border-line/30">
        <h2 id="modal-detalle-muestra-titulo" className="font-display text-lg font-semibold text-bg-dark">
          Detalle de muestra
        </h2>
        <BotonCerrar
          ariaLabel="Cerrar detalle de muestra"
          alCerrar={alCerrarDetalle}
          className="text-slate-text hover:text-bg-dark hover:bg-emerald-primary/10 focus-visible:ring-emerald-primary"
        />
      </header>

      <div className="px-5 py-4">
        {muestraDetalle && (
          <>
            {(() => {
      const fuenteDemo = FUENTES_DEMO.find((f) => f.valor === normalizarFuente(muestraDetalle.fuente));
              const etiquetaFuente = fuenteDemo?.etiqueta || muestraDetalle.fuente;
      const segmento = SEGMENTOS_CONTABLES.find((opcion) => opcion.valor === muestraDetalle.segmentoContable);
              const tipoDemo = TIPOS_VISUALIZACION.find((t) => t.valor === muestraDetalle.tipo);
              const etiquetaTipo = tipoDemo?.etiqueta || muestraDetalle.tipo;
      const valor = muestraDetalle.valor ?? (fuenteDemo ? VALORES_DEMO[fuenteDemo.valor] : null);
              const tipoValido = ["tarjeta", "grafica", "metrica", "mapa_calor"].includes(muestraDetalle.tipo);
              const valorFormateado = valor && tipoValido ? formatearMonto(valor) : TEXTO_SIN_DATOS;

              return (
                <>
                  <section
                    aria-label="Vista previa de la muestra"
                    className="mb-5 overflow-hidden rounded-2xl border border-border-line/30 bg-bg-cream/75 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-3 border-b border-border-line/20 px-4 py-3">
                      <h3 className="font-display font-semibold text-bg-dark">{muestraDetalle.titulo}</h3>
                      <span className="shrink-0 rounded-full bg-emerald-primary/10 px-2.5 py-1 text-xs font-medium text-slate-text">
                        {etiquetaTipo}
                      </span>
                    </div>
                    <div className="flex min-h-28 flex-col justify-center gap-2 px-4 py-4">
                      {renderContenidoVisual(muestraDetalle)}
                    </div>
                    <div className="grid grid-cols-2 gap-3 border-t border-border-line/20 px-4 py-3">
                      <div>
                        <p className="text-[0.65rem] font-medium uppercase tracking-wide text-slate-text">Fuente</p>
                        <p className="text-sm text-bg-dark">{etiquetaFuente}{segmento ? ` · ${segmento.etiqueta}` : ""}</p>
                      </div>
                      <div>
                        <p className="text-[0.65rem] font-medium uppercase tracking-wide text-slate-text">Valor</p>
                        <p className="text-sm text-bg-dark">{valorFormateado}</p>
                      </div>
                    </div>
                  </section>

                  <dl className="mb-6 grid grid-cols-2 gap-x-5 gap-y-4">
                    <div>
                      <dt className="text-[0.65rem] font-medium uppercase tracking-wide text-slate-text">Título</dt>
                      <dd className="mt-0.5 break-words text-sm text-bg-dark">{muestraDetalle.titulo}</dd>
                    </div>
                    <div>
                      <dt className="text-[0.65rem] font-medium uppercase tracking-wide text-slate-text">Fuente</dt>
                      <dd className="mt-0.5 text-sm text-bg-dark">{etiquetaFuente}{segmento ? ` · ${segmento.etiqueta}` : ""}</dd>
                    </div>
                    <div>
                      <dt className="text-[0.65rem] font-medium uppercase tracking-wide text-slate-text">Tipo</dt>
                      <dd className="mt-0.5 text-sm text-bg-dark">{etiquetaTipo}</dd>
                    </div>
                    <div>
                      <dt className="text-[0.65rem] font-medium uppercase tracking-wide text-slate-text">Valor</dt>
                      <dd className="mt-0.5 text-sm text-bg-dark">{valorFormateado}</dd>
                    </div>
                  </dl>

                  <section aria-label="Ir a la fuente de la muestra" className={`mb-5 rounded-xl border border-border-line/40 p-4 ${temaOscuro ? "bg-bg-dark/60" : "bg-bg-cream/60"}`}>
                    <p className="mb-2 text-sm text-slate-text">Continuar en {etiquetaFuente}</p>
                    <button
                      type="button"
                      onClick={() => alActivarMuestra(muestraDetalle.fuente)}
                      className="w-full rounded-xl bg-emerald-primary px-4 py-2.5 text-sm font-medium text-bg-cream outline-none transition-colors hover:bg-emerald-hover focus-visible:ring-2 focus-visible:ring-mint-accent"
                    >
                      Ir a la fuente
                    </button>
                  </section>

                  {confirmarEliminacion && (
                    <div role="alert" className="mb-4 rounded-xl border border-red-300/50 bg-red-50/60 p-3 text-sm text-bg-dark">
                      ¿Eliminar esta muestra? Esta acción no se puede deshacer.
                    </div>
                  )}
                </>
              );
            })()}

            <div className="grid grid-cols-2 gap-2 border-t border-border-line/20 pt-4">
              <button
                type="button"
                onClick={alCrearMuestra}
                className="rounded-xl border border-border-line/40 px-3 py-2.5 text-sm font-medium text-bg-dark hover:bg-emerald-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary"
              >
                Nueva muestra
              </button>
              <button
                type="button"
                onClick={alEditarMuestra}
                className="rounded-xl border border-border-line/40 px-3 py-2.5 text-sm font-medium text-bg-dark hover:bg-emerald-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={alEliminarMuestra}
                disabled={eliminandoMuestra}
                className="rounded-xl border border-red-300/60 px-3 py-2.5 text-sm font-medium text-red-700 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              >
                {eliminandoMuestra ? "Eliminando…" : confirmarEliminacion ? "Confirmar eliminación" : "Eliminar"}
              </button>
              {confirmarEliminacion && (
                <button
                  type="button"
                  onClick={() => setConfirmarEliminacion(false)}
                  className="rounded-xl border border-border-line/40 px-3 py-2.5 text-sm font-medium text-bg-dark hover:bg-emerald-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary"
                >
                  Cancelar
                </button>
              )}
            </div>
            {errorPersistencia && <p role="alert" className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{errorPersistencia}</p>}
          </>
        )}
      </div>
    </motion.div>
  );

  return (
    <>
      <section aria-labelledby="dashboard-title" className="space-y-6 pt-6">
        {/* Cabecera exclusiva de esta página: título "dashboard" y botón "crear muestra" a la derecha */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-primary">FinApp / Panel</p>
            <h1 id="dashboard-title" className="font-display text-3xl font-medium text-bg-dark">
              dashboard
            </h1>
            <p className="text-sm text-slate-text/80">Tus muestras y vistas guardadas, en un solo lugar.</p>
          </div>
          <button
            ref={triggerRef}
            type="button"
            onClick={alCrearMuestra}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-primary hover:bg-emerald-hover text-bg-cream text-sm font-medium shadow-md transition-all cursor-pointer hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-accent"
          >
            crear muestra
          </button>
        </header>

        {errorPersistencia && !modalAbierto && !muestraDetalle && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{errorPersistencia}</p>}
        {cargandoMuestras && <p role="status" className="text-sm text-slate-text">Cargando tus muestras guardadas…</p>}

        {/* Lista de muestras guardadas en backend para el usuario activo.
             Rejilla responsiva: escritorio con columnas desde sm:, móvil 1 columna (RF-16, T7). */}
        <ul data-testid="lista-muestras" id="lista-muestras" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {muestras.map((muestra, indice) => renderMuestra(muestra, indice))}
        </ul>
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

      {/* Portal del modal «Detalle de muestra» (solo cuando está abierto) */}
      {muestraDetalle &&
        createPortal(
          <>
            {/* Overlay: cierra el modal al tocar/clicar fuera */}
            <div
              className="fixed inset-0 bg-bg-dark/80 backdrop-blur-sm z-50"
              onClick={handleOverlayClickDetalle}
              aria-hidden="true"
            />
            <AnimatePresence>{modalDetalleContent}</AnimatePresence>
          </>,
          document.body
        )}
    </>
  );
}
