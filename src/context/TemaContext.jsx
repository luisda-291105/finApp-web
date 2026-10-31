/**
 * @uso        Mantiene y persiste la apariencia clara u oscura de FinApp
 * @funciones  TemaProvider, useTema
 * @datos      tema ("claro" | "oscuro")
 * @eventos    Cambio de apariencia desde Configuración
 * @estados    tema
 * @usadoPor   App.jsx y PaginaDashboardConfiguracion.jsx
 */
import { createContext, useContext, useEffect, useState } from "react";

const CLAVE_TEMA = "finapp_tema";
const TemaContext = createContext({ tema: "claro", alternarTema: () => {} });

export function TemaProvider({ children }) {
  const [tema, setTema] = useState(() => {
    try {
      return localStorage.getItem(CLAVE_TEMA) === "oscuro" ? "oscuro" : "claro";
    } catch {
      return "claro";
    }
  });

  useEffect(() => {
    document.documentElement.dataset.tema = tema;
    try {
      localStorage.setItem(CLAVE_TEMA, tema);
    } catch {
      // El tema sigue activo durante esta sesión aunque el almacenamiento no esté disponible.
    }
  }, [tema]);

  const alternarTema = () => setTema((actual) => actual === "claro" ? "oscuro" : "claro");

  return (
    <TemaContext.Provider value={{ tema, alternarTema }}>
      {children}
    </TemaContext.Provider>
  );
}

export function useTema() {
  return useContext(TemaContext);
}
