import { afterEach, describe, expect, it, vi } from "vitest";
import { crear, obtener } from "../../../services/httpServicio";
import { API_BASE_URL } from "../../../config/api.config";
import { confirmarMovimientoGmailGlobal, guardarCorreoPorRevisar, obtenerResumenGlobal } from "../../../features/contabilidad/services/movimientosService";

vi.mock("../../../services/httpServicio", () => ({
  crear: vi.fn(), obtener: vi.fn(), actualizar: vi.fn(), eliminar: vi.fn(),
}));

afterEach(() => vi.clearAllMocks());

describe("movimientosService.obtenerResumenGlobal", () => {
  it("consulta el resumen global con el mes seleccionado", () => {
    obtenerResumenGlobal("2026-05");

    expect(obtener).toHaveBeenCalledWith(`${API_BASE_URL}/movimiento/resumen-global?mes=2026-05`);
  });

  it("permite que el backend use el mes actual cuando no recibe mes", () => {
    obtenerResumenGlobal();

    expect(obtener).toHaveBeenCalledWith(`${API_BASE_URL}/movimiento/resumen-global`);
  });
});

describe("movimientosService review Gmail", () => {
  it("envía sugerencias Gmail al estado por revisar", () => {
    const sugerencia = { tipo: "GASTO", monto: 300000, origenTipo: "GMAIL", origenId: "cuenta:mensaje" };

    guardarCorreoPorRevisar(sugerencia);

    expect(crear).toHaveBeenCalledWith(`${API_BASE_URL}/movimiento/gmail/por-revisar`, sugerencia);
  });

  it("confirma el movimiento Gmail como global", () => {
    confirmarMovimientoGmailGlobal("mov-123");

    expect(crear).toHaveBeenCalledWith(`${API_BASE_URL}/movimiento/mov-123/confirmar-global`, {});
  });
});
