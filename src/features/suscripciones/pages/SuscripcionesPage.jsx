import { useEffect, useMemo, useRef, useState } from "react";
import { Filter, Plus, Search } from "lucide-react";
import ModalDetalleRegistro from "../../../components/domain/modales/ModalDetalleRegistro";
import { useGmail } from "../../../context/GmailContext";
import useSuscripcionesGmail from "../hooks/useSuscripcionesGmail";
import MetricasCobrosRecurrentes from "../components/cards/MetricasCobrosRecurrentes";
import TodasSuscripcionesSection from "../components/cards/TodasSuscripcionesSection";
import useSuscripcionesRecurrentes from "../hooks/useSuscripcionesRecurrentes";
import BuscarSuscripcionesModal from "../components/modals/BuscarSuscripcionesModal";
import FiltrarSuscripcionesModal from "../components/modals/FiltrarSuscripcionesModal";
import DetalleSuscripcionModal from "../components/modals/DetalleSuscripcionModal";
import CrearSuscripcionManualModal from "../components/modals/CrearSuscripcionManualModal";
import { crearSuscripcionManual, listarSuscripcionesManuales } from "../services/suscripcionesServicio";
import { AlertaGlobal } from "../../../features/error";
import { formatoMoneda } from "../utils/suscripcionesData";

const FILTROS_CORREO_INICIALES = { cuentas: [], categorias: [], baja: [] };
const CATEGORIAS_SUSCRIPCION_MANUAL = ["Alimentación", "Comunicación", "Entretenimiento", "Servicios", "Transporte", "Salud", "Educación", "Hogar", "Otros"];
const SUSCRIPCION_MANUAL_INICIAL = { nombre: "", monto: "", fechaCobro: "", categoria: "Servicios", importancia: "Alta", prioridad: "Media", apodo: "" };
const formatoFechaCobro = new Intl.DateTimeFormat("es-CO", { day: "2-digit", month: "2-digit", year: "numeric" });

