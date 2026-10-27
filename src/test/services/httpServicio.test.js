/**
 * @uso        Pruebas del servicio HTTP base: lectura de respuestas correctas y errores 4xx/5xx
 * @funciones  obtener, crear, actualizar, eliminar
 * @datos      Respuestas de `fetch` simuladas (cuerpo JSON, texto o vacío)
 * @eventos    N/A
 * @estados    N/A
 * @usadoPor   Vitest
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { actualizar, crear, eliminar, obtener } from "../../services/httpServicio";

/** Construye una respuesta falsa de `fetch` con el estado y el cuerpo indicados. */
const crearRespuesta = ({ status = 200, ok, statusText = "", cuerpo = "" } = {}) => ({
  ok: ok ?? (status >= 200 && status < 300),
  status,
  statusText,
  text: vi.fn().mockResolvedValue(
    typeof cuerpo === "string" ? cuerpo : JSON.stringify(cuerpo),
  ),
});

describe("httpServicio", () => {
  let espiaError;

  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    espiaError = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    espiaError.mockRestore();
    vi.unstubAllGlobals();
  });

  it("crear devuelve el cuerpo cuando el estado es 201", async () => {
    fetch.mockResolvedValue(
      crearRespuesta({ status: 201, cuerpo: { idUsuario: "123", nombre: "Ana" } }),
    );

    const resultado = await crear("/usuario", { nombre: "Ana" });

    expect(resultado).toEqual({ idUsuario: "123", nombre: "Ana" });
    expect(espiaError).not.toHaveBeenCalled();
  });

  it("lanza el mensaje del backend cuando crear recibe 409", async () => {
    fetch.mockResolvedValue(
      crearRespuesta({ status: 409, cuerpo: { mensaje: "El usuario ya existe" } }),
    );

    await expect(crear("/usuario", { nombre: "Ana" })).rejects.toThrow(
      "El usuario ya existe",
    );
    expect(espiaError).toHaveBeenCalledWith(
      "[HTTP][ERROR]",
      expect.objectContaining({ metodo: "POST", status: 409 }),
    );
  });

  it("lanza el mensaje del backend cuando actualizar recibe 500", async () => {
    fetch.mockResolvedValue(
      crearRespuesta({ status: 500, cuerpo: { mensaje: "Fallo del servidor" } }),
    );

    await expect(actualizar("/usuario/123", { nombre: "Ana" })).rejects.toThrow(
      "Fallo del servidor",
    );
    expect(espiaError).toHaveBeenCalledWith(
      "[HTTP][ERROR]",
      expect.objectContaining({ metodo: "PUT", status: 500 }),
    );
  });

  it("lanza «Error HTTP 404» cuando no hay cuerpo", async () => {
    fetch.mockResolvedValue(crearRespuesta({ status: 404, cuerpo: "" }));

    await expect(obtener("/usuario/123")).rejects.toThrow("Error HTTP 404");
    expect(espiaError).toHaveBeenCalledWith(
      "[HTTP][ERROR]",
      expect.objectContaining({ metodo: "GET", status: 404 }),
    );
  });

  it("eliminar lanza el texto del backend cuando el cuerpo no es JSON", async () => {
    fetch.mockResolvedValue(
      crearRespuesta({ status: 400, cuerpo: "Solicitud inválida" }),
    );

    await expect(eliminar("/usuario/123")).rejects.toThrow("Solicitud inválida");
    expect(espiaError).toHaveBeenCalledWith(
      "[HTTP][ERROR]",
      expect.objectContaining({ metodo: "DELETE", status: 400 }),
    );
  });
});
