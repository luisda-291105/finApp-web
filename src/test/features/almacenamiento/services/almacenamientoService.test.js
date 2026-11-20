import { afterEach, describe, expect, it, vi } from "vitest";
import { API_BASE_URL } from "../../../../config/api.config";
import {
  crear,
  descargar,
  eliminar,
  obtener,
  patch,
  subir,
} from "../../../../services/httpServicio";
import {
  compartir,
  copiar,
  crearCarpeta,
  descargarArchivo,
  enviarAPapelera,
  listarArchivos,
  listarPermisos,
  mover,
  operacionLote,
  renombrar,
  restaurar,
  revocarPermiso,
  subirArchivo,
  urlContenido,
  urlPrevisualizacion,
  vaciarPapelera,
} from "../../../../features/almacenamiento/services/almacenamientoServicio";

vi.mock("../../../../services/httpServicio", () => ({
  crear: vi.fn(),
  obtener: vi.fn(),
  actualizar: vi.fn(),
  patch: vi.fn(),
  eliminar: vi.fn(),
  subir: vi.fn(),
  descargar: vi.fn(),
}));

afterEach(() => vi.clearAllMocks());

// La fuente de verdad es CAlmacenamientoArchivos del backend:
//   GET    /api/almacenamiento/conexiones/{id}/archivos
//   GET    /api/almacenamiento/conexiones/{id}/archivos/{fileId}
//   GET    /api/almacenamiento/conexiones/{id}/archivos/{fileId}/contenido
//   GET    /api/almacenamiento/conexiones/{id}/archivos/{fileId}/previsualizacion
//   POST   /api/almacenamiento/conexiones/{id}/archivos/carpeta        { carpetaId, nombre }
//   POST   /api/almacenamiento/conexiones/{id}/archivos/subir          multipart: archivo, idPadre
//   PATCH  /api/almacenamiento/conexiones/{id}/archivos/{fileId}       { nombre, idNuevoPadre, destacar }
//   POST   /api/almacenamiento/conexiones/{id}/archivos/{fileId}/copiar { carpetaId }
//   DELETE /api/almacenamiento/conexiones/{id}/archivos/{fileId}
//   POST   /api/almacenamiento/conexiones/{id}/archivos/{fileId}/restaurar
//   DELETE /api/almacenamiento/conexiones/{id}/archivos/{fileId}/permanente
//   DELETE /api/almacenamiento/conexiones/{id}/archivos/papelera
//   GET    /api/almacenamiento/conexiones/{id}/archivos/{fileId}/permisos
//   POST   /api/almacenamiento/conexiones/{id}/archivos/{fileId}/permisos
//   DELETE /api/almacenamiento/conexiones/{id}/archivos/{fileId}/permisos/{permisoId}
const base = `${API_BASE_URL}/api/almacenamiento/conexiones/cuenta-1/archivos`;

