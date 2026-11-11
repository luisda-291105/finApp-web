import { describe, expect, it } from "vitest";
import { clasificarMovimientoCorreo, extraerMovimientoSugerido } from "../../../../features/correos/utils/correoFinancieroHelpers";

describe("correoFinancieroHelpers", () => {
  it("clasifica una nómina recibida como ingreso, no como ahorro", () => {
    const correo = {
      id: "nomina-15-oct",
      asunto: "Alertas y Notificaciones",
      remitente: "alertasynotificaciones@ayn.notificacionesbancolombia.com",
      fragmento: "¡Listo! Todo salió bien. Bancolombia: Recibiste un pago de Nómina de $964.797,00.",
      fecha: "2026-10-15T06:20:00-05:00",
    };

    expect(clasificarMovimientoCorreo(correo)).toEqual({ categoria: "Nómina", tipo: "INGRESO" });
    expect(extraerMovimientoSugerido(correo)).toMatchObject({ tipo: "INGRESO", monto: 964797 });
  });

  it("reconoce Retiraste como gasto y extrae el monto colombiano", () => {
    const correo = {
      id: "retiro-9-oct",
      asunto: "Alertas y Notificaciones",
      remitente: "alertasynotificaciones@ayn.notificacionesbancolombia.com",
      fragmento: "¡Listo! Todo salió bien con tus movimientos. Bancolombia: Retiraste $300.000,00 en TESOROLAB1 de tu T.Déb **9389 el 09/10/2026.",
      fecha: "2026-10-09T10:04:00-05:00",
    };

    expect(clasificarMovimientoCorreo(correo)).toEqual({ categoria: "Retiros", tipo: "GASTO" });
    expect(extraerMovimientoSugerido(correo)).toMatchObject({ tipo: "GASTO", monto: 300000 });
  });
});
