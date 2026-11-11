import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import ImportarCorreosFinancieros from "../../../../features/correos/components/ImportarCorreosFinancieros";

const mocks = vi.hoisted(() => ({
  guardarCorreoPorRevisar: vi.fn(),
  listarCorreosImportados: vi.fn(),
  obtenerContenidoCorreosFinancierosGmail: vi.fn(),
  listarNotificacionesMovimientosGmail: vi.fn(),
  confirmarNotificacionesMovimientosGmail: vi.fn(),
  extraerMovimientoSugerido: vi.fn(),
}));

vi.mock("../../../../context/GmailContext", () => ({
  useGmail: () => ({ gmailConectado: true, cuentaGmail: "usuario@gmail.com", cuentaSeleccionadaId: "cuenta-1" }),
}));
vi.mock("../../../../features/contabilidad/services/movimientosService", () => ({
  guardarCorreoPorRevisar: mocks.guardarCorreoPorRevisar,
  listarCorreosImportados: mocks.listarCorreosImportados,
}));
vi.mock("../../../../services/gmailServicio", () => ({
  confirmarNotificacionesMovimientosGmail: mocks.confirmarNotificacionesMovimientosGmail,
  listarNotificacionesMovimientosGmail: mocks.listarNotificacionesMovimientosGmail,
  obtenerContenidoCorreosFinancierosGmail: mocks.obtenerContenidoCorreosFinancierosGmail,
}));
vi.mock("../../../../features/correos/utils/correoFinancieroHelpers", () => ({
  esCandidatoFinanciero: () => true,
  extraerMovimientoSugerido: mocks.extraerMovimientoSugerido,
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("ImportarCorreosFinancieros", () => {
  it("envía una sugerencia a Por revisar en lugar de pedir un bolsillo de gasto o ingreso", async () => {
    mocks.listarNotificacionesMovimientosGmail.mockResolvedValue([]);
    mocks.obtenerContenidoCorreosFinancierosGmail.mockResolvedValue([{ id: "gmail-1", asunto: "Alerta" }]);
    mocks.extraerMovimientoSugerido.mockReturnValue({
      idCorreo: "gmail-1", origenId: "cuenta-1:gmail-1", tipo: "GASTO", fecha: "2026-11-09",
      monto: 300000, categoria: "Retiros", concepto: "Retiro", remitente: "alertas@banco.test",
    });
    mocks.listarCorreosImportados.mockResolvedValue([]);
    mocks.guardarCorreoPorRevisar.mockResolvedValue({});

    render(<ImportarCorreosFinancieros mensajes={[{ id: "gmail-1" }]} />);

    await waitFor(() => expect(mocks.guardarCorreoPorRevisar).toHaveBeenCalledWith({
      idBolsillo: null, tipo: "GASTO", fecha: "2026-11-09", monto: 300000,
      categoria: "Retiros", concepto: "Retiro", origenTipo: "GMAIL",
      origenId: "cuenta-1:gmail-1", origenNombre: "alertas@banco.test",
    }));
    await waitFor(() => expect(screen.getByText(/enviado a Contabilidad · Por revisar/)).toBeInTheDocument());
    expect(screen.queryByText("Confirmar importación")).not.toBeInTheDocument();
  });
});