describe("almacenamientoServicio", () => {
  it("lista archivos con parámetros de consulta", async () => {
    obtener.mockResolvedValue({
      datos: [{ id: "arch-1", nombre: "factura.pdf" }],
    });

    await expect(
      listarArchivos("cuenta-1", {
        carpetaId: "root",
        vista: "unidad",
        busqueda: "factura",
      }),
    ).resolves.toEqual([{ id: "arch-1", nombre: "factura.pdf" }]);

    expect(obtener).toHaveBeenCalledWith(
      `${base}?carpetaId=root&vista=unidad&busqueda=factura`,
    );
  });

  it("no consulta archivos sin cuenta conectada", async () => {
    await expect(listarArchivos("")).rejects.toThrow(
      "Selecciona una cuenta de almacenamiento.",
    );
    expect(obtener).not.toHaveBeenCalled();
  });

  it("crea la carpeta enviando carpetaId y nombre", async () => {
    crear.mockResolvedValue({ datos: { id: "carp-1" } });

    await expect(
      crearCarpeta("cuenta-1", { nombre: "Docs", padreId: "carp-0" }),
    ).resolves.toEqual({ id: "carp-1" });

    expect(crear).toHaveBeenCalledWith(
      `${base}/carpeta`,
      { carpetaId: "carp-0", nombre: "Docs" },
      expect.any(Object),
    );
  });

  it("sube el archivo por /subir con el campo idPadre", async () => {
    subir.mockResolvedValue({ datos: { id: "arch-2" } });
    const archivo = new File(["contenido"], "dato.txt", { type: "text/plain" });
    const form = new FormData();
    form.append("archivo", archivo);
    form.append("padreId", "carp-0");

    await expect(subirArchivo("cuenta-1", form)).resolves.toEqual({
      id: "arch-2",
    });

    const [ruta, enviado] = subir.mock.calls[0];
    expect(ruta).toBe(`${base}/subir`);
    expect(enviado.get("archivo")).toBeInstanceOf(File);
    expect(enviado.get("idPadre")).toBe("carp-0");
    expect(enviado.get("padreId")).toBeNull();
  });

  it("renombra con PATCH sobre el archivo", async () => {
    patch.mockResolvedValue({ datos: { ok: true } });

    await renombrar("cuenta-1", "arch-1", "nuevo.pdf");

    expect(patch).toHaveBeenCalledWith(
      `${base}/arch-1`,
      { nombre: "nuevo.pdf" },
      expect.any(Object),
    );
  });

  it("mueve cada archivo con PATCH e idNuevoPadre", async () => {
    patch.mockResolvedValue({ datos: { ok: true } });

    await mover("cuenta-1", { ids: ["arch-1", "arch-2"], destinoId: "carp-2" });

    expect(patch).toHaveBeenCalledTimes(2);
    expect(patch).toHaveBeenNthCalledWith(
      1,
      `${base}/arch-1`,
      { idNuevoPadre: "carp-2" },
      expect.any(Object),
    );
    expect(patch).toHaveBeenNthCalledWith(
      2,
      `${base}/arch-2`,
      { idNuevoPadre: "carp-2" },
      expect.any(Object),
    );
  });

  it("copia cada archivo con POST sobre /{fileId}/copiar", async () => {
    crear.mockResolvedValue({ datos: { ok: true } });

    await copiar("cuenta-1", { ids: ["arch-1"], destinoId: "carp-2" });

    expect(crear).toHaveBeenCalledWith(
      `${base}/arch-1/copiar`,
      { carpetaId: "carp-2" },
      expect.any(Object),
    );
  });

  it("envía a la papelera con DELETE sobre cada archivo", async () => {
    eliminar.mockResolvedValue({ datos: { ok: true } });

    await enviarAPapelera("cuenta-1", { ids: ["arch-1", "arch-2"] });

    expect(eliminar).toHaveBeenCalledTimes(2);
    expect(eliminar).toHaveBeenNthCalledWith(
      1,
      `${base}/arch-1`,
      expect.any(Object),
    );
    expect(eliminar).toHaveBeenNthCalledWith(
      2,
      `${base}/arch-2`,
      expect.any(Object),
    );
  });

  it("restaura cada archivo con POST sobre /{fileId}/restaurar", async () => {
    crear.mockResolvedValue({ datos: { ok: true } });

    await restaurar("cuenta-1", { ids: ["arch-1"] });

    expect(crear).toHaveBeenCalledWith(
      `${base}/arch-1/restaurar`,
      {},
      expect.any(Object),
    );
  });

  it("elimina de forma definitiva con DELETE sobre /{fileId}/permanente", async () => {
    eliminar.mockResolvedValue({ datos: { ok: true } });

    await operacionLote("cuenta-1", {
      accion: "eliminar_definitivo",
      ids: ["arch-1"],
    });

    expect(eliminar).toHaveBeenCalledWith(
      `${base}/arch-1/permanente`,
      expect.any(Object),
    );
  });

  it("gestiona papelera, permisos y operaciones por lote", async () => {
    eliminar.mockResolvedValue({ datos: { ok: true } });
    obtener.mockResolvedValue({ datos: [{ id: "perm-1", correo: "a@b.com" }] });
    crear.mockResolvedValue({ datos: { id: "perm-2" } });

    await vaciarPapelera("cuenta-1");
    expect(eliminar).toHaveBeenCalledWith(
      `${base}/papelera`,
      expect.any(Object),
    );

    await expect(listarPermisos("cuenta-1", "arch-1")).resolves.toEqual([
      { id: "perm-1", correo: "a@b.com" },
    ]);
    expect(obtener).toHaveBeenCalledWith(`${base}/arch-1/permisos`);

    await compartir("cuenta-1", "arch-1", { correo: "a@b.com", rol: "lector" });
    expect(crear).toHaveBeenCalledWith(
      `${base}/arch-1/permisos`,
      { correo: "a@b.com", rol: "lector" },
      expect.any(Object),
    );

    await revocarPermiso("cuenta-1", "arch-1", "perm-1");
    expect(eliminar).toHaveBeenCalledWith(
      `${base}/arch-1/permisos/perm-1`,
      expect.any(Object),
    );
  });

  it("expone URLs y descarga de contenido", async () => {
    const blob = new Blob(["x"], { type: "text/plain" });
    descargar.mockResolvedValue(blob);

    expect(urlContenido("cuenta-1", "arch-1")).toBe(`${base}/arch-1/contenido`);
    expect(urlPrevisualizacion("cuenta-1", "arch-1")).toBe(
      `${base}/arch-1/previsualizacion`,
    );
    await expect(descargarArchivo("cuenta-1", "arch-1")).resolves.toBe(blob);
    expect(descargar).toHaveBeenCalledWith(`${base}/arch-1/contenido`);
  });
});
