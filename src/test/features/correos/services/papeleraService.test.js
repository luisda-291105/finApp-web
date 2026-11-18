import { afterEach, describe, expect, it, vi } from "vitest";
import {
  agregarRemitenteListaBlanca,
  eliminarRemitenteListaBlanca,
  generarVistaPreviaPapelera,
  guardarConfiguracionPapelera,
  iniciarLimpiezaPapelera,
  listarListaBlanca,
  listarPapeleraDeCuenta,
  listarPapeleraPorCuentas,
  moverCorreoAPapelera,
  normalizarConfiguracionPapelera,
  normalizarCorreoPapelera,
  normalizarLoteLimpieza,
  normalizarVistaPreviaPapelera,
  obtenerConfiguracionPapelera,
  obtenerEstadoLimpiezaPapelera,
  restaurarCorreoDePapelera,
} from "../../../../features/correos/services/papeleraService";
import {
  agregarRemitenteListaBlancaGmail,
  eliminarRemitenteListaBlancaGmail,
  generarVistaPreviaPapeleraGmail,
  guardarConfiguracionPapeleraGmail,
  iniciarLimpiezaPapeleraGmail,
  listarListaBlancaGmail,
  listarPapeleraGmail,
  moverMensajeAPapeleraGmail,
  obtenerConfiguracionPapeleraGmail,
  obtenerEstadoLimpiezaPapeleraGmail,
  restaurarMensajeDePapeleraGmail,
} from "../../../../services/gmailServicio";

vi.mock("../../../../services/gmailServicio", () => ({
  listarPapeleraGmail: vi.fn(),
  moverMensajeAPapeleraGmail: vi.fn(),
  restaurarMensajeDePapeleraGmail: vi.fn(),
  obtenerConfiguracionPapeleraGmail: vi.fn(),
  guardarConfiguracionPapeleraGmail: vi.fn(),
  generarVistaPreviaPapeleraGmail: vi.fn(),
  iniciarLimpiezaPapeleraGmail: vi.fn(),
  obtenerEstadoLimpiezaPapeleraGmail: vi.fn(),
  listarListaBlancaGmail: vi.fn(),
  agregarRemitenteListaBlancaGmail: vi.fn(),
  eliminarRemitenteListaBlancaGmail: vi.fn(),
}));

afterEach(() => vi.clearAllMocks());

const CORREO_DTO = {
  mensaje_id: "m-1",
  remitente: "promo@tienda.com",
  asunto: "Oferta del mes",
  fecha: "2026-11-10T14:03:00Z",
  eliminacion_estimada_en: "2026-12-10T14:03:00Z",
  movido_automaticamente: true,
  motivo_automatico: "CATEGORY_PROMOTIONS",
  categoria: "CATEGORY_PROMOTIONS",
};

