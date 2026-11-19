import { renderHook, act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import useMinimizadoPersistente from "../../hooks/useMinimizadoPersistente";

// vitest.setup.js reemplaza localStorage por vi.fn(): se le da comportamiento real por prueba.
const almacen = new Map();
const resetLocalStorageMock = () => {
  almacen.clear();
  window.localStorage.getItem.mockImplementation((clave) =>
    almacen.has(clave) ? almacen.get(clave) : null,
  );
  window.localStorage.setItem.mockImplementation((clave, valor) => {
    almacen.set(clave, String(valor));
  });
  window.localStorage.clear.mockImplementation(() => almacen.clear());
};

beforeEach(() => {
  resetLocalStorageMock();
});

describe("useMinimizadoPersistente", () => {
  it("arranca expandido por defecto si no hay valor guardado", () => {
    const { result } = renderHook(() =>
      useMinimizadoPersistente("pruebaA", false),
    );
    expect(result.current[0]).toBe(false);
  });

  it("persiste «true» al minimizar y lo recuerda al remontar", () => {
    const { result, unmount } = renderHook(() =>
      useMinimizadoPersistente("pruebaB", false),
    );
    act(() => {
      result.current[1]();
    });
    expect(result.current[0]).toBe(true);
    expect(localStorage.getItem("finapp.config.pruebaB")).toBe("true");
    unmount();
    const remontado = renderHook(() =>
      useMinimizadoPersistente("pruebaB", false),
    );
    expect(remontado.result.current[0]).toBe(true);
  });

  it("respeta los prefijos por clave: cada título guarda su estado aparte", () => {
    const a = renderHook(() => useMinimizadoPersistente("claveUno", false));
    const b = renderHook(() => useMinimizadoPersistente("claveDos", false));
    act(() => {
      a.result.current[1]();
    });
    expect(a.result.current[0]).toBe(true);
    expect(b.result.current[0]).toBe(false);
    expect(localStorage.getItem("finapp.config.claveUno")).toBe("true");
    expect(localStorage.getItem("finapp.config.claveDos")).toBeNull();
  });

  it("tolera valores corruptos en localStorage y usa el valor inicial", () => {
    localStorage.setItem("finapp.config.pruebaC", "wat");
    const { result } = renderHook(() =>
      useMinimizadoPersistente("pruebaC", false),
    );
    expect(result.current[0]).toBe(false);
    localStorage.setItem("finapp.config.pruebaC", "true");
    const segunda = renderHook(() =>
      useMinimizadoPersistente("pruebaC", false),
    );
    expect(segunda.result.current[0]).toBe(true);
  });
});
