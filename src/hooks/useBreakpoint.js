/**
 * @uso        Hook unificado de breakpoints y estado sidebar para navegación responsive
 * @funciones  useBreakpoint() → { isMobile, isTablet, isDesktop, sidebarColapsada, toggleSidebar }
 * @datos      Usa matchMedia listeners (cleanup en unmount), sin dependencia de useReveal
 * @eventos    resize, change en media queries
 * @estados    sidebarColapsada (persistida en localStorage 'sidebarCollapsed')
 * @usadoPor   DashboardLayout, DashboardHeader (modo dashboard)
 */
import { useState, useEffect } from "react";

export function useBreakpoint() {
  const [sidebarColapsada, setSidebarColapsada] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return JSON.parse(localStorage.getItem("sidebarCollapsed")) ?? false;
    } catch {
      return false;
    }
  });

  const [breakpoint, setBreakpoint] = useState(() => {
    if (typeof window === "undefined") {
      return { isMobile: false, isTablet: false, isDesktop: true };
    }
    const w = window.innerWidth;
    return {
      isMobile: w < 640,
      isTablet: w >= 640 && w < 1024,
      isDesktop: w >= 1024,
    };
  });

  useEffect(() => {
    const mqMobile = window.matchMedia("(max-width: 639px)");
    const mqTablet = window.matchMedia("(min-width: 640px) and (max-width: 1023px)");
    const mqDesktop = window.matchMedia("(min-width: 1024px)");

    const handler = () =>
      setBreakpoint({
        isMobile: mqMobile.matches,
        isTablet: mqTablet.matches,
        isDesktop: mqDesktop.matches,
      });

    mqMobile.addEventListener("change", handler);
    mqTablet.addEventListener("change", handler);
    mqDesktop.addEventListener("change", handler);
    handler(); // sync inicial

    return () => {
      mqMobile.removeEventListener("change", handler);
      mqTablet.removeEventListener("change", handler);
      mqDesktop.removeEventListener("change", handler);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", JSON.stringify(sidebarColapsada));
  }, [sidebarColapsada]);

  const toggleSidebar = () => setSidebarColapsada((c) => !c);

  return { ...breakpoint, sidebarColapsada, toggleSidebar };
}