import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { consultarCorreosDeFuentes, consultarEstadoCorreos } from "../../../../features/correos/services/correosService";
import { obtenerFuentesPorUsuario } from "../../../../services/fuenteServicio";
import { useCorreos } from "../../../../features/correos/hooks/useCorreos";

const gmail = vi.hoisted(() => {
  const cuentasGmail = [
    { id: "cuenta-a", email: "a@ejemplo.test" },
    { id: "cuenta-b", email: "b@ejemplo.test" },
  ];
  return {
    cuentasGmail,
    valor: {
      gmailConectado: true,
      cuentaGmail: "a@ejemplo.test",
      cuentasGmail,
      cuentaSeleccionadaId: "cuenta-a",
      seleccionarCuentaGmail: () => {},
      conexionCargando: false,
      desconectarGmail: () => {},
    },
  };
});

vi.mock("../../../../context/UsuarioActivoContext", () => ({
  useUsuarioActivo: () => ({ usuario: { idUsuario: "usuario-1" } }),
}));

vi.mock("../../../../context/GmailContext", () => ({
  useGmail: () => gmail.valor,
}));

vi.mock("../../../../services/fuenteServicio", () => ({
  obtenerFuentesPorUsuario: vi.fn(),
}));

vi.mock("../../../../services/gmailServicio", () => ({
  invalidarCacheConsultasGmail: vi.fn(),
}));

vi.mock("../../../../features/correos/services/correosService", () => ({
  consultarCorreosDeFuente: vi.fn(),
  consultarCorreosDeFuentes: vi.fn(),
  consultarEstadoCorreos: vi.fn(),
}));

const FUENTE_A = { idFuente: "fuente-a", tipo: "CORREO", contenido: "a@ejemplo.test", estado: true };
const FUENTE_B = { idFuente: "fuente-b", tipo: "CORREO", contenido: "b@ejemplo.test", estado: true };

beforeEach(() => {
  vi.clearAllMocks();
  obtenerFuentesPorUsuario.mockResolvedValue([FUENTE_A, FUENTE_B]);
  consultarEstadoCorreos.mockResolvedValue({ en_espera: 0, procesando: 0 });
  consultarCorreosDeFuentes.mockImplementation(async (cuentaId, fuentes) =>
    fuentes.map((fuente) => [fuente.idFuente, [{ id: `msg-${cuentaId}-${fuente.idFuente}`, destinatario: fuente.contenido }]]));
});

describe("useCorreos · consulta por cuenta", () => {
  it("consulta cada cuenta solo con sus fuentes y conserva los mensajes de todas", async () => {
    const { result } = renderHook(() => useCorreos());

    await waitFor(() => expect(consultarCorreosDeFuentes).toHaveBeenCalledTimes(2));

    expect(consultarCorreosDeFuentes).toHaveBeenCalledWith("cuenta-a", [FUENTE_A]);
    expect(consultarCorreosDeFuentes).toHaveBeenCalledWith("cuenta-b", [FUENTE_B]);
    await waitFor(() => {
      expect(result.current.mensajesPorFuente["fuente-a"]?.[0]?.id).toBe("msg-cuenta-a-fuente-a");
      expect(result.current.mensajesPorFuente["fuente-b"]?.[0]?.id).toBe("msg-cuenta-b-fuente-b");
    });
    expect(result.current.mensajesPorFuente["fuente-a"]).toHaveLength(1);
    expect(result.current.mensajesPorFuente["fuente-b"]).toHaveLength(1);
  });
});
