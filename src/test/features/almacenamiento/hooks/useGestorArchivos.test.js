import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useGestorArchivos } from "../../../../features/almacenamiento/hooks/useGestorArchivos";

describe("useGestorArchivos", () => {
  beforeEach(() => {
    // El gestor usa estado demo local sin timers propios en las acciones puras.
  });

  it("arranca en la vista unidad con la carpeta raíz y lista los hijos demo", () => {
    const { result } = renderHook(() => useGestorArchivos());

    expect(result.current.vista).toBe("unidad");
    expect(result.current.carpetaId).toBe("arch-unidad");
    expect(result.current.itemsVisibles.map((item) => item.nombre)).toContain("Finanzas");
    expect(result.current.itemsVisibles.map((item) => item.nombre)).toContain("Personal");
  });

  it("abre una carpeta y construye la miga de pan", () => {
    const { result } = renderHook(() => useGestorArchivos());

    act(() => result.current.abrirCarpeta("arch-facturas"));

    expect(result.current.ruta.map((nivel) => nivel.nombre)).toEqual(["Mi unidad", "Finanzas", "Facturas"]);
  });

  it("filtra los items visibles por búsqueda", () => {
    const { result } = renderHook(() => useGestorArchivos());

    act(() => result.current.abrirCarpeta("arch-facturas"));
    act(() => result.current.setBusqueda("factura"));

    expect(result.current.itemsVisibles.map((item) => item.nombre)).toEqual(["factura-2026-04.pdf", "factura-2026-03.pdf"]);
  });

  it("selecciona un item con clic simple y alterna con Ctrl", () => {
    const { result } = renderHook(() => useGestorArchivos());

    act(() => result.current.seleccionarId("arch-finanzas", undefined));
    expect(result.current.seleccionIds).toEqual(["arch-finanzas"]);

    act(() => result.current.seleccionarId("arch-finanzas", { ctrlKey: true }));
    expect(result.current.seleccionIds).toEqual([]);

    act(() => result.current.seleccionarId("arch-personal", { ctrlKey: true }));
    act(() => result.current.seleccionarId("arch-finanzas", { ctrlKey: true }));
    expect(result.current.seleccionIds).toEqual(["arch-personal", "arch-finanzas"]);
  });

  it("elimina un item moviéndolo a la papelera", () => {
    const { result } = renderHook(() => useGestorArchivos());

    act(() => result.current.eliminarItems(["arch-factura-2026-03"]));
    act(() => result.current.seleccionarVista("papelera"));

    expect(result.current.itemsVisibles.map((item) => item.nombre)).toContain("factura-2026-03.pdf");
  });

  it("copia un item y lo pega en la carpeta destino", () => {
    const { result } = renderHook(() => useGestorArchivos());

    act(() => result.current.copiar(["arch-contrato"]));
    act(() => result.current.abrirCarpeta("arch-facturas"));
    act(() => result.current.pegar());

    expect(result.current.itemsVisibles.map((item) => item.nombre)).toContain("contrato-personal.pdf");
  });

  it("alterna el estado de compartado de un item", () => {
    const { result } = renderHook(() => useGestorArchivos());

    act(() => result.current.compartirItem("arch-contrato"));

    expect(result.current.items.find((item) => item.id === "arch-contrato")?.compartido).toBe(true);
  });
});
