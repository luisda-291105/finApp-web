/**
 * @uso        Página de Contactos del dashboard
 * @funciones  PaginaDashboardContactos()
 * @datos      Obtiene contactos desde contactoServicio.obtenerContactos()
 * @eventos    click en Nuevo contacto
 * @estados    contactos (array), cargando (boolean), error (string)
 * @usadoPor   App.jsx (ruta /dashboard/contactos)
 */

import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Card } from "../components/ui/Card";
import { obtenerContactos } from "../services/contactoServicio";

export default function PaginaDashboardContactos() {
  const [contactos, setContactos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarContactos = async () => {
      try {
        setCargando(true);
        setError("");
        const respuesta = await obtenerContactos();
        if (Array.isArray(respuesta)) {
          setContactos(respuesta);
        } else if (respuesta && Array.isArray(respuesta.data)) {
          setContactos(respuesta.data);
        } else if (respuesta && Array.isArray(respuesta.content)) {
          setContactos(respuesta.content);
        } else {
          setContactos([]);
        }
      } catch (err) {
        setError(err?.message || "Error al cargar contactos");
        setContactos([]);
      } finally {
        setCargando(false);
      }
    };

    cargarContactos();
  }, []);

  return (
    <section aria-labelledby="dashboard-title" className="space-y-6 pt-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-primary">FinApp / Panel</p>
          <h1 id="dashboard-title" className="mt-1 font-display text-3xl font-medium text-bg-dark">
            Contactos
          </h1>
          <p className="mt-1 text-sm text-slate-text">
            Organiza la información de tus contactos relacionados con finanzas.
          </p>
        </div>

        <button
          type="button"
          aria-label="Agregar nuevo contacto"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-primary hover:bg-emerald-hover text-bg-cream text-sm font-medium shadow-md transition-all cursor-pointer hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-accent"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>Nuevo contacto</span>
        </button>
      </div>

      <Card className="space-y-4 p-6">
        {cargando && (
          <p className="text-slate-text">Cargando contactos...</p>
        )}

        {!cargando && error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        {!cargando && !error && contactos.length === 0 && (
          <p className="text-slate-text">
            No hay contactos registrados en el backend.
          </p>
        )}

        {!cargando && !error && contactos.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-line/30">
                  <th className="text-left py-2 pr-4 font-medium text-slate-text">
                    Nombre
                  </th>
                  <th className="text-left py-2 pr-4 font-medium text-slate-text">
                    Teléfono
                  </th>
                  <th className="text-left py-2 pr-4 font-medium text-slate-text">
                    Correo
                  </th>
                  <th className="text-left py-2 font-medium text-slate-text">
                    Nota
                  </th>
                </tr>
              </thead>
              <tbody>
                {contactos.map((contacto, index) => (
                  <tr
                    key={contacto.idContacto || contacto.id || index}
                    className="border-b border-border-line/20"
                  >
                    <td className="py-2 pr-4 text-bg-dark">
                      {contacto.nombre || "-"}
                    </td>
                    <td className="py-2 pr-4 text-slate-text">
                      {contacto.telefono || contacto.contacto || "-"}
                    </td>
                    <td className="py-2 pr-4 text-slate-text">
                      {contacto.correo || contacto.email || "-"}
                    </td>
                    <td className="py-2 text-slate-text">
                      {contacto.nota || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </section>
  );
}
