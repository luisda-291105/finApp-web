/**
 * @uso        Verifica la coherencia del stub global de `matchMedia` de `vitest.setup.js` (AC-11)
 * @funciones  Sin exports; aserta que `matches` se deriva del `innerWidth` vigente en cada consulta
 * @datos      Lee `window.matchMedia` y `window.innerWidth` del entorno de jsdom (no los reemplaza)
 * @eventos    N/A
 * @estados    N/A
 * @usadoPor   vitest (npm run test)
 */
import { afterEach, describe, expect, it, vi } from "vitest";

const QUERY_PANTALLAS_GRANDES = "(min-width: 768px)";
const QUERY_ANCHO_GRANDE = "(min-width: 1024px)";
const QUERY_SIN_ANCHO = "(prefers-reduced-motion: reduce)";

describe("stub global de matchMedia (vitest.setup.js)", () => {
  const descriptorOriginalInnerWidth = Object.getOwnPropertyDescriptor(window, "innerWidth");

  /** Fija el ancho de viewport simulado, como hacen las suites del inventario. */
  const fijarAncho = (ancho) => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: ancho,
    });
  };

  afterEach(() => {
    if (descriptorOriginalInnerWidth) {
      Object.defineProperty(window, "innerWidth", descriptorOriginalInnerWidth);
    }
  });

  it("con el ancho por defecto (1024) mide pantallas grandes en las dos queries de ancho", () => {
    expect(window.innerWidth).toBe(1024);

    expect(window.matchMedia(QUERY_PANTALLAS_GRANDES).matches).toBe(true);
    expect(window.matchMedia(QUERY_ANCHO_GRANDE).matches).toBe(true);
  });

  it("deja en false las consultas que no son de ancho", () => {
    expect(window.matchMedia(QUERY_SIN_ANCHO).matches).toBe(false);
  });

  it("deriva matches del innerWidth vigente en el momento de la consulta", () => {
    fijarAncho(375);
    expect(window.matchMedia(QUERY_PANTALLAS_GRANDES).matches).toBe(false);
    expect(window.matchMedia(QUERY_ANCHO_GRANDE).matches).toBe(false);

    fijarAncho(800);
    expect(window.matchMedia(QUERY_PANTALLAS_GRANDES).matches).toBe(true);
    expect(window.matchMedia(QUERY_ANCHO_GRANDE).matches).toBe(false);
  });

  it("sigue siendo reemplazable por una suite y se restituye al stub global", () => {
    const stubGlobal = window.matchMedia;
    const sustituto = vi.fn(() => ({ matches: false, media: "", onchange: null }));

    window.matchMedia = sustituto;
    expect(window.matchMedia(QUERY_PANTALLAS_GRANDES).matches).toBe(false);
    expect(sustituto).toHaveBeenCalledWith(QUERY_PANTALLAS_GRANDES);

    window.matchMedia = stubGlobal;
    expect(window.matchMedia(QUERY_PANTALLAS_GRANDES).matches).toBe(true);
  });
});
