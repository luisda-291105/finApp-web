/**
 * @uso        Página de configuración con acceso al registro demostrativo de fuentes
 * @funciones  PaginaDashboardConfiguracion()
 * @datos      Contenido fijo; no usa backend ni persistencia
 * @eventos    Apertura y cierre del modal Fuentes
 * @estados    modalFuentesAbierto, disparadorFuentesRef
 * @usadoPor   App.jsx (ruta /dashboard/configuracion)
 */
import { useRef, useState } from "react";
import { Card } from "../components/ui/Card";
import ModalFuentes from "../components/domain/modales/ModalFuentes";

export default function PaginaDashboardConfiguracion() {
  const [modalFuentesAbierto, setModalFuentesAbierto] = useState(false);
  const disparadorFuentesRef = useRef(null);

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
        <div className="mt-6 border-t border-border-line/60 pt-5">
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
      <ModalFuentes
        abierto={modalFuentesAbierto}
        alCerrar={() => setModalFuentesAbierto(false)}
        triggerRef={disparadorFuentesRef}
      />
    </section>
  );
}
