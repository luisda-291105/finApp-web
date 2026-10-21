/**
 * @uso        Pruebas unitarias del hook useDeslizarParaCerrar (spec 010, tarea 3)
 * @funciones  solo móvil (<768px), umbral 96px + dirección vertical, exclusión de controles
 *             interactivos, scroll del panel, puntero primario, sin transform y limpieza de listeners
 * @datos      Mock de window.matchMedia/innerWidth; espías de addEventListener/removeEventListener del panel
 * @eventos    pointerdown/pointermove/pointerup/pointercancel sintéticos sobre el panel
 * @estados    N/A
 * @usadoPor   vitest (npm run test)
 */
import { createElement, useRef } from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/react";
import { useDeslizarParaCerrar } from "../../hooks/useDeslizarParaCerrar";

const QUERY_PANTALLAS_GRANDES = "(min-width: 768px)";
const QUERY_ANCHO_GRANDE = "(min-width: 1024px)";

/** Sonda: panel real con contenido y varios controles interactivos dentro. */
function SondaPanel({ activo = true, alCerrar = () => {} }) {
  const refPanel = useRef(null);
  useDeslizarParaCerrar({ activo, refPanel, alCerrar });
  return createElement(
    "div",
    { ref: refPanel, "data-panel": "true" },
    createElement("button", { type: "button" }, "Botón"),
    createElement("a", { href: "#destino" }, "Enlace"),
    createElement("input", { "aria-label": "Campo" }),
    createElement("textarea", { "aria-label": "Área de texto" }),
    createElement("label", null, "Etiqueta"),
    createElement("div", { role: "button", tabIndex: 0 }, "Rol botón"),
    createElement("p", { "data-contenido": "true" }, "Contenido no interactivo")
  );
}

/** Evento de puntero nativo sintético (jsdom no implementa PointerEvent con coords). */
function eventoPuntero(tipo, { x = 0, y = 0, pointerId = 1, isPrimary = true } = {}) {
  const evento = new Event(tipo, { bubbles: true, cancelable: true });
  Object.assign(evento, { clientX: x, clientY: y, pointerId, isPrimary });
  return evento;
}

/** Dispara un deslizamiento completo (down → move → up) sobre el objetivo. */
function deslizar(objetivo, { desdeX = 0, desdeY = 0, hastaX = 0, hastaY = 0, pointerId = 1, isPrimary = true } = {}) {
  objetivo.dispatchEvent(eventoPuntero("pointerdown", { x: desdeX, y: desdeY, pointerId, isPrimary }));
  objetivo.dispatchEvent(eventoPuntero("pointermove", { x: hastaX, y: hastaY, pointerId, isPrimary }));
  objetivo.dispatchEvent(eventoPuntero("pointerup", { x: hastaX, y: hastaY, pointerId, isPrimary }));
}

