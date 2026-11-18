import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ALCANCE_GMAIL_MODIFICAR,
  confirmarNotificacionesMovimientosGmail,
  eliminarCuentaGmail,
  iniciarCodigoAutorizacionGmail,
  listarNotificacionesMovimientosGmail,
  listarPapeleraGmail,
  moverMensajeAPapeleraGmail,
  obtenerContactosGoogle,
  obtenerCorreosGmail,
  restaurarMensajeDePapeleraGmail,
  verificarPermisoContactosGoogle,
} from "../../services/gmailServicio";

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
  delete window.google;
});

describe("gmailServicio", () => {
  it("consulta mensajes en el backend sin enviar tokens de Google", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => [
        {
          id: "mensaje-1",
          remitente: "Tienda <tienda@ejemplo.test>",
          destinatario: "compras@ejemplo.test",
          asunto: "Factura",
          fecha: "2026-11-08",
          fragmento: "Pago",
          etiquetas: ["IMPORTANT"],
          nombresEtiquetas: ["Important"],
        },
      ],
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
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => [{ googleResourceName: "people/1", nombre: "Ana" }],
    });

    await expect(obtenerContactosGoogle("cuenta-1")).resolves.toEqual([
      { googleResourceName: "people/1", nombre: "Ana" },
    ]);
    expect(fetchMock.mock.calls[0][0]).toContain(
      "/api/gmail/cuentas/cuenta-1/contactos",
    );
  });

  it("consulta y confirma las alertas de movimientos automáticos desde Gmail", async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => [] });

    await listarNotificacionesMovimientosGmail();
    await confirmarNotificacionesMovimientosGmail(["alerta-1"]);

    expect(fetchMock.mock.calls[0][0]).toContain(
      "/api/gmail/movimientos/notificaciones",
    );
    expect(fetchMock.mock.calls[1][1].method).toBe("POST");
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({
      ids: ["alerta-1"],
    });
  });

  it("devuelve el estado del permiso de contactos consultado por el backend", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ autorizado: false }),
    });

    await expect(verificarPermisoContactosGoogle("cuenta-1")).resolves.toBe(
      false,
    );
    expect(fetchMock.mock.calls[0][0]).toContain(
      "/api/gmail/cuentas/cuenta-1/contactos/permiso",
    );
  });

  it("limpia la sesión de la pestaña cuando el backend rechaza una consulta Gmail con 401", async () => {
    const notificarSesion = vi.spyOn(window, "dispatchEvent");
    const cuerpo = { message: "No hay una sesión activa." };
    fetchMock.mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => cuerpo,
      text: async () => JSON.stringify(cuerpo),
    });

    await expect(obtenerCorreosGmail("cuenta-1", [])).rejects.toThrow(
      "No hay una sesión activa.",
    );

    expect(notificarSesion).toHaveBeenCalledWith(
      expect.objectContaining({ type: "finapp:sesion-requerida" }),
    );
    notificarSesion.mockRestore();
  });

  it("no cierra la sesión si el 401 indica que Gmail necesita reconectarse", async () => {
    const notificarSesion = vi.spyOn(window, "dispatchEvent");
    const cuerpo = {
      message: "Google revocó o venció esta autorización. Conecta de nuevo la cuenta.",
      requires_reconnect: true,
    };
    fetchMock.mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => cuerpo,
      text: async () => JSON.stringify(cuerpo),
    });

    await expect(obtenerCorreosGmail("cuenta-1", [])).rejects.toThrow(
      "Google revocó o venció esta autorización.",
    );

    expect(notificarSesion).not.toHaveBeenCalledWith(
      expect.objectContaining({ type: "finapp:sesion-requerida" }),
    );
    notificarSesion.mockRestore();
  });

  it("renueva la sesión y reintenta una sola vez cuando el access de FinApp venció", async () => {
    const notificarSesion = vi.spyOn(window, "dispatchEvent");
    fetchMock
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: "No hay una sesión activa." }),
        text: async () =>
          JSON.stringify({ message: "No hay una sesión activa." }),
      })
      .mockResolvedValueOnce({ ok: true, status: 200 })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [],
        text: async () => "[]",
      });

    await expect(obtenerCorreosGmail("cuenta-1", [])).resolves.toEqual([]);

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[1][0]).toContain("/usuario/refresh");
    expect(fetchMock.mock.calls[2][0]).toContain(
      "/api/gmail/cuentas/cuenta-1/mensajes",
    );
    expect(notificarSesion).not.toHaveBeenCalledWith(
      expect.objectContaining({ type: "finapp:sesion-requerida" }),
    );
    notificarSesion.mockRestore();
  });

  it("adjunta el código HTTP al error para distinguir un 404", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({}),
      text: async () => "",
    });

    await expect(eliminarCuentaGmail("cuenta-x")).rejects.toMatchObject({
      status: 404,
    });
  });

  it("pide el permiso de modificar (gmail.modify) cuando incluirModificar está activo", async () => {
    let opcionesCliente;
    window.google = {
      accounts: {
        oauth2: {
          initCodeClient: (opciones) => {
            opcionesCliente = opciones;
            return {
              requestCode: () =>
                opciones.callback({
                  code: "codigo-modificar",
                  scope: `${ALCANCE_GMAIL_MODIFICAR} https://www.googleapis.com/auth/gmail.readonly`,
                }),
            };
          },
        },
      },
    };

    const codigo = await iniciarCodigoAutorizacionGmail({
      incluirModificar: true,
      cuentaEsperada: "cuenta@ejemplo.test",
    });

    expect(opcionesCliente.scope).toContain(ALCANCE_GMAIL_MODIFICAR);
    expect(codigo).toBe("codigo-modificar");
  });

  it("rechaza con un mensaje claro si Google no concede gmail.modify", async () => {
    window.google = {
      accounts: {
        oauth2: {
          initCodeClient: (opciones) => ({
            requestCode: () =>
              opciones.callback({
                code: "codigo-parcial",
                scope: "https://www.googleapis.com/auth/gmail.readonly",
              }),
          }),
        },
      },
    };

    await expect(
      iniciarCodigoAutorizacionGmail({ incluirModificar: true }),
    ).rejects.toThrow(/gmail\.modify/i);
  });

  it("lista la papelera de una cuenta y reenvía el page_token", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        cuenta_id: "cuenta-1",
        correos: [],
        total: 0,
        siguiente_page_token: "token-2",
      }),
    });

    const datos = await listarPapeleraGmail("cuenta/uno", "token-1");

    const url = fetchMock.mock.calls[0][0];
    expect(url).toContain("/api/gmail/cuentas/cuenta%2Funo/papelera");
    expect(url).toContain("page_token=token-1");
    expect(fetchMock.mock.calls[0][1].credentials).toBe("include");
    expect(datos.siguiente_page_token).toBe("token-2");
  });

  it("mueve un mensaje a la papelera con POST y devuelve el estado", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        mensaje_id: "m-1",
        estado: "EN_PAPELERA",
        movido_automaticamente: false,
      }),
    });

    const datos = await moverMensajeAPapeleraGmail("cuenta-1", "m-1");

    const [url, opciones] = fetchMock.mock.calls[0];
    expect(url).toContain("/api/gmail/cuentas/cuenta-1/mensajes/m-1/papelera");
    expect(opciones.method).toBe("POST");
    expect(datos).toEqual({
      mensaje_id: "m-1",
      estado: "EN_PAPELERA",
      movido_automaticamente: false,
    });
  });

  it("restaura un mensaje de la papelera con POST", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ mensaje_id: "m-2", estado: "EN_BANDEJA" }),
    });

    await expect(
      restaurarMensajeDePapeleraGmail("cuenta-1", "m-2"),
    ).resolves.toEqual({ mensaje_id: "m-2", estado: "EN_BANDEJA" });
    expect(fetchMock.mock.calls[0][0]).toContain(
      "/api/gmail/cuentas/cuenta-1/mensajes/m-2/restaurar",
    );
    expect(fetchMock.mock.calls[0][1].method).toBe("POST");
  });

  it("propaga los flags de acción del usuario en los errores de papelera", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 409,
      json: async () => ({
        message: "Falta el permiso ampliado.",
        requires_scope_authorization: true,
      }),
      text: async () => "",
    });

    await expect(
      moverMensajeAPapeleraGmail("cuenta-1", "m-1"),
    ).rejects.toMatchObject({
      status: 409,
      requires_scope_authorization: true,
    });
  });

  it("distingue un 410 (purgado) y un 409 mail_unavailable", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 410,
      json: async () => ({ message: "El correo ya fue eliminado." }),
      text: async () => "",
    });
    await expect(
      restaurarMensajeDePapeleraGmail("cuenta-1", "m-1"),
    ).rejects.toMatchObject({ status: 410 });

    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: async () => ({
        message: "El correo ya no está disponible.",
        mail_unavailable: true,
      }),
      text: async () => "",
    });
    await expect(
      restaurarMensajeDePapeleraGmail("cuenta-1", "m-1"),
    ).rejects.toMatchObject({ status: 409, mail_unavailable: true });
  });

  it("propaga el estado 429 de cuota agotada al listar la papelera", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 429,
      json: async () => ({ message: "Cuota de Gmail agotada." }),
      text: async () => "",
    });

    await expect(listarPapeleraGmail("cuenta-1")).rejects.toMatchObject({
      status: 429,
    });
  });
});
