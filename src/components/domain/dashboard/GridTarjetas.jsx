/**
 * @uso        Grid responsivo (3 col en sm/md, 5 en lg+) de tarjetas demo para /dashboard/tarjetas (spec 004)
 * @funciones  GridTarjetas({ tarjetas, onSeleccionarTarjeta })
 * @datos      Recibe `tarjetas` (array de tarjetas demo); no transforma datos externos
 * @eventos    onSeleccionarTarjeta(tarjeta) - se dispara al primer clic/Enter/Espacio (abre modal)
 * @estados    Ninguno (presentacional; el modal vive en PanelTarjetas)
 * @usadoPor   PanelTarjetas
 */
import MiTarjetaVirtual from "./MiTarjetaVirtual";

/**
 * GridTarjetas
 * - Visible solo en tablet/escritorio (`hidden sm:grid`; el acordeón móvil es otro
 *   contenedor hermano, doble render por clases según breakpoints).
 * - Cada celda muestra la tarjeta completa con `flipDeshabilitado` (sin flip fuera
 *   del modal) envuelta en un control accesible `role="button"` con aria-label en
 *   español: un solo gesto (clic, Enter o Espacio) dispara `onSeleccionarTarjeta`.
 * - Sin hexadecimales: solo clases/tokens del proyecto.
 */
export default function GridTarjetas({ tarjetas, onSeleccionarTarjeta }) {
  return (
    <div
      className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start"
      role="list"
      aria-label="Tarjetas de demostración"
    >
      {tarjetas.map((tarjeta) => (
        <div key={tarjeta.id} role="listitem">
          <div
            role="button"
            tabIndex={0}
            aria-label={`Ver detalle de la tarjeta de ${tarjeta.titular}`}
            className="cursor-pointer rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary focus-visible:ring-offset-2"
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
        </div>
      ))}
    </div>
  );
}
