/**
 * @uso        Pruebas unitarias del hook useCierreConEsc (spec 010, tarea 3)
 * @funciones  registro/limpieza de capas, un solo listener global, capa superior por zIndex y por orden,
 *             una sola llamada por pulsación, activo=false, idempotencia con StrictMode
 * @datos      Espías sobre document.addEventListener/removeEventListener
 * @eventos    keydown (Escape) sobre document
 * @estados    N/A
 * @usadoPor   vitest (npm run test)
 */
import { StrictMode } from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useCierreConEsc } from "./useCierreConEsc";

const pulsarEscape = () => document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));

describe("useCierreConEsc", () => {
  let originalAdd;
  let originalRemove;
  let addKeydown;
  let removeKeydown;

  beforeEach(() => {
    addKeydown = 0;
    removeKeydown = 0;
    originalAdd = document.addEventListener;
    originalRemove = document.removeEventListener;
    document.addEventListener = function (tipo, ...resto) {
      if (tipo === "keydown") addKeydown += 1;
      return originalAdd.call(this, tipo, ...resto);
    };
    document.removeEventListener = function (tipo, ...resto) {
      if (tipo === "keydown") removeKeydown += 1;
      return originalRemove.call(this, tipo, ...resto);
    };
  });

  afterEach(() => {
    document.addEventListener = originalAdd;
    document.removeEventListener = originalRemove;
    vi.restoreAllMocks();
  });

  it("cierra la capa activa al pulsar Escape (una sola llamada por pulsación)", () => {
    const alCerrar = vi.fn();
    renderHook(() => useCierreConEsc({ activo: true, zIndex: 50, alCerrar }));

    pulsarEscape();

    expect(alCerrar).toHaveBeenCalledTimes(1);
  });

  it("no cierra con otras teclas", () => {
    const alCerrar = vi.fn();
    renderHook(() => useCierreConEsc({ activo: true, zIndex: 50, alCerrar }));

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));

    expect(alCerrar).not.toHaveBeenCalled();
  });

  it("no cierra y no registra nada cuando activo es falso", () => {
    const alCerrar = vi.fn();
    renderHook(() => useCierreConEsc({ activo: false, zIndex: 50, alCerrar }));

    pulsarEscape();

    expect(alCerrar).not.toHaveBeenCalled();
    expect(addKeydown).toBe(0);
  });

  it("instala un único listener global aunque haya varias capas", () => {
    renderHook(() => useCierreConEsc({ activo: true, zIndex: 50, alCerrar: vi.fn() }));
    renderHook(() => useCierreConEsc({ activo: true, zIndex: 60, alCerrar: vi.fn() }));
    renderHook(() => useCierreConEsc({ activo: true, zIndex: 55, alCerrar: vi.fn() }));

    expect(addKeydown).toBe(1);
  });

  it("cierra solo la capa de mayor zIndex", () => {
    const inferior = vi.fn();
    const superior = vi.fn();
    renderHook(() => useCierreConEsc({ activo: true, zIndex: 50, alCerrar: inferior }));
    renderHook(() => useCierreConEsc({ activo: true, zIndex: 60, alCerrar: superior }));

    pulsarEscape();

    expect(superior).toHaveBeenCalledTimes(1);
    expect(inferior).not.toHaveBeenCalled();
  });

  it("en empate de zIndex cierra la capa montada más tarde", () => {
    const primera = vi.fn();
    const segunda = vi.fn();
    renderHook(() => useCierreConEsc({ activo: true, zIndex: 50, alCerrar: primera }));
    renderHook(() => useCierreConEsc({ activo: true, zIndex: 50, alCerrar: segunda }));

    pulsarEscape();

    expect(segunda).toHaveBeenCalledTimes(1);
    expect(primera).not.toHaveBeenCalled();
  });

  it("tras desmontar la capa superior, la siguiente pasa a ser la superior", () => {
    const inferior = vi.fn();
    const superior = vi.fn();
    renderHook(() => useCierreConEsc({ activo: true, zIndex: 50, alCerrar: inferior }));
    const capaSuperior = renderHook(() => useCierreConEsc({ activo: true, zIndex: 60, alCerrar: superior }));

    capaSuperior.unmount();
    pulsarEscape();

    expect(superior).not.toHaveBeenCalled();
    expect(inferior).toHaveBeenCalledTimes(1);
  });

  it("retira el listener global al desmontar la última capa", () => {
    const alCerrar = vi.fn();
    const { unmount } = renderHook(() => useCierreConEsc({ activo: true, zIndex: 50, alCerrar }));

    unmount();

    expect(removeKeydown).toBe(1);
    pulsarEscape();
    expect(alCerrar).not.toHaveBeenCalled();
  });

  it("no retira el listener global mientras queden capas registradas", () => {
    const primera = vi.fn();
    const segunda = vi.fn();
    const capaUno = renderHook(() => useCierreConEsc({ activo: true, zIndex: 50, alCerrar: primera }));
    renderHook(() => useCierreConEsc({ activo: true, zIndex: 60, alCerrar: segunda }));

    capaUno.unmount();
    pulsarEscape();

    expect(removeKeydown).toBe(0);
    expect(segunda).toHaveBeenCalledTimes(1);
  });

  it("con doble montaje de efectos (StrictMode) sigue cerrando una sola vez por pulsación", () => {
    const alCerrar = vi.fn();
    renderHook(() => useCierreConEsc({ activo: true, zIndex: 50, alCerrar }), {
      wrapper: StrictMode,
    });

    pulsarEscape();

    expect(alCerrar).toHaveBeenCalledTimes(1);
  });
});
