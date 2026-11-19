import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useNotificacionesCorreos } from "../../../../features/correos/hooks/useNotificacionesCorreos";
import {
  confirmarNotificacionesMovimientosGmail,
  listarNotificacionesMovimientosGmail,
} from "../../../../services/gmailServicio";

vi.mock("../../../../features/contabilidad/services/movimientosService", () => ({
  guardarCorreoPorRevisar: vi.fn(),
  listarCorreosImportados: vi.fn(),
}));

vi.mock("../../../../services/gmailServicio", () => ({
  confirmarNotificacionesMovimientosGmail: vi.fn(),
  listarNotificacionesMovimientosGmail: vi.fn(),
  obtenerContenidoCorreosFinancierosGmail: vi.fn(),
}));

const notificacion = (id, extra = {}) => ({
  id,
  asunto: `Asunto ${id}`,
  mensaje: "Mensaje de prueba",
  fecha: "2026-11-18T19:53:00Z",
  leida: false,
  origen: "movimiento-gmail",
  cuentaGmail: "cuenta@ejemplo.test",
  ...extra,
});

const BANDEJA = [
  notificacion("alerta-1"),
  notificacion("sync-1", { origen: "sincronizacion", cuentaGmail: "" }),
  notificacion("alerta-2", { leida: true }),
];

function renderBandeja() {
  return renderHook(() =>
    useNotificacionesCorreos({
      gmailConectado: false,
      cuentasGmail: [],
      mensajes: [],
    }),
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  window.localStorage.getItem.mockReturnValue(JSON.stringify(BANDEJA));
  listarNotificacionesMovimientosGmail.mockResolvedValue([]);
  confirmarNotificacionesMovimientosGmail.mockResolvedValue(undefined);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("useNotificacionesCorreos.marcarComoLeida", () => {
  it("marca solo la notificación abierta, actualiza el contador y persiste la bandeja", () => {
    const { result } = renderBandeja();
    expect(result.current.noLeidas).toBe(2);

    act(() => result.current.marcarComoLeida("alerta-1"));

    expect(
      result.current.notificaciones.find((n) => n.id === "alerta-1").leida,
    ).toBe(true);
    expect(
      result.current.notificaciones.find((n) => n.id === "sync-1").leida,
    ).toBe(false);
    expect(result.current.noLeidas).toBe(1);
    const ultimaEscritura = JSON.parse(
      window.localStorage.setItem.mock.calls.at(-1)[1],
    );
    expect(ultimaEscritura.find((n) => n.id === "alerta-1").leida).toBe(true);
  });

  it("confirma en Gmail solo las alertas de movimiento, no las de sincronización", () => {
    const { result } = renderBandeja();

    act(() => result.current.marcarComoLeida("alerta-1"));
    act(() => result.current.marcarComoLeida("sync-1"));

    expect(confirmarNotificacionesMovimientosGmail).toHaveBeenCalledTimes(1);
    expect(confirmarNotificacionesMovimientosGmail).toHaveBeenCalledWith([
      "alerta-1",
    ]);
  });

  it("no reprocesa una notificación ya leída", () => {
    const { result } = renderBandeja();
    const escriturasPrevias = window.localStorage.setItem.mock.calls.length;

    act(() => result.current.marcarComoLeida("alerta-2"));

    expect(confirmarNotificacionesMovimientosGmail).not.toHaveBeenCalled();
    expect(window.localStorage.setItem).toHaveBeenCalledTimes(escriturasPrevias);
  });

  it("conserva el marcado local aunque falle la confirmación remota", () => {
    confirmarNotificacionesMovimientosGmail.mockRejectedValueOnce(
      new Error("Gmail no responde"),
    );
    const { result } = renderBandeja();

    act(() => result.current.marcarComoLeida("alerta-1"));

    expect(
      result.current.notificaciones.find((n) => n.id === "alerta-1").leida,
    ).toBe(true);
    expect(result.current.noLeidas).toBe(1);
  });
});
