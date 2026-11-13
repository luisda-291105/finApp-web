import { Link } from "react-router-dom";
import { useMemo, useRef, useState } from "react";
import { ExternalLink, Filter, Search } from "lucide-react";
import { Card } from "../../../components/ui";
import ModalDetalleRegistro from "../../../components/domain/modales/ModalDetalleRegistro";
import { useGmail } from "../../../context/GmailContext";
import useSuscripcionesGmail from "../hooks/useSuscripcionesGmail";
import SuscripcionGmailCard from "../components/cards/SuscripcionGmailCard";
import FiltroCategoriasSuscripciones from "../components/cards/FiltroCategoriasSuscripciones";
import CobrosRecurrentesReales from "../components/cards/CobrosRecurrentesReales";
import useSuscripcionesRecurrentes from "../hooks/useSuscripcionesRecurrentes";
import BuscarSuscripcionesModal from "../components/modals/BuscarSuscripcionesModal";
import FiltrarSuscripcionesModal from "../components/modals/FiltrarSuscripcionesModal";
import DetalleSuscripcionModal from "../components/modals/DetalleSuscripcionModal";

const FILTROS_CORREO_INICIALES = { cuentas: [], categorias: [], baja: [] };

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
  const triggerBuscarRef = useRef(null);
  const triggerFiltrarRef = useRef(null);
  const triggerDetalleCorreoRef = useRef(null);

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
  const cuentaGmailAdministrar = cuentasGmail[0];
  const urlAdministrarGmail = `https://mail.google.com/mail/u/?authuser=${encodeURIComponent(cuentaGmailAdministrar?.email || "")}#sub`;

  return (
    <section aria-labelledby="suscripciones-titulo" className="space-y-6 pt-6 pb-12">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-emerald-primary">FinApp / Panel</p>
          <h1 id="suscripciones-titulo" className="mt-1 font-display text-3xl font-medium text-bg-dark">Suscripciones</h1>
          <p className="mt-1 text-sm text-slate-text">Controla tus cobros periódicos reales y las suscripciones de tus cuentas Gmail.</p>
        </div>
        <div className="flex w-full flex-wrap gap-2 sm:w-auto" aria-label="Acciones de suscripciones de Gmail">
          <button ref={triggerBuscarRef} type="button" onClick={() => setBuscarAbierto(true)} aria-label="Buscar suscripciones de Gmail" title="Buscar" className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-border-line px-3 text-sm font-medium text-slate-text hover:border-emerald-primary/50 hover:text-emerald-primary sm:flex-none"><Search className="h-4 w-4" aria-hidden="true" /><span>Buscar</span></button>
          <button ref={triggerFiltrarRef} type="button" onClick={() => setFiltrarAbierto(true)} aria-label="Filtrar suscripciones de Gmail" title="Filtrar" className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-border-line px-3 text-sm font-medium text-slate-text hover:border-emerald-primary/50 hover:text-emerald-primary sm:flex-none"><Filter className="h-4 w-4" aria-hidden="true" /><span>Filtrar</span></button>
          <a href={urlAdministrarGmail} target="_blank" rel="noreferrer" aria-label="Administrar suscripciones en Gmail" className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-border-line px-3 text-sm font-medium text-slate-text hover:border-emerald-primary/50 hover:text-emerald-primary sm:flex-none"><ExternalLink className="h-4 w-4" aria-hidden="true" /><span>Administrar en Gmail</span></a>
        </div>
      </header>

      <FiltroCategoriasSuscripciones seleccionadas={filtrosCorreo.categorias} cantidades={conteosFiltro.categoria} total={gmail.suscripcionesCorreo.length} categoriasPersonalizadas={categoriasPersonalizadas.map(({ nombre, ids }) => ({ nombre, cantidad: ids.length }))} alCrearCategoria={() => setCrearCategoriaAbierto(true)} alAlternar={(valor) => cambiarFiltroCorreo("categorias", valor)} />

      <CobrosRecurrentesReales datos={recurrentes.suscripciones} cargando={recurrentes.cargando} error={recurrentes.error} />

      <section aria-labelledby="suscripciones-correo-titulo" className="space-y-4">
        <Card className="space-y-4 p-5">
          <h2 id="suscripciones-correo-titulo" className="sr-only">Suscripciones de Gmail</h2>
          {!cuentasGmail.length && <p className="rounded-xl border border-border-line/50 bg-bg-cream/50 p-3 text-sm text-slate-text">Conecta Gmail desde <Link to="/dashboard/configuracion" className="font-semibold text-emerald-primary underline">Configuración → Fuentes</Link> para consultar las suscripciones.</p>}
          {gmail.error && <p role="alert" className="rounded-xl border border-red-300/40 bg-red-50 p-3 text-sm text-red-700">{gmail.error}</p>}
          {gmail.erroresCuentas.length > 0 && <ul aria-label="Cuentas Gmail con error" className="space-y-1 rounded-xl border border-amber-300/50 bg-amber-50 p-3 text-sm text-amber-900">{gmail.erroresCuentas.map((item) => <li key={item.correo}><strong>{item.correo}:</strong> {item.mensaje}</li>)}</ul>}
          {gmail.cargando && <p role="status" className="py-4 text-sm text-slate-text">Consultando las suscripciones recientes por cuenta Gmail…</p>}
          {!gmail.cargando && gmail.consultaRealizada && <p role="status" className="text-sm text-slate-text">Mostrando {suscripcionesCorreoFiltradas.length} de {gmail.suscripcionesCorreo.length} suscripciones detectadas en {cuentasGmail.length} {cuentasGmail.length === 1 ? "cuenta" : "cuentas"}.</p>}
          {!gmail.cargando && gmail.consultaRealizada && gmail.suscripcionesCorreo.length === 0 && !gmail.erroresCuentas.length && <p className="rounded-xl border border-border-line/50 bg-bg-cream/50 p-4 text-sm text-slate-text">No se detectaron suscripciones en los correos recientes. Gmail puede mostrar más en su administrador.</p>}
          {!gmail.cargando && suscripcionesCorreoFiltradas.length > 0 && <ul aria-label="Suscripciones de Gmail" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">{suscripcionesCorreoFiltradas.map((item) => <SuscripcionGmailCard key={`${item.cuentaGmailId}:${item.id}`} suscripcion={item} alAbrir={(evento) => { triggerDetalleCorreoRef.current = evento.currentTarget; setSuscripcionCorreoDetalle(item); }} />)}</ul>}
          {!gmail.cargando && gmail.consultaRealizada && gmail.suscripcionesCorreo.length > 0 && suscripcionesCorreoFiltradas.length === 0 && <div className="rounded-xl border border-border-line/50 bg-bg-cream/50 p-4 text-sm text-slate-text"><p>No hay suscripciones que coincidan con la búsqueda y los filtros seleccionados.</p><button type="button" onClick={() => { setFiltrosCorreo(FILTROS_CORREO_INICIALES); setBusquedaCorreo(""); }} className="mt-2 font-semibold text-emerald-primary underline">Limpiar filtros y búsqueda</button></div>}
          <p className="text-xs leading-relaxed text-slate-text">La lista se detecta en mensajes de Promociones y Actualizaciones. Para exactitud y administrar bajas, Gmail mantiene su administrador de suscripciones.</p>
        </Card>
      </section>

      <BuscarSuscripcionesModal abierto={buscarAbierto} alCerrar={() => setBuscarAbierto(false)} triggerRef={triggerBuscarRef} busqueda={busquedaCorreo} alCambiarBusqueda={setBusquedaCorreo} resultados={suscripcionesCorreoFiltradas} alSeleccionar={(item) => { triggerDetalleCorreoRef.current = triggerBuscarRef.current; setBuscarAbierto(false); setSuscripcionCorreoDetalle(item); }} />
      <FiltrarSuscripcionesModal abierto={filtrarAbierto} alCerrar={() => setFiltrarAbierto(false)} triggerRef={triggerFiltrarRef} filtros={filtrosCorreo} alCambiarFiltro={cambiarFiltroCorreo} alLimpiar={() => setFiltrosCorreo(FILTROS_CORREO_INICIALES)} cuentas={cuentasGmail} cantidades={conteosFiltro} />
      <DetalleSuscripcionModal suscripcion={suscripcionCorreoDetalle} triggerRef={triggerDetalleCorreoRef} alCerrar={() => setSuscripcionCorreoDetalle(null)} />
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
