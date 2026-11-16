import { afterEach, describe, expect, it, vi } from "vitest";
import { API_BASE_URL } from "../../../../config/api.config";
import { actualizar, crear, descargar, eliminar, obtener, subir } from "../../../../services/httpServicio";
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
  eliminar: vi.fn(),
  subir: vi.fn(),
  descargar: vi.fn(),
}));

afterEach(() => vi.clearAllMocks());

const base = `${API_BASE_URL}/api/almacenamiento/conexiones/cuenta-1/archivos`;

describe("almacenamientoServicio", () => {
  it("lista archivos con parámetros de consulta", async () => {
    obtener.mockResolvedValue({ datos: [{ id: "arch-1", nombre: "factura.pdf" }] });

    await expect(listarArchivos("cuenta-1", { carpetaId: "root", vista: "unidad", busqueda: "factura" }))
      .resolves.toEqual([{ id: "arch-1", nombre: "factura.pdf" }]);

    expect(obtener).toHaveBeenCalledWith(`${base}?carpetaId=root&vista=unidad&busqueda=factura`);
  });

  it("crea carpetas y sube archivos por cuenta", async () => {
    crear.mockResolvedValue({ datos: { id: "carp-1" } });
    const form = new FormData();
    subir.mockResolvedValue({ datos: [{ id: "arch-2" }] });

    await expect(crearCarpeta("cuenta-1", { nombre: "Docs", padreId: "root" })).resolves.toEqual({ id: "carp-1" });
    expect(crear).toHaveBeenCalledWith(`${base}/carpeta`, { nombre: "Docs", padreId: "root" }, expect.any(Object));

    await expect(subirArchivo("cuenta-1", form)).resolves.toEqual([{ id: "arch-2" }]);
    expect(subir).toHaveBeenCalledWith(base, form, expect.any(Object));
  });

  it("renombra, mueve, copia, envía a papelera y restaura", async () => {
    actualizar.mockResolvedValue({ datos: { ok: true } });
    crear.mockResolvedValue({ datos: { ok: true } });

    await renombrar("cuenta-1", "arch-1", "nuevo.pdf");
    expect(actualizar).toHaveBeenCalledWith(`${base}/arch-1/renombrar`, { nombre: "nuevo.pdf" }, expect.any(Object));

    await mover("cuenta-1", { ids: ["arch-1"], destinoId: "carp-2" });
    expect(actualizar).toHaveBeenCalledWith(`${base}/mover`, { ids: ["arch-1"], destinoId: "carp-2" }, expect.any(Object));

    await copiar("cuenta-1", { ids: ["arch-1"], destinoId: "carp-2" });
    expect(crear).toHaveBeenCalledWith(`${base}/copiar`, { ids: ["arch-1"], destinoId: "carp-2" }, expect.any(Object));

    await enviarAPapelera("cuenta-1", { ids: ["arch-1"] });
    expect(actualizar).toHaveBeenCalledWith(`${base}/papelera`, { ids: ["arch-1"] }, expect.any(Object));

    await restaurar("cuenta-1", { ids: ["arch-1"] });
    expect(actualizar).toHaveBeenCalledWith(`${base}/restaurar`, { ids: ["arch-1"] }, expect.any(Object));
  });

  it("gestiona papelera, permisos y operaciones por lote", async () => {
    eliminar.mockResolvedValue({ datos: { ok: true } });
    obtener.mockResolvedValue({ datos: [{ id: "perm-1", correo: "a@b.com" }] });
    crear.mockResolvedValue({ datos: { id: "perm-2" } });

    await vaciarPapelera("cuenta-1");
    expect(eliminar).toHaveBeenCalledWith(`${base}/papelera`, expect.any(Object));

    await expect(listarPermisos("cuenta-1", "arch-1")).resolves.toEqual([{ id: "perm-1", correo: "a@b.com" }]);
    expect(obtener).toHaveBeenCalledWith(`${base}/arch-1/permisos`);

    await compartir("cuenta-1", "arch-1", { correo: "a@b.com", rol: "lector" });
    expect(crear).toHaveBeenCalledWith(`${base}/arch-1/permisos`, { correo: "a@b.com", rol: "lector" }, expect.any(Object));

    await revocarPermiso("cuenta-1", "arch-1", "perm-1");
    expect(eliminar).toHaveBeenCalledWith(`${base}/arch-1/permisos/perm-1`, expect.any(Object));

    await operacionLote("cuenta-1", { accion: "eliminar", ids: ["arch-1", "arch-2"] });
    expect(crear).toHaveBeenCalledWith(`${base}/lote`, { accion: "eliminar", ids: ["arch-1", "arch-2"] }, expect.any(Object));
  });

  it("expone URLs y descarga de contenido", async () => {
    const blob = new Blob(["x"], { type: "text/plain" });
    descargar.mockResolvedValue(blob);

    expect(urlContenido("cuenta-1", "arch-1")).toBe(`${base}/arch-1/contenido`);
    expect(urlPrevisualizacion("cuenta-1", "arch-1")).toBe(`${base}/arch-1/previsualizacion`);
    await expect(descargarArchivo("cuenta-1", "arch-1")).resolves.toBe(blob);
    expect(descargar).toHaveBeenCalledWith(`${base}/arch-1/contenido`);
  });
});
