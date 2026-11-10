import { beforeEach, describe, expect, it, vi } from "vitest";

const httpMocks = vi.hoisted(() => ({
  crear: vi.fn(),
  obtener: vi.fn(),
  actualizar: vi.fn(),
  eliminar: vi.fn(),
}));

vi.mock("../../../services/httpServicio", () => httpMocks);

import { actualizarOrdenMuestras, crearMuestra, listarMuestras } from "../../../features/inicio/services/muestrasService";

describe("muestrasService sample settings", () => {
  beforeEach(() => {
    Object.values(httpMocks).forEach((mock) => mock.mockReset());
  });

  it("persists the selected Gmail account and source list in the DTO data", async () => {
    httpMocks.crear.mockResolvedValue({
      datos: {
        id: "muestra-1",
        titulo: "Correo personal",
        tipo: "TARJETA",
        datos: JSON.stringify({ fuente: "correo", cuentaCorreo: "cuenta-1", cuentasCorreo: ["cuenta-1"], fuentes: ["correo"], columnasDashboard: 1 }),
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
      datos: JSON.stringify({ fuente: "correo", segmentoContable: null, cuentaCorreo: "cuenta-1", cuentasCorreo: ["cuenta-1"], fuentes: ["correo"], columnasDashboard: 1 }),
    });
  });

  it("restores the selected Gmail account when loading a saved sample", async () => {
    httpMocks.obtener.mockResolvedValue({
      datos: [{
        id: "muestra-1",
        titulo: "Correo personal",
        tipo: "TARJETA",
        datos: { fuente: "correo", cuentaCorreo: "cuenta-1", cuentasCorreo: ["cuenta-1"], fuentes: ["correo"], columnasDashboard: 2 },
      }],
    });

    await expect(listarMuestras()).resolves.toEqual([
      expect.objectContaining({ cuentaCorreo: "cuenta-1", cuentasCorreo: ["cuenta-1"], fuentes: ["correo"], columnasDashboard: 2 }),
    ]);
  });

  it("persists multiple selected sources regardless of visualization type", async () => {
    httpMocks.crear.mockResolvedValue({
      datos: {
        id: "muestra-2",
        titulo: "Fuentes combinadas",
        tipo: "GRAFICA",
        datos: JSON.stringify({ fuente: "contabilidad", fuentes: ["contabilidad", "contactos"] }),
      },
    });

    await crearMuestra({
      titulo: "Fuentes combinadas",
      tipo: "grafica",
      fuente: "contabilidad",
      segmentoContable: "todos",
      fuentes: ["contabilidad", "contactos"],
    });

    expect(httpMocks.crear).toHaveBeenCalledWith("/api/muestras", {
      tipo: "GRAFICA",
      titulo: "Fuentes combinadas",
      datos: JSON.stringify({
        fuente: "contabilidad",
        segmentoContable: "todos",
        cuentaCorreo: null,
        cuentasCorreo: null,
        fuentes: ["contabilidad", "contactos"],
        columnasDashboard: 1,
      }),
    });
  });

  it("persists more than one selected email account", async () => {
    httpMocks.crear.mockResolvedValue({
      datos: {
        id: "muestra-3",
        titulo: "Correos personales y de trabajo",
        tipo: "TARJETA",
        datos: JSON.stringify({ fuente: "correo", cuentaCorreo: "todas", cuentasCorreo: ["cuenta-1", "cuenta-2"], fuentes: ["correo"], columnasDashboard: 1 }),
      },
    });

    const muestra = await crearMuestra({
      titulo: "Correos personales y de trabajo",
      tipo: "tarjeta",
      fuente: "correo",
      cuentaCorreo: "todas",
      cuentasCorreo: ["cuenta-1", "cuenta-2"],
    });

    expect(httpMocks.crear).toHaveBeenCalledWith("/api/muestras", {
      tipo: "TARJETA",
      titulo: "Correos personales y de trabajo",
      datos: JSON.stringify({
        fuente: "correo",
        segmentoContable: null,
        cuentaCorreo: "todas",
        cuentasCorreo: ["cuenta-1", "cuenta-2"],
        fuentes: ["correo"],
        columnasDashboard: 1,
      }),
    });
    expect(muestra.cuentasCorreo).toEqual(["cuenta-1", "cuenta-2"]);
  });

  it("persists the selected dashboard width and restores it from the DTO", async () => {
    httpMocks.crear.mockResolvedValue({
      datos: {
        id: "muestra-4",
        titulo: "Fuentes anchas",
        tipo: "TARJETA",
        datos: JSON.stringify({ fuente: "contabilidad", fuentes: ["contabilidad", "contactos"], columnasDashboard: 2 }),
      },
    });

    const muestra = await crearMuestra({
      titulo: "Fuentes anchas",
      tipo: "tarjeta",
      fuente: "contabilidad",
      fuentes: ["contabilidad", "contactos"],
      columnasDashboard: "2",
    });

    expect(httpMocks.crear).toHaveBeenCalledWith("/api/muestras", {
      tipo: "TARJETA",
      titulo: "Fuentes anchas",
      datos: JSON.stringify({
        fuente: "contabilidad",
        segmentoContable: "todos",
        cuentaCorreo: null,
        cuentasCorreo: null,
        fuentes: ["contabilidad", "contactos"],
        columnasDashboard: 2,
      }),
    });
    expect(muestra.columnasDashboard).toBe(2);
  });

  it("saves the order of dashboard samples", async () => {
    await actualizarOrdenMuestras([3, 1, 2]);

    expect(httpMocks.actualizar).toHaveBeenCalledWith("/api/muestras/orden", { ids: [3, 1, 2] });
  });

  it("restores the saved position for a dashboard sample", async () => {
    httpMocks.obtener.mockResolvedValue({
      datos: [{
        id: "muestra-ordenada",
        titulo: "Muestra ordenada",
        tipo: "TARJETA",
        datos: JSON.stringify({ fuente: "contactos", ordenDashboard: 4 }),
      }],
    });

    await expect(listarMuestras()).resolves.toEqual([
      expect.objectContaining({ ordenDashboard: 4 }),
    ]);
  });
});