describe("useDeslizarParaCerrar", () => {
  let mqPantallas;
  let mqAncho;
  let originalMatchMedia;
  let originalInnerWidth;
  let originalAddElement;
  let originalRemoveElement;
  let registrados;
  let retirados;

  const esPunteroDePanel = (nodo, tipo) =>
    typeof tipo === "string" && tipo.startsWith("pointer") && nodo?.dataset?.panel === "true";

  const configurarAncho = (width) => {
    Object.defineProperty(window, "innerWidth", { value: width, writable: true, configurable: true });
    mqPantallas.matches = width >= 768;
    mqAncho.matches = width >= 1024;
  };

  const montar = (props = {}) => render(createElement(SondaPanel, props));

  const panelDe = (container) => container.querySelector('[data-panel="true"]');

  beforeEach(() => {
    registrados = [];
    retirados = [];
    originalAddElement = Element.prototype.addEventListener;
    originalRemoveElement = Element.prototype.removeEventListener;
    Element.prototype.addEventListener = function (tipo, ...resto) {
      if (esPunteroDePanel(this, tipo)) registrados.push(tipo);
      return originalAddElement.call(this, tipo, ...resto);
    };
    Element.prototype.removeEventListener = function (tipo, ...resto) {
      if (esPunteroDePanel(this, tipo)) retirados.push(tipo);
      return originalRemoveElement.call(this, tipo, ...resto);
    };

    originalMatchMedia = window.matchMedia;
    originalInnerWidth = Object.getOwnPropertyDescriptor(window, "innerWidth");
    mqPantallas = { matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() };
    mqAncho = { matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() };
    window.matchMedia = vi.fn((query) => {
      if (query === QUERY_PANTALLAS_GRANDES) return mqPantallas;
      if (query === QUERY_ANCHO_GRANDE) return mqAncho;
      return { matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() };
    });
    configurarAncho(375);
  });

  afterEach(() => {
    Element.prototype.addEventListener = originalAddElement;
    Element.prototype.removeEventListener = originalRemoveElement;
    window.matchMedia = originalMatchMedia;
    if (originalInnerWidth) Object.defineProperty(window, "innerWidth", originalInnerWidth);
    vi.restoreAllMocks();
  });

  describe("versión de vista (móvil <768px)", () => {
    it("registra los cuatro eventos de puntero en el panel en móvil", () => {
      montar();

      expect(registrados.slice().sort()).toEqual([
        "pointercancel",
        "pointerdown",
        "pointermove",
        "pointerup",
      ]);
    });

    it("en ≥768px no registra ningún listener y no cierra", () => {
      configurarAncho(1024);
      const alCerrar = vi.fn();
      const { container } = montar({ alCerrar });

      expect(registrados).toEqual([]);

      deslizar(panelDe(container), { hastaY: 200 });
      expect(alCerrar).not.toHaveBeenCalled();
    });
  });

  describe("umbral y dirección", () => {
    it("cierra al superar el umbral con dirección vertical predominante (una sola llamada)", () => {
      const alCerrar = vi.fn();
      const { container } = montar({ alCerrar });
      const panel = panelDe(container);

      deslizar(panel, { hastaY: 120 });

      expect(alCerrar).toHaveBeenCalledTimes(1);
    });

    it("no cierra con un arrastre corto (por debajo del umbral)", () => {
      const alCerrar = vi.fn();
      const { container } = montar({ alCerrar });

      deslizar(panelDe(container), { hastaY: 40 });

      expect(alCerrar).not.toHaveBeenCalled();
    });

    it("no cierra si la dirección horizontal predomina", () => {
      const alCerrar = vi.fn();
      const { container } = montar({ alCerrar });

      deslizar(panelDe(container), { hastaX: 100, hastaY: 120 });

      expect(alCerrar).not.toHaveBeenCalled();
    });

    it("cierra cuando el desplazamiento vertical es claramente predominante", () => {
      const alCerrar = vi.fn();
      const { container } = montar({ alCerrar });

      deslizar(panelDe(container), { hastaX: 60, hastaY: 200 });

      expect(alCerrar).toHaveBeenCalledTimes(1);
    });

    it("arranca desde contenido no interactivo (evento delegado al panel)", () => {
      const alCerrar = vi.fn();
      const { container } = montar({ alCerrar });
      const contenido = container.querySelector('[data-contenido="true"]');

      deslizar(contenido, { hastaY: 200 });

      expect(alCerrar).toHaveBeenCalledTimes(1);
    });
  });

  describe("exclusiones", () => {
    it.each(["button", "a", "input", "textarea", "label", '[role="button"]'])(
      "no arranca si el gesto empieza sobre %s",
      (selector) => {
        const alCerrar = vi.fn();
        const { container } = montar({ alCerrar });
        const control = container.querySelector(selector);

        deslizar(control, { hastaY: 200 });

        expect(alCerrar).not.toHaveBeenCalled();
      }
    );

    it("no arranca si el panel ya tiene scroll interno desplazado (scrollTop > 0)", () => {
      const alCerrar = vi.fn();
      const { container } = montar({ alCerrar });
      const panel = panelDe(container);
      Object.defineProperty(panel, "scrollTop", { value: 40, writable: true, configurable: true });

      deslizar(panel, { hastaY: 200 });

      expect(alCerrar).not.toHaveBeenCalled();
    });

    it("ignora los punteros no primarios", () => {
      const alCerrar = vi.fn();
      const { container } = montar({ alCerrar });

      deslizar(panelDe(container), { hastaY: 200, isPrimary: false });

      expect(alCerrar).not.toHaveBeenCalled();
    });
  });

  describe("sin animación y limpieza", () => {
    it("no aplica transform ni transición al panel durante el gesto", () => {
      const { container } = montar({ alCerrar: () => {} });
      const panel = panelDe(container);

      deslizar(panel, { hastaY: 200 });

      expect(panel.style.transform).toBe("");
      expect(panel.style.transition).toBe("");
    });

    it("retira sus cuatro listeners al desmontar", () => {
      const { container, unmount } = montar();
      expect(panelDe(container)).toBeDefined();

      unmount();

      expect(retirados.slice().sort()).toEqual([
        "pointercancel",
        "pointerdown",
        "pointermove",
        "pointerup",
      ]);
    });

    it("retira sus listeners y deja de cerrar al desactivarse", () => {
      const alCerrar = vi.fn();
      const { container, rerender } = montar({ alCerrar });
      const panel = panelDe(container);

      rerender(createElement(SondaPanel, { activo: false, alCerrar }));

      expect(retirados.slice().sort()).toEqual([
        "pointercancel",
        "pointerdown",
        "pointermove",
        "pointerup",
      ]);
      deslizar(panel, { hastaY: 200 });
      expect(alCerrar).not.toHaveBeenCalled();
    });
  });
});
