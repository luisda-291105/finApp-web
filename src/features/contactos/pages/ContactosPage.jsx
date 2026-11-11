/**
 * @uso        Listado de contactos del usuario activo
 * @funciones  ContactosPage()
 * @datos      Coordina filtros, consulta y modales de contactos
 * @eventos    Crear, abrir, editar y eliminar contactos
 * @estados    Filtros y registros seleccionados
 * @usadoPor   App.jsx mediante la API pública de features/contactos
 */
import { useMemo, useRef, useState } from "react";
import { useGmail } from "../../../context/GmailContext";
import { useContactos } from "../hooks/useContactos";
import CrearContactoModal from "../components/modals/CrearContactoModal";
import DetalleContactoModal from "../components/modals/DetalleContactoModal";
import ImportarContactosGoogle from "../components/ImportarContactosGoogle";
import BuscarContactosModal from "../components/BuscarContactosModal";
import FiltrarContactosOrigenModal from "../components/FiltrarContactosOrigenModal";
import ContactosToolbar from "../components/ContactosToolbar";
import ContactosLista from "../components/ContactosLista";
import { obtenerCorreoOrigenContacto, obtenerOrigenContacto } from "../utils/origenContacto";

const ordenAlfabetico = new Intl.Collator("es", { sensitivity: "base", numeric: true });

/** Coordina el estado de la página y delega cada sección en su componente. */
export default function ContactosPage() {
  const { usuario, contactos, cargando, error, cargarContactos, guardarContacto: guardarEnLista, borrarContacto: borrarDeLista } = useContactos();
  const { cuentasGmail } = useGmail();
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalGoogleAbierto, setModalGoogleAbierto] = useState(false);
  const [modalBusquedaAbierto, setModalBusquedaAbierto] = useState(false);
  const [modalOrigenAbierto, setModalOrigenAbierto] = useState(false);
  const [contactoSeleccionado, setContactoSeleccionado] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [origenFiltro, setOrigenFiltro] = useState("TODOS");

  const disparadorCrearRef = useRef(null);
  const disparadorDetalleRef = useRef(null);
  const disparadorGoogleRef = useRef(null);
  const disparadorBusquedaRef = useRef(null);
  const disparadorOrigenRef = useRef(null);
  const entradaBusquedaRef = useRef(null);

  const origenesDisponibles = useMemo(() => [...new Set(contactos.map((contacto) => (
    obtenerCorreoOrigenContacto(contacto, cuentasGmail) || obtenerOrigenContacto(contacto)
  )))].sort(ordenAlfabetico.compare), [contactos, cuentasGmail]);

  const contactosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLocaleLowerCase();
    return contactos.filter((contacto) => {
      const origen = obtenerCorreoOrigenContacto(contacto, cuentasGmail) || obtenerOrigenContacto(contacto);
      const coincideOrigen = origenFiltro === "TODOS" || origen === origenFiltro;
      const coincideBusqueda = !termino || [contacto.nombre, contacto.correo, contacto.telefono, contacto.cargo, contacto.empresa, contacto.notas, origen]
        .some((valor) => String(valor || "").toLocaleLowerCase().includes(termino));
      return coincideOrigen && coincideBusqueda;
    }).sort((a, b) => {
      const origenA = obtenerCorreoOrigenContacto(a, cuentasGmail) || obtenerOrigenContacto(a);
      const origenB = obtenerCorreoOrigenContacto(b, cuentasGmail) || obtenerOrigenContacto(b);
      return ordenAlfabetico.compare(origenA, origenB) || ordenAlfabetico.compare(a.nombre || "", b.nombre || "");
    });
  }, [contactos, busqueda, origenFiltro, cuentasGmail]);

  const opcionesOrigen = useMemo(() => [
    { valor: "TODOS", etiqueta: "Todos los orígenes", cantidad: contactos.length },
    ...origenesDisponibles.map((origen) => ({
      valor: origen,
      etiqueta: origen,
      cantidad: contactos.filter((contacto) => (obtenerCorreoOrigenContacto(contacto, cuentasGmail) || obtenerOrigenContacto(contacto)) === origen).length,
    })),
  ], [origenesDisponibles, contactos, cuentasGmail]);

  const guardarContacto = async (idContacto, cambios) => {
    await guardarEnLista(idContacto, cambios);
    setContactoSeleccionado((actual) => actual?.idContacto === idContacto ? { ...actual, ...cambios } : actual);
  };

  const borrarContacto = async (idContacto) => {
    await borrarDeLista(idContacto);
    setContactoSeleccionado(null);
  };

  const seleccionarContactoDesdeBusqueda = (contacto) => {
    disparadorDetalleRef.current = disparadorBusquedaRef.current;
    setContactoSeleccionado(contacto);
    setModalBusquedaAbierto(false);
  };

  return <section aria-labelledby="dashboard-title" className="space-y-6 pt-6">
    <ContactosToolbar
      busqueda={busqueda}
      alCambiarBusqueda={setBusqueda}
      origenFiltro={origenFiltro}
      alBuscar={() => setModalBusquedaAbierto(true)}
      alFiltrarOrigen={() => setModalOrigenAbierto(true)}
      alActualizar={() => setModalGoogleAbierto(true)}
      alCrear={() => setModalAbierto(true)}
      refs={{ crear: disparadorCrearRef, actualizar: disparadorGoogleRef, busqueda: disparadorBusquedaRef, origen: disparadorOrigenRef }}
    />

    <ContactosLista
      cargando={cargando}
      error={error}
      usuarioActivo={Boolean(usuario?.idUsuario)}
      contactos={contactos}
      contactosFiltrados={contactosFiltrados}
      alAbrir={(contacto, disparador) => { disparadorDetalleRef.current = disparador; setContactoSeleccionado(contacto); }}
    />

    <CrearContactoModal abierto={modalAbierto} alCerrar={() => setModalAbierto(false)} triggerRef={disparadorCrearRef} alGuardar={cargarContactos} />
    <ImportarContactosGoogle abierto={modalGoogleAbierto} contactosLocales={contactos} triggerRef={disparadorGoogleRef} alCerrar={() => setModalGoogleAbierto(false)} alImportar={cargarContactos} />
    <BuscarContactosModal abierto={modalBusquedaAbierto} alCerrar={() => setModalBusquedaAbierto(false)} triggerRef={disparadorBusquedaRef} inputRef={entradaBusquedaRef} busqueda={busqueda} alCambiarBusqueda={setBusqueda} contactos={contactosFiltrados} cuentasGmail={cuentasGmail} alSeleccionar={seleccionarContactoDesdeBusqueda} />
    <FiltrarContactosOrigenModal abierto={modalOrigenAbierto} alCerrar={() => setModalOrigenAbierto(false)} triggerRef={disparadorOrigenRef} origenFiltro={origenFiltro} opciones={opcionesOrigen} alSeleccionar={(origen) => { setOrigenFiltro(origen); setModalOrigenAbierto(false); }} />
    <DetalleContactoModal contacto={contactoSeleccionado} triggerRef={disparadorDetalleRef} onCerrar={() => setContactoSeleccionado(null)} onGuardar={guardarContacto} onEliminar={borrarContacto} />
  </section>;
}
