import { beforeEach, describe, expect, it, vi } from "vitest";

const gmailMocks = vi.hoisted(() => ({
  listarCuentasGmail: vi.fn(),
  obtenerCorreosGmail: vi.fn(),
}));

vi.mock("../../../services/gmailServicio", () => gmailMocks);

import { obtenerDatosMuestra } from "../../../features/inicio/services/datosMuestrasService";

describe("datosMuestrasService correo", () => {
  beforeEach(() => {
    gmailMocks.listarCuentasGmail.mockReset().mockResolvedValue([
      { id: "cuenta-1", email: "personal@example.test" },
      { id: "cuenta-2", email: "trabajo@example.test" },
    ]);
    gmailMocks.obtenerCorreosGmail.mockReset().mockImplementation(async (id) => (
      id === "cuenta-1" ? [{ fecha: "2026-11-08" }, { fecha: "2026-11-07" }] : [{ fecha: "2026-11-06" }]
    ));
  });

  it("consulta solo la cuenta elegida", async () => {
    const datos = await obtenerDatosMuestra("correo", "usuario-prueba", "todos", "cuenta-1");

    expect(gmailMocks.obtenerCorreosGmail).toHaveBeenCalledTimes(1);
    expect(gmailMocks.obtenerCorreosGmail).toHaveBeenCalledWith("cuenta-1", []);
    expect(datos.valor).toBe(2);
    expect(datos.cuentaCorreoEtiqueta).toBe("personal@example.test");
    expect(datos.detalles).toEqual(expect.arrayContaining([
      { etiqueta: "Cuentas incluidas", valor: "1" },
    ]));
  });

  it("consulta todas las cuentas cuando se elige todos", async () => {
    const datos = await obtenerDatosMuestra("correo", "usuario-prueba", "todos", "todas");

    expect(gmailMocks.obtenerCorreosGmail).toHaveBeenCalledTimes(2);
    expect(datos.valor).toBe(3);
    expect(datos.cuentaCorreoEtiqueta).toBe("Todas las cuentas");
    expect(datos.detalles).toEqual(expect.arrayContaining([
      { etiqueta: "Cuentas incluidas", valor: "2" },
    ]));
  });

  it("reporta si la cuenta guardada dejó de estar disponible", async () => {
    await expect(obtenerDatosMuestra("correo", "usuario-prueba", "todos", "eliminada"))
      .rejects.toThrow("La cuenta de correo seleccionada ya no está disponible.");
    expect(gmailMocks.obtenerCorreosGmail).not.toHaveBeenCalled();
  });
});
