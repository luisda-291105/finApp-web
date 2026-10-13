/**
 * @uso        Panel de tarjetas para la sección "tarjetas" del dashboard con tarjeta virtual destacada
 * @funciones  PanelTarjetas()
 * @datos      Constantes internas tarjetasDemo (nombre, últimos 4 dígitos, saldo) y
 *             ejemplosDiseno (variaciones de colorTema de MiTarjetaVirtual)
 * @eventos    Ninguno
 * @estados    Ninguno
 * @usadoPor   App.jsx (DashboardSection)
 */
import MiTarjetaVirtual from "./MiTarjetaVirtual";

const tarjetasDemo = [
  { nombre: "Tarjeta Oro", ultimos4: "4242", saldo: "$2,340.00" },
  { nombre: "Tarjeta Platino", ultimos4: "5300", saldo: "$980.25" },
  { nombre: "Débito Nómina", ultimos4: "7841", saldo: "$5,120.75" },
];

const ejemplosDiseno = [
  {
    titular: "ANA MARTÍNEZ",
    numero: "5555 5555 5555 4444",
    expiracion: "06/27",
    cvv: "312",
    colorTema: "menta",
  },
  {
    titular: "CARLOS RUIZ",
    numero: "3782 822463 10005",
    expiracion: "09/29",
    cvv: "650",
    colorTema: "morado",
  },
];

/**
 * PanelTarjetas
 * Muestra la tarjeta virtual interactiva "Mi Tarjeta Virtual" como elemento
 * principal, seguida de un grid de tarjetas de demostración adicionales.
 * Incluye nota "Datos de demostración" bajo el grid. Datos ficticios.
 */
export default function PanelTarjetas() {
  return (
    <div className="space-y-6">
      {/* Tarjeta Virtual Principal - Mi Tarjeta Virtual */}
      <section aria-labelledby="mi-tarjeta-virtual-titulo">
        <h2 id="mi-tarjeta-virtual-titulo" className="sr-only">
          Mi Tarjeta Virtual
        </h2>
        <MiTarjetaVirtual
          titular="MARÍA GARCÍA"
          numero="4242 4242 4242 4242"
          expiracion="12/28"
          cvv="847"
          entidad="FinApp"
          colorTema="azul"
        />
      </section>

      {/* Ejemplos de diseño: variaciones de colorTema de la tarjeta virtual */}
      <section aria-labelledby="ejemplos-diseno-titulo">
        <h3 id="ejemplos-diseno-titulo" className="text-sm font-semibold text-slate-text mb-1">
          Ejemplos de diseño
        </h3>
        <p className="text-xs text-slate-text mb-3">
          Variaciones de diseño de la tarjeta virtual
        </p>
        <div className="grid gap-6 sm:grid-cols-2">
          {ejemplosDiseno.map(({ titular, numero, expiracion, cvv, colorTema }) => (
            <MiTarjetaVirtual
              key={colorTema}
              titular={titular}
              numero={numero}
              expiracion={expiracion}
              cvv={cvv}
              entidad="FinApp"
              colorTema={colorTema}
            />
          ))}
        </div>
      </section>

      {/* Tarjetas adicionales en grid */}
      <section aria-labelledby="otras-tarjetas-titulo">
        <h3 id="otras-tarjetas-titulo" className="text-sm font-semibold text-slate-text mb-3">
          Tus otras tarjetas
        </h3>
        <div className="grid gap-4 sm:grid-cols-3">
          {tarjetasDemo.map(({ nombre, ultimos4, saldo }) => (
            <article key={nombre} className="glass-card p-5">
              <p className="text-sm text-slate-text">{nombre}</p>
              <p className="text-sm text-slate-text">•••• {ultimos4}</p>
              <p className="mt-3 text-2xl font-semibold text-bg-dark">{saldo}</p>
            </article>
          ))}
        </div>
      </section>

      <p className="text-sm text-slate-text text-center">Datos de demostración</p>
    </div>
  );
}
