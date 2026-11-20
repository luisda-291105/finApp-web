/**
 * @uso        Minimiza/expande un bloque de configuración y recuerda el estado entre recargas
 * @funciones  useMinimizadoPersistente(clave, valorInicial = false)
 * @datos      Guarda y lee el estado en localStorage bajo la clave indicada
 * @eventos    Ninguno; al alternar persiste en localStorage
 * @estados    [minimizado, alternar]; la clave se crea con prefijo `finapp.config.`
 * @usadoPor   ConfiguracionPage (tarjetas LimpiezaAutomaticaPapelera, Mensajería y GrupoConfiguracionCard)
 */
import { useCallback, useState } from "react";

const CLAVE_MINIMIZADO = (clave) => `finapp.config.${clave}`;

/** Lee el estado inicial persistido; tolera localStorage no disponible o datos corruptos. */
function leerPersistido(clave, valorInicial) {
  try {
    const guardado = localStorage.getItem(CLAVE_MINIMIZADO(clave));
    return guardado === null ? valorInicial : guardado === "true";
  } catch {
    return valorInicial;
  }
}

/** Devuelve [minimizado, alternar]; persiste en localStorage como cadena «true»/«false». */
export default function useMinimizadoPersistente(clave, valorInicial = false) {
  const [minimizado, setMinimizado] = useState(() =>
    leerPersistido(clave, valorInicial),
  );

  const alternar = useCallback(() => {
    setMinimizado((actual) => {
      const siguiente = !actual;
      try {
        localStorage.setItem(CLAVE_MINIMIZADO(clave), String(siguiente));
      } catch {
        /* El estado sigue funcionando aunque no se pueda persistir. */
      }
      return siguiente;
    });
  }, [clave]);

  return [minimizado, alternar];
}
