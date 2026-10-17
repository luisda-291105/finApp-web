/**
 * @uso        Configuración global de las pruebas (setupFiles de vitest.config.js): stubs de las
 *             APIs de navegador que jsdom no implementa y que las suites necesitan
 * @funciones  Sin exports; aplica los stubs al importarse el archivo
 * @datos      matchMedia, innerWidth, localStorage y geometría mínima (ver "Stub de geometría")
 * @eventos    Ninguno
 * @estados    Ninguno
 * @usadoPor   Todas las suites de Vitest (setupFiles de vitest.config.js)
 */
import { expect } from "vitest";
import "@testing-library/jest-dom";

// Mock window.matchMedia for jsdom (used by useBreakpoint hook)
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock window.innerWidth for breakpoint tests
Object.defineProperty(window, "innerWidth", {
  writable: true,
  configurable: true,
  value: 1024,
});

// Mock localStorage for jsdom (used by useBreakpoint hook)
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, "localStorage", {
  writable: true,
  value: localStorageMock,
});

// ─────────────────────────────────────────────────────────────────────────────────────────────
// Stub de geometría para poder ejercer la TRAMPA DE FOCO REAL en jsdom (spec 010, T2; RF-18, D1)
// ─────────────────────────────────────────────────────────────────────────────────────────────
// QUÉ: `getBoundingClientRect()` y `getClientRects()` devuelven un rectángulo 1×1 no vacío
//      cuando el elemento está conectado al documento (`isConnected`) y jsdom no aporta
//      geometría (rect vacío). Los nodos desconectados conservan el comportamiento original.
//
// POR QUÉ: jsdom no calcula layout, así que `getClientRects()` devuelve siempre una lista vacía.
//      `tabbable` decide la visibilidad de un nodo con `displayCheck: 'full'` (su valor por
//      defecto) consultando `node.getClientRects().length` (tabbable/dist/index.js:421); sin
//      rectángulos concluye que no hay nodos tabulables y `focus-trap` lanza al activarse
//      "Your focus-trap must have at least one container with at least one tabbable node in it
//      at all times" (focus-trap/index.js:437-438) — o, si no encuentra ningún enfocable,
//      "Your focus-trap needs to have at least one focusable element" (index.js:333-334).
//      Eso es lo que hoy obliga a mockear la librería en las suites de modales.
//
// LO QUE ESTE STUB NO ES: no mockea `focus-trap-react` ni `tabbable` (se ejecutan reales) y no
//      usa `displayCheck` en ninguna parte; solo aporta la geometría que el navegador daría.
const rectConArea = { x: 0, y: 0, top: 0, right: 1, bottom: 1, left: 0, width: 1, height: 1 };

const getBoundingClientRectOriginal = Element.prototype.getBoundingClientRect;
Element.prototype.getBoundingClientRect = function getBoundingClientRect() {
  const rect = getBoundingClientRectOriginal.call(this);
  // Nodos desconectados: se respeta el rect vacío original (tabbable los considera ocultos).
  if (!this.isConnected) return rect;
  // Si jsdom ya aportara geometría (no es el caso hoy), se devuelve tal cual.
  if (rect.width !== 0 || rect.height !== 0) return rect;
  return { ...rectConArea, toJSON: () => rectConArea };
};

const getClientRectsOriginal = Element.prototype.getClientRects;
Element.prototype.getClientRects = function getClientRects() {
  const rects = getClientRectsOriginal.call(this);
  if (!this.isConnected) return rects;
  if (rects.length !== 0) return rects;
  return [rectConArea];
};