/** Vista principal de suscripciones, compone el resumen, filtros y lista. */
export default function SuscripcionesPage() {
  const { cuentasGmail } = useGmail();
  const gmail = useSuscripcionesGmail({ cuentasGmail });
  const recurrentes = useSuscripcionesRecurrentes();
  const [busquedaCorreo, setBusquedaCorreo] = useState("");
  const [filtrosCorreo, setFiltrosCorreo] = useState(FILTROS_CORREO_INICIALES);
  const [buscarAbierto, setBuscarAbierto] = useState(false);
  const [filtrarAbierto, setFiltrarAbierto] = useState(false);
  const [suscripcionCorreoDetalle, setSuscripcionCorreoDetalle] = useState(null);
  const [crearCategoriaAbierto, setCrearCategoriaAbierto] = useState(false);
  const [nombreCategoria, setNombreCategoria] = useState("");
  const [categoriasPersonalizadas, setCategoriasPersonalizadas] = useState([]);
  const [modalManualAbierto, setModalManualAbierto] = useState(false);
  const [suscripcionManual, setSuscripcionManual] = useState(SUSCRIPCION_MANUAL_INICIAL);
  const [suscripcionesManuales, setSuscripcionesManuales] = useState([]);
  const [cargandoSuscripcionesManuales, setCargandoSuscripcionesManuales] = useState(true);
  const [guardandoSuscripcionManual, setGuardandoSuscripcionManual] = useState(false);
  const [errorSuscripcionManual, setErrorSuscripcionManual] = useState("");
  const [errorManualCerrado, setErrorManualCerrado] = useState("");
  const [errorRecurrentesCerrado, setErrorRecurrentesCerrado] = useState("");
  const [errorGmailCerrado, setErrorGmailCerrado] = useState("");
  const [erroresCuentasCerrados, setErroresCuentasCerrados] = useState("");
  const triggerBuscarRef = useRef(null);
  const triggerFiltrarRef = useRef(null);
  const triggerDetalleCorreoRef = useRef(null);
  const triggerManualRef = useRef(null);

  useEffect(() => { setErrorRecurrentesCerrado(""); }, [recurrentes.error]);
  useEffect(() => { setErrorGmailCerrado(""); }, [gmail.error]);
  useEffect(() => { setErrorManualCerrado(""); }, [errorSuscripcionManual]);

  useEffect(() => {
    let vigente = true;
    listarSuscripcionesManuales()
      .then((manuales) => {
        if (vigente) setSuscripcionesManuales(manuales);
      })
      .catch((error) => {
        if (vigente) setErrorSuscripcionManual(error?.message || "No se pudieron cargar las suscripciones registradas.");
      })
      .finally(() => {
        if (vigente) setCargandoSuscripcionesManuales(false);
      });
    return () => { vigente = false; };
  }, []);
  const textoErroresCuentas = useMemo(
    () => gmail.erroresCuentas.map((item) => `${item.correo}: ${item.mensaje}`).join(" · "),
    [gmail.erroresCuentas],
  );
  useEffect(() => { setErroresCuentasCerrados(""); }, [textoErroresCuentas]);

  const suscripcionesCorreoFiltradas = useMemo(() => {
    const termino = busquedaCorreo.trim().toLocaleLowerCase();
    return gmail.suscripcionesCorreo.filter((item) => {
      const cuentaId = String(item.cuentaGmailId ?? "");
      const cuentaEmail = String(item.cuentaGmail || "").toLocaleLowerCase();
      const categorias = Array.isArray(item.categorias) ? item.categorias : [];
      const coincideCuenta = filtrosCorreo.cuentas.length === 0
        || filtrosCorreo.cuentas.includes("TODAS")
        || filtrosCorreo.cuentas.includes(cuentaId)
        || filtrosCorreo.cuentas.some((email) => email.includes("@") && email.toLocaleLowerCase() === cuentaEmail);
      const idSuscripcion = `${item.cuentaGmailId || ""}:${item.id || item.correoRemitente || ""}`;
      const coincideCategoria = filtrosCorreo.categorias.length === 0 || filtrosCorreo.categorias.some((categoria) =>
        categorias.includes(categoria) || categoriasPersonalizadas.some((personalizada) => personalizada.nombre === categoria && personalizada.ids.includes(idSuscripcion)));
      const tieneBaja = Boolean(item.urlBaja || item.mailtoBaja);
      const coincideBaja = filtrosCorreo.baja.length === 0 || filtrosCorreo.baja.length === 2
        || (filtrosCorreo.baja.includes("SI") && tieneBaja) || (filtrosCorreo.baja.includes("NO") && !tieneBaja);
      const coincideTexto = !termino || `${item.nombre || ""} ${item.correoRemitente || ""} ${item.cuentaGmail || ""}`.toLocaleLowerCase().includes(termino);
      return coincideCuenta && coincideCategoria && coincideBaja && coincideTexto;
    });
  }, [gmail.suscripcionesCorreo, filtrosCorreo, busquedaCorreo, categoriasPersonalizadas]);

  const filtrosActivos = useMemo(
    () =>
      Boolean(busquedaCorreo.trim())
      || filtrosCorreo.cuentas.length > 0
      || filtrosCorreo.categorias.length > 0
      || filtrosCorreo.baja.length > 0,
    [busquedaCorreo, filtrosCorreo],
  );

  const conteosFiltro = useMemo(() => {
    const cuentas = { TODAS: gmail.suscripcionesCorreo.length };
    cuentasGmail.forEach((cuenta) => { cuentas[String(cuenta.id)] = gmail.suscripcionesCorreo.filter((item) => String(item.cuentaGmailId ?? "") === String(cuenta.id) || String(item.cuentaGmail || "").toLocaleLowerCase() === String(cuenta.email || "").toLocaleLowerCase()).length; });
    const categoria = {
      TODAS: gmail.suscripcionesCorreo.length,
      CATEGORY_PROMOTIONS: gmail.suscripcionesCorreo.filter((item) => (item.categorias || []).includes("CATEGORY_PROMOTIONS")).length,
      CATEGORY_UPDATES: gmail.suscripcionesCorreo.filter((item) => (item.categorias || []).includes("CATEGORY_UPDATES")).length,
    };
    const cantidadConBaja = gmail.suscripcionesCorreo.filter((item) => item.urlBaja || item.mailtoBaja).length;
    const baja = { TODAS: gmail.suscripcionesCorreo.length, SI: cantidadConBaja, NO: gmail.suscripcionesCorreo.length - cantidadConBaja };
    return { cuenta: cuentas, categoria, baja };
  }, [gmail.suscripcionesCorreo, cuentasGmail]);

  const cambiarFiltroCorreo = (campo, valor) => setFiltrosCorreo((actuales) => {
    if (campo === "categorias" && valor === "TODAS") return { ...actuales, categorias: [] };
    const seleccionadas = actuales[campo];
    return { ...actuales, [campo]: seleccionadas.includes(valor) ? seleccionadas.filter((item) => item !== valor) : [...seleccionadas, valor] };
  });

  const cambiarSuscripcionManual = (campo, valor) => {
    setSuscripcionManual((actual) => ({ ...actual, [campo]: valor }));
  };

  const guardarSuscripcionManual = async (evento) => {
    evento.preventDefault();
    setErrorSuscripcionManual("");
    const nombre = suscripcionManual.nombre.trim();
    const montoTexto = String(suscripcionManual.monto || "").trim();
    const montoNormalizado = montoTexto
      .replace(/\s/g, "")
      .replace(/\./g, "")
      .replace(/,/g, ".");
    const monto = Number(montoNormalizado);
    const fechaCobro = suscripcionManual.fechaCobro;
    if (!nombre || !montoTexto || !Number.isFinite(monto) || monto <= 0 || !fechaCobro) return;

    setGuardandoSuscripcionManual(true);
    try {
      const creada = await crearSuscripcionManual({
        nombre,
        monto,
        fechaCobro,
        categoria: suscripcionManual.categoria,
        importancia: suscripcionManual.importancia,
        prioridad: suscripcionManual.prioridad,
        apodo: suscripcionManual.apodo,
      });

      try {
        setSuscripcionesManuales(await listarSuscripcionesManuales());
      } catch {
        setSuscripcionesManuales((actuales) => [creada, ...actuales]);
      }

      setSuscripcionManual(SUSCRIPCION_MANUAL_INICIAL);
      setModalManualAbierto(false);
    } catch (error) {
      setErrorSuscripcionManual(error?.message || "No se pudo registrar la suscripción. Intenta de nuevo.");
    } finally {
      setGuardandoSuscripcionManual(false);
    }
  };

  /** Propaga los ajustes guardados en el detalle (apodo, importancia, prioridad) a la lista correspondiente. */
  const alActualizarDetalle = (cambios) => {
    const detalle = suscripcionCorreoDetalle;
    if (!detalle) return;
    const esManual = detalle.origen === "MANUAL" || (!detalle.cuentaGmailId && !detalle.correoRemitente);
    if (esManual) {
      setSuscripcionesManuales((actuales) => actuales.map((item) =>
        String(item.id) === String(detalle.id) ? { ...item, ...cambios } : item));
    } else {
      gmail.actualizarSuscripcionLocal?.(detalle.idSuscripcion || detalle.id, cambios);
    }
    setSuscripcionCorreoDetalle((actual) => (actual ? { ...actual, ...cambios } : actual));
  };

  // "Administrar en Gmail" se movió a Configuración (Ajustes).

  /** Abre el detalle compartido; en items de Gmail recuerda el elemento que lo disparó para devolver el foco. */
  const abrirDetalleCombinado = (item, evento) => {
    triggerDetalleCorreoRef.current = evento?.currentTarget ?? null;
    setSuscripcionCorreoDetalle(item);
  };

  return (
    <section aria-labelledby="suscripciones-titulo" className="space-y-6 pt-6 pb-12">
      <AlertaGlobal
        idBase="suscripciones-recurrentes-error"
        tipo="error"
        mensaje={recurrentes.error && recurrentes.error !== errorRecurrentesCerrado ? recurrentes.error : ""}
        alCerrar={() => setErrorRecurrentesCerrado(recurrentes.error || "")}
      />
      <AlertaGlobal
        idBase="suscripciones-gmail-error"
        tipo="error"
        mensaje={gmail.error && gmail.error !== errorGmailCerrado ? gmail.error : ""}
        alCerrar={() => setErrorGmailCerrado(gmail.error || "")}
      />
      <AlertaGlobal
        idBase="suscripciones-gmail-cuentas-error"
        tipo="error"
        mensaje={textoErroresCuentas && textoErroresCuentas !== erroresCuentasCerrados ? `Algunas cuentas Gmail no se pudieron consultar: ${textoErroresCuentas}` : ""}
        alCerrar={() => setErroresCuentasCerrados(textoErroresCuentas)}
      />
      <AlertaGlobal
        idBase="suscripciones-manuales-error"
        tipo="error"
        mensaje={errorSuscripcionManual && errorSuscripcionManual !== errorManualCerrado ? errorSuscripcionManual : ""}
        alCerrar={() => setErrorManualCerrado(errorSuscripcionManual)}
      />
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-emerald-primary">FinApp / Panel</p>
          <h1 id="suscripciones-titulo" className="mt-1 font-display text-3xl font-medium text-bg-dark">Suscripciones</h1>
          <p className="mt-1 text-sm text-slate-text">Todas tus suscripciones y cobros periódicos en un solo lugar: Gmail, registros manuales y cobros detectados.</p>
        </div>
        <div className="flex w-full flex-wrap gap-2 sm:w-auto" aria-label="Acciones de suscripciones de Gmail">
          <button ref={triggerBuscarRef} type="button" onClick={() => setBuscarAbierto(true)} aria-label="Buscar suscripciones de Gmail" title="Buscar" className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-border-line px-3 text-sm font-medium text-slate-text hover:border-emerald-primary/50 hover:text-emerald-primary sm:flex-none"><Search className="h-4 w-4" aria-hidden="true" /><span>Buscar</span></button>
          <button ref={triggerFiltrarRef} type="button" onClick={() => setFiltrarAbierto(true)} aria-label="Filtrar suscripciones de Gmail" title="Filtrar" className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-border-line px-3 text-sm font-medium text-slate-text hover:border-emerald-primary/50 hover:text-emerald-primary sm:flex-none"><Filter className="h-4 w-4" aria-hidden="true" /><span>Filtrar</span></button>
          <button ref={triggerManualRef} type="button" onClick={() => setModalManualAbierto(true)} aria-label="Registrar suscripción manual" title="Registrar suscripción" className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-primary px-3 text-sm font-semibold text-white hover:bg-emerald-hover sm:flex-none"><Plus className="h-4 w-4" aria-hidden="true" /><span>Registrar suscripción</span></button>
        </div>
      </header>

      <MetricasCobrosRecurrentes datos={recurrentes.suscripciones} cargando={recurrentes.cargando} />

      <TodasSuscripcionesSection
        suscripcionesGmail={suscripcionesCorreoFiltradas}
        totalGmail={gmail.suscripcionesCorreo.length}
        cargandoGmail={gmail.cargando}
        consultaRealizada={gmail.consultaRealizada}
        cantidadCuentas={cuentasGmail.length}
        manuales={suscripcionesManuales}
        cargandoManuales={cargandoSuscripcionesManuales}
        recurrentes={recurrentes.suscripciones}
        cargandoRecurrentes={recurrentes.cargando}
        filtrosActivos={filtrosActivos}
        alLimpiarFiltros={() => { setFiltrosCorreo(FILTROS_CORREO_INICIALES); setBusquedaCorreo(""); }}
        alAbrirDetalle={abrirDetalleCombinado}
        formatoMoneda={formatoMoneda}
        formatoFecha={formatoFechaCobro}
      />

      <BuscarSuscripcionesModal abierto={buscarAbierto} alCerrar={() => setBuscarAbierto(false)} triggerRef={triggerBuscarRef} busqueda={busquedaCorreo} alCambiarBusqueda={setBusquedaCorreo} resultados={suscripcionesCorreoFiltradas} alSeleccionar={(item) => { triggerDetalleCorreoRef.current = triggerBuscarRef.current; setBuscarAbierto(false); setSuscripcionCorreoDetalle(item); }} />
      <FiltrarSuscripcionesModal
        abierto={filtrarAbierto}
        alCerrar={() => setFiltrarAbierto(false)}
        triggerRef={triggerFiltrarRef}
        filtros={filtrosCorreo}
        alCambiarFiltro={cambiarFiltroCorreo}
        alLimpiar={() => setFiltrosCorreo(FILTROS_CORREO_INICIALES)}
        cuentas={cuentasGmail}
        cantidades={conteosFiltro}
        totalCategorias={gmail.suscripcionesCorreo.length}
        categoriasPersonalizadas={categoriasPersonalizadas.map(({ nombre, ids }) => ({ nombre, cantidad: ids.length }))}
        alCrearCategoria={() => { setFiltrarAbierto(false); setCrearCategoriaAbierto(true); }}
      />
      <DetalleSuscripcionModal suscripcion={suscripcionCorreoDetalle} triggerRef={triggerDetalleCorreoRef} alCerrar={() => setSuscripcionCorreoDetalle(null)} alActualizar={alActualizarDetalle} />
      <CrearSuscripcionManualModal
        abierto={modalManualAbierto}
        alCerrar={() => setModalManualAbierto(false)}
        triggerRef={triggerManualRef}
        valores={suscripcionManual}
        alCambiar={cambiarSuscripcionManual}
        alGuardar={guardarSuscripcionManual}
        categorias={CATEGORIAS_SUSCRIPCION_MANUAL}
        guardando={guardandoSuscripcionManual}
      />
      <ModalDetalleRegistro abierto={crearCategoriaAbierto} titulo="Crear categoría" alCerrar={() => setCrearCategoriaAbierto(false)} ancho="max-w-md">
        <form className="space-y-4" onSubmit={(evento) => { evento.preventDefault(); const nombre = nombreCategoria.trim(); if (!nombre) return; const ids = suscripcionesCorreoFiltradas.map((item) => `${item.cuentaGmailId || ""}:${item.id || item.correoRemitente || ""}`); setCategoriasPersonalizadas((actuales) => { const existentes = actuales.filter((item) => item.nombre.toLocaleLowerCase() !== nombre.toLocaleLowerCase()); return [...existentes, { nombre, ids }]; }); setFiltrosCorreo((actuales) => ({ ...actuales, categorias: [nombre] })); setNombreCategoria(""); setCrearCategoriaAbierto(false); }}>
          <p className="text-sm text-slate-text">La categoría se aplicará a las {suscripcionesCorreoFiltradas.length} suscripciones que coinciden actualmente con la búsqueda y los filtros.</p>
          <label className="block space-y-2 text-sm font-medium text-bg-dark">Nombre de la categoría<input autoFocus maxLength={40} required value={nombreCategoria} onChange={(evento) => setNombreCategoria(evento.target.value)} placeholder="Ej. Finanzas" className="min-h-11 w-full rounded-xl border border-border-line bg-bg-cream px-3 text-bg-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary" /></label>
          <div className="flex justify-end gap-2 border-t border-border-line/40 pt-3"><button type="button" onClick={() => setCrearCategoriaAbierto(false)} className="min-h-10 rounded-xl border border-border-line px-4 text-sm font-medium text-bg-dark">Cancelar</button><button type="submit" className="min-h-10 rounded-xl bg-emerald-primary px-4 text-sm font-semibold text-white">Crear categoría</button></div>
        </form>
      </ModalDetalleRegistro>
    </section>
  );
}
