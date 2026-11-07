/**
 * @uso        Listado de contactos del usuario activo
 * @funciones  ContactosPage()
 * @datos      Coordina useContactos, tarjetas y modales
 * @eventos    Crear, abrir, editar y eliminar contactos
 * @estados    modalAbierto, contactoSeleccionado, referencias de foco
 * @usadoPor   App.jsx mediante la API pública de features/contactos
 */
import { useRef, useState } from "react";
import { Plus } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { useContactos } from "../hooks/useContactos";
import ContactoCard from "../components/cards/ContactoCard";
import CrearContactoModal from "../components/modals/CrearContactoModal";
import DetalleContactoModal from "../components/modals/DetalleContactoModal";

/** Renderiza contactos y coordina los modales del feature. */
export default function ContactosPage() {
  const { usuario, contactos, cargando, error, cargarContactos, guardarContacto: guardarEnLista, borrarContacto: borrarDeLista } = useContactos();
  const [modalAbierto, setModalAbierto] = useState(false);
  const [contactoSeleccionado, setContactoSeleccionado] = useState(null);
  const disparadorRef = useRef(null);
  const disparadorDetalleRef = useRef(null);
  const guardarContacto = async (idContacto, cambios) => {
    await guardarEnLista(idContacto, cambios);
    setContactoSeleccionado((actual) => actual?.idContacto === idContacto ? { ...actual, ...cambios } : actual);
  };
  const borrarContacto = async (idContacto) => {
    await borrarDeLista(idContacto);
    setContactoSeleccionado(null);
  };

  return <section aria-labelledby="dashboard-title" className="space-y-6 pt-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-medium text-emerald-primary">FinApp / Panel</p><h1 id="dashboard-title" className="mt-1 font-display text-3xl font-medium text-bg-dark">Contactos</h1><p className="mt-1 text-sm text-slate-text">Organiza tus contactos relacionados con finanzas.</p></div>
      <button ref={disparadorRef} type="button" onClick={() => setModalAbierto(true)} aria-label="Agregar nuevo contacto" className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-primary px-4 py-2.5 text-sm font-medium text-bg-cream shadow-md transition-all hover:scale-[1.02] hover:bg-emerald-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-accent"><Plus className="h-4 w-4" aria-hidden="true" /><span>Nuevo contacto</span></button>
    </div>
    <Card className="space-y-4 p-6">
      {cargando && <p role="status" className="text-slate-text">Cargando contactos...</p>}
      {!cargando && error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      {!cargando && !error && !usuario?.idUsuario && <p className="text-slate-text">Inicia sesión para consultar tus contactos.</p>}
      {!cargando && !error && usuario?.idUsuario && contactos.length === 0 && <p className="text-slate-text">Todavía no tienes contactos registrados.</p>}
      {!cargando && !error && contactos.length > 0 && <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Contactos registrados">{contactos.map((contacto, index) => <li key={contacto.idContacto || index}><ContactoCard contacto={contacto} alAbrir={(evento) => { disparadorDetalleRef.current = evento.currentTarget; setContactoSeleccionado(contacto); }} /></li>)}</ul>}
    </Card>
    <CrearContactoModal abierto={modalAbierto} alCerrar={() => setModalAbierto(false)} triggerRef={disparadorRef} alGuardar={cargarContactos} />
    <DetalleContactoModal contacto={contactoSeleccionado} triggerRef={disparadorDetalleRef} onCerrar={() => setContactoSeleccionado(null)} onGuardar={guardarContacto} onEliminar={borrarContacto} />
  </section>;
}
