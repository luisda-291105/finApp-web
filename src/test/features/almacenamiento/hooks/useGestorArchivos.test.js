import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  listarArchivos: vi.fn(),
  crearCarpeta: vi.fn(),
  subirArchivo: vi.fn(),
  renombrar: vi.fn(),
  mover: vi.fn(),
  copiar: vi.fn(),
  enviarAPapelera: vi.fn(),
  restaurar: vi.fn(),
  vaciarPapelera: vi.fn(),
  descargarArchivo: vi.fn(),
  urlContenido: vi.fn(() => "http://contenido"),
  urlPrevisualizacion: vi.fn(() => "http://prev"),
}));

vi.mock(
  "../../../../features/almacenamiento/services/almacenamientoServicio",
  () => mocks,
);

import { useGestorArchivos } from "../../../../features/almacenamiento/hooks/useGestorArchivos";

describe("useGestorArchivos", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.listarArchivos.mockImplementation(async (_cuentaId, params = {}) => {
      if (params.vista === "papelera")
        return {
          items: [
            {
              id: "arch-p",
              nombre: "borrado.pdf",
              tipo: "archivo",
              eliminado: true,
            },
          ],
        };
      if (params.carpetaId === "carp-1")
        return {
          items: [{ id: "arch-2", nombre: "interno.txt", tipo: "archivo" }],
          ruta: [
            { id: "root", nombre: "Mi unidad" },
            { id: "carp-1", nombre: "Carpeta 1" },
          ],
        };
      return {
        items: [
          { id: "carp-1", nombre: "Carpeta 1", tipo: "carpeta" },
          { id: "arch-1", nombre: "factura.pdf", tipo: "archivo" },
        ],
        ruta: [{ id: "root", nombre: "Mi unidad" }],
      };
    });
  });

  it("carga la vista unidad de la cuenta activa", async () => {
    const { result } = renderHook(() =>
      useGestorArchivos({ cuentaId: "cuenta-1" }),
    );

    await waitFor(() => expect(result.current.cargando).toBe(false));
    expect(mocks.listarArchivos).toHaveBeenCalled();
    expect(result.current.vista).toBe("unidad");
    expect(result.current.itemsVisibles.map((i) => i.nombre)).toEqual(
      expect.arrayContaining(["Carpeta 1", "factura.pdf"]),
    );
  });

  it("navega a una carpeta y actualiza la ruta", async () => {
    const { result } = renderHook(() =>
      useGestorArchivos({ cuentaId: "cuenta-1" }),
    );
    await waitFor(() => expect(result.current.cargando).toBe(false));

    await act(async () => {
      result.current.abrirCarpeta("carp-1");
    });
    await waitFor(() => expect(result.current.carpetaId).toBe("carp-1"));

    expect(result.current.ruta.map((n) => n.nombre)).toContain("Carpeta 1");
  });

  it("permite selección simple y múltiple", async () => {
    const { result } = renderHook(() =>
      useGestorArchivos({ cuentaId: "cuenta-1" }),
    );
    await waitFor(() => expect(result.current.cargando).toBe(false));

    act(() => result.current.seleccionarId("arch-1", {}));
    expect(result.current.seleccionIds).toEqual(["arch-1"]);

    act(() => result.current.seleccionarId("carp-1", { ctrlKey: true }));
    expect(result.current.seleccionIds.sort()).toEqual(
      ["arch-1", "carp-1"].sort(),
    );
  });

  it("cambia de vista y consulta el estado correspondiente", async () => {
    const { result } = renderHook(() =>
      useGestorArchivos({ cuentaId: "cuenta-1" }),
    );
    await waitFor(() => expect(result.current.cargando).toBe(false));

    await act(async () => {
      result.current.seleccionarVista("papelera");
    });
    await waitFor(() => expect(result.current.vista).toBe("papelera"));
    expect(mocks.listarArchivos).toHaveBeenCalledWith(
      "cuenta-1",
      expect.objectContaining({ vista: "papelera" }),
    );
  });
});
