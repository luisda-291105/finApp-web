/**
 * @uso        Dos versiones de vista del dashboard (móvil / pantallas grandes) y estado de la navegación lateral
 * @funciones  useBreakpoint() → { isMobile, isDesktop, sidebarColapsada, toggleSidebar }
 * @datos      Lee la preferencia del usuario en localStorage 'sidebarCollapsed'; el snapshot inicial y la suscripción miden con las mismas matchMedia (768px / 1024px), fuente única
 * @eventos    change en la media query de 768px (versión de vista) y en la de 1024px (estado por defecto)
 * @estados    preferencia (boolean | null), esDesktop (boolean), anchoGrande (boolean), inicializados con la medición de matchMedia
 * @usadoPor   DashboardLayout (modo dashboard)
 */
import { useState, useEffect } from "react";

/** Corte de versión de vista: <768px = móvil; >=768px = pantallas grandes (única fuente de verdad). */
const QUERY_PANTALLAS_GRANDES = "(min-width: 768px)";
/** Umbral SOLO del estado por defecto de la navegación lateral; no es una versión de vista. */
const QUERY_ANCHO_GRANDE = "(min-width: 1024px)";
const CLAVE_PREFERENCIA = "sidebarCollapsed";

/** Preferencia válida ⇔ booleano tras deserializar; clave ausente, otro tipo o error ⇒ sin preferencia. */
function leerPreferencia() {
  if (typeof window === "undefined") return null;
  try {
    const valor = JSON.parse(localStorage.getItem(CLAVE_PREFERENCIA));
    return typeof valor === "boolean" ? valor : null;
  } catch {
    return null;
  }
}

function medirEsDesktop() {
  if (typeof window === "undefined") return true;
  return window.matchMedia(QUERY_PANTALLAS_GRANDES).matches;
}

function medirAnchoGrande() {
  if (typeof window === "undefined") return true;
  return window.matchMedia(QUERY_ANCHO_GRANDE).matches;
}

export function useBreakpoint() {
  const [preferencia, setPreferencia] = useState(leerPreferencia);
  const [esDesktop, setEsDesktop] = useState(medirEsDesktop);
  const [anchoGrande, setAnchoGrande] = useState(medirAnchoGrande);

  useEffect(() => {
    const mqPantallasGrandes = window.matchMedia(QUERY_PANTALLAS_GRANDES);
    const mqAnchoGrande = window.matchMedia(QUERY_ANCHO_GRANDE);

    const sincronizarVersion = () => setEsDesktop(mqPantallasGrandes.matches);
    const sincronizarAnchoGrande = () => setAnchoGrande(mqAnchoGrande.matches);

    mqPantallasGrandes.addEventListener("change", sincronizarVersion);
    mqAnchoGrande.addEventListener("change", sincronizarAnchoGrande);
    sincronizarVersion(); // sync inicial
    sincronizarAnchoGrande();

    return () => {
      mqPantallasGrandes.removeEventListener("change", sincronizarVersion);
      mqAnchoGrande.removeEventListener("change", sincronizarAnchoGrande);
    };
  }, []);

  // Sin preferencia válida: colapsada en 768–1023px, expandida en >=1024px.
  const sidebarColapsada = preferencia !== null ? preferencia : !anchoGrande;

  const toggleSidebar = () => {
    const siguiente = !sidebarColapsada;
    setPreferencia(siguiente);
    // Solo la elección del usuario se persiste; el default de banda nunca se materializa.
    if (typeof window !== "undefined") {
      localStorage.setItem(CLAVE_PREFERENCIA, JSON.stringify(siguiente));
    }
  };

  return { isMobile: !esDesktop, isDesktop: esDesktop, sidebarColapsada, toggleSidebar };
}
