/**
 * @uso        Selector de fecha personalizado (popover de calendario) que reemplaza al <input type="date"> nativo
 * @funciones  SelectorFecha({ id, value, onChange, className })
 * @datos      value/onChange usan la cadena ISO «aaaa-mm-dd»; el calendario trabaja con objetos Date locales
 * @eventos    Toggle por clic en el disparador, selección por clic o Enter/Espacio, flechas/Inicio/Fin/Re Pág/Av Pág para navegar, Escape cierra el popover, clic exterior cierra
 * @estados    abierto, fechaEnfoque (día con foco dentro del popover)
 * @usadoPor   ModalCrearMovimientoContable
 */
import { useEffect, useRef, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

const DIAS_SEMANA = ["L", "M", "X", "J", "V", "S", "D"];
const FORMATO_LARGO = new Intl.DateTimeFormat("es-CO", {
  day: "numeric",
  month: "long",
  year: "numeric",
});
const FORMATO_MES = new Intl.DateTimeFormat("es-CO", {
  month: "long",
  year: "numeric",
});
const FORMATO_DIA_ETIQUETA = new Intl.DateTimeFormat("es-CO", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

/** Convierte «aaaa-mm-dd» a Date local; devuelve null si la cadena no es válida. */
function parsearIso(valor) {
  const coincidencia = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(valor || ""));
  if (!coincidencia) return null;
  const [, anio, mes, dia] = coincidencia;
  const fecha = new Date(Number(anio), Number(mes) - 1, Number(dia));
  return Number.isNaN(fecha.getTime()) ? null : fecha;
}

/** Formatea una Date local como «aaaa-mm-dd». */
function aIso(fecha) {
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

/** Suma días a una fecha sin mutarla. */
function sumarDias(fecha, dias) {
  const copia = new Date(fecha);
  copia.setDate(copia.getDate() + dias);
  return copia;
}

function esMismoDia(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function capitalizar(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/** Celdas del mes visible: huecos iniciales (semana empieza en lunes) + días. */
function celdasDelMes(mesVisible) {
  const anio = mesVisible.getFullYear();
  const mes = mesVisible.getMonth();
  const primerDia = new Date(anio, mes, 1);
  const huecos = (primerDia.getDay() + 6) % 7;
  const totalDias = new Date(anio, mes + 1, 0).getDate();
  const celdas = Array.from({ length: huecos }, () => null);
  for (let dia = 1; dia <= totalDias; dia += 1) {
    celdas.push(new Date(anio, mes, dia));
  }
  return celdas;
}

export default function SelectorFecha({
  id = "selector-fecha",
  value = "",
  onChange,
  className = "",
}) {
  const [abierto, setAbierto] = useState(false);
  const [fechaEnfoque, setFechaEnfoque] = useState(
    () => parsearIso(value) || new Date(),
  );
  const contenedorRef = useRef(null);
  const disparadorRef = useRef(null);
  const diasRef = useRef(new Map());

  const seleccionada = parsearIso(value);
  const hoy = new Date();
  const mesVisible = new Date(
    fechaEnfoque.getFullYear(),
    fechaEnfoque.getMonth(),
    1,
  );

  // Al abrir o moverse con el teclado, el foco queda en el día enfocado.
  useEffect(() => {
    if (!abierto) return;
    diasRef.current.get(aIso(fechaEnfoque))?.focus();
  }, [abierto, fechaEnfoque]);

  // Clic exterior cierra el popover sin robar el foco.
  useEffect(() => {
    if (!abierto) return undefined;
    const alPulsarFuera = (evento) => {
      if (!contenedorRef.current?.contains(evento.target)) {
        setAbierto(false);
      }
    };
    document.addEventListener("mousedown", alPulsarFuera);
    return () => document.removeEventListener("mousedown", alPulsarFuera);
  }, [abierto]);

  const abrir = () => {
    setFechaEnfoque(parsearIso(value) || new Date());
    setAbierto(true);
  };

  const cerrarYDevolverFoco = () => {
    setAbierto(false);
    disparadorRef.current?.focus();
  };

  const elegir = (fecha) => {
    onChange?.(aIso(fecha));
    cerrarYDevolverFoco();
  };

  const manejarTeclaDia = (evento) => {
    const movimientos = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
      ArrowDown: 7,
    };
    if (evento.key in movimientos) {
      evento.preventDefault();
      evento.stopPropagation();
      setFechaEnfoque((actual) => sumarDias(actual, movimientos[evento.key]));
      return;
    }
    if (evento.key === "Home" || evento.key === "End") {
      evento.preventDefault();
      evento.stopPropagation();
      // La semana empieza en lunes: Home va al lunes, End al domingo.
      const desplazamiento = (fechaEnfoque.getDay() + 6) % 7;
      setFechaEnfoque(
        sumarDias(fechaEnfoque, evento.key === "Home" ? -desplazamiento : 6 - desplazamiento),
      );
      return;
    }
    if (evento.key === "PageUp" || evento.key === "PageDown") {
      evento.preventDefault();
      evento.stopPropagation();
      const delta = evento.key === "PageUp" ? -1 : 1;
      setFechaEnfoque(
        (actual) =>
          new Date(actual.getFullYear(), actual.getMonth() + delta, actual.getDate()),
      );
      return;
    }
    if (evento.key === "Escape") {
      evento.preventDefault();
      evento.stopPropagation();
      cerrarYDevolverFoco();
    }
  };

  const manejarTeclaDisparador = (evento) => {
    if (evento.key === "Escape" && abierto) {
      evento.preventDefault();
      evento.stopPropagation();
      cerrarYDevolverFoco();
    }
  };

  const textoDisparador = seleccionada
    ? capitalizar(FORMATO_LARGO.format(seleccionada))
    : "Selecciona una fecha";

  return (
    <div ref={contenedorRef} className={`relative ${className}`}>
      <button
        ref={disparadorRef}
        id={id}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={abierto}
        onClick={() => (abierto ? setAbierto(false) : abrir())}
        onKeyDown={manejarTeclaDisparador}
        className="mt-1 flex min-h-11 w-full items-center gap-2 rounded-xl border border-border-line bg-white px-3 text-left text-bg-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary"
      >
        <Calendar
          className="h-5 w-5 shrink-0 text-emerald-primary"
          aria-hidden="true"
        />
        <span className={seleccionada ? "" : "text-slate-text"}>
          {textoDisparador}
        </span>
      </button>

      {abierto && (
        <div
          role="dialog"
          aria-label="Elegir fecha"
          className="absolute left-0 top-full z-20 mt-2 w-72 rounded-2xl border border-border-line bg-white p-3 shadow-xl"
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <button
              type="button"
              aria-label="Mes anterior"
              onClick={() =>
                setFechaEnfoque(
                  new Date(
                    fechaEnfoque.getFullYear(),
                    fechaEnfoque.getMonth() - 1,
                    fechaEnfoque.getDate(),
                  ),
                )
              }
              className="rounded-lg p-2 hover:bg-bg-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <p className="text-sm font-semibold text-bg-dark" aria-live="polite">
              {capitalizar(FORMATO_MES.format(mesVisible))}
            </p>
            <button
              type="button"
              aria-label="Mes siguiente"
              onClick={() =>
                setFechaEnfoque(
                  new Date(
                    fechaEnfoque.getFullYear(),
                    fechaEnfoque.getMonth() + 1,
                    fechaEnfoque.getDate(),
                  ),
                )
              }
              className="rounded-lg p-2 hover:bg-bg-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1" aria-hidden="true">
            {DIAS_SEMANA.map((dia) => (
              <span
                key={dia}
                className="flex h-8 items-center justify-center text-xs font-medium text-slate-text"
              >
                {dia}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {celdasDelMes(mesVisible).map((fecha, indice) =>
              fecha === null ? (
                <span key={`hueco-${indice}`} className="h-9" />
              ) : (
                <button
                  key={aIso(fecha)}
                  ref={(elemento) => {
                    if (elemento) diasRef.current.set(aIso(fecha), elemento);
                    else diasRef.current.delete(aIso(fecha));
                  }}
                  type="button"
                  aria-label={capitalizar(FORMATO_DIA_ETIQUETA.format(fecha))}
                  aria-pressed={Boolean(seleccionada && esMismoDia(fecha, seleccionada))}
                  onClick={() => elegir(fecha)}
                  onKeyDown={manejarTeclaDia}
                  className={[
                    "flex h-9 w-9 items-center justify-center justify-self-center rounded-full text-sm tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary",
                    seleccionada && esMismoDia(fecha, seleccionada)
                      ? "bg-emerald-primary font-semibold text-bg-cream"
                      : esMismoDia(fecha, hoy)
                        ? "font-semibold text-emerald-primary ring-1 ring-emerald-primary hover:bg-bg-cream"
                        : "text-bg-dark hover:bg-bg-cream",
                  ].join(" ")}
                >
                  {fecha.getDate()}
                </button>
              ),
            )}
          </div>

          <button
            type="button"
            onClick={() => elegir(new Date())}
            className="mt-2 min-h-9 w-full rounded-xl border border-border-line px-3 text-sm font-medium text-emerald-primary hover:bg-bg-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary"
          >
            Hoy
          </button>
        </div>
      )}
    </div>
  );
}