describe("papeleraService", () => {
  it("normaliza un correo del DTO de la papelera", () => {
    expect(normalizarCorreoPapelera(CORREO_DTO, "cuenta-a")).toEqual({
      id: "m-1",
      mensajeId: "m-1",
      cuentaId: "cuenta-a",
      remitente: "promo@tienda.com",
      asunto: "Oferta del mes",
      fecha: "2026-11-10T14:03:00Z",
      eliminacionEstimadaEn: "2026-12-10T14:03:00Z",
      movidoAutomaticamente: true,
      motivoAutomatico: "CATEGORY_PROMOTIONS",
      categoria: "CATEGORY_PROMOTIONS",
    });
  });

  it("consulta una vez por cuenta y agrupa los correos por cuenta", async () => {
    listarPapeleraGmail.mockImplementation(async (cuentaId) =>
      cuentaId === "cuenta-a"
        ? { correos: [CORREO_DTO], total: 1, siguiente_page_token: null }
        : { correos: [], total: 0, siguiente_page_token: null },
    );

    const secciones = await listarPapeleraPorCuentas([
      { id: "cuenta-a", email: "a@ejemplo.test" },
      { id: "cuenta-b", email: "b@ejemplo.test" },
    ]);

    expect(listarPapeleraGmail).toHaveBeenCalledTimes(2);
    expect(listarPapeleraGmail).toHaveBeenCalledWith("cuenta-a");
    expect(listarPapeleraGmail).toHaveBeenCalledWith("cuenta-b");
    expect(secciones).toHaveLength(2);
    expect(secciones[0]).toMatchObject({
      cuentaId: "cuenta-a",
      email: "a@ejemplo.test",
      total: 1,
      error: "",
      requierePermiso: false,
      requiereReconexion: false,
    });
    expect(secciones[0].correos[0].mensajeId).toBe("m-1");
    expect(secciones[1].correos).toEqual([]);
  });

  it("marca la cuenta sin permiso ampliado sin tratarlo como error", async () => {
    const fallo = Object.assign(new Error("Falta el permiso ampliado."), {
      status: 409,
      requires_scope_authorization: true,
    });
    listarPapeleraGmail.mockRejectedValue(fallo);

    const [seccion] = await listarPapeleraPorCuentas([
      { id: "cuenta-a", email: "a@ejemplo.test" },
    ]);

    expect(seccion.requierePermiso).toBe(true);
    expect(seccion.requiereReconexion).toBe(false);
    expect(seccion.error).toBe("");
  });

  it("distingue la conexión revocada y los fallos técnicos", async () => {
    listarPapeleraGmail
      .mockRejectedValueOnce(
        Object.assign(new Error("Reconecta la cuenta."), {
          status: 409,
          requires_reconnect: true,
        }),
      )
      .mockRejectedValueOnce(
        Object.assign(new Error("Gmail no responde."), { status: 503 }),
      );

    const secciones = await listarPapeleraPorCuentas([
      { id: "cuenta-a", email: "a@ejemplo.test" },
      { id: "cuenta-b", email: "b@ejemplo.test" },
    ]);

    expect(secciones[0].requiereReconexion).toBe(true);
    expect(secciones[0].error).toBe("");
    expect(secciones[1].error).toBe("Gmail no responde.");
    expect(secciones[1].requiereReconexion).toBe(false);
  });

  it("reenvía el page_token y expone el token siguiente", async () => {
    listarPapeleraGmail.mockResolvedValue({
      correos: [],
      total: 3,
      siguiente_page_token: "token-y",
    });

    const datos = await listarPapeleraDeCuenta("cuenta-a", "token-x");

    expect(listarPapeleraGmail).toHaveBeenCalledWith("cuenta-a", "token-x");
    expect(datos.total).toBe(3);
    expect(datos.siguientePageToken).toBe("token-y");
  });

  it("delega mover y restaurar en el servicio de Gmail", async () => {
    moverMensajeAPapeleraGmail.mockResolvedValue({
      mensaje_id: "m-1",
      estado: "EN_PAPELERA",
      movido_automaticamente: false,
    });
    restaurarMensajeDePapeleraGmail.mockResolvedValue({
      mensaje_id: "m-1",
      estado: "EN_BANDEJA",
    });

    await expect(moverCorreoAPapelera("cuenta-a", "m-1")).resolves.toMatchObject(
      { estado: "EN_PAPELERA" },
    );
    await expect(
      restaurarCorreoDePapelera("cuenta-a", "m-1"),
    ).resolves.toMatchObject({ estado: "EN_BANDEJA" });

    expect(moverMensajeAPapeleraGmail).toHaveBeenCalledWith("cuenta-a", "m-1");
    expect(restaurarMensajeDePapeleraGmail).toHaveBeenCalledWith(
      "cuenta-a",
      "m-1",
    );
  });

  it("normaliza la configuración, la vista previa y el lote de limpieza", () => {
    expect(
      normalizarConfiguracionPapelera({
        categorias: [
          {
            categoria: "CATEGORY_UPDATES",
            activa: true,
            requiere_advertencia: true,
            advertencia_aceptada: true,
          },
        ],
        antiguedad_minima_dias: "14",
        limite_por_ejecucion: 50,
        scope_autorizado: true,
      }),
    ).toEqual({
      categorias: [
        {
          categoria: "CATEGORY_UPDATES",
          activa: true,
          requiereAdvertencia: true,
          advertenciaAceptada: true,
        },
      ],
      antiguedadMinimaDias: 14,
      limitePorEjecucion: 50,
      scopeAutorizado: true,
    });

    expect(
      normalizarVistaPreviaPapelera({
        vista_previa_id: "vp-1",
        total_estimado: 34,
        por_categoria: [
          {
            categoria: "CATEGORY_PROMOTIONS",
            cantidad: 28,
            remitentes: [{ remitente: "promo@tienda.com", cantidad: 12 }],
          },
        ],
        excluidos_por_motivo: [{ motivo: "LISTA_BLANCA", cantidad: 2 }],
      }),
    ).toEqual({
      vistaPreviaId: "vp-1",
      totalEstimado: 34,
      porCategoria: [
        {
          categoria: "CATEGORY_PROMOTIONS",
          cantidad: 28,
          remitentes: [{ remitente: "promo@tienda.com", cantidad: 12 }],
        },
      ],
      excluidosPorMotivo: [{ motivo: "LISTA_BLANCA", cantidad: 2 }],
    });

    expect(
      normalizarLoteLimpieza({
        lote_id: "lote-1",
        estado: "EN_PROCESO",
        total: 28,
        movidos: 0,
        omitidos: 0,
        fallidos: 0,
        limite_ejecucion_alcanzado: true,
      }),
    ).toEqual({
      loteId: "lote-1",
      estado: "EN_PROCESO",
      total: 28,
      movidos: 0,
      omitidos: 0,
      fallidos: 0,
      limiteEjecucionAlcanzado: true,
    });
  });

  it("lee y guarda la configuración delegando en el servicio de Gmail", async () => {
    obtenerConfiguracionPapeleraGmail.mockResolvedValue({
      categorias: [],
      antiguedad_minima_dias: 7,
      limite_por_ejecucion: 200,
      scope_autorizado: false,
    });
    guardarConfiguracionPapeleraGmail.mockResolvedValue({
      categorias: [],
      antiguedad_minima_dias: 21,
      limite_por_ejecucion: 10,
      scope_autorizado: true,
    });

    const config = await obtenerConfiguracionPapelera("cuenta-a");
    expect(config.scopeAutorizado).toBe(false);
    expect(config.antiguedadMinimaDias).toBe(7);

    const guardada = await guardarConfiguracionPapelera("cuenta-a", {
      categoriasActivas: ["CATEGORY_SOCIAL"],
      antiguedadMinimaDias: 21,
      limitePorEjecucion: 10,
      advertenciaAceptada: false,
    });
    expect(guardarConfiguracionPapeleraGmail).toHaveBeenCalledWith("cuenta-a", {
      categoriasActivas: ["CATEGORY_SOCIAL"],
      antiguedadMinimaDias: 21,
      limitePorEjecucion: 10,
      advertenciaAceptada: false,
    });
    expect(guardada.antiguedadMinimaDias).toBe(21);
    expect(guardada.limitePorEjecucion).toBe(10);
  });

  it("genera la vista previa y sigue el lote de limpieza", async () => {
    generarVistaPreviaPapeleraGmail.mockResolvedValue({
      vista_previa_id: "vp-1",
      total_estimado: 3,
      por_categoria: [],
      excluidos_por_motivo: [],
    });
    const previa = await generarVistaPreviaPapelera("cuenta-a", {
      categorias: ["CATEGORY_PROMOTIONS"],
      antiguedadMinimaDias: 7,
    });
    expect(generarVistaPreviaPapeleraGmail).toHaveBeenCalledWith("cuenta-a", {
      categorias: ["CATEGORY_PROMOTIONS"],
      antiguedadMinimaDias: 7,
    });
    expect(previa.vistaPreviaId).toBe("vp-1");

    iniciarLimpiezaPapeleraGmail.mockResolvedValue({
      lote_id: "lote-1",
      estado: "EN_PROCESO",
    });
    const inicio = await iniciarLimpiezaPapelera("cuenta-a", {
      vistaPreviaId: "vp-1",
      totalEstimado: 3,
    });
    expect(iniciarLimpiezaPapeleraGmail).toHaveBeenCalledWith("cuenta-a", {
      vistaPreviaId: "vp-1",
      totalEstimado: 3,
    });
    expect(inicio).toEqual({ loteId: "lote-1", estado: "EN_PROCESO" });

    obtenerEstadoLimpiezaPapeleraGmail.mockResolvedValue({
      lote_id: "lote-1",
      estado: "COMPLETADO",
      total: 3,
      movidos: 3,
      omitidos: 0,
      fallidos: 0,
    });
    const estado = await obtenerEstadoLimpiezaPapelera("cuenta-a", "lote-1");
    expect(estado).toMatchObject({ estado: "COMPLETADO", movidos: 3 });
  });

  it("gestiona la lista blanca delegando en el servicio de Gmail", async () => {
    listarListaBlancaGmail.mockResolvedValue({
      remitentes: [{ id: "c-1", remitente: "banco@banco.com" }],
    });
    agregarRemitenteListaBlancaGmail.mockResolvedValue({
      id: "c-2",
      remitente: "otro@ejemplo.test",
    });
    eliminarRemitenteListaBlancaGmail.mockResolvedValue(undefined);

    await expect(listarListaBlanca("cuenta-a")).resolves.toEqual([
      { id: "c-1", remitente: "banco@banco.com" },
    ]);
    await expect(
      agregarRemitenteListaBlanca("cuenta-a", "otro@ejemplo.test"),
    ).resolves.toEqual({ id: "c-2", remitente: "otro@ejemplo.test" });
    await expect(
      eliminarRemitenteListaBlanca("cuenta-a", "c-2"),
    ).resolves.toBeUndefined();

    expect(agregarRemitenteListaBlancaGmail).toHaveBeenCalledWith(
      "cuenta-a",
      "otro@ejemplo.test",
    );
    expect(eliminarRemitenteListaBlancaGmail).toHaveBeenCalledWith(
      "cuenta-a",
      "c-2",
    );
  });
});
