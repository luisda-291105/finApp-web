import { beforeEach, describe, expect, it, vi } from "vitest";

const httpMocks = vi.hoisted(() => ({
  crear: vi.fn(),
  obtener: vi.fn(),
  actualizar: vi.fn(),
  eliminar: vi.fn(),
}));

vi.mock("../../../services/httpServicio", () => httpMocks);

import { crearMuestra, listarMuestras } from "../../../features/inicio/services/muestrasService";

describe("muestrasService account config", () => {
  beforeEach(() => {
    Object.values(httpMocks).forEach((mock) => mock.mockReset());
  });

  it("persists the selected Gmail account in the DTO data", async () => {
    httpMocks.crear.mockResolvedValue({
      datos: {
        id: "muestra-1",
        titulo: "Correo personal",
        tipo: "TARJETA",
        datos: JSON.stringify({ fuente: "correo", cuentaCorreo: "cuenta-1" }),
      },
    });

    await crearMuestra({
      titulo: "Correo personal",
      tipo: "tarjeta",
      fuente: "correo",
      cuentaCorreo: "cuenta-1",
    });

    expect(httpMocks.crear).toHaveBeenCalledWith("/api/muestras", {
      tipo: "TARJETA",
      titulo: "Correo personal",
      datos: JSON.stringify({ fuente: "correo", segmentoContable: null, cuentaCorreo: "cuenta-1" }),
    });
  });

  it("restores the selected Gmail account when loading a saved sample", async () => {
    httpMocks.obtener.mockResolvedValue({
      datos: [{
        id: "muestra-1",
        titulo: "Correo personal",
        tipo: "TARJETA",
        datos: { fuente: "correo", cuentaCorreo: "cuenta-1" },
      }],
    });

    await expect(listarMuestras()).resolves.toEqual([
      expect.objectContaining({ cuentaCorreo: "cuenta-1" }),
    ]);
  });
});
