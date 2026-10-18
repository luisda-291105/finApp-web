/**
 * @uso        Acordeón vertical exclusivo de tarjetas demo para móvil (<640px) de /dashboard/tarjetas (spec 004)
 * @funciones  AcordeonTarjetas({ tarjetas, onSeleccionarTarjeta })
 * @datos      Recibe `tarjetas` (array de tarjetas demo); no transforma datos externos
 * @eventos    onSeleccionarTarjeta(tarjeta) - se dispara al segundo toque sobre la tarjeta ya expandida
 * @estados    indiceExpandido (number|null) - acordeón exclusivo, primera expandida por defecto;
 *             reducirMovimiento (useReducedMotion) - desactiva la animación de expansión
 * @usadoPor   PanelTarjetas
 */
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import MiTarjetaVirtual from "./MiTarjetaVirtual";

/**
 * AcordeonTarjetas
 * - Visible solo en móvil (`sm:hidden`; el grid responsivo es otro contenedor hermano).
 * - Acordeón exclusivo: una tarjeta expandida a la vez; la primera expandida por defecto.
 * - Gesto móvil: primer toque sobre encabezado colapsado expande; tocar el encabezado
 *   expandido lo colapsa (toggle); tocar la tarjeta ya expandida abre el modal vía
 *   `onSeleccionarTarjeta(tarjeta)`.
 * - ARIA de acordeón: cada encabezado es `<button aria-expanded aria-controls>` y el
 *   panel expandido usa `role="region"` + `aria-labelledby`; solo se monta el panel
 *   expandido (sin hijos interactivos ocultos).
 * - Dentro del panel, `MiTarjetaVirtual` con `flipDeshabilitado` (sin flip fuera del modal).
 */
export default function AcordeonTarjetas({ tarjetas, onSeleccionarTarjeta }) {
  const [indiceExpandido, setIndiceExpandido] = useState(0);
  const reducirMovimiento = useReducedMotion();

  const alternarIndice = (indice) => {
    setIndiceExpandido((actual) => (actual === indice ? null : indice));
  };

  return (
    <div className="sm:hidden flex flex-col gap-3" role="list" aria-label="Tarjetas de demostración">
      {tarjetas.map((tarjeta, indice) => {
        const expandida = indice === indiceExpandido;
        const idEncabezado = `encabezado-tarjeta-${indice}`;
        const idPanel = `panel-tarjeta-${indice}`;
        const ultimos4 = tarjeta.numero.replace(/\s/g, "").slice(-4);

        return (
          <div key={tarjeta.id} role="listitem">
            <button
              type="button"
              id={idEncabezado}
              className="w-full text-left glass-card px-4 py-3 flex items-center justify-between gap-3"
              aria-expanded={expandida}
              aria-controls={idPanel}
              onClick={() => alternarIndice(indice)}
            >
              <span className="min-w-0">
                <span className="block font-display font-medium truncate">{tarjeta.titular}</span>
                <span className="block text-sm text-slate-text font-mono tabular-nums">
                  •••• {ultimos4}
                </span>
              </span>
              <svg
                className={`w-5 h-5 shrink-0 text-slate-text transition-transform${expandida ? " rotate-180" : ""}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>

            {expandida && (
              <motion.div
                id={idPanel}
                role="region"
                aria-labelledby={idEncabezado}
                className="overflow-hidden pt-3"
                initial={reducirMovimiento ? false : { height: 0, opacity: 0 }}
                animate={reducirMovimiento ? {} : { height: "auto", opacity: 1 }}
                transition={reducirMovimiento ? { duration: 0 } : { duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <div
                  role="button"
                  tabIndex={0}
                  aria-label={`Ver detalle de la tarjeta de ${tarjeta.titular}`}
                  className="cursor-pointer outline-none"
                  onClick={() => onSeleccionarTarjeta(tarjeta)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSeleccionarTarjeta(tarjeta);
                    }
                  }}
                >
                  <MiTarjetaVirtual
                    titular={tarjeta.titular}
                    numero={tarjeta.numero}
                    expiracion={tarjeta.expiracion}
                    cvv={tarjeta.cvv}
                    entidad={tarjeta.entidad}
                    colorTema={tarjeta.colorTema}
                    flipDeshabilitado
                  />
                </div>
              </motion.div>
            )}
          </div>
        );
      })}
    </div>
  );
}
