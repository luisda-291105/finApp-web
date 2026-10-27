/**
 * @uso        Página de configuración
 * @funciones  PaginaDashboardConfiguracion()
 * @datos      Usuario activo de UsuarioActivoContext (nombre e identificación); resto de contenido fijo
 * @eventos    Apertura del modal de perfil y del modal Fuentes, click en Registrar fuentes
 * @estados    modalFuentesAbierto, usuarioAbierto, disparadorFuentesRef, triggerUsuarioRef
 * @usadoPor   App.jsx (ruta /dashboard/configuracion)
 */

import { useRef, useState } from "react";
import { Card } from "../components/ui/Card";
import ModalFuentes from "../components/domain/modales/ModalFuentes";
import ModalPerfilUsuario from "../components/domain/modales/ModalPerfilUsuario";
import { useUsuarioActivo } from "../context/UsuarioActivoContext";

export default function PaginaDashboardConfiguracion() {
  const [modalFuentesAbierto, setModalFuentesAbierto] = useState(false);
  const [usuarioAbierto, setUsuarioAbierto] = useState(false);
  const disparadorFuentesRef = useRef(null);
  const triggerUsuarioRef = useRef(null);
  const { usuario } = useUsuarioActivo();

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

      <Card className="p-6">
        <div className="border-t border-border-line/60 pt-1">
          <h2 className="font-display text-xl font-semibold text-bg-dark">
            Registro de fuentes
          </h2>
          <p className="mt-2 text-slate-text">
            Reúne información relacionada con conectar correos y registrar números telefónicos.
          </p>
          <button
            ref={disparadorFuentesRef}
            type="button"
            className="mt-4 min-h-11 rounded-xl bg-emerald-primary px-4 py-2 font-medium text-bg-cream outline-none transition-colors hover:bg-emerald-hover focus-visible:ring-2 focus-visible:ring-emerald-primary focus-visible:ring-offset-2"
            onClick={() => setModalFuentesAbierto(true)}
          >
            Registrar fuentes
          </button>
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
      />
    </section>
  );
}
