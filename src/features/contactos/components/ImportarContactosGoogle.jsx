/**
 * @uso        Modal para consultar y seleccionar contactos de Google
 * @funciones  ImportarContactosGoogle({ abierto, contactosLocales, triggerRef, alCerrar, alImportar })
 * @datos      Consulta todas las cuentas Gmail registradas en Fuentes y guarda contactos por lote
 * @eventos    Consultar al abrir, filtrar, seleccionar, importar y cerrar
 * @estados    contactosGoogle, filtro, seleccionados, consultaRealizada, cargando, importando, error y aviso
 * @usadoPor   ContactosPage
 */
import { useEffect, useMemo, useState } from "react";
import { Download, RefreshCw, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useGmail } from "../../../context/GmailContext";
import { obtenerConexionCuentaGmail, obtenerContactosGoogle } from "../../../services/gmailServicio";
import { formatearTelefonoColombia, normalizarTelefonoColombia } from "../../../utils/formatoTelefono";
import { importarContactosGoogle } from "../services/contactosService";
import ModalDetalleRegistro from "../../../components/domain/modales/ModalDetalleRegistro";

function normalizar(valor) { return String(valor || "").trim().toLocaleLowerCase(); }
function origenGoogle(contacto) {
  const recurso = contacto.googleResourceName || "";
  return contacto.googleAccountId ? `GOOGLE_CONTACTS:${contacto.googleAccountId}:${recurso}` : `GOOGLE_CONTACTS:${recurso}`;
}
function idGoogle(contacto) { return `${contacto.googleAccountId || ""}:${contacto.googleResourceName || ""}`; }
function origenGoogleAntiguo(contacto) { return `GOOGLE_CONTACTS:${contacto.googleResourceName || ""}`; }
function buscarGoogleLocal(contacto, localesPorOrigen) {
  return localesPorOrigen.get(origenGoogle(contacto)) || localesPorOrigen.get(origenGoogleAntiguo(contacto));
}
function coincideLocal(contacto, locales, localesPorCorreo, localesPorTelefono) {
  return Boolean(locales.has(origenGoogle(contacto))
    || locales.has(origenGoogleAntiguo(contacto))
    || (contacto.correo && localesPorCorreo.has(normalizar(contacto.correo)))
    || (contacto.telefono && localesPorTelefono.has(normalizarTelefonoColombia(contacto.telefono))));
}
function requiereActualizarDatos(contacto, localesPorOrigen) {
  const existente = buscarGoogleLocal(contacto, localesPorOrigen);
  return Boolean(existente && ((contacto.googleAccountEmail && contacto.googleAccountEmail !== existente.correoOrigen)
    || (contacto.cargo && contacto.cargo !== existente.cargo)
    || (contacto.empresa && contacto.empresa !== existente.empresa)));
}

