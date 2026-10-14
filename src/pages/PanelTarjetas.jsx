/**
 * @uso        Panel de la sección "tarjetas" del dashboard: conjunto fluido de tarjetas demo
 *             con acordeón móvil, grid escritorio y modal de detalle (spec 004, T7).
 *             Alojado en src/pages/ por decisión del usuario (excepción documentada, spec 005)
 * @funciones  PanelTarjetas()
 * @datos      Lee TARJETAS_DEMO desde src/data/tarjetasDemo.js (fuente única, 5 tarjetas);
 *             no transforma datos ni consulta backend
 * @eventos    onSeleccionarTarjeta(tarjeta) del acordeón/grid abre el modal;
 *             onCerrar del modal vuelve a null (el retorno del foco lo gestiona ModalTarjeta)
 * @estados    tarjetaActiva (objeto tarjeta | null) - null = modal cerrado
 * @usadoPor   PaginaDashboardTarjetas (/dashboard/tarjetas, spec 005)
 */
import { useState } from "react";
import AcordeonTarjetas from "../components/AcordeonTarjetas";
import GridTarjetas from "../components/GridTarjetas";
import ModalTarjeta from "../components/ModalTarjeta";
import { TARJETAS_DEMO } from "../data/tarjetasDemo";

/**
 * PanelTarjetas
 * - Fuente única de datos: TARJETAS_DEMO (fixture de octubre 2026); ya no hay
 *   secciones "Mi Tarjeta Virtual", "Ejemplos de diseño" ni "Tus otras tarjetas".
 * - Doble render por breakpoints, solo CSS (cero matchMedia en JS):
 *   `AcordeonTarjetas` lleva `sm:hidden` y `GridTarjetas` `hidden sm:grid`.
 * - Estado local `tarjetaActiva`: el callback `onSeleccionarTarjeta(tarjeta)` de
 *   ambos layouts abre el modal; `onCerrar` lo cierra con `setTarjetaActiva(null)`
 *   (el foco vuelve al activador en el cleanup de ModalTarjeta).
 * - Mantiene la nota "Datos de demostración" al final. Solo tokens, español.
 */
export default function PanelTarjetas() {
  const [tarjetaActiva, setTarjetaActiva] = useState(null);

  return (
    <div className="space-y-6">
      <AcordeonTarjetas
        tarjetas={TARJETAS_DEMO}
        onSeleccionarTarjeta={setTarjetaActiva}
      />
      <GridTarjetas
        tarjetas={TARJETAS_DEMO}
        onSeleccionarTarjeta={setTarjetaActiva}
      />
      <ModalTarjeta
        tarjeta={tarjetaActiva}
        onCerrar={() => setTarjetaActiva(null)}
      />
      <p className="text-sm text-slate-text text-center">Datos de demostración</p>
    </div>
  );
}
