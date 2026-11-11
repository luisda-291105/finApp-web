import { beforeEach, describe, expect, it, vi } from "vitest";

const gmailMocks = vi.hoisted(() => ({
  listarCuentasGmail: vi.fn(),
  obtenerCorreosGmail: vi.fn(),
  listarMovimientos: vi.fn(),
}));

vi.mock("../../../services/gmailServicio", () => gmailMocks);
vi.mock("../../../features/contabilidad/services/movimientosService", () => ({
  listarMovimientos: gmailMocks.listarMovimientos,
}));

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
    gmailMocks.listarMovimientos.mockReset().mockResolvedValue([{ monto: 250, fecha: "2026-11-08", tipo: "INGRESO" }]);
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

  it("consulta por separado todas las cuentas seleccionadas", async () => {
    const datos = await obtenerDatosMuestra("correo", "usuario-prueba", "todos", "todas", [], ["cuenta-1", "cuenta-2"]);

    expect(gmailMocks.obtenerCorreosGmail).toHaveBeenCalledTimes(2);
    expect(gmailMocks.obtenerCorreosGmail).toHaveBeenCalledWith("cuenta-1", []);
    expect(gmailMocks.obtenerCorreosGmail).toHaveBeenCalledWith("cuenta-2", []);
    expect(datos.valor).toBe(3);
    expect(datos.cuentaCorreoEtiqueta).toBe("personal@example.test, trabajo@example.test");
    expect(datos.serie).toEqual(expect.arrayContaining([
      expect.objectContaining({ etiqueta: "personal@example.test", valor: 2 }),
      expect.objectContaining({ etiqueta: "trabajo@example.test", valor: 1 }),
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

  it("devuelve datos por separado cuando se seleccionan fuentes con unidades distintas", async () => {
    const datos = await obtenerDatosMuestra(
      "contabilidad",
      "usuario-prueba",
      "todos",
      "cuenta-1",
      ["contabilidad", "correo"],
    );

    expect(datos.fuentesDatos).toHaveLength(2);
    expect(datos.fuentesDatos.map(({ fuente }) => fuente)).toEqual(["contabilidad", "correo"]);
    expect(datos.fuentesDatos.find(({ fuente }) => fuente === "contabilidad")).toMatchObject({
      valor: 250,
      unidad: "moneda",
    });
    expect(datos.fuentesDatos.find(({ fuente }) => fuente === "correo")).toMatchObject({
      valor: 2,
      unidad: "cantidad",
      cuentaCorreoEtiqueta: "personal@example.test",
    });
  });
});
