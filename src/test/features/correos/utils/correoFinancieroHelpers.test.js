import { describe, expect, it } from "vitest";
import {
  clasificarMovimientoCorreo,
  extraerMovimientoSugerido,
} from "../../../../features/correos/utils/correoFinancieroHelpers";

describe("correoFinancieroHelpers", () => {
  it("clasifica una nómina recibida como ingreso, no como ahorro", () => {
    const correo = {
      id: "nomina-15-oct",
      asunto: "Alertas y Notificaciones",
      remitente: "alertasynotificaciones@ayn.notificacionesbancolombia.com",
      fragmento:
        "¡Listo! Todo salió bien. Bancolombia: Recibiste un pago de Nómina de $964.797,00.",
      fecha: "2026-10-15T06:20:00-05:00",
    };

    expect(clasificarMovimientoCorreo(correo)).toEqual({
      categoria: "Nómina",
      tipo: "INGRESO",
    });
    expect(extraerMovimientoSugerido(correo)).toMatchObject({
      tipo: "INGRESO",
      monto: 964797,
    });
  });

  it("reconoce Retiraste como gasto y extrae el monto colombiano", () => {
    const correo = {
      id: "retiro-9-oct",
      asunto: "Alertas y Notificaciones",
      remitente: "alertasynotificaciones@ayn.notificacionesbancolombia.com",
      fragmento:
        "¡Listo! Todo salió bien con tus movimientos. Bancolombia: Retiraste $300.000,00 en TESOROLAB1 de tu T.Déb **9389 el 09/10/2026.",
      fecha: "2026-10-09T10:04:00-05:00",
    };

    expect(clasificarMovimientoCorreo(correo)).toEqual({
      categoria: "Retiros",
      tipo: "GASTO",
    });
    expect(extraerMovimientoSugerido(correo)).toMatchObject({
      tipo: "GASTO",
      monto: 300000,
    });
  });

  it("extrae los parámetros de la notificación bancolombiana de una transferencia", () => {
    const correo = {
      id: "transfer-16-nov",
      asunto: "Alertas y Notificaciones",
      remitente: "alertasynotificaciones@ayn.notificacionesbancolombia.com",
      fragmento:
        "Bancolombia: Transferiste $1.000.000,00 de tu cuenta origen *5201 hacia la cuenta destino *25310487123 el 16/11/2026. Hora: 16:03.",
      contenido: "Encabezado: Alertas y Notificaciones",
      fecha: "2026-11-16T16:03:00-05:00",
    };

    expect(clasificarMovimientoCorreo(correo)).toEqual({
      categoria: "Transferencia",
      tipo: "GASTO",
    });
    expect(extraerMovimientoSugerido(correo)).toMatchObject({
      tipo: "GASTO",
      banco: "Bancolombia",
      operacion: "Transferiste",
      monto: 1000000,
      cuentaOrigen: "5201",
      cuentaDestino: "25310487123",
      encabezado: "Alertas y Notificaciones",
    });
    expect(extraerMovimientoSugerido(correo)).toMatchObject({ hora: "16:03" });
  });
});
