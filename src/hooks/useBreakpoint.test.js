/**
 * @uso        Test unitario del hook useBreakpoint (dos versiones de vista y estado de la sidebar)
 * @funciones  contrato de 4 props, partición complementaria 768px, defaults por banda (1024px), contrato de preferencia, persistencia y cleanup
 * @datos      Mock de window.matchMedia (2 queries), window.innerWidth y localStorage
 * @eventos    N/A
 * @estados    N/A
 * @usadoPor   vitest (npm run test)
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useBreakpoint } from "./useBreakpoint";

const QUERY_PANTALLAS_GRANDES = "(min-width: 768px)";
const QUERY_ANCHO_GRANDE = "(min-width: 1024px)";
const CLAVE_PREFERENCIA = "sidebarCollapsed";

describe("useBreakpoint", () => {
  let originalMatchMedia;
  let originalLocalStorage;
  let originalInnerWidthDescriptor;
  let matchMediaMocks;

  beforeEach(() => {
    originalMatchMedia = window.matchMedia;
    originalLocalStorage = global.localStorage;
    originalInnerWidthDescriptor = Object.getOwnPropertyDescriptor(window, "innerWidth");

    matchMediaMocks = {
      pantallasGrandes: { matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() },
      anchoGrande: { matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() },
    };

    window.matchMedia = vi.fn((query) => {
      if (query === QUERY_PANTALLAS_GRANDES) return matchMediaMocks.pantallasGrandes;
      if (query === QUERY_ANCHO_GRANDE) return matchMediaMocks.anchoGrande;
      return { matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() };
    });

    global.localStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    global.localStorage = originalLocalStorage;
    if (originalInnerWidthDescriptor) {
      Object.defineProperty(window, "innerWidth", originalInnerWidthDescriptor);
    }
    vi.clearAllMocks();
  });

  /** Fija innerWidth y el `matches` coherente de las dos media queries. */
  const configurarAncho = (width) => {
    Object.defineProperty(window, "innerWidth", {
      value: width,
      writable: true,
      configurable: true,
    });
    matchMediaMocks.pantallasGrandes.matches = width >= 768;
    matchMediaMocks.anchoGrande.matches = width >= 1024;
  };

  const handlerPantallasGrandes = () =>
    matchMediaMocks.pantallasGrandes.addEventListener.mock.calls[0][1];

  const handlerAnchoGrande = () =>
    matchMediaMocks.anchoGrande.addEventListener.mock.calls[0][1];

  describe("contrato de versión de vista", () => {
    beforeEach(() => configurarAncho(1280));

    it("expone exactamente isDesktop, isMobile, sidebarColapsada y toggleSidebar", () => {
      const { result } = renderHook(() => useBreakpoint());

      expect(Object.keys(result.current).sort()).toEqual([
        "isDesktop",
        "isMobile",
        "sidebarColapsada",
        "toggleSidebar",
      ]);
    });

    it("no expone isTablet", () => {
      const { result } = renderHook(() => useBreakpoint());

      expect(result.current.isTablet).toBeUndefined();
    });

    it("solo consulta las queries de 768px y 1024px (ninguna de la banda 640–1023px)", () => {
      renderHook(() => useBreakpoint());

      const queries = window.matchMedia.mock.calls.map(([query]) => query);
      expect(queries).toContain(QUERY_PANTALLAS_GRANDES);
      expect(queries).toContain(QUERY_ANCHO_GRANDE);
      queries.forEach((query) => {
        expect(query).not.toContain("639");
        expect(query).not.toContain("640");
        expect(query).not.toContain("1023");
      });
    });

    it("toggleSidebar es una función", () => {
      const { result } = renderHook(() => useBreakpoint());

      expect(typeof result.current.toggleSidebar).toBe("function");
    });
  });

  describe("partición complementaria en el corte de 768px", () => {
    const casos = [767, 767.5, 768, 800, 1023, 1024, 1440].map((width) => ({
      width,
      esDesktop: width >= 768,
    }));

    it.each(casos)("en $width px exactamente uno de isMobile/isDesktop está activo", ({ width, esDesktop }) => {
      configurarAncho(width);
      const { result } = renderHook(() => useBreakpoint());

      expect(result.current.isDesktop).toBe(esDesktop);
      expect(result.current.isMobile).toBe(!esDesktop);
      expect(Number(result.current.isMobile) + Number(result.current.isDesktop)).toBe(1);
    });

    it("responde al change de la query de 768px", () => {
      configurarAncho(375);
      const { result } = renderHook(() => useBreakpoint());
      expect(result.current.isMobile).toBe(true);

      act(() => {
        matchMediaMocks.pantallasGrandes.matches = true;
        handlerPantallasGrandes()();
      });

      expect(result.current.isDesktop).toBe(true);
      expect(result.current.isMobile).toBe(false);
    });
  });

  describe("estado por defecto por banda sin preferencia válida", () => {
    beforeEach(() => {
      global.localStorage.getItem.mockReturnValue(null);
    });

    it("queda colapsada en 768–1023px (800px)", () => {
      configurarAncho(800);
      const { result } = renderHook(() => useBreakpoint());

      expect(result.current.sidebarColapsada).toBe(true);
    });

    it("queda expandida en >=1024px (1200px)", () => {
      configurarAncho(1200);
      const { result } = renderHook(() => useBreakpoint());

      expect(result.current.sidebarColapsada).toBe(false);
    });
  });

  describe("contrato de preferencia válida", () => {
    it("una preferencia colapsada manda en 800px y en 1200px", () => {
      global.localStorage.getItem.mockReturnValue("true");

      configurarAncho(800);
      const enBanda = renderHook(() => useBreakpoint());
      expect(enBanda.result.current.sidebarColapsada).toBe(true);
      enBanda.unmount();

      configurarAncho(1200);
      const enGrande = renderHook(() => useBreakpoint());
      expect(enGrande.result.current.sidebarColapsada).toBe(true);
    });

    it("una preferencia expandida manda en 800px y en 1200px", () => {
      global.localStorage.getItem.mockReturnValue("false");

      configurarAncho(800);
      const enBanda = renderHook(() => useBreakpoint());
      expect(enBanda.result.current.sidebarColapsada).toBe(false);
      enBanda.unmount();

      configurarAncho(1200);
      const enGrande = renderHook(() => useBreakpoint());
      expect(enGrande.result.current.sidebarColapsada).toBe(false);
    });

    it.each([
      ["clave ausente (null)", null],
      ["null serializado", "null"],
      ["número serializado", "1"],
      ["string serializado", '"false"'],
      ["JSON corrupto", "invalid-json"],
    ])("sin preferencia válida (%s) aplica el default de banda colapsada en 800px", (_caso, valor) => {
      global.localStorage.getItem.mockReturnValue(valor);
      configurarAncho(800);

      const { result } = renderHook(() => useBreakpoint());

      expect(result.current.sidebarColapsada).toBe(true);
    });
  });

  describe("persistencia solo al alternar", () => {
    beforeEach(() => {
      global.localStorage.getItem.mockReturnValue(null);
    });

    it("montar el hook no escribe en localStorage", () => {
      configurarAncho(800);
      renderHook(() => useBreakpoint());

      expect(global.localStorage.setItem).not.toHaveBeenCalled();
    });

    it("toggleSidebar alterna y escribe el valor elegido", () => {
      configurarAncho(800); // default colapsada
      const { result } = renderHook(() => useBreakpoint());
      expect(result.current.sidebarColapsada).toBe(true);

      act(() => {
        result.current.toggleSidebar();
      });
      expect(result.current.sidebarColapsada).toBe(false);
      expect(global.localStorage.setItem).toHaveBeenCalledWith(CLAVE_PREFERENCIA, "false");

      act(() => {
        result.current.toggleSidebar();
      });
      expect(result.current.sidebarColapsada).toBe(true);
      expect(global.localStorage.setItem).toHaveBeenLastCalledWith(CLAVE_PREFERENCIA, "true");
    });

    it("cruzar 1200px→800px por change sin preferencia colapsa y no escribe", () => {
      configurarAncho(1200);
      const { result } = renderHook(() => useBreakpoint());
      expect(result.current.sidebarColapsada).toBe(false);
      expect(global.localStorage.setItem).not.toHaveBeenCalled();

      act(() => {
        matchMediaMocks.anchoGrande.matches = false;
        handlerAnchoGrande()();
      });

      expect(result.current.isDesktop).toBe(true); // misma versión de vista
      expect(result.current.sidebarColapsada).toBe(true);
      expect(global.localStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe("listeners de matchMedia", () => {
    beforeEach(() => configurarAncho(1280));

    it("registra addEventListener de ambas queries en mount", () => {
      renderHook(() => useBreakpoint());

      expect(matchMediaMocks.pantallasGrandes.addEventListener).toHaveBeenCalledWith("change", expect.any(Function));
      expect(matchMediaMocks.anchoGrande.addEventListener).toHaveBeenCalledWith("change", expect.any(Function));
    });

    it("llama removeEventListener de ambas queries en unmount", () => {
      const { unmount } = renderHook(() => useBreakpoint());

      unmount();

      expect(matchMediaMocks.pantallasGrandes.removeEventListener).toHaveBeenCalledWith("change", expect.any(Function));
      expect(matchMediaMocks.anchoGrande.removeEventListener).toHaveBeenCalledWith("change", expect.any(Function));
    });
  });

  describe("primer render sin medición disponible (SSR)", () => {
    it("no lanza error y devuelve booleanos aunque no haya preferencia", () => {
      global.localStorage.getItem.mockReturnValue(undefined);

      expect(() => renderHook(() => useBreakpoint())).not.toThrow();

      const { result } = renderHook(() => useBreakpoint());
      expect(typeof result.current.isMobile).toBe("boolean");
      expect(typeof result.current.isDesktop).toBe("boolean");
      expect(typeof result.current.sidebarColapsada).toBe("boolean");
    });
  });
});
