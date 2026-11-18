/**
 * @uso        Pruebas de renovación deslizante del cliente HTTP (single-flight, inactividad, proactiva)
 * @funciones  obtener, crear, renovarSesion, consumirMensajeSesion
 * @datos      fetch simulado, eventos de window y localStorage
 * @eventos    finapp:sesion-requerida
 * @estados    Módulo reimportado en cada prueba para aislar el estado de sesión
 * @usadoPor   Vitest
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const crearRespuesta = ({
  status = 200,
  cuerpo = "",
} = {}) => ({
  ok: status >= 200 && status < 300,
  status,
  statusText: "",
  text: vi.fn().mockResolvedValue(
    typeof cuerpo === "string" ? cuerpo : JSON.stringify(cuerpo),
  ),
});

describe("httpServicio: sesión access/refresh", () => {
  let http;
  let fetchMock;

  beforeEach(async () => {
    vi.resetModules();
    vi.useRealTimers();
    window.localStorage.clear();
    window.sessionStorage.clear();
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    http = await import("../../services/httpServicio");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it("renueva una sola vez aunque fallen varias peticiones y repite las originales", async () => {
    fetchMock.mockImplementation((url) => {
      if (String(url).endsWith("/usuario/refresh")) {
        return Promise.resolve(crearRespuesta({ status: 200, cuerpo: { tipo: "exito" } }));
      }
      const llamada = fetchMock.mock.calls.filter((c) => !String(c[0]).endsWith("/usuario/refresh")).length;
      return Promise.resolve(
        llamada <= 2
          ? crearRespuesta({ status: 401, cuerpo: { mensaje: "Token vencido" } })
          : crearRespuesta({ status: 200, cuerpo: { ok: true } }),
      );
    });

    const [a, b] = await Promise.all([
      http.obtener("/api/datos/1"),
      http.obtener("/api/datos/2"),
    ]);

    expect(a).toEqual({ ok: true });
    expect(b).toEqual({ ok: true });
    const renovaciones = fetchMock.mock.calls.filter((c) =>
      String(c[0]).endsWith("/usuario/refresh"),
    );
    expect(renovaciones).toHaveLength(1);
    expect(renovaciones[0][1]).toMatchObject({
      method: "POST",
      credentials: "include",
    });
  });

  it("no intenta renovar en login ni en el propio refresh", async () => {
    fetchMock.mockResolvedValue(
      crearRespuesta({ status: 401, cuerpo: { mensaje: "Credenciales incorrectas" } }),
    );

    await expect(
      http.crear("/usuario/login", { identificador: "u", contrasena: "x" }),
    ).rejects.toThrow("Credenciales incorrectas");
    await expect(http.obtener("/usuario/refresh")).rejects.toThrow(
      "Credenciales incorrectas",
    );

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("avisa de inactividad y guarda el mensaje para el modal de acceso", async () => {
    const notificar = vi.spyOn(window, "dispatchEvent");
    const guardar = vi.spyOn(window.sessionStorage, "setItem");
    fetchMock.mockImplementation((url) =>
      Promise.resolve(
        String(url).endsWith("/usuario/refresh")
          ? crearRespuesta({ status: 401, cuerpo: { mensaje: "Sesión expirada" } })
          : crearRespuesta({ status: 401, cuerpo: { mensaje: "Token vencido" } }),
      ),
    );

    await expect(http.obtener("/api/gmail/suscripciones")).rejects.toThrow(
      "Token vencido",
    );

    expect(notificar).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "finapp:sesion-requerida",
        detail: expect.objectContaining({ motivo: "inactividad" }),
      }),
    );
    expect(guardar).toHaveBeenCalledWith(
      "finapp_mensaje_sesion",
      expect.stringContaining("expiró por inactividad"),
    );

    // El modal consume el aviso una sola vez.
    window.sessionStorage.getItem.mockReturnValue("Aviso de prueba");
    expect(http.consumirMensajeSesion()).toBe("Aviso de prueba");
    expect(window.sessionStorage.removeItem).toHaveBeenCalledWith(
      "finapp_mensaje_sesion",
    );
  });

  it("renueva de forma proactiva solo cuando hubo actividad después del acceso", async () => {
    vi.useFakeTimers();
    fetchMock.mockImplementation((url) =>
      Promise.resolve(
        String(url).endsWith("/usuario/refresh")
          ? crearRespuesta({ status: 200, cuerpo: { tipo: "exito" } })
          : crearRespuesta({ status: 200, cuerpo: { ok: true } }),
      ),
    );

    await http.crear("/usuario/login", { identificador: "u", contrasena: "x" });
    await vi.advanceTimersByTimeAsync(13 * 60 * 1000);
    expect(fetchMock.mock.calls.filter((c) => String(c[0]).endsWith("/usuario/refresh"))).toHaveLength(0);

    await http.obtener("/api/datos");
    await vi.advanceTimersByTimeAsync(13 * 60 * 1000);
    expect(fetchMock.mock.calls.filter((c) => String(c[0]).endsWith("/usuario/refresh"))).toHaveLength(1);
  });
});
