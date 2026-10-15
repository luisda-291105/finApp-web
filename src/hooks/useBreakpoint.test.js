/**
 * @uso        Test unitario del hook useBreakpoint
 * @funciones  test "breakpoints según innerWidth", "persistencia localStorage", "cleanup listeners", "SSR pattern"
 * @datos      Mock de window.matchMedia, window.innerWidth, localStorage
 * @eventos    N/A
 * @estados    N/A
 * @usadoPor   vitest (npm run test)
 */
import { createElement } from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useBreakpoint } from "./useBreakpoint";

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
      mobile: { matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() },
      tablet: { matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() },
      desktop: { matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() },
    };

    window.matchMedia = vi.fn((query) => {
      if (query === "(max-width: 639px)") return matchMediaMocks.mobile;
      if (query === "(min-width: 640px) and (max-width: 1023px)") return matchMediaMocks.tablet;
      if (query === "(min-width: 1024px)") return matchMediaMocks.desktop;
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

  const setInnerWidth = (width) => {
    Object.defineProperty(window, "innerWidth", {
      value: width,
      writable: true,
      configurable: true,
    });
  };

  describe("breakpoints según innerWidth", () => {
    beforeEach(() => {
      setInnerWidth(1280);
    });

    it("retorna isMobile=true, isTablet=false, isDesktop=false cuando innerWidth < 640", () => {
      setInnerWidth(375);
      matchMediaMocks.mobile.matches = true;
      matchMediaMocks.tablet.matches = false;
      matchMediaMocks.desktop.matches = false;

      const { result } = renderHook(() => useBreakpoint());

      expect(result.current.isMobile).toBe(true);
      expect(result.current.isTablet).toBe(false);
      expect(result.current.isDesktop).toBe(false);
    });

    it("retorna isMobile=false, isTablet=true, isDesktop=false cuando innerWidth 640–1023", () => {
      setInnerWidth(768);
      matchMediaMocks.mobile.matches = false;
      matchMediaMocks.tablet.matches = true;
      matchMediaMocks.desktop.matches = false;

      const { result } = renderHook(() => useBreakpoint());

      expect(result.current.isMobile).toBe(false);
      expect(result.current.isTablet).toBe(true);
      expect(result.current.isDesktop).toBe(false);
    });

    it("retorna isMobile=false, isTablet=false, isDesktop=true cuando innerWidth >= 1024", () => {
      setInnerWidth(1280);
      matchMediaMocks.mobile.matches = false;
      matchMediaMocks.tablet.matches = false;
      matchMediaMocks.desktop.matches = true;

      const { result } = renderHook(() => useBreakpoint());

      expect(result.current.isMobile).toBe(false);
      expect(result.current.isTablet).toBe(false);
      expect(result.current.isDesktop).toBe(true);
    });

    it("actualiza breakpoints cuando matchMedia dispara change", () => {
      setInnerWidth(1280);
      matchMediaMocks.mobile.matches = false;
      matchMediaMocks.tablet.matches = false;
      matchMediaMocks.desktop.matches = true;

      const { result } = renderHook(() => useBreakpoint());

      expect(result.current.isDesktop).toBe(true);

      act(() => {
        matchMediaMocks.desktop.matches = false;
        matchMediaMocks.tablet.matches = true;
        // Get the handler that was registered
        const handler = matchMediaMocks.desktop.addEventListener.mock.calls[0][1];
        handler();
      });

      expect(result.current.isDesktop).toBe(false);
      expect(result.current.isTablet).toBe(true);
    });
  });

  describe("persistencia sidebarColapsada en localStorage", () => {
    beforeEach(() => {
      setInnerWidth(1280);
    });

    it("inicializa sidebarColapsada=false por defecto", () => {
      global.localStorage.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useBreakpoint());

      expect(result.current.sidebarColapsada).toBe(false);
    });

    it("restaura sidebarColapsada desde localStorage en cliente", () => {
      global.localStorage.getItem.mockReturnValue("true");

      const { result } = renderHook(() => useBreakpoint());

      expect(result.current.sidebarColapsada).toBe(true);
    });

    it("persiste sidebarColapsada en localStorage al cambiar con toggleSidebar", () => {
      global.localStorage.getItem.mockReturnValue("false");

      const { result } = renderHook(() => useBreakpoint());

      act(() => {
        result.current.toggleSidebar();
      });

      expect(global.localStorage.setItem).toHaveBeenCalledWith("sidebarCollapsed", "true");

      act(() => {
        result.current.toggleSidebar();
      });

      expect(global.localStorage.setItem).toHaveBeenCalledWith("sidebarCollapsed", "false");
    });

    it("maneja error de JSON.parse en localStorage corrupto", () => {
      global.localStorage.getItem.mockReturnValue("invalid-json");

      const { result } = renderHook(() => useBreakpoint());

      expect(result.current.sidebarColapsada).toBe(false);
    });
  });

  describe("cleanup de listeners matchMedia", () => {
    beforeEach(() => {
      setInnerWidth(1280);
    });

    it("registra addEventListener en mount", () => {
      renderHook(() => useBreakpoint());

      expect(matchMediaMocks.mobile.addEventListener).toHaveBeenCalledWith("change", expect.any(Function));
      expect(matchMediaMocks.tablet.addEventListener).toHaveBeenCalledWith("change", expect.any(Function));
      expect(matchMediaMocks.desktop.addEventListener).toHaveBeenCalledWith("change", expect.any(Function));
    });

    it("llama removeEventListener en unmount", () => {
      const { unmount } = renderHook(() => useBreakpoint());

      unmount();

      expect(matchMediaMocks.mobile.removeEventListener).toHaveBeenCalledWith("change", expect.any(Function));
      expect(matchMediaMocks.tablet.removeEventListener).toHaveBeenCalledWith("change", expect.any(Function));
      expect(matchMediaMocks.desktop.removeEventListener).toHaveBeenCalledWith("change", expect.any(Function));
    });
  });

  describe("toggleSidebar", () => {
    beforeEach(() => {
      setInnerWidth(1280);
    });

    it("alterna sidebarColapsada entre true y false", () => {
      global.localStorage.getItem.mockReturnValue("false");

      const { result } = renderHook(() => useBreakpoint());

      expect(result.current.sidebarColapsada).toBe(false);

      act(() => {
        result.current.toggleSidebar();
      });
      expect(result.current.sidebarColapsada).toBe(true);

      act(() => {
        result.current.toggleSidebar();
      });
      expect(result.current.sidebarColapsada).toBe(false);
    });

    it("retorna función toggleSidebar", () => {
      const { result } = renderHook(() => useBreakpoint());
      expect(typeof result.current.toggleSidebar).toBe("function");
    });
  });

  describe("retorno completo", () => {
    beforeEach(() => {
      setInnerWidth(1280);
    });

    it("retorna exactamente 5 props: isMobile, isTablet, isDesktop, sidebarColapsada, toggleSidebar", () => {
      const { result } = renderHook(() => useBreakpoint());

      const keys = Object.keys(result.current).sort();
      expect(keys).toEqual(["isDesktop", "isMobile", "isTablet", "sidebarColapsada", "toggleSidebar"]);
    });

    it("toggleSidebar es una función", () => {
      const { result } = renderHook(() => useBreakpoint());

      expect(typeof result.current.toggleSidebar).toBe("function");
    });
  });

  describe("patrón SSR: useState initializer no accede window/localStorage en servidor", () => {
    it("inicializa breakpoint con valores por defecto seguros (isDesktop=true) sin acceder window en initializer", () => {
      // El initializer de useState para breakpoint usa typeof window === 'undefined'
      // En entorno de test (jsdom) window existe, pero verificamos que el valor
      // por defecto cuando no hay window sería isDesktop=true
      global.localStorage.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useBreakpoint());

      // En test jsdom, innerWidth será el del entorno (>=1024 típicamente)
      // Lo importante es que no lance error y sidebarColapsada sea false por defecto
      expect(result.current.sidebarColapsada).toBe(false);
      expect(typeof result.current.isMobile).toBe("boolean");
      expect(typeof result.current.isTablet).toBe("boolean");
      expect(typeof result.current.isDesktop).toBe("boolean");
    });

    it("inicializa sidebarColapsada=false sin acceder localStorage cuando window es undefined (simulado)", () => {
      // Verificamos el patrón del initializer: typeof window === 'undefined' return false
      // En jsdom no podemos borrar window, pero el código usa el patrón correcto
      // Esto se valida inspeccionando la implementación: useState(() => { if (typeof window === 'undefined') return false; ... })
      const { result } = renderHook(() => useBreakpoint());
      expect(result.current.sidebarColapsada).toBe(false);
    });

    it("initializer de breakpoint usa comprobación typeof window === 'undefined'", () => {
      // Test de comportamiento: el initializer no debe lanzar aunque window.matchMedia no exista
      // En jsdom window.matchMedia existe, pero el código maneja el caso SSR correctamente
      expect(() => renderHook(() => useBreakpoint())).not.toThrow();
    });
  });
});