import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  confirmarNotificacionesMovimientosGmail,
  listarNotificacionesMovimientosGmail,
  obtenerContactosGoogle,
  obtenerCorreosGmail,
  verificarPermisoContactosGoogle,
} from "../../services/gmailServicio";

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("gmailServicio", () => {
  it("consulta mensajes en el backend sin enviar tokens de Google", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => [{
        id: "mensaje-1", remitente: "Tienda <tienda@ejemplo.test>", destinatario: "compras@ejemplo.test",
        asunto: "Factura", fecha: "2026-11-08", fragmento: "Pago", etiquetas: ["IMPORTANT"], nombresEtiquetas: ["Important"],
      }],
    });

    const mensajes = await obtenerCorreosGmail("cuenta/uno", [
      { idFuente: "fuente-1", contenido: "compras@ejemplo.test" },
      { idFuente: "gmail-cuenta/uno", contenido: "cuenta@ejemplo.test" },
    ]);

    const [url, opciones] = fetchMock.mock.calls[0];
    expect(url).toContain("/api/gmail/cuentas/cuenta%2Funo/mensajes");
    expect(opciones.credentials).toBe("include");
    expect(opciones.headers.Authorization).toBeUndefined();
    expect(JSON.parse(opciones.body)).toEqual({ fuentes_ids: ["fuente-1"] });
    expect(mensajes[0].esImportante).toBe(true);
  });

  it("consulta Google Contacts por medio del backend", async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => [{ googleResourceName: "people/1", nombre: "Ana" }] });

    await expect(obtenerContactosGoogle("cuenta-1")).resolves.toEqual([
      { googleResourceName: "people/1", nombre: "Ana" },
    ]);
    expect(fetchMock.mock.calls[0][0]).toContain("/api/gmail/cuentas/cuenta-1/contactos");
  });

  it("consulta y confirma las alertas de movimientos automáticos desde Gmail", async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => [] });

    await listarNotificacionesMovimientosGmail();
    await confirmarNotificacionesMovimientosGmail(["alerta-1"]);

    expect(fetchMock.mock.calls[0][0]).toContain("/api/gmail/movimientos/notificaciones");
    expect(fetchMock.mock.calls[1][1].method).toBe("POST");
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({ ids: ["alerta-1"] });
  });

  it("devuelve el estado del permiso de contactos consultado por el backend", async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ autorizado: false }) });

    await expect(verificarPermisoContactosGoogle("cuenta-1")).resolves.toBe(false);
    expect(fetchMock.mock.calls[0][0]).toContain("/api/gmail/cuentas/cuenta-1/contactos/permiso");
  });

  it("limpia la sesión de la pestaña cuando el backend rechaza una consulta Gmail con 401", async () => {
    const notificarSesion = vi.spyOn(window, "dispatchEvent");
    fetchMock.mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ message: "No hay una sesión activa." }),
    });

    await expect(obtenerCorreosGmail("cuenta-1", [])).rejects.toThrow("No hay una sesión activa.");

    expect(notificarSesion).toHaveBeenCalledWith(
      expect.objectContaining({ type: "finapp:sesion-requerida" }),
    );
    notificarSesion.mockRestore();
  });
});
