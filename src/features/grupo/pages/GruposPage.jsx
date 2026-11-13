/**
 * @uso        Listado de grupos del usuario activo
 * @funciones  GruposPage()
 * @datos      Coordina useGrupos, tarjetas del listado y modales
 * @eventos    Crear grupo y abrir detalle
 * @estados    modalAbierto, grupoSeleccionado, referencias de foco
 * @usadoPor   App.jsx mediante la API pública de features/grupo
 */
import { useRef, useState } from "react";
import { Plus } from "lucide-react";
import { Card } from "../../../components/ui";
import { AvisoEnDesarrollo } from "../../enDesarrollo";
import { useGrupos } from "../hooks/useGrupos";
import GrupoCard from "../components/cards/GrupoCard";
import CrearGrupoModal from "../components/modals/CrearGrupoModal";
import GrupoDetalleModal from "../components/modals/GrupoDetalleModal";

/** Renderiza el listado de grupos y conecta sus acciones. */
export default function GruposPage() {
  const { usuario, grupos, cargando, error, cargarGrupos, actualizarGrupoEnLista } = useGrupos();
  const [modalAbierto, setModalAbierto] = useState(false);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState(null);
  const disparadorRef = useRef(null);
  const disparadorDetalleRef = useRef(null);

  const abrirDetalleGrupo = (grupo, evento) => {
    disparadorDetalleRef.current = evento.currentTarget;
    setGrupoSeleccionado(grupo);
  };
  const actualizarGrupo = (actualizado) => {
    actualizarGrupoEnLista(actualizado);
    if (actualizado.eliminado) {
      setGrupoSeleccionado(null);
      return;
    }
    setGrupoSeleccionado((actual) => actual?.id === (actualizado.idGrupo || actualizado.id)
      ? { ...actual, ...actualizado, fuentes: actualizado.fuentes ?? actual.fuentes }
      : actual);
  };

  return (
    <section aria-labelledby="grupos-titulo" className="space-y-6 pt-6 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><p className="text-sm font-medium text-emerald-primary">FinApp / Panel</p><h1 id="grupos-titulo" className="mt-1 font-display text-3xl font-medium text-bg-dark">Grupos</h1><p className="mt-1 text-sm text-slate-text">Gestiona tus grupos, sus fuentes vinculadas y la conversación de cada grupo.</p></div>
        <button type="button" ref={disparadorRef} onClick={() => setModalAbierto(true)} aria-label="Crear nuevo grupo" className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-primary px-4 py-2.5 text-sm font-medium text-bg-cream shadow-md transition-all hover:scale-[1.02] hover:bg-emerald-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-accent"><Plus className="h-4 w-4" aria-hidden="true" /><span>Nuevo grupo</span></button>
      </div>
      <AvisoEnDesarrollo />
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      {!usuario?.idUsuario && <p className="text-sm text-slate-text">Inicia sesión para consultar y crear grupos.</p>}
      <div className="space-y-4"><h2 className="text-lg font-semibold text-bg-dark">Mis grupos</h2>
        {cargando && <p role="status" className="text-sm text-slate-text">Cargando grupos…</p>}
        {!cargando && !error && usuario?.idUsuario && grupos.length === 0 && <Card className="p-8 text-center text-sm text-slate-text">Todavía no tienes grupos. Crea uno para vincular fuentes y conversar.</Card>}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">{grupos.map((grupo) => <GrupoCard key={grupo.id} grupo={grupo} alAbrir={(evento) => abrirDetalleGrupo(grupo, evento)} />)}</div>
      </div>
      <CrearGrupoModal abierto={modalAbierto} alCerrar={() => setModalAbierto(false)} triggerRef={disparadorRef} alGuardar={cargarGrupos} />
      <GrupoDetalleModal grupo={grupoSeleccionado} abierto={Boolean(grupoSeleccionado)} alCerrar={() => setGrupoSeleccionado(null)} triggerRef={disparadorDetalleRef} alGrupoActualizado={actualizarGrupo} />
    </section>
  );
}
