import { afterEach, describe, expect, it, vi } from "vitest";
import {
  listarPapeleraDeCuenta,
  listarPapeleraPorCuentas,
  moverCorreoAPapelera,
  normalizarCorreoPapelera,
  restaurarCorreoDePapelera,
} from "../../../../features/correos/services/papeleraService";
import {
  listarPapeleraGmail,
  moverMensajeAPapeleraGmail,
  restaurarMensajeDePapeleraGmail,
} from "../../../../services/gmailServicio";

vi.mock("../../../../services/gmailServicio", () => ({
  listarPapeleraGmail: vi.fn(),
  moverMensajeAPapeleraGmail: vi.fn(),
  restaurarMensajeDePapeleraGmail: vi.fn(),
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
});
