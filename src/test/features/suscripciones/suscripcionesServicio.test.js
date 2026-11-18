import { beforeEach, describe, expect, it, vi } from "vitest";

const httpMocks = vi.hoisted(() => ({
  obtener: vi.fn(),
  crear: vi.fn(),
  actualizar: vi.fn(),
  patch: vi.fn(),
  eliminar: vi.fn(),
}));

vi.mock("../../../services/httpServicio", () => httpMocks);

import { getEndpoint } from "../../../config/api.config";
import {
  actualizarAjustesSuscripcion,
  actualizarSuscripcionManual,
  cambiarEstadoSuscripcionManual,
  crearSuscripcionManual,
  eliminarSuscripcionManual,
  listarSuscripcionesManuales,
} from "../../../features/suscripciones/services/suscripcionesServicio";

const rutaSuscripcion = getEndpoint("suscripcion.base");

describe("suscripcionesServicio manuales", () => {
  beforeEach(() => {
    Object.values(httpMocks).forEach((mock) => mock.mockReset());
  });

  it("normaliza a cadena vacía («No definido») los niveles y suscripciones sin valor", async () => {
    httpMocks.obtener.mockResolvedValue([
      {
        id: "manual-1",
        origen: "MANUAL",
        nombre: "Internet hogar",
        categoria: "Servicios",
        monto: 120000,
        fechaCobro: "2026-12-10",
        importancia: null,
        prioridad: null,
        activa: true,
      },
    ]);

    await expect(listarSuscripcionesManuales()).resolves.toEqual([
      expect.objectContaining({
        importancia: "",
        prioridad: "",
      }),
    ]);
  });

  it("lista las manuales desde backend y normaliza los datos", async () => {
    httpMocks.obtener.mockResolvedValue([
      {
        id: "manual-1",
        origen: "MANUAL",
        nombre: "Internet hogar",
        categoria: "Servicios",
        monto: "120000.5",
        fechaCobro: "2026-12-10",
        importancia: "BAJA",
        prioridad: "ALTA",
        apodo: "Alertas casa",
        activa: true,
      },
    ]);

    await expect(listarSuscripcionesManuales()).resolves.toEqual([
      expect.objectContaining({
        id: "manual-1",
        origen: "MANUAL",
        importancia: "Baja",
        prioridad: "Alta",
        apodo: "Alertas casa",
        monto: 120000.5,
      }),
    ]);
    expect(httpMocks.obtener).toHaveBeenCalledWith(
      `${rutaSuscripcion}?origen=MANUAL`,
    );
  });

  it("crea una manual con el payload esperado", async () => {
    httpMocks.crear.mockResolvedValue({
      id: "manual-1",
      nombre: "Netflix",
      categoria: "Entretenimiento",
      monto: 47068.11,
      fechaCobro: "2026-12-04",
      importancia: "BAJA",
      activa: true,
    });

    await expect(
      crearSuscripcionManual({
        nombre: " Netflix ",
        categoria: " Entretenimiento ",
        monto: "47068,11",
        fechaCobro: "2026-12-04",
        importancia: "Baja",
      }),
    ).resolves.toMatchObject({ id: "manual-1", importancia: "Baja" });

    expect(httpMocks.crear).toHaveBeenCalledWith(rutaSuscripcion, {
      nombre: "Netflix",
      categoria: "Entretenimiento",
      monto: 47068.11,
      fechaCobro: "2026-12-04",
      importancia: "BAJA",
      prioridad: "MEDIA",
      apodo: null,
    });
  });

  it("actualiza una manual usando PUT y normaliza la respuesta", async () => {
    httpMocks.actualizar.mockResolvedValue({
      id: "manual-2",
      nombre: "Gimnasio",
      categoria: "Salud",
      monto: 90000,
      fechaCobro: "2026-12-15",
      importancia: "BAJA",
      activa: false,
    });

    await expect(
      actualizarSuscripcionManual("manual-2", {
        nombre: "Gimnasio",
        categoria: "Salud",
        monto: 90000,
        fechaCobro: "2026-12-15",
        importancia: "Baja",
        activa: false,
      }),
    ).resolves.toMatchObject({
      id: "manual-2",
      importancia: "Baja",
      activa: false,
    });

    expect(httpMocks.actualizar).toHaveBeenCalledWith(
      `${rutaSuscripcion}/manual-2`,
      {
        nombre: "Gimnasio",
        categoria: "Salud",
        monto: 90000,
        fechaCobro: "2026-12-15",
        importancia: "BAJA",
        prioridad: "MEDIA",
        apodo: null,
        activa: false,
      },
    );
  });

  it("guarda ajustes de organización con PATCH /ajustes, omite campos no enviados y limpia el apodo vacío", async () => {
    httpMocks.patch.mockResolvedValue({
      id: "gmail-1",
      importancia: "MEDIA",
      prioridad: "ALTA",
      apodo: null,
    });

    await actualizarAjustesSuscripcion("gmail-1", {
      importancia: "Media",
      prioridad: "Alta",
      apodo: "",
    });

    expect(httpMocks.patch).toHaveBeenCalledWith(
      `${rutaSuscripcion}/gmail-1/ajustes`,
      {
        importancia: "MEDIA",
        prioridad: "ALTA",
        apodo: null,
      },
    );

    await actualizarAjustesSuscripcion("gmail-1", {
      apodo: "Alertas del banco",
    });
    expect(httpMocks.patch).toHaveBeenLastCalledWith(
      `${rutaSuscripcion}/gmail-1/ajustes`,
      {
        apodo: "Alertas del banco",
      },
    );
  });

  it("envía cadena vacía en «No definido» para que el backend lo guarde como null", async () => {
    httpMocks.patch.mockResolvedValue({
      id: "gmail-1",
      importancia: null,
      prioridad: null,
      apodo: null,
    });

    await actualizarAjustesSuscripcion("gmail-1", {
      importancia: "",
      prioridad: "",
    });

    expect(httpMocks.patch).toHaveBeenCalledWith(
      `${rutaSuscripcion}/gmail-1/ajustes`,
      {
        importancia: "",
        prioridad: "",
      },
    );
  });

  it("cambia el estado con PATCH y elimina con DELETE", async () => {
    httpMocks.patch.mockResolvedValue({
      id: "manual-3",
      nombre: "Vercel",
      categoria: "Servicios",
      monto: 20000,
      fechaCobro: "2026-12-01",
      importancia: "ALTA",
      activa: false,
    });

    await expect(
      cambiarEstadoSuscripcionManual("manual-3", false),
    ).resolves.toMatchObject({ activa: false });
    expect(httpMocks.patch).toHaveBeenCalledWith(
      `${rutaSuscripcion}/manual-3/estado`,
      { activa: false },
    );

    httpMocks.eliminar.mockResolvedValue({ mensaje: "Suscripción eliminada." });
    await eliminarSuscripcionManual("manual-3");
    expect(httpMocks.eliminar).toHaveBeenCalledWith(
      `${rutaSuscripcion}/manual-3`,
    );
  });
});
