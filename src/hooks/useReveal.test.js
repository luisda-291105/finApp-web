/**
 * @uso        Test unitario del hook useReveal
 * @funciones  test "marca visible tras interseccion"
 * @datos      Mock de IntersectionObserver
 * @eventos    N/A
 * @estados    N/A
 * @usadoPor   vitest (npm run test)
 */
import { createElement } from "react";
import { describe, it, expect, vi } from "vitest";
import { renderHook, act, render } from "@testing-library/react";
import { useReveal } from "./useReveal";

describe("useReveal", () => {
  it("inicia visible=false", () => {
    let observe = vi.fn();
    global.IntersectionObserver = vi.fn().mockImplementation(() => ({
      observe,
      disconnect: vi.fn(),
    }));
    const { result } = renderHook(() => useReveal());
    expect(result.current.visible).toBe(false);
  });

  it("usa threshold 0.15 y rootMargin 0px 0px -8% 0px por defecto", () => {
    let opcionesRecibidas;
    global.IntersectionObserver = vi.fn().mockImplementation((cb, opts) => {
      opcionesRecibidas = opts;
      return { observe: vi.fn(), disconnect: vi.fn() };
    });
    function Sonda() {
      const { ref } = useReveal();
      return createElement("div", { ref });
    }
    render(createElement(Sonda));
    expect(opcionesRecibidas.threshold).toBe(0.15);
    expect(opcionesRecibidas.rootMargin).toBe("0px 0px -8% 0px");
  });

  it("desconecta el observer tras la primera intersección", () => {
    let callback;
    const disconnect = vi.fn();
    global.IntersectionObserver = vi.fn().mockImplementation((cb) => {
      callback = cb;
      return { observe: vi.fn(), disconnect };
    });
    function Sonda() {
      const { ref, visible } = useReveal();
      return createElement("div", { ref, "data-visible": String(visible) });
    }
    const { container } = render(createElement(Sonda));
    act(() => {
      callback([{ isIntersecting: true }]);
    });
    expect(disconnect).toHaveBeenCalledTimes(1);
    expect(container.firstChild.getAttribute("data-visible")).toBe("true");
  });

  it("desconecta el observer al desmontar", () => {
    const disconnect = vi.fn();
    global.IntersectionObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      disconnect,
    }));
    function Sonda() {
      const { ref } = useReveal();
      return createElement("div", { ref });
    }
    const { unmount } = render(createElement(Sonda));
    unmount();
    expect(disconnect).toHaveBeenCalledTimes(1);
  });

  it("no falla ni marca visible si nunca intersecta", () => {
    const disconnect = vi.fn();
    global.IntersectionObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      disconnect,
    }));
    function Sonda() {
      const { ref, visible } = useReveal();
      return createElement("div", { ref, "data-visible": String(visible) });
    }
    const { container, unmount } = render(createElement(Sonda));
    // No se dispara el callback de intersección.
    expect(container.firstChild.getAttribute("data-visible")).toBe("false");
    expect(() => unmount()).not.toThrow();
    expect(disconnect).toHaveBeenCalledTimes(1);
  });

  it("marca visible=true sin lanzar error cuando IntersectionObserver no existe", () => {
    const original = global.IntersectionObserver;
    delete global.IntersectionObserver;
    function Sonda() {
      const { ref, visible } = useReveal();
      return createElement("div", { ref, "data-visible": String(visible) });
    }
    const { container, unmount } = render(createElement(Sonda));
    expect(container.firstChild.getAttribute("data-visible")).toBe("true");
    expect(() => unmount()).not.toThrow();
    global.IntersectionObserver = original;
  });
});
