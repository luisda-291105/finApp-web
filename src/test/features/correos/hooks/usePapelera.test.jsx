import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  INTERVALO_ESTADO_MS,
  usePapelera,
} from "../../../../features/correos/hooks/usePapelera";
import {
  listarPapeleraPorCuentas,
  restaurarCorreoDePapelera,
} from "../../../../features/correos/services/papeleraService";

vi.mock("../../../../features/correos/services/papeleraService", () => ({
  listarPapeleraPorCuentas: vi.fn(),
  listarPapeleraDeCuenta: vi.fn(),
  moverCorreoAPapelera: vi.fn(),
  restaurarCorreoDePapelera: vi.fn(),
  normalizarCorreoPapelera: vi.fn(),
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
});
