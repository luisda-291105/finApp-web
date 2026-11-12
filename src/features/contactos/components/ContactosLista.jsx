import { Card } from "../../../components/ui";
import ContactoCard from "./cards/ContactoCard";

export default function ContactosLista({ cargando, error, usuarioActivo, contactos, contactosFiltrados, alAbrir }) {
  return <Card className="space-y-4 p-6">
    {cargando && <p role="status" className="text-slate-text">Cargando contactos...</p>}
    {!cargando && error && <p role="alert" className="text-sm text-red-600">{error}</p>}
    {!cargando && !error && !usuarioActivo && <p className="text-slate-text">Inicia sesión para consultar tus contactos.</p>}
    {!cargando && !error && usuarioActivo && contactos.length === 0 && <p className="text-slate-text">Todavía no tienes contactos registrados.</p>}
    {!cargando && !error && contactos.length > 0 && contactosFiltrados.length === 0 && <p role="status" className="text-slate-text">No se encontraron contactos que coincidan con los filtros actuales.</p>}
    {!cargando && !error && contactosFiltrados.length > 0 && <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Contactos registrados">{contactosFiltrados.map((contacto, index) => <li key={contacto.idContacto || index}><ContactoCard contacto={contacto} alAbrir={(evento) => alAbrir(contacto, evento.currentTarget)} /></li>)}</ul>}
  </Card>;
}
