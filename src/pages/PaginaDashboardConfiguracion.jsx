/**
 * @uso        Página de configuración
 * @funciones  PaginaDashboardConfiguracion()
 * @datos      Usuario activo de UsuarioActivoContext y fuentes registradas desde fuenteServicio.obtenerFuentes()
 * @eventos    Apertura del modal de perfil y del modal Fuentes, click en Registrar fuentes
 * @estados    modalFuentesAbierto, usuarioAbierto, disparadorFuentesRef, triggerUsuarioRef, fuentes, cargandoFuentes, errorFuentes
 * @usadoPor   App.jsx (ruta /dashboard/configuracion)
 */

import { useEffect, useRef, useState } from "react";
import { Card } from "../components/ui/Card";
import ModalFuentes from "../components/domain/modales/ModalFuentes";
import ModalPerfilUsuario from "../components/domain/modales/ModalPerfilUsuario";
import { useUsuarioActivo } from "../context/UsuarioActivoContext";
import { useTema } from "../context/TemaContext";
import { useGmail } from "../context/GmailContext";
import { actualizarFuente, eliminarFuente, obtenerFuentesPorUsuario } from "../services/fuenteServicio";
import { GMAIL_CONFIGURADO } from "../services/gmailServicio";
import { Moon, Sun } from "lucide-react";

