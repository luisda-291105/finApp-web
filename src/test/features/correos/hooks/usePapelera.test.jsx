import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  INTERVALO_ESTADO_MS,
  usePapelera,
} from "../../../../features/correos/hooks/usePapelera";
import {
  agregarRemitenteListaBlanca,
  eliminarRemitenteListaBlanca,
  generarVistaPreviaPapelera,
  guardarConfiguracionPapelera,
  iniciarLimpiezaPapelera,
  listarListaBlanca,
  listarPapeleraPorCuentas,
  obtenerConfiguracionPapelera,
  obtenerEstadoLimpiezaPapelera,
  restaurarCorreoDePapelera,
} from "../../../../features/correos/services/papeleraService";

vi.mock("../../../../features/correos/services/papeleraService", () => ({
  listarPapeleraPorCuentas: vi.fn(),
  listarPapeleraDeCuenta: vi.fn(),
  moverCorreoAPapelera: vi.fn(),
  restaurarCorreoDePapelera: vi.fn(),
  normalizarCorreoPapelera: vi.fn(),
  obtenerConfiguracionPapelera: vi.fn(),
  guardarConfiguracionPapelera: vi.fn(),
  generarVistaPreviaPapelera: vi.fn(),
  iniciarLimpiezaPapelera: vi.fn(),
  obtenerEstadoLimpiezaPapelera: vi.fn(),
  listarListaBlanca: vi.fn(),
  agregarRemitenteListaBlanca: vi.fn(),
  eliminarRemitenteListaBlanca: vi.fn(),
}));

const gmail = vi.hoisted(() => ({
  cuentasGmail: [
    { id: "cuenta-a", email: "a@ejemplo.test" },
    { id: "cuenta-b", email: "b@ejemplo.test" },
  ],
  conectarGmail: vi.fn(),
}));

vi.mock("../../../../context/GmailContext", () => ({
  useGmail: () => ({
    gmailConectado: true,
    cuentasGmail: gmail.cuentasGmail,
    cuentaSeleccionadaId: "cuenta-a",
    conectarGmail: gmail.conectarGmail,
  }),
}));

const correo = (mensajeId) => ({
  id: mensajeId,
  mensajeId,
  cuentaId: "cuenta-a",
  remitente: `${mensajeId}@ejemplo.test`,
  asunto: `Correo ${mensajeId}`,
  fecha: "2026-11-10T14:03:00Z",
  eliminacionEstimadaEn: "2026-12-10T14:03:00Z",
  movidoAutomaticamente: false,
  motivoAutomatico: null,
  categoria: null,
});

const SECCION_A = {
  cuentaId: "cuenta-a",
  email: "a@ejemplo.test",
  correos: [correo("m-1"), correo("m-2")],
  total: 2,
  siguientePageToken: null,
  error: "",
  requierePermiso: false,
  requiereReconexion: false,
};

