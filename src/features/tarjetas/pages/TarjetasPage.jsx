/**
 * @uso        Listado de tarjetas del usuario activo
 * @funciones  TarjetasPage()
 * @datos      Coordina useTarjetas, tarjetas y modales
 * @eventos    Crear tarjeta, abrir detalle, guardar y eliminar
 * @estados    modalAbierto, tarjetaSeleccionada, referencias de foco
 * @usadoPor   App.jsx mediante la API pública de features/tarjetas
 */
import { useRef, useState } from "react";
import { Plus } from "lucide-react";
import { Card } from "../../../components/ui";
import { useTarjetas } from "../hooks/useTarjetas";
import TarjetaCard from "../components/cards/TarjetaCard";
import CrearTarjetaModal from "../components/modals/CrearTarjetaModal";
import DetalleTarjetaModal from "../components/modals/DetalleTarjetaModal";

/** Renderiza el estado del listado y delega las acciones al hook. */
export default function TarjetasPage() {
  const { usuario, tarjetas, cargando, error, cargarTarjetas, guardarTarjeta, borrarTarjeta } = useTarjetas();
  const [modalAbierto, setModalAbierto] = useState(false);
  const [tarjetaSeleccionada, setTarjetaSeleccionada] = useState(null);
  const disparadorDetalleRef = useRef(null);
  const disparadorRef = useRef(null);

  return (
    <section aria-labelledby="dashboard-title" className="space-y-6 pt-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-medium text-emerald-primary">FinApp / Panel</p><h1 id="dashboard-title" className="mt-1 font-display text-3xl font-medium text-bg-dark">Tus tarjetas</h1><p className="mt-1 text-sm text-slate-text">Administra tus tarjetas y revisa sus saldos.</p></div>
        <button ref={disparadorRef} type="button" onClick={() => setModalAbierto(true)} aria-label="Agregar nueva tarjeta" className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-primary px-4 py-2.5 text-sm font-medium text-bg-cream shadow-md transition-all hover:scale-[1.02] hover:bg-emerald-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-accent"><Plus className="h-4 w-4" aria-hidden="true" /><span>Nueva tarjeta</span></button>
      </div>
      <Card className="space-y-4 p-6"><h2 className="font-display text-lg font-semibold text-bg-dark">Tarjetas registradas</h2>
        {cargando && <p role="status" className="text-sm text-slate-text">Cargando tarjetas...</p>}
        {!cargando && error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        {!cargando && !error && !usuario?.idUsuario && <p className="text-sm text-slate-text">Inicia sesión para ver tus tarjetas.</p>}
        {!cargando && !error && usuario?.idUsuario && tarjetas.length === 0 && <p className="text-sm text-slate-text">Todavía no tienes tarjetas registradas.</p>}
        {!cargando && !error && tarjetas.length > 0 && <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Tarjetas registradas">{tarjetas.map((tarjeta, index) => <li key={tarjeta.idTarjeta || index}><TarjetaCard tarjeta={tarjeta} alAbrir={(evento) => { disparadorDetalleRef.current = evento.currentTarget; setTarjetaSeleccionada(tarjeta); }} /></li>)}</ul>}
      </Card>
      <DetalleTarjetaModal tarjeta={tarjetaSeleccionada} triggerRef={disparadorDetalleRef} onCerrar={() => setTarjetaSeleccionada(null)} onGuardar={guardarTarjeta} onEliminar={borrarTarjeta} />
      <CrearTarjetaModal abierto={modalAbierto} alCerrar={() => setModalAbierto(false)} triggerRef={disparadorRef} alGuardar={cargarTarjetas} />
    </section>
  );
}
