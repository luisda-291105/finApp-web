import { afterEach, describe, expect, it, vi } from "vitest";
import { API_BASE_URL } from "../../../../config/api.config";
import { obtener } from "../../../../services/httpServicio";
import { obtenerArchivos } from "../../../../features/almacenamiento/services/almacenamientoServicio";

vi.mock("../../../../services/httpServicio", () => ({
  crear: vi.fn(),
  obtener: vi.fn(),
  actualizar: vi.fn(),
  eliminar: vi.fn(),
}));

afterEach(() => vi.clearAllMocks());

describe("almacenamientoService.obtenerArchivos", () => {
  it("consulta la lista de archivos de una cuenta de almacenamiento conectada", async () => {
    obtener.mockResolvedValue([{ id: "arch-1", nombre: "factura-2026-03.pdf", tipo: "archivo" }]);

    await expect(obtenerArchivos("cuenta-1")).resolves.toEqual([
      { id: "arch-1", nombre: "factura-2026-03.pdf", tipo: "archivo" },
    ]);

    expect(obtener).toHaveBeenCalledWith(`${API_BASE_URL}/api/almacenamiento/conexiones/cuenta-1/archivos`);
  });
});