beforeEach(() => {
  gmail.conectarGmail.mockReset();
  gmail.conectarGmail.mockResolvedValue({ accountId: "cuenta-a" });
  obtenerConfiguracionPapelera.mockResolvedValue({
    categorias: [],
    antiguedadMinimaDias: 7,
    limitePorEjecucion: 200,
    scopeAutorizado: true,
  });
  listarListaBlanca.mockResolvedValue([]);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("usePapelera", () => {
  it("consulta una vez por cuenta al activarse", async () => {
    listarPapeleraPorCuentas.mockResolvedValue([SECCION_A]);
    const { result } = renderHook(() => usePapelera({ activo: true }));

    await waitFor(() => expect(result.current.secciones).toHaveLength(1));
    expect(listarPapeleraPorCuentas).toHaveBeenCalledTimes(1);
    expect(listarPapeleraPorCuentas).toHaveBeenCalledWith(gmail.cuentasGmail);
    expect(result.current.cargando).toBe(false);
  });

  it("no consulta mientras el modal está inactivo", async () => {
    listarPapeleraPorCuentas.mockResolvedValue([SECCION_A]);
    renderHook(() => usePapelera({ activo: false }));

    await new Promise((resolver) => setTimeout(resolver, 20));
    expect(listarPapeleraPorCuentas).not.toHaveBeenCalled();
  });

  it("quita el correo de la papelera al restaurarlo con éxito", async () => {
    listarPapeleraPorCuentas.mockResolvedValue([SECCION_A]);
    restaurarCorreoDePapelera.mockResolvedValue({
      mensaje_id: "m-1",
      estado: "EN_BANDEJA",
    });
    const { result } = renderHook(() => usePapelera({ activo: true }));
    await waitFor(() => expect(result.current.secciones[0]?.correos).toHaveLength(2));

    await act(async () => {
      await result.current.restaurar({ cuentaId: "cuenta-a", mensajeId: "m-1" });
    });

    expect(restaurarCorreoDePapelera).toHaveBeenCalledWith("cuenta-a", "m-1");
    expect(result.current.secciones[0].correos.map((c) => c.mensajeId)).toEqual([
      "m-2",
    ]);
  });

  it("revierte el reflejo y avisa si restaurar falla", async () => {
    listarPapeleraPorCuentas.mockResolvedValue([SECCION_A]);
    restaurarCorreoDePapelera.mockRejectedValue(
      Object.assign(new Error("Gmail no responde."), { status: 503 }),
    );
    const { result } = renderHook(() => usePapelera({ activo: true }));
    await waitFor(() => expect(result.current.secciones[0]?.correos).toHaveLength(2));

    await act(async () => {
      await result.current.restaurar({ cuentaId: "cuenta-a", mensajeId: "m-1" });
    });

    expect(result.current.secciones[0].correos.map((c) => c.mensajeId)).toEqual([
      "m-1",
      "m-2",
    ]);
    expect(result.current.aviso).toMatchObject({ tipo: "error" });
  });

  it("quita el correo purgado (410) e informa sin tratarlo como fallo", async () => {
    listarPapeleraPorCuentas.mockResolvedValue([SECCION_A]);
    restaurarCorreoDePapelera.mockRejectedValue(
      Object.assign(new Error("El correo ya fue eliminado."), { status: 410 }),
    );
    const { result } = renderHook(() => usePapelera({ activo: true }));
    await waitFor(() => expect(result.current.secciones[0]?.correos).toHaveLength(2));

    await act(async () => {
      await result.current.restaurar({ cuentaId: "cuenta-a", mensajeId: "m-1" });
    });

    expect(result.current.secciones[0].correos.map((c) => c.mensajeId)).toEqual([
      "m-2",
    ]);
    expect(result.current.aviso).toMatchObject({ tipo: "info" });
  });

  it("informa sin fallo cuando el correo ya no está disponible", async () => {
    listarPapeleraPorCuentas.mockResolvedValue([SECCION_A]);
    restaurarCorreoDePapelera.mockRejectedValue(
      Object.assign(new Error("El correo ya no está disponible."), {
        status: 409,
        mail_unavailable: true,
      }),
    );
    const { result } = renderHook(() => usePapelera({ activo: true }));
    await waitFor(() => expect(result.current.secciones[0]?.correos).toHaveLength(2));

    await act(async () => {
      await result.current.restaurar({ cuentaId: "cuenta-a", mensajeId: "m-1" });
    });

    expect(result.current.secciones[0].correos.map((c) => c.mensajeId)).toEqual([
      "m-2",
    ]);
    expect(result.current.aviso).toMatchObject({ tipo: "info" });
  });

  it("autoriza el permiso ampliado con incluirModificar y recarga", async () => {
    listarPapeleraPorCuentas.mockResolvedValue([SECCION_A]);
    const { result } = renderHook(() => usePapelera({ activo: true }));
    await waitFor(() => expect(result.current.secciones).toHaveLength(1));

    await act(async () => {
      await result.current.autorizarPermiso("cuenta-a");
    });

    expect(gmail.conectarGmail).toHaveBeenCalledWith({
      incluirModificar: true,
      cuentaEsperadaId: "cuenta-a",
    });
    expect(listarPapeleraPorCuentas).toHaveBeenCalledTimes(2);
  });

  it("reconcilia la papelera periódicamente", async () => {
    listarPapeleraPorCuentas.mockResolvedValue([SECCION_A]);
    renderHook(() => usePapelera({ activo: true, intervaloMs: 25 }));

    await waitFor(() =>
      expect(listarPapeleraPorCuentas).toHaveBeenCalledTimes(1),
    );
    await waitFor(
      () =>
        expect(
          listarPapeleraPorCuentas.mock.calls.length,
        ).toBeGreaterThanOrEqual(2),
      { timeout: 1500 },
    );
    expect(INTERVALO_ESTADO_MS).toBe(15 * 1000);
  });

  it("carga la configuración y la lista blanca de la cuenta al activarse", async () => {
    listarPapeleraPorCuentas.mockResolvedValue([SECCION_A]);
    obtenerConfiguracionPapelera.mockResolvedValue({
      categorias: [
        {
          categoria: "CATEGORY_PROMOTIONS",
          activa: true,
          requiereAdvertencia: false,
          advertenciaAceptada: false,
        },
      ],
      antiguedadMinimaDias: 14,
      limitePorEjecucion: 50,
      scopeAutorizado: true,
    });
    listarListaBlanca.mockResolvedValue([
      { id: "c-1", remitente: "banco@banco.com" },
    ]);
    const { result } = renderHook(() => usePapelera({ activo: true }));

    await waitFor(() =>
      expect(result.current.gestion.configuracion).not.toBeNull(),
    );

    expect(obtenerConfiguracionPapelera).toHaveBeenCalledWith("cuenta-a");
    expect(listarListaBlanca).toHaveBeenCalledWith("cuenta-a");
    expect(result.current.gestion.cuentaId).toBe("cuenta-a");
    expect(result.current.gestion.configuracion.limitePorEjecucion).toBe(50);
    expect(result.current.gestion.listaBlanca).toEqual([
      { id: "c-1", remitente: "banco@banco.com" },
    ]);
  });

  it("guarda la configuración y refleja la devuelta por el backend", async () => {
    listarPapeleraPorCuentas.mockResolvedValue([SECCION_A]);
    guardarConfiguracionPapelera.mockResolvedValue({
      categorias: [
        {
          categoria: "CATEGORY_UPDATES",
          activa: true,
          requiereAdvertencia: true,
          advertenciaAceptada: true,
        },
      ],
      antiguedadMinimaDias: 21,
      limitePorEjecucion: 10,
      scopeAutorizado: true,
    });
    const { result } = renderHook(() => usePapelera({ activo: true }));
    await waitFor(() =>
      expect(result.current.gestion.configuracion).not.toBeNull(),
    );

    await act(async () => {
      await result.current.accionesGestion.alGuardarConfiguracion({
        categoriasActivas: ["CATEGORY_UPDATES"],
        antiguedadMinimaDias: 21,
        limitePorEjecucion: 10,
        advertenciaAceptada: true,
      });
    });

    expect(guardarConfiguracionPapelera).toHaveBeenCalledWith("cuenta-a", {
      categoriasActivas: ["CATEGORY_UPDATES"],
      antiguedadMinimaDias: 21,
      limitePorEjecucion: 10,
      advertenciaAceptada: true,
    });
    expect(result.current.gestion.configuracion.antiguedadMinimaDias).toBe(21);
    expect(result.current.gestion.configuracion.limitePorEjecucion).toBe(10);
    expect(result.current.aviso).toMatchObject({ tipo: "exito" });
  });

  it("ejecuta la limpieza con la vista previa y sigue el lote", async () => {
    listarPapeleraPorCuentas.mockResolvedValue([SECCION_A]);
    generarVistaPreviaPapelera.mockResolvedValue({
      vistaPreviaId: "vp-1",
      totalEstimado: 5,
      porCategoria: [],
      excluidosPorMotivo: [],
    });
    iniciarLimpiezaPapelera.mockResolvedValue({
      loteId: "lote-1",
      estado: "EN_PROCESO",
    });
    obtenerEstadoLimpiezaPapelera.mockResolvedValue({
      loteId: "lote-1",
      estado: "COMPLETADO",
      total: 5,
      movidos: 5,
      omitidos: 0,
      fallidos: 0,
      limiteEjecucionAlcanzado: false,
    });
    const { result } = renderHook(() => usePapelera({ activo: true }));
    await waitFor(() => expect(result.current.gestion.cuentaId).toBe("cuenta-a"));

    await act(async () => {
      await result.current.accionesGestion.alGenerarVistaPrevia({
        categorias: ["CATEGORY_PROMOTIONS"],
        antiguedadMinimaDias: 7,
      });
    });
    expect(result.current.gestion.vistaPreviaLimpieza.totalEstimado).toBe(5);

    await act(async () => {
      await result.current.accionesGestion.alConfirmarLimpieza();
    });

    expect(iniciarLimpiezaPapelera).toHaveBeenCalledWith("cuenta-a", {
      vistaPreviaId: "vp-1",
      totalEstimado: 5,
    });
    expect(obtenerEstadoLimpiezaPapelera).toHaveBeenCalledWith(
      "cuenta-a",
      "lote-1",
    );
    expect(result.current.gestion.lote).toMatchObject({
      estado: "COMPLETADO",
      movidos: 5,
    });
    expect(result.current.gestion.limpiando).toBe(false);
  });

  it("pide una nueva vista previa cuando el conteo cambió", async () => {
    listarPapeleraPorCuentas.mockResolvedValue([SECCION_A]);
    generarVistaPreviaPapelera.mockResolvedValue({
      vistaPreviaId: "vp-1",
      totalEstimado: 5,
      porCategoria: [],
      excluidosPorMotivo: [],
    });
    iniciarLimpiezaPapelera.mockRejectedValue(
      Object.assign(new Error("El conteo cambió."), {
        status: 409,
        conteo_cambiado: true,
      }),
    );
    const { result } = renderHook(() => usePapelera({ activo: true }));
    await waitFor(() => expect(result.current.gestion.cuentaId).toBe("cuenta-a"));

    await act(async () => {
      await result.current.accionesGestion.alGenerarVistaPrevia({
        categorias: ["CATEGORY_PROMOTIONS"],
        antiguedadMinimaDias: 7,
      });
    });
    await act(async () => {
      await result.current.accionesGestion.alConfirmarLimpieza();
    });

    expect(result.current.gestion.vistaPreviaLimpieza).toBeNull();
    expect(result.current.gestion.vistaPreviaDesactualizada).toBe(true);
    expect(result.current.aviso).toMatchObject({ tipo: "info" });
  });

  it("informa cuando ya hay una limpieza en curso", async () => {
    listarPapeleraPorCuentas.mockResolvedValue([SECCION_A]);
    generarVistaPreviaPapelera.mockResolvedValue({
      vistaPreviaId: "vp-1",
      totalEstimado: 5,
      porCategoria: [],
      excluidosPorMotivo: [],
    });
    iniciarLimpiezaPapelera.mockRejectedValue(
      Object.assign(new Error("Ya hay una limpieza en curso."), {
        status: 409,
        limpieza_en_curso: true,
      }),
    );
    const { result } = renderHook(() => usePapelera({ activo: true }));
    await waitFor(() => expect(result.current.gestion.cuentaId).toBe("cuenta-a"));

    await act(async () => {
      await result.current.accionesGestion.alGenerarVistaPrevia({
        categorias: ["CATEGORY_PROMOTIONS"],
        antiguedadMinimaDias: 7,
      });
    });
    await act(async () => {
      await result.current.accionesGestion.alConfirmarLimpieza();
    });

    expect(result.current.aviso).toMatchObject({
      tipo: "info",
      mensaje: expect.stringMatching(/limpieza en curso/i),
    });
    expect(result.current.gestion.limpiando).toBe(false);
  });

  it("refleja los cambios de la lista blanca en la vista previa", async () => {
    listarPapeleraPorCuentas.mockResolvedValue([SECCION_A]);
    generarVistaPreviaPapelera.mockResolvedValue({
      vistaPreviaId: "vp-1",
      totalEstimado: 5,
      porCategoria: [],
      excluidosPorMotivo: [],
    });
    agregarRemitenteListaBlanca.mockResolvedValue({
      id: "c-2",
      remitente: "banco@banco.com",
    });
    listarListaBlanca.mockResolvedValue([
      { id: "c-2", remitente: "banco@banco.com" },
    ]);
    const { result } = renderHook(() => usePapelera({ activo: true }));
    await waitFor(() => expect(result.current.gestion.cuentaId).toBe("cuenta-a"));

    await act(async () => {
      await result.current.accionesGestion.alGenerarVistaPrevia({
        categorias: ["CATEGORY_PROMOTIONS"],
        antiguedadMinimaDias: 7,
      });
    });
    generarVistaPreviaPapelera.mockClear();

    await act(async () => {
      await result.current.accionesGestion.alAgregarRemitente("banco@banco.com");
    });

    expect(agregarRemitenteListaBlanca).toHaveBeenCalledWith(
      "cuenta-a",
      "banco@banco.com",
    );
    expect(generarVistaPreviaPapelera).toHaveBeenCalledWith("cuenta-a", {
      categorias: ["CATEGORY_PROMOTIONS"],
      antiguedadMinimaDias: 7,
    });
    expect(result.current.gestion.listaBlanca).toEqual([
      { id: "c-2", remitente: "banco@banco.com" },
    ]);
  });
});
