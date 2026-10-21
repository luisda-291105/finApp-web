/**
 * @uso        Pieza del cierre que navega: coloca el foco en la vista de destino una sola vez por
 *             entrada de historial (spec 011, M6; RF-15)
 * @funciones  useFocoEnVistaDestino()
 * @datos      Lee la marca `location.state.focoEnDestino` escrita por el cierre que navega; no
 *             transforma datos de aplicación
 * @eventos    Efecto de nivel de ruta: tras el render de la vista de destino aplica el foco con la
 *             lista ordenada de RF-15 (`resolverControlDeVista`: control estable por versión de
 *             vista → otro control estable → primer control enfocable)
 * @estados    Ninguno propio de React: una ref interna con la clave de la entrada ya consumida
 * @usadoPor   DashboardLayout (destino /dashboard), PaginaInicio (destino /)
 */
import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useBreakpoint } from "./useBreakpoint";
import { resolverControlDeVista } from "./useRetornoDeFoco";

/**
 * useFocoEnVistaDestino
 * Consume la marca que el cierre de una superficie modal escribe al cambiar de ruta (RF-15) y
 * coloca el foco en la vista de destino:
 * - **Después** del render de la nueva vista (efecto de nivel de ruta) y **una sola vez** por
 *   entrada de historial: la clave (`location.key`) queda registrada en una ref, así que los
 *   re-renders posteriores —incluido el doble efecto de `StrictMode`— no repiten la colocación.
 * - Aplica la **lista ordenada** de RF-15 reutilizando `resolverControlDeVista`: control estable de
 *   la versión de vista; si la vista de destino no es el dashboard, el primer control enfocable.
 * - Sin marca (navegación ordinaria) no toca el foco (AC-25); sin candidato no hace nada ni inventa
 *   marcado (limitación explícita, AC-23).
 * La marca viaja con la entrada de historial, así que caduca sola: una navegación ordinaria
 * posterior no la lleva.
 */
export function useFocoEnVistaDestino() {
  const location = useLocation();
  const { isMobile } = useBreakpoint();
  const claveConsumidaRef = useRef(null);
  const hayMarca = location.state?.focoEnDestino === true;

  useEffect(() => {
    if (!hayMarca) return;
    // Una sola colocación por entrada de historial (RF-15): la clave se registra antes de intentar
    // el foco, de modo que tampoco se reintenta si el destino no ofrece candidatos.
    if (claveConsumidaRef.current === location.key) return;
    claveConsumidaRef.current = location.key;

    const destino = resolverControlDeVista(isMobile);
    if (destino) destino.focus();
  }, [hayMarca, location.key, isMobile]);
}
