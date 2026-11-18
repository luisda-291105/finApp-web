import { beforeEach, describe, expect, it, vi } from "vitest";

const movimientosMocks = vi.hoisted(() => ({
  listarMovimientos: vi.fn(),
  actualizarMovimiento: vi.fn(),
}));

vi.mock(
  "../../../../features/contabilidad/services/movimientosService",
  () => movimientosMocks,
);

import {
  sincronizarOrigenesMovimientosGmail,
} from "../../../../features/suscripciones/services/suscripcionesServicio";

const SUSCRIPCIONES = [
  {
    idSuscripcion: "sub-1",
    cuentaGmailId: "cta-1",
    correoRemitente: "alertasynotificaciones@ayn.notificacionesbancolombia.com",
    apodo: "bamcolombia",
    nombre: "Alertas y Notificaciones",
  },
];

const MOVIMIENTOS = [
  {
    idMovimiento: "mov-1",
    origenTipo: "GMAIL",
    origenId: "cta-1:mensaje-abc",
    origenNombre: "alertasynotificaciones@ayn.notificacionesbancolombia.com",
    concepto: "Cobro mensual",
    categoria: "Suscripciones",
  },
  {
    idMovimiento: "mov-2",
    origenTipo: "GMAIL",
    origenId: "cta-1:mensaje-xyz",
    origenNombre: "bamcolombia",
    concepto: "Ya actualizado",
    categoria: "Suscripciones",
  },
  {
    idMovimiento: "mov-3",
    origenTipo: "MANUAL",
    origenNombre: "Otro",
    concepto: "Manual",
    categoria: "Otros",
  },
];

function mockFetch(respuesta) {
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => respuesta,
  });
}

describe("sincronizarOrigenesMovimientosGmail", () => {
  beforeEach(() => {
    Object.values(movimientosMocks).forEach((mock) => mock.mockReset());
    vi.restoreAllMocks();
  });

  it("actualiza el origen de los movimientos GMAIL con el apodo de la suscripción", async () => {
    mockFetch({ suscripciones: SUSCRIPCIONES });
    movimientosMocks.listarMovimientos.mockResolvedValue(MOVIMIENTOS);
    movimientosMocks.actualizarMovimiento.mockResolvedValue({});

    const resultado = await sincronizarOrigenesMovimientosGmail();

    expect(resultado).toMatchObject({
      total: 2,
      actualizados: 1,
      errores: 0,
    });
    expect(movimientosMocks.actualizarMovimiento).toHaveBeenCalledTimes(1);
    expect(movimientosMocks.actualizarMovimiento).toHaveBeenCalledWith(
      "mov-1",
      expect.objectContaining({ origenNombre: "bamcolombia" }),
    );
  });

  it("no falla cuando no hay suscripciones ni movimientos", async () => {
    mockFetch({ suscripciones: [] });
    movimientosMocks.listarMovimientos.mockResolvedValue([]);

    const resultado = await sincronizarOrigenesMovimientosGmail();

    expect(resultado).toEqual({
      total: 0,
      actualizados: 0,
      errores: 0,
      detalles: [],
    });
    expect(movimientosMocks.actualizarMovimiento).not.toHaveBeenCalled();
  });

  it("cuenta errores cuando una actualización falla", async () => {
    mockFetch({ suscripciones: SUSCRIPCIONES });
    movimientosMocks.listarMovimientos.mockResolvedValue([MOVIMIENTOS[0]]);
    movimientosMocks.actualizarMovimiento.mockRejectedValue(
      new Error("falló"),
    );

    const resultado = await sincronizarOrigenesMovimientosGmail();

    expect(resultado).toMatchObject({
      total: 1,
      actualizados: 0,
      errores: 1,
    });
  });
});
