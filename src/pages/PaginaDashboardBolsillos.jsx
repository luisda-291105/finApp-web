/**
 * @uso        Página de Grupos con fuentes vinculadas y chat
 * @funciones  PaginaDashboardBolsillos()
 * @datos      Obtiene grupos desde grupoServicio.obtenerGrupos()
 * @eventos    click en Compartir entrada, click en Nuevo bolsillo
 * @estados    grupos (array), cargando (boolean), error (string), feedbackCopia (string), mensajeCrear (boolean)
 * @usadoPor   App.jsx (ruta /dashboard/grupos)
 */


import { useCallback, useEffect, useRef, useState } from "react";
import { MessageCircle, Plus, WalletCards } from "lucide-react";
import { Card } from "../components/ui/Card";
import ModalRegistroEntidad from "../components/domain/modales/ModalRegistroEntidad";
import ModalDetalleGrupo from "../components/domain/modales/ModalDetalleGrupo";
import { useUsuarioActivo } from "../context/UsuarioActivoContext";
import { obtenerGruposPorUsuario } from "../services/grupoServicio";

function normalizarGrupo(grupo, index) {
  const fuentes = Array.isArray(grupo.fuentes) ? grupo.fuentes : [];
  return {
    id: grupo.idGrupo || grupo.id || `grupo-${index}`,
    nombre: grupo.nombre || "Grupo sin nombre",
    descripcion: grupo.descripcion || grupo.detalle || "Sin descripción",
    fuentes,
  };
}

export default function PaginaDashboardBolsillos() {
  const { usuario } = useUsuarioActivo();
  const [grupos, setGrupos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const disparadorRef = useRef(null);
  const disparadorDetalleRef = useRef(null);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState(null);

  const cargarGrupos = useCallback(async () => {
    if (!usuario?.idUsuario) {
      setGrupos([]);
      setCargando(false);
      return;
    }
    try {
      setCargando(true);
      setError("");
      const respuesta = await obtenerGruposPorUsuario(usuario.idUsuario);
      const lista = Array.isArray(respuesta) ? respuesta : respuesta?.data || respuesta?.content || [];
      setGrupos(lista.map((grupo, index) => normalizarGrupo(grupo, index)));
    } catch (fallo) {
      setError(fallo?.message || "No se pudieron cargar tus grupos.");
      setGrupos([]);
    } finally {
      setCargando(false);
    }
  }, [usuario?.idUsuario]);

  useEffect(() => { cargarGrupos(); }, [cargarGrupos]);


  const abrirDetalleGrupo = (grupo, evento) => {
    disparadorDetalleRef.current = evento.currentTarget;
    setGrupoSeleccionado(grupo);
  };

  const actualizarGrupo = (actualizado) => {
    const id = actualizado.idGrupo || actualizado.id;
    if (actualizado.eliminado) {
      setGrupos((actuales) => actuales.filter((grupo) => grupo.id !== id));
      setGrupoSeleccionado(null);
      return;
    }
    setGrupos((actuales) => actuales.map((grupo, index) => grupo.id === id
      ? normalizarGrupo({ ...grupo, ...actualizado, fuentes: actualizado.fuentes ?? grupo.fuentes }, index)
      : grupo));
    setGrupoSeleccionado((actual) => actual?.id === id
      ? normalizarGrupo({ ...actual, ...actualizado, fuentes: actualizado.fuentes ?? actual.fuentes }, 0)
      : actual);
  };

  return (
    <section aria-labelledby="bolsillos-titulo" className="space-y-6 pt-6 pb-12">
      {/* Cabecera de la página */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-primary">FinApp / Panel</p>
          <h1 id="bolsillos-titulo" className="mt-1 font-display text-3xl font-medium text-bg-dark">
            Grupos
          </h1>
          <p className="mt-1 text-sm text-slate-text">
            Gestiona tus grupos, sus fuentes vinculadas y la conversación de cada grupo.
          </p>
        </div>

        <button
          type="button"
          ref={disparadorRef}
          onClick={() => setModalAbierto(true)}
          aria-label="Crear nuevo grupo"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-primary hover:bg-emerald-hover text-bg-cream text-sm font-medium shadow-md transition-all cursor-pointer hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-accent"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>Nuevo grupo</span>
        </button>
      </div>

      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      {!usuario?.idUsuario && <p className="text-sm text-slate-text">Inicia sesión para consultar y crear grupos.</p>}

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-bg-dark">Mis grupos</h2>
        {cargando && <p role="status" className="text-sm text-slate-text">Cargando grupos…</p>}
        {!cargando && !error && usuario?.idUsuario && grupos.length === 0 && <Card className="p-8 text-center text-sm text-slate-text">Todavía no tienes grupos. Crea uno para vincular fuentes y conversar.</Card>}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {grupos.map((grupo) => (
            <Card key={grupo.id} role="button" tabIndex={0} aria-label={`Abrir grupo ${grupo.nombre}`} onClick={(evento) => abrirDetalleGrupo(grupo, evento)} onKeyDown={(evento) => { if (evento.target === evento.currentTarget && (evento.key === "Enter" || evento.key === " ")) { evento.preventDefault(); abrirDetalleGrupo(grupo, evento); } }} className="cursor-pointer border border-border-line/40 p-5 transition hover:border-emerald-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-accent">
              <div className="flex items-start justify-between gap-3"><div><h3 className="font-display text-lg font-semibold text-bg-dark">{grupo.nombre}</h3><p className="mt-1 line-clamp-2 text-sm text-slate-text">{grupo.descripcion}</p></div><MessageCircle className="mt-1 h-5 w-5 shrink-0 text-emerald-primary" aria-hidden="true" /></div>
              <div className="mt-4 border-t border-border-line/30 pt-3"><div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-text"><WalletCards className="h-4 w-4 text-emerald-primary" aria-hidden="true" />Fuentes · {grupo.fuentes.length}</div>{grupo.fuentes.length ? <ul className="space-y-1.5">{grupo.fuentes.slice(0, 2).map((fuente) => <li key={fuente.idFuente} className="truncate text-sm text-bg-dark">{fuente.contenido}</li>)}</ul> : <p className="text-sm text-slate-text">Sin fuentes vinculadas</p>}{grupo.fuentes.length > 2 && <p className="mt-1 text-xs text-emerald-primary">y {grupo.fuentes.length - 2} más</p>}</div>
              <p className="mt-4 text-xs font-medium text-emerald-primary">Abrir fuentes y chat</p>
            </Card>
          ))}
        </div>
      </div>
      <ModalRegistroEntidad tipo="grupo" abierto={modalAbierto} alCerrar={() => setModalAbierto(false)} triggerRef={disparadorRef} alGuardar={cargarGrupos} />
      <ModalDetalleGrupo grupo={grupoSeleccionado} abierto={Boolean(grupoSeleccionado)} alCerrar={() => setGrupoSeleccionado(null)} triggerRef={disparadorDetalleRef} alGrupoActualizado={actualizarGrupo} />
    </section>
  );
}
