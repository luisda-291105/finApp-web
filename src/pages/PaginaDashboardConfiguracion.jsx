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
import { obtenerFuentesPorUsuario } from "../services/fuenteServicio";

export default function PaginaDashboardConfiguracion() {
  const [modalFuentesAbierto, setModalFuentesAbierto] = useState(false);
  const [usuarioAbierto, setUsuarioAbierto] = useState(false);
  const [fuentes, setFuentes] = useState([]);
  const [cargandoFuentes, setCargandoFuentes] = useState(true);
  const [errorFuentes, setErrorFuentes] = useState("");

  const disparadorFuentesRef = useRef(null);
  const triggerUsuarioRef = useRef(null);
  const { usuario } = useUsuarioActivo();

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

  const alGuardarFuente = (nuevaFuente) => {
    setFuentes((prev) => [
      nuevaFuente,
      ...prev.filter((f) => f.idFuente !== nuevaFuente.idFuente),
    ]);
  };

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
              Registro de fuentes
            </h2>
            <p className="mt-1 text-sm text-slate-text">
              Reúne y administra tus fuentes financieras vinculadas (correos, teléfonos y más).
            </p>
          </div>
          <button
            ref={disparadorFuentesRef}
            type="button"
            className="self-start sm:self-auto min-h-11 rounded-xl bg-emerald-primary px-4 py-2 font-medium text-bg-cream outline-none transition-colors hover:bg-emerald-hover focus-visible:ring-2 focus-visible:ring-emerald-primary focus-visible:ring-offset-2 cursor-pointer"
            onClick={() => setModalFuentesAbierto(true)}
          >
            Registrar fuentes
          </button>
        </div>

        {/* Listado renderizado de fuentes */}
        <div className="pt-2">
          {cargandoFuentes && (
            <p className="text-sm text-slate-text">Cargando fuentes...</p>
          )}

          {!cargandoFuentes && errorFuentes && (
            <p className="text-xs text-red-600">{errorFuentes}</p>
          )}

          {!cargandoFuentes && !errorFuentes && fuentes.length === 0 && (
            <p className="text-sm text-slate-text">
              No hay fuentes registradas actualmente.
            </p>
          )}

          {!cargandoFuentes && !errorFuentes && fuentes.length > 0 && (
            <div className="overflow-x-auto">
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
                  </tr>
                </thead>
                <tbody>
                  {fuentes.map((fuente, index) => (
                    <tr
                      key={fuente.idFuente || `fuente-${index}`}
                      className="border-b border-border-line/20"
                    >
                      <td className="py-2.5 pr-4 font-medium text-bg-dark">
                        <span className="inline-block px-2 py-0.5 rounded text-xs bg-emerald-primary/10 text-emerald-primary">
                          {fuente.tipo || "OTRO"}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4 text-bg-dark">
                        {fuente.contenido || "-"}
                      </td>
                      <td className="py-2.5 pr-4">
                        <span
                          className={`text-xs font-semibold ${
                            fuente.estado !== false
                              ? "text-emerald-primary"
                              : "text-slate-text"
                          }`}
                        >
                          {fuente.estado !== false ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="py-2.5 text-xs text-slate-text">
                        {fuente.fechaCreacion || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
      />
    </section>
  );
}