/** Consulta Google Contacts con la cuenta guardada e importa los contactos nuevos elegidos. */
export default function ImportarContactosGoogle({ abierto, contactosLocales, triggerRef, alCerrar, alImportar }) {
  const { cuentasGmail } = useGmail();
  const [contactosGoogle, setContactosGoogle] = useState([]);
  const [seleccionados, setSeleccionados] = useState(new Set());
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("TODOS");
  const [cuentaOrigen, setCuentaOrigen] = useState("TODAS");
  const [cargando, setCargando] = useState(false);
  const [importando, setImportando] = useState(false);
  const [consultaRealizada, setConsultaRealizada] = useState(false);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");
  const [erroresCuentas, setErroresCuentas] = useState([]);

  const localesPorIdGoogle = useMemo(() => new Set(contactosLocales.map((item) => item.origen).filter((origen) => origen?.startsWith("GOOGLE_CONTACTS:"))), [contactosLocales]);
  const localesGooglePorOrigen = useMemo(() => new Map(contactosLocales.filter((item) => item.origen?.startsWith("GOOGLE_CONTACTS:")).map((item) => [item.origen, item])), [contactosLocales]);
  const localesPorCorreo = useMemo(() => new Set(contactosLocales.map((item) => normalizar(item.correo)).filter(Boolean)), [contactosLocales]);
  const localesPorTelefono = useMemo(() => new Set(contactosLocales.map((item) => normalizarTelefonoColombia(item.telefono)).filter(Boolean)), [contactosLocales]);
  const nuevos = useMemo(() => contactosGoogle.filter((item) => item.googleResourceName
    && !coincideLocal(item, localesPorIdGoogle, localesPorCorreo, localesPorTelefono)), [contactosGoogle, localesPorIdGoogle, localesPorCorreo, localesPorTelefono]);
  const yaImportados = useMemo(() => contactosGoogle.filter((item) => coincideLocal(item, localesPorIdGoogle, localesPorCorreo, localesPorTelefono)), [contactosGoogle, localesPorIdGoogle, localesPorCorreo, localesPorTelefono]);
  const actualizables = useMemo(() => contactosGoogle.filter((item) => requiereActualizarDatos(item, localesGooglePorOrigen)), [contactosGoogle, localesGooglePorOrigen]);
  const actualizablesIds = useMemo(() => new Set(actualizables.map(idGoogle)), [actualizables]);
  const contactosDeFuente = useMemo(() => cuentaOrigen === "TODAS"
    ? contactosGoogle
    : contactosGoogle.filter((item) => String(item.googleAccountId) === String(cuentaOrigen)), [contactosGoogle, cuentaOrigen]);
  const nuevosFuente = useMemo(() => contactosDeFuente.filter((item) => item.googleResourceName
    && !coincideLocal(item, localesPorIdGoogle, localesPorCorreo, localesPorTelefono)), [contactosDeFuente, localesPorIdGoogle, localesPorCorreo, localesPorTelefono]);
  const importadosFuente = useMemo(() => contactosDeFuente.filter((item) => coincideLocal(item, localesPorIdGoogle, localesPorCorreo, localesPorTelefono)), [contactosDeFuente, localesPorIdGoogle, localesPorCorreo, localesPorTelefono]);
  const listaFiltro = filtro === "NUEVOS" ? nuevosFuente : filtro === "IMPORTADOS" ? importadosFuente : contactosDeFuente;
  const filtrados = useMemo(() => listaFiltro.filter((item) => `${item.nombre} ${item.correo} ${item.telefono} ${item.cargo} ${item.empresa}`.toLocaleLowerCase().includes(busqueda.toLocaleLowerCase())), [listaFiltro, busqueda]);
  const seleccionables = contactosDeFuente.filter((item) => !coincideLocal(item, localesPorIdGoogle, localesPorCorreo, localesPorTelefono)
    || actualizablesIds.has(idGoogle(item)));
  const seleccionadosDeFuente = seleccionables.filter((item) => seleccionados.has(idGoogle(item)));
  const todosSeleccionados = seleccionables.length > 0 && seleccionadosDeFuente.length === seleccionables.length;

  useEffect(() => {
    if (!abierto) return;
    setContactosGoogle([]);
    setSeleccionados(new Set());
    setConsultaRealizada(false);
    setAviso("");
    setError("");
    setErroresCuentas([]);
    setBusqueda("");
    setFiltro("TODOS");
    setCuentaOrigen("TODAS");
    if (cuentasGmail.length) consultar(cuentasGmail);
    else setError("No hay cuentas Gmail registradas en Fuentes.");
  // La consulta usa todas las cuentas Gmail registradas y se repite cuando se cargan.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto, cuentasGmail]);

  const consultar = async (cuentas = cuentasGmail) => {
    if (!cuentas.length) { setError("No hay cuentas Gmail registradas en Fuentes."); return; }
    setCargando(true); setError(""); setAviso(""); setErroresCuentas([]);
    try {
      const resultado = [];
      const cuentasConsultadas = [];
      const cuentasFallidas = [];
      for (const cuenta of cuentas) {
        try {
          const conexion = await obtenerConexionCuentaGmail(cuenta.id);
          const contactosCuenta = await obtenerContactosGoogle(conexion.access_token || "");
          const emailCuenta = conexion.email || cuenta.email;
          resultado.push(...contactosCuenta.map((contacto) => ({ ...contacto, googleAccountId: cuenta.id, googleAccountEmail: emailCuenta })));
          cuentasConsultadas.push(emailCuenta);
        } catch (falloCuenta) {
          cuentasFallidas.push({ email: cuenta.email, mensaje: falloCuenta?.message || "No se pudo consultar esta cuenta." });
        }
      }
      const idsConsultados = new Set(cuentas.map((cuenta) => String(cuenta.id)));
      const resultadoConservado = [
        ...contactosGoogle.filter((item) => !idsConsultados.has(String(item.googleAccountId))),
        ...resultado,
      ];
      setContactosGoogle(resultadoConservado);
      setConsultaRealizada(true);
      setErroresCuentas(cuentasFallidas);
      const conservarSeleccion = [...seleccionados].filter((id) => {
        const anterior = contactosGoogle.find((item) => idGoogle(item) === id);
        return anterior && !idsConsultados.has(String(anterior.googleAccountId));
      });
      setSeleccionados(new Set([
        ...conservarSeleccion,
        ...resultado.filter((item) => item.googleResourceName
          && (!coincideLocal(item, localesPorIdGoogle, localesPorCorreo, localesPorTelefono)
            || requiereActualizarDatos(item, localesGooglePorOrigen))).map(idGoogle),
      ]));
      setAviso(`Se encontraron ${resultado.length} contactos en ${cuentasConsultadas.length} de ${cuentas.length} cuentas Gmail; ${resultado.filter((item) => coincideLocal(item, localesPorIdGoogle, localesPorCorreo, localesPorTelefono)).length} ya están en FinApp.`);
      if (!resultado.length && cuentasFallidas.length) setError("No se pudieron obtener contactos de ninguna cuenta autorizada.");
    } catch (fallo) { setError(fallo?.message || "No se pudieron cargar los contactos de Google."); }
    finally { setCargando(false); }
  };

  const importar = async () => {
    const lote = contactosDeFuente.filter((item) => seleccionados.has(idGoogle(item))
      && (!coincideLocal(item, localesPorIdGoogle, localesPorCorreo, localesPorTelefono) || actualizablesIds.has(idGoogle(item))));
    if (!lote.length) return;
    const cantidadNuevos = lote.filter((item) => !coincideLocal(item, localesPorIdGoogle, localesPorCorreo, localesPorTelefono)).length;
    const cantidadActualizados = lote.length - cantidadNuevos;
    setImportando(true); setError(""); setAviso("");
    try {
      await importarContactosGoogle(lote.map((item) => {
        const camposContacto = { ...item };
        delete camposContacto.googleResourceName;
        delete camposContacto.googleAccountId;
        delete camposContacto.googleAccountEmail;
        const existente = buscarGoogleLocal(item, localesGooglePorOrigen);
        const origenExistente = existente?.origen || "";
        const origenGoogleActual = origenExistente.startsWith("GOOGLE_CONTACTS:people/") ? origenGoogle(item) : origenExistente || origenGoogle(item);
        return {
          ...camposContacto,
          nombre: item.nombre.slice(0, 100),
          telefono: item.telefono.slice(0, 64),
          notas: item.notas.slice(0, 500),
          cargo: item.cargo ? item.cargo.slice(0, 150) : undefined,
          empresa: item.empresa ? item.empresa.slice(0, 150) : undefined,
          correoOrigen: item.googleAccountEmail || undefined,
          origen: origenGoogleActual.slice(0, 255),
        };
      }));
      setAviso([cantidadNuevos && `Se importaron ${cantidadNuevos} contactos`, cantidadActualizados && `se actualizaron ${cantidadActualizados} con cargo o empresa`].filter(Boolean).join("; ") + " en FinApp.");
      setSeleccionados(new Set());
      await alImportar?.();
    } catch (fallo) { setError(fallo?.message || "No se pudieron importar los contactos seleccionados."); }
    finally { setImportando(false); }
  };

  const alternar = (id) => setSeleccionados((actuales) => {
    const siguiente = new Set(actuales);
    if (siguiente.has(id)) siguiente.delete(id); else siguiente.add(id);
    return siguiente;
  });

  const alternarTodos = () => setSeleccionados((actuales) => {
    const siguiente = new Set(actuales);
    if (todosSeleccionados) seleccionables.forEach((item) => siguiente.delete(idGoogle(item)));
    else seleccionables.forEach((item) => siguiente.add(idGoogle(item)));
    return siguiente;
  });

  const filtros = [
    { id: "TODOS", etiqueta: "Todos", cantidad: contactosDeFuente.length, tono: "correo-tono-todos" },
    { id: "NUEVOS", etiqueta: "Nuevos", cantidad: nuevosFuente.length, tono: "correo-tono-contable" },
    { id: "IMPORTADOS", etiqueta: "En FinApp", cantidad: importadosFuente.length, tono: "correo-tono-no-importante" },
  ];

  return <ModalDetalleRegistro abierto={abierto} titulo="Contactos de Google" alCerrar={alCerrar} triggerRef={triggerRef} ancho="max-w-4xl">
    <section aria-label="Importar contactos de Google" className="min-w-0 overflow-hidden rounded-2xl border border-border-line/50 bg-bg-cream/60">
      <header className="flex min-w-0 flex-wrap items-center justify-between gap-3 border-b border-border-line/30 p-4 sm:p-5">
        <div className="flex min-w-0 items-start gap-3"><span className="rounded-xl bg-emerald-primary/10 p-2 text-emerald-primary"><Users className="h-5 w-5" aria-hidden="true" /></span>
        <div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-wide text-slate-text">Fuentes Gmail</p><p className="break-all text-sm font-medium text-emerald-primary">{cuentasGmail.length} {cuentasGmail.length === 1 ? "cuenta registrada" : "cuentas registradas"}</p><p className="mt-1 text-xs text-slate-text">Elige una cuenta para consultar o selecciona todas.</p></div></div>
        <div className="flex w-full min-w-0 flex-wrap items-center gap-2 sm:w-auto sm:flex-1 sm:justify-end"><select value={cuentaOrigen} onChange={(evento) => setCuentaOrigen(evento.target.value)} aria-label="Cuenta Gmail de origen para importar" className="min-h-10 min-w-0 flex-1 rounded-lg border border-border-line bg-bg-cream px-3 text-sm sm:max-w-xs"><option value="TODAS">Todas las cuentas Gmail</option>{cuentasGmail.map((cuenta) => <option key={cuenta.id} value={String(cuenta.id)}>{cuenta.email}</option>)}</select><input type="search" value={busqueda} onChange={(evento) => setBusqueda(evento.target.value)} placeholder="Buscar contactos" aria-label="Buscar contactos de Google por nombre, correo, cargo o empresa" className="min-h-10 min-w-0 flex-1 rounded-lg border border-border-line bg-bg-cream px-3 text-sm sm:max-w-xs" /><button type="button" onClick={() => consultar(cuentaOrigen === "TODAS" ? cuentasGmail : cuentasGmail.filter((cuenta) => String(cuenta.id) === String(cuentaOrigen)))} disabled={!cuentasGmail.length || cargando} className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-emerald-primary/40 px-3 text-sm font-semibold text-emerald-primary disabled:cursor-not-allowed disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${cargando ? "animate-spin" : ""}`} aria-hidden="true" />{cargando ? "Actualizando…" : "Actualizar"}</button></div>
      </header>
    {!cuentasGmail.length && <p className="p-5 text-sm text-slate-text">Registra una cuenta Gmail en Configuración → Fuentes para consultar sus contactos.</p>}
    {error && <div className="mx-4 mt-4 rounded-lg bg-red-100 p-3 text-sm text-red-700 sm:mx-5"><p role="alert">{error}</p>{cuentasGmail.length > 0 && <Link to="/dashboard/configuracion" className="mt-2 inline-flex min-h-9 items-center rounded-lg border border-red-300 px-3 font-semibold hover:bg-red-200">Revisar autorización en Fuentes</Link>}</div>}
    {aviso && <p role="status" className="px-4 pt-3 text-sm text-slate-text sm:px-5">{aviso}</p>}
    {erroresCuentas.length > 0 && <div className="mx-4 mt-3 rounded-lg border border-amber-300/40 bg-amber-100/60 p-3 text-sm text-amber-900 sm:mx-5"><ul aria-label="Cuentas que no se pudieron consultar" className="space-y-2">{erroresCuentas.map((item) => <li key={item.email}><strong>{item.email}:</strong> {item.mensaje}</li>)}</ul><Link to="/dashboard/configuracion" className="mt-3 inline-flex min-h-9 items-center rounded-lg border border-amber-700/30 px-3 font-semibold hover:bg-amber-200/60">Revisar permisos en Fuentes</Link></div>}
    {cargando && <p role="status" className="p-5 text-sm text-slate-text">Consultando los contactos de todas las cuentas Gmail…</p>}
    {!contactosGoogle.length && !cargando && consultaRealizada && !error && <p className="p-5 text-sm text-slate-text">Ninguna cuenta autorizada tiene contactos disponibles para importar.</p>}
    {!contactosGoogle.length && !cargando && !consultaRealizada && cuentasGmail.length > 0 && !error && <p className="p-5 text-sm text-slate-text">Se consultarán todas las cuentas Gmail registradas al abrir este panel.</p>}
    {contactosGoogle.length > 0 && <>
      <nav className="flex flex-wrap gap-2 border-b border-border-line/30 p-3 sm:px-4" aria-label="Filtrar contactos de Google">{filtros.map((item) => <button key={item.id} type="button" aria-pressed={filtro === item.id} onClick={() => setFiltro(item.id)} className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-all ${item.tono} ${filtro === item.id ? "correo-filtro-activo" : ""}`}><span>{item.etiqueta}</span><span className="correo-contador inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-xs font-semibold tabular-nums">{item.cantidad}</span></button>)}</nav>
      <div className="flex flex-wrap justify-between gap-2 p-3 sm:p-4"><button type="button" onClick={alternarTodos} disabled={!seleccionables.length || importando} className="min-h-10 rounded-lg border border-border-line px-3 text-sm font-semibold text-bg-dark disabled:opacity-50">{todosSeleccionados ? "Deseleccionar todos" : "Seleccionar todos"}</button><button type="button" onClick={importar} disabled={!seleccionadosDeFuente.length || importando} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-emerald-primary px-3 text-sm font-semibold text-bg-cream disabled:opacity-50"><Download className="h-4 w-4" aria-hidden="true" />{importando ? "Guardando…" : `Importar o actualizar (${seleccionadosDeFuente.length})`}</button></div>
      {filtrados.length ? <ul className="grid max-h-[55vh] min-w-0 gap-3 overflow-y-auto p-3 pt-0 sm:grid-cols-2 sm:p-4 sm:pt-0 xl:grid-cols-3">{filtrados.map((contacto) => {
        const yaExiste = coincideLocal(contacto, localesPorIdGoogle, localesPorCorreo, localesPorTelefono);
        const inicial = contacto.nombre.split(/\s+/).filter(Boolean).slice(0, 2).map((parte) => parte[0]?.toUpperCase()).join("") || "?";
        return <li key={idGoogle(contacto)} className={`min-w-0 space-y-3 rounded-2xl border border-border-line/70 border-l-4 ${yaExiste ? "correo-barra-no-importante" : "correo-barra-contable"} bg-white p-4 shadow-sm`}>
          <div className="flex min-w-0 items-start gap-3"><span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-primary/10 text-sm font-semibold text-emerald-primary">{inicial}</span><div className="min-w-0 flex-1"><p className="break-words text-sm font-semibold leading-snug text-bg-dark">{contacto.nombre}</p><p className="mt-1 break-all text-xs text-emerald-primary">{contacto.correo || "Sin correo"}</p><p className="mt-1 break-all text-[11px] text-slate-text">Desde {contacto.googleAccountEmail}</p></div></div>
          <p className="min-h-10 break-words rounded-xl bg-bg-cream px-3 py-2 text-sm leading-relaxed text-slate-text">{formatearTelefonoColombia(contacto.telefono) || "Sin teléfono"}</p>
          {(contacto.cargo || contacto.empresa) && <p className="text-xs leading-relaxed text-slate-text">{[contacto.cargo, contacto.empresa].filter(Boolean).join(" · ")}</p>}
          <div className="flex items-center gap-2 border-t border-border-line/40 pt-3">{yaExiste && !actualizablesIds.has(idGoogle(contacto)) ? <span className="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold correo-tono-no-importante">Ya está en FinApp</span> : <label className="inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-lg px-2 text-xs font-semibold text-emerald-primary"><input type="checkbox" checked={seleccionados.has(idGoogle(contacto))} onChange={() => alternar(idGoogle(contacto))} aria-label={`${yaExiste ? "Actualizar" : "Importar"} ${contacto.nombre}`} className="h-4 w-4 accent-emerald-600" />{yaExiste ? "Actualizar origen, cargo o empresa" : "Seleccionar para importar"}</label>}</div>
        </li>;
      })}</ul> : <p className="p-5 text-sm text-slate-text">No hay contactos en este filtro que coincidan con la búsqueda.</p>}
    </>}
    </section>
  </ModalDetalleRegistro>;
}