function EstadoFuente({ activo }) {
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${activo ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"}`}><span className={`h-2 w-2 rounded-full ${activo ? "animate-pulse bg-emerald-600" : "bg-slate-500"}`} aria-hidden="true" />{activo ? "Activa" : "Inactiva"}</span>;
}

export default function PaginaDashboardConfiguracion() {
  const [modalFuentesAbierto, setModalFuentesAbierto] = useState(false);
  const [usuarioAbierto, setUsuarioAbierto] = useState(false);
  const [fuentes, setFuentes] = useState([]);
  const [cargandoFuentes, setCargandoFuentes] = useState(true);
  const [errorFuentes, setErrorFuentes] = useState("");
  const [fuenteEditando, setFuenteEditando] = useState(null);
  const [fuenteEliminando, setFuenteEliminando] = useState(null);
  const [operacionFuente, setOperacionFuente] = useState(false);

  const disparadorFuentesRef = useRef(null);
  const triggerUsuarioRef = useRef(null);
  const { usuario } = useUsuarioActivo();
  const { tema, alternarTema } = useTema();
  const { tokenGmail, cuentaGmail, cuentasGmail, cuentaSeleccionadaId, gisListo, conexionCargando, errorGmail, conectarGmail, desconectarGmail, seleccionarCuentaGmail } = useGmail();

  const cargarFuentes = async () => {
    try {
      setCargandoFuentes(true);
      setErrorFuentes("");
      if (!usuario?.idUsuario) {
        setFuentes([]);
        setCargandoFuentes(false);
        return;
      }
      const respuesta = await obtenerFuentesPorUsuario(usuario.idUsuario);
      let lista = [];
      if (Array.isArray(respuesta)) {
        lista = respuesta;
      } else if (respuesta && Array.isArray(respuesta.data)) {
        lista = respuesta.data;
      } else if (respuesta && Array.isArray(respuesta.content)) {
        lista = respuesta.content;
      }
      setFuentes(lista);
    } catch (err) {
      setErrorFuentes(err?.message || "No se pudieron cargar las fuentes.");
      setFuentes([]);
    } finally {
      setCargandoFuentes(false);
    }
  };

  useEffect(() => {
    cargarFuentes();
  }, [usuario?.idUsuario]);

  const alGuardarFuente = async (nuevaFuente) => {
    try {
      const respuesta = await obtenerFuentesPorUsuario(usuario.idUsuario);
      const lista = Array.isArray(respuesta)
        ? respuesta
        : Array.isArray(respuesta?.data)
          ? respuesta.data
          : Array.isArray(respuesta?.content)
            ? respuesta.content
            : [];
      const guardada = lista.some((fuente) => fuente.idFuente === nuevaFuente.idFuente);
      setFuentes(lista);
      setErrorFuentes(guardada
        ? ""
        : "El servidor aceptó el registro, pero no aparece al volver a consultar las fuentes. Revisa la conexión y vuelve a cargar.");
    } catch (fallo) {
      setErrorFuentes(`La fuente se envió, pero no se pudo confirmar su persistencia: ${fallo?.message || "error al consultar el servidor"}`);
    }
  };

  const conectarFuentesGmail = async () => {
    try {
      await conectarGmail();
      const pendientes = fuentes.filter((fuente) => fuente.tipo?.toUpperCase() === "CORREO" && fuente.estado === false);
      const resultados = await Promise.allSettled(pendientes.map((fuente) => actualizarFuente(
        fuente.idFuente,
        { tipo: fuente.tipo, contenido: fuente.contenido, estado: true },
        usuario?.idUsuario,
      )));
      const activadas = new Set();
      resultados.forEach((resultado, indice) => { if (resultado.status === "fulfilled") activadas.add(pendientes[indice].idFuente); });
      if (activadas.size > 0) {
        const respuesta = await obtenerFuentesPorUsuario(usuario.idUsuario);
        const lista = Array.isArray(respuesta) ? respuesta : respuesta?.data || respuesta?.content || [];
        setFuentes(Array.isArray(lista) ? lista : []);
      }
      if (activadas.size < pendientes.length) setErrorFuentes("Gmail quedó conectado, pero algunas fuentes no se pudieron activar.");
      else setErrorFuentes("");
    } catch { /* El mensaje detallado se muestra desde GmailContext. */ }
  };

  const guardarEdicionFuente = async (evento) => {
    evento.preventDefault();
    if (!fuenteEditando || !usuario?.idUsuario || operacionFuente) return;
    setOperacionFuente(true);
    setErrorFuentes("");
    try {
      const payload = {
        tipo: fuenteEditando.tipo.trim().toUpperCase(),
        contenido: fuenteEditando.contenido.trim(),
        estado: fuenteEditando.estado,
        usuario: { idUsuario: usuario.idUsuario },
      };
      const respuesta = await actualizarFuente(fuenteEditando.idFuente, payload, usuario.idUsuario);
      const guardada = respuesta?.data || respuesta || { ...fuenteEditando, ...payload };
      setFuentes((actuales) => actuales.map((fuente) => fuente.idFuente === fuenteEditando.idFuente ? { ...fuente, ...guardada } : fuente));
      setFuenteEditando(null);
    } catch (fallo) {
      setErrorFuentes(fallo?.message || "No se pudo actualizar la fuente.");
    } finally {
      setOperacionFuente(false);
    }
  };

  const confirmarEliminacionFuente = async () => {
    if (!fuenteEliminando || !usuario?.idUsuario || operacionFuente) return;
    setOperacionFuente(true);
    setErrorFuentes("");
    try {
      await eliminarFuente(fuenteEliminando.idFuente, usuario.idUsuario);
      setFuentes((actuales) => actuales.filter((fuente) => fuente.idFuente !== fuenteEliminando.idFuente));
      setFuenteEliminando(null);
    } catch (fallo) {
      setErrorFuentes(fallo?.message || "No se pudo eliminar la fuente.");
    } finally {
      setOperacionFuente(false);
    }
  };

  const cuentaVinculada = (fuente) => fuente.tipo?.toUpperCase() === "CORREO"
    ? cuentasGmail.find((cuenta) => cuenta.email?.trim().toLowerCase() === fuente.contenido?.trim().toLowerCase())
    : null;
  const cuentasSinFuente = cuentasGmail.filter((cuenta) => !fuentes.some((fuente) => fuente.tipo?.toUpperCase() === "CORREO" && cuenta.email?.trim().toLowerCase() === fuente.contenido?.trim().toLowerCase()));

  return (
    <section aria-labelledby="dashboard-title" className="space-y-6 pt-6">
      <div>
        <p className="text-sm font-medium text-emerald-primary">FinApp / Panel</p>
        <h1 id="dashboard-title" className="mt-2 font-display text-3xl text-bg-dark">
          Configuración
        </h1>
      </div>
      <Card className="p-6">
        <p className="text-slate-text">
          Ajusta tus preferencias de cuenta y seguridad.
        </p>
      </Card>

      <Card className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold text-bg-dark">Apariencia</h2>
          <p className="text-sm text-slate-text">Elige el tema claro u oscuro para FinApp.</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={tema === "oscuro"}
          aria-label="Modo oscuro"
          onClick={alternarTema}
          className="inline-flex min-h-11 items-center gap-3 self-start rounded-full border border-border-line px-4 py-2 text-sm font-medium text-bg-dark transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary sm:self-auto"
        >
          {tema === "oscuro" ? <Moon className="h-4 w-4" aria-hidden="true" /> : <Sun className="h-4 w-4" aria-hidden="true" />}
          <span>{tema === "oscuro" ? "Modo oscuro" : "Modo claro"}</span>
          <span aria-hidden="true" className={`relative h-6 w-11 rounded-full transition-colors ${tema === "oscuro" ? "bg-emerald-primary" : "bg-slate-text/30"}`}>
            <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${tema === "oscuro" ? "translate-x-6" : "translate-x-1"}`} />
          </span>
        </button>
      </Card>

      <Card className="space-y-3 p-6">
        <div>
          <h2 className="font-display text-lg font-semibold text-bg-dark">Perfil</h2>
          <p className="text-sm text-slate-text">
            Ver y editar información básica de tu usuario.
          </p>
          {usuario && (
            <p className="mt-1 text-xs text-emerald-primary">
              Usuario activo: {usuario.nombre} ({usuario.idUsuario})
            </p>
          )}
        </div>
        <button
          ref={triggerUsuarioRef}
          type="button"
          onClick={() => setUsuarioAbierto(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-primary hover:bg-emerald-hover text-bg-cream text-sm font-medium shadow-md transition-all cursor-pointer hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-accent"
        >
          Ver perfil
        </button>
      </Card>

      <Card className="p-6 space-y-4">
        <div className="border-t border-border-line/60 pt-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-semibold text-bg-dark">
              Fuentes registradas
            </h2>
            <p className="mt-1 text-sm text-slate-text">
              Consulta y administra las fuentes asociadas a tu usuario.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button ref={disparadorFuentesRef} type="button" className="min-h-11 rounded-xl bg-emerald-primary px-4 py-2 font-medium text-bg-cream outline-none transition-colors hover:bg-emerald-hover focus-visible:ring-2 focus-visible:ring-emerald-primary focus-visible:ring-offset-2 cursor-pointer" onClick={() => setModalFuentesAbierto(true)}>Registrar fuentes</button>
            <button type="button" onClick={conectarFuentesGmail} disabled={!GMAIL_CONFIGURADO || !gisListo || conexionCargando} className="min-h-11 rounded-xl border border-emerald-primary px-4 py-2 text-sm font-medium text-emerald-primary hover:bg-emerald-primary/10 disabled:opacity-50">{!GMAIL_CONFIGURADO ? "Configura Gmail" : conexionCargando ? "Restaurando Gmail…" : !gisListo ? "Preparando Gmail…" : "Agregar cuenta Gmail"}</button>
          </div>
        </div>
        {!GMAIL_CONFIGURADO && <p className="text-sm text-amber-800">Configura VITE_GOOGLE_CLIENT_ID para habilitar la conexión.</p>}
        {errorGmail && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{errorGmail}</p>}
        {tokenGmail && <p className="text-sm text-emerald-primary">Gmail conectado como {cuentaGmail}. La conexión se guarda para restaurarse al volver a entrar y las fuentes nuevas se registran activas.</p>}
        {/* Listado renderizado de fuentes */}
        <div className="pt-2">
          {cargandoFuentes && (
            <p className="text-sm text-slate-text">Cargando fuentes...</p>
          )}

          {!cargandoFuentes && errorFuentes && (
            <p role="alert" className="text-xs text-red-600">{errorFuentes}</p>
          )}

          {!cargandoFuentes && !errorFuentes && fuentes.length === 0 && cuentasGmail.length === 0 && (
            <p className="text-sm text-slate-text">
              No hay fuentes registradas actualmente.
            </p>
          )}

          {!cargandoFuentes && !errorFuentes && (fuentes.length > 0 || cuentasGmail.length > 0) && (
            <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-line/30">
                    <th className="text-left py-2 pr-4 font-medium text-slate-text">
                      Tipo
                    </th>
                    <th className="text-left py-2 pr-4 font-medium text-slate-text">
                      Contenido
                    </th>
                    <th className="text-left py-2 pr-4 font-medium text-slate-text">
                      Estado
                    </th>
                    <th className="text-left py-2 font-medium text-slate-text">
                      Fecha
                    </th>
                    <th className="text-left py-2 pl-4 font-medium text-slate-text">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {fuentes.map((fuente, index) => (
                    <tr
                      key={fuente.idFuente || `fuente-${index}`}
                      className="border-b border-border-line/20"
                    >
                      {fuenteEditando?.idFuente === fuente.idFuente ? (
                        <>
                          <td className="py-2.5 pr-4"><label className="sr-only" htmlFor={`fuente-tipo-${fuente.idFuente}`}>Tipo de {fuente.contenido}</label><select id={`fuente-tipo-${fuente.idFuente}`} value={fuenteEditando.tipo} onChange={(evento) => setFuenteEditando((actual) => ({ ...actual, tipo: evento.target.value }))} className="min-h-10 rounded-lg border border-border-line bg-bg-cream px-2 text-sm"><option value="CORREO">CORREO</option><option value="TELEFONO">TELEFONO</option><option value="OTRO">OTRO</option></select></td>
                          <td className="py-2.5 pr-4"><label className="sr-only" htmlFor={`fuente-contenido-${fuente.idFuente}`}>Contenido de la fuente</label><input id={`fuente-contenido-${fuente.idFuente}`} value={fuenteEditando.contenido} maxLength={255} onChange={(evento) => setFuenteEditando((actual) => ({ ...actual, contenido: evento.target.value }))} className="min-h-10 w-full rounded-lg border border-border-line bg-bg-cream px-2 text-sm" /></td>
                          <td className="py-2.5 pr-4"><label className="sr-only" htmlFor={`fuente-estado-${fuente.idFuente}`}>Estado</label><select id={`fuente-estado-${fuente.idFuente}`} value={String(fuenteEditando.estado !== false)} onChange={(evento) => setFuenteEditando((actual) => ({ ...actual, estado: evento.target.value === "true" }))} className="min-h-10 rounded-lg border border-border-line bg-bg-cream px-2 text-sm"><option value="true">Activo</option><option value="false">Inactivo</option></select></td>
                          <td className="py-2.5 text-xs text-slate-text">{fuente.fechaCreacion || "-"}</td>
                          <td className="py-2.5 pl-4"><form onSubmit={guardarEdicionFuente} className="flex flex-wrap gap-2"><button type="submit" disabled={operacionFuente || !fuenteEditando.contenido.trim()} className="min-h-9 rounded-lg bg-emerald-primary px-3 text-xs font-semibold text-bg-cream hover:bg-emerald-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-accent disabled:opacity-50">Guardar</button><button type="button" disabled={operacionFuente} onClick={() => setFuenteEditando(null)} className="min-h-9 rounded-lg px-3 text-xs font-medium text-slate-text hover:bg-emerald-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-accent">Cancelar</button></form></td>
                        </>
                      ) : (
                        <>
                      <td className="py-2.5 pr-4 font-medium text-bg-dark">
                        <span className="inline-block px-2 py-0.5 rounded text-xs bg-emerald-primary/10 text-emerald-primary">
                          {fuente.tipo || "OTRO"}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4 text-bg-dark">
                        <span className="block">{fuente.contenido || "-"}</span>
                        {cuentaVinculada(fuente) && <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-800"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-600" aria-hidden="true" />Cuenta Gmail conectada</span>}
                      </td>
                      <td className="py-2.5 pr-4"><EstadoFuente activo={fuente.estado !== false} /></td>
                      <td className="py-2.5 text-xs text-slate-text">
                        {fuente.fechaCreacion || "-"}
                      </td>
                      <td className="py-2.5 pl-4">
                        {fuenteEliminando?.idFuente === fuente.idFuente ? (
                          <div className="flex flex-wrap items-center gap-2"><span className="text-xs text-slate-text">¿Eliminar esta fuente?</span><button type="button" disabled={operacionFuente} onClick={confirmarEliminacionFuente} className="min-h-9 rounded-lg bg-red-700 px-3 text-xs font-semibold text-white hover:bg-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700 disabled:opacity-50">Confirmar</button><button type="button" disabled={operacionFuente} onClick={() => setFuenteEliminando(null)} className="min-h-9 rounded-lg px-2 text-xs font-medium text-slate-text hover:bg-emerald-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-accent">Cancelar</button></div>
                        ) : (
                          <div className="flex flex-wrap gap-1">{cuentaVinculada(fuente) && <><button type="button" onClick={() => seleccionarCuentaGmail(cuentaVinculada(fuente).id)} className="min-h-9 rounded-lg px-2 text-xs font-medium text-emerald-primary hover:bg-emerald-primary/10">{String(cuentaVinculada(fuente).id) === String(cuentaSeleccionadaId) ? "Seleccionada" : "Consultar"}</button><button type="button" onClick={() => desconectarGmail(true, cuentaVinculada(fuente).id)} className="min-h-9 rounded-lg px-2 text-xs font-medium text-red-700 hover:bg-red-100">Desconectar</button></>}<button type="button" aria-label={`Editar fuente ${fuente.contenido}`} onClick={() => { setFuenteEliminando(null); setFuenteEditando({ ...fuente, tipo: fuente.tipo || "OTRO", contenido: fuente.contenido || "", estado: fuente.estado !== false }); }} className="min-h-9 rounded-lg px-2 text-xs font-medium text-emerald-primary hover:bg-emerald-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-accent">Editar</button><button type="button" aria-label={`Eliminar fuente ${fuente.contenido}`} onClick={() => { setFuenteEditando(null); setFuenteEliminando(fuente); }} className="min-h-9 rounded-lg px-2 text-xs font-medium text-red-700 hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700">Eliminar</button></div>
                        )}
                      </td>
                        </>
                      )}
                    </tr>
                  ))}
                  {cuentasSinFuente.map((cuenta) => <tr key={`gmail-${cuenta.id}`} className="border-b border-border-line/20"><td className="py-2.5 pr-4"><span className="inline-block rounded bg-emerald-primary/10 px-2 py-0.5 text-xs text-emerald-primary">GMAIL</span></td><td className="py-2.5 pr-4 text-bg-dark">{cuenta.email}</td><td className="py-2.5 pr-4"><EstadoFuente activo /></td><td className="py-2.5 text-xs text-slate-text">Cuenta conectada</td><td className="py-2.5 pl-4"><div className="flex gap-2"><button type="button" onClick={() => seleccionarCuentaGmail(cuenta.id)} className="min-h-9 rounded-lg px-2 text-xs font-medium text-emerald-primary hover:bg-emerald-primary/10">{String(cuenta.id) === String(cuentaSeleccionadaId) ? "Seleccionada" : "Consultar"}</button><button type="button" onClick={() => desconectarGmail(true, cuenta.id)} className="min-h-9 rounded-lg px-2 text-xs font-medium text-red-700 hover:bg-red-100">Desconectar</button></div></td></tr>)}
                </tbody>
              </table>
            </div>
            <ul className="space-y-3 md:hidden" aria-label="Fuentes registradas en móvil">
              {fuentes.map((fuente) => <li key={`movil-${fuente.idFuente}`} className="min-w-0 rounded-xl border border-border-line/40 bg-bg-cream/60 p-3">
                {fuenteEditando?.idFuente === fuente.idFuente ? <form onSubmit={guardarEdicionFuente} className="space-y-3">
                  <label className="grid gap-1 text-xs text-slate-text">Tipo<select aria-label={`Tipo de ${fuente.contenido} en móvil`} value={fuenteEditando.tipo} onChange={(evento) => setFuenteEditando((actual) => ({ ...actual, tipo: evento.target.value }))} className="min-h-10 rounded-lg border border-border-line bg-bg-cream px-2 text-sm"><option value="CORREO">CORREO</option><option value="TELEFONO">TELEFONO</option><option value="OTRO">OTRO</option></select></label>
                  <label className="grid gap-1 text-xs text-slate-text">Contenido<input aria-label="Contenido de la fuente en móvil" value={fuenteEditando.contenido} maxLength={255} onChange={(evento) => setFuenteEditando((actual) => ({ ...actual, contenido: evento.target.value }))} className="min-h-10 min-w-0 w-full rounded-lg border border-border-line bg-bg-cream px-2 text-sm" /></label>
                  <label className="grid gap-1 text-xs text-slate-text">Estado en móvil<select aria-label="Estado de la fuente en móvil" value={String(fuenteEditando.estado !== false)} onChange={(evento) => setFuenteEditando((actual) => ({ ...actual, estado: evento.target.value === "true" }))} className="min-h-10 rounded-lg border border-border-line bg-bg-cream px-2 text-sm"><option value="true">Activo</option><option value="false">Inactivo</option></select></label>
                  <p className="text-xs text-slate-text">Fecha: {fuente.fechaCreacion || "-"}</p><div className="flex flex-wrap gap-2"><button type="submit" disabled={operacionFuente || !fuenteEditando.contenido.trim()} aria-label="Guardar cambios de fuente en móvil" className="min-h-10 rounded-lg bg-emerald-primary px-3 text-xs font-semibold text-bg-cream disabled:opacity-50">Guardar</button><button type="button" disabled={operacionFuente} onClick={() => setFuenteEditando(null)} className="min-h-10 rounded-lg px-3 text-xs">Cancelar</button></div>
                </form> : <>
                  <div className="flex items-center justify-between gap-3"><p className="text-xs uppercase tracking-wide text-slate-text">{fuente.tipo || "OTRO"}</p><EstadoFuente activo={fuente.estado !== false} /></div><p className="mt-1 break-all text-sm font-medium text-bg-dark">{fuente.contenido || "-"}</p>{cuentaVinculada(fuente) && <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-800"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-600" aria-hidden="true" />Cuenta Gmail conectada</span>}<p className="mt-1 text-xs text-slate-text">Fecha: {fuente.fechaCreacion || "-"}</p>
                  {fuenteEliminando?.idFuente === fuente.idFuente ? <div className="mt-3 flex flex-wrap items-center gap-2"><span className="text-xs text-slate-text">¿Eliminar esta fuente?</span><button type="button" disabled={operacionFuente} onClick={confirmarEliminacionFuente} aria-label={`Confirmar eliminación de ${fuente.contenido}`} className="min-h-10 rounded-lg bg-red-700 px-3 text-xs font-semibold text-white">Confirmar</button><button type="button" onClick={() => setFuenteEliminando(null)} className="min-h-10 rounded-lg px-3 text-xs">Cancelar</button></div> : <div className="mt-3 flex flex-wrap gap-2">{cuentaVinculada(fuente) && <><button type="button" onClick={() => seleccionarCuentaGmail(cuentaVinculada(fuente).id)} className="min-h-10 rounded-lg px-3 text-xs font-medium text-emerald-primary hover:bg-emerald-primary/10">{String(cuentaVinculada(fuente).id) === String(cuentaSeleccionadaId) ? "Seleccionada" : "Consultar"}</button><button type="button" onClick={() => desconectarGmail(true, cuentaVinculada(fuente).id)} className="min-h-10 rounded-lg px-3 text-xs font-medium text-red-700 hover:bg-red-100">Desconectar Gmail</button></>}<button type="button" aria-label={`Editar fuente ${fuente.contenido} en móvil`} onClick={() => { setFuenteEliminando(null); setFuenteEditando({ ...fuente, tipo: fuente.tipo || "OTRO", contenido: fuente.contenido || "", estado: fuente.estado !== false }); }} className="min-h-10 rounded-lg px-3 text-xs font-medium text-emerald-primary hover:bg-emerald-primary/10">Editar</button><button type="button" aria-label={`Eliminar fuente ${fuente.contenido} en móvil`} onClick={() => { setFuenteEditando(null); setFuenteEliminando(fuente); }} className="min-h-10 rounded-lg px-3 text-xs font-medium text-red-700 hover:bg-red-100">Eliminar</button></div>}
                </>}
              </li>)}
              {cuentasSinFuente.map((cuenta) => <li key={`gmail-movil-${cuenta.id}`} className="min-w-0 rounded-xl border border-border-line/40 bg-bg-cream/60 p-3"><div className="flex items-center justify-between gap-3"><span className="text-xs font-semibold uppercase tracking-wide text-emerald-primary">Gmail</span><EstadoFuente activo /></div><p className="mt-1 break-all text-sm font-medium text-bg-dark">{cuenta.email}</p><p className="mt-1 text-xs text-slate-text">Cuenta conectada</p><div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={() => seleccionarCuentaGmail(cuenta.id)} className="min-h-10 rounded-lg px-3 text-xs font-medium text-emerald-primary hover:bg-emerald-primary/10">{String(cuenta.id) === String(cuentaSeleccionadaId) ? "Seleccionada" : "Consultar"}</button><button type="button" onClick={() => desconectarGmail(true, cuenta.id)} className="min-h-10 rounded-lg px-3 text-xs font-medium text-red-700 hover:bg-red-100">Desconectar</button></div></li>)}
            </ul>
            </>
          )}
        </div>
      </Card>

      <ModalPerfilUsuario
        abierto={usuarioAbierto}
        alCerrar={() => setUsuarioAbierto(false)}
        triggerRef={triggerUsuarioRef}
      />

      <ModalFuentes
        abierto={modalFuentesAbierto}
        alCerrar={() => setModalFuentesAbierto(false)}
        triggerRef={disparadorFuentesRef}
        alGuardar={alGuardarFuente}
        fuentesExistentes={fuentes}
        estadoInicial={Boolean(tokenGmail)}
      />
    </section>
  );
}
