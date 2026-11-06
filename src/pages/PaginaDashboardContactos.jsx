/**
 * @uso        Página de Contactos del dashboard
 * @funciones  PaginaDashboardContactos()
 * @datos      Contactos del usuario activo consultados al backend
 * @eventos    Apertura y envío del modal de nuevo contacto
 * @estados    contactos, cargando, error, modalAbierto
 * @usadoPor   App.jsx (/dashboard/contactos)
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { Mail, Phone, Plus, StickyNote, UserRound } from "lucide-react";
import { Card } from "../components/ui/Card";
import ModalRegistroEntidad from "../components/domain/modales/ModalRegistroEntidad";
import ModalContacto from "../components/domain/modales/ModalContacto";
import { useUsuarioActivo } from "../context/UsuarioActivoContext";
import { actualizarContacto, eliminarContacto, obtenerContactosPorUsuario } from "../services/contactoServicio";

function extraerLista(respuesta) {
  if (Array.isArray(respuesta)) return respuesta;
  return respuesta?.data || respuesta?.content || [];
}

export default function PaginaDashboardContactos() {
  const { usuario } = useUsuarioActivo();
  const [contactos, setContactos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [contactoSeleccionado, setContactoSeleccionado] = useState(null);
  const disparadorRef = useRef(null);

  const cargarContactos = useCallback(async () => {
    if (!usuario?.idUsuario) {
      setContactos([]);
      setCargando(false);
      return;
    }
    try {
      setCargando(true);
      setError("");
      setContactos(extraerLista(await obtenerContactosPorUsuario(usuario.idUsuario)));
    } catch (fallo) {
      setContactos([]);
      setError(fallo?.message || "No se pudieron cargar tus contactos.");
    } finally {
      setCargando(false);
    }
  }, [usuario?.idUsuario]);

  useEffect(() => { cargarContactos(); }, [cargarContactos]);

  const guardarContacto = async (idContacto, cambios) => {
    await actualizarContacto(idContacto, cambios);
    setContactos((actuales) => actuales.map((contacto) => contacto.idContacto === idContacto ? { ...contacto, ...cambios } : contacto));
    setContactoSeleccionado((actual) => actual?.idContacto === idContacto ? { ...actual, ...cambios } : actual);
  };

  const borrarContacto = async (idContacto) => {
    await eliminarContacto(idContacto);
    setContactos((actuales) => actuales.filter((contacto) => contacto.idContacto !== idContacto));
    setContactoSeleccionado(null);
  };

  return (
    <section aria-labelledby="dashboard-title" className="space-y-6 pt-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-primary">FinApp / Panel</p>
          <h1 id="dashboard-title" className="mt-1 font-display text-3xl font-medium text-bg-dark">Contactos</h1>
          <p className="mt-1 text-sm text-slate-text">Organiza tus contactos relacionados con finanzas.</p>
        </div>
        <button ref={disparadorRef} type="button" onClick={() => setModalAbierto(true)} aria-label="Agregar nuevo contacto" className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-primary px-4 py-2.5 text-sm font-medium text-bg-cream shadow-md transition-all hover:scale-[1.02] hover:bg-emerald-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-accent">
          <Plus className="h-4 w-4" aria-hidden="true" /><span>Nuevo contacto</span>
        </button>
      </div>
      <Card className="space-y-4 p-6">
        {cargando && <p role="status" className="text-slate-text">Cargando contactos...</p>}
        {!cargando && error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        {!cargando && !error && !usuario?.idUsuario && <p className="text-slate-text">Inicia sesión para consultar tus contactos.</p>}
        {!cargando && !error && usuario?.idUsuario && contactos.length === 0 && <p className="text-slate-text">Todavía no tienes contactos registrados.</p>}
        {!cargando && !error && contactos.length > 0 && (
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Contactos registrados">
            {contactos.map((contacto, index) => (
              <li key={contacto.idContacto || index}>
                <article role="button" tabIndex={0} onClick={() => setContactoSeleccionado(contacto)} onKeyDown={(evento) => { if (evento.key === "Enter" || evento.key === " ") { evento.preventDefault(); setContactoSeleccionado(contacto); } }} aria-label={`Ver contacto ${contacto.nombre || "sin nombre"}`} className="h-full cursor-pointer rounded-xl border border-border-line/30 bg-bg-cream/70 p-5 text-left transition-colors hover:border-emerald-primary/40 hover:bg-bg-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-primary/10 text-emerald-primary">
                      <UserRound className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <h2 className="max-w-full truncate font-display text-lg font-semibold text-bg-dark">{contacto.nombre || "Contacto sin nombre"}</h2>
                  </div>
                  <dl className="mt-4 space-y-3 text-sm">
                    <div className="flex items-start gap-2 text-slate-text"><Phone className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /><div><dt className="sr-only">Teléfono</dt><dd>{contacto.telefono || "Sin teléfono"}</dd></div></div>
                    {contacto.correo && <div className="flex items-start gap-2 text-slate-text"><Mail className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /><div><dt className="sr-only">Correo</dt><dd className="break-all">{contacto.correo}</dd></div></div>}
                    <div className="flex items-start gap-2 text-slate-text"><StickyNote className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /><div><dt className="sr-only">Notas</dt><dd>{contacto.notas || "Sin notas"}</dd></div></div>
                  </dl>
                </article>
              </li>
            ))}
          </ul>
        )}
      </Card>
      <ModalRegistroEntidad tipo="contacto" abierto={modalAbierto} alCerrar={() => setModalAbierto(false)} triggerRef={disparadorRef} alGuardar={cargarContactos} />
      <ModalContacto contacto={contactoSeleccionado} onCerrar={() => setContactoSeleccionado(null)} onGuardar={guardarContacto} onEliminar={borrarContacto} />
    </section>
  );
}
