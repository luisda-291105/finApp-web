import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import PaginaDashboardContabilidad from "../../pages/PaginaDashboardContabilidad";
import { listarBolsillos } from "../../services/bolsilloServicio";
import { listarMovimientos, obtenerResumenesBolsillos } from "../../services/movimientoContableServicio";

vi.mock("../../context/UsuarioActivoContext", () => ({
  useUsuarioActivo: () => ({ usuario: { idUsuario: "usuario-prueba", nombre: "Ana Pérez" } }),
}));
vi.mock("../../services/bolsilloServicio", () => ({
  listarBolsillos: vi.fn(), crearBolsillo: vi.fn(), actualizarBolsillo: vi.fn(), eliminarBolsillo: vi.fn(),
}));
vi.mock("../../services/movimientoContableServicio", () => ({
  listarMovimientos: vi.fn(), crearMovimiento: vi.fn(), actualizarMovimiento: vi.fn(),
  eliminarMovimiento: vi.fn(), obtenerResumenesBolsillos: vi.fn(),
}));
vi.mock("../../services/tarjetaServicio", () => ({ obtenerTarjetasPorUsuario: vi.fn().mockResolvedValue([]) }));

const BOLSILLOS = [
  { idBolsillo: "gasto-1", nombre: "Gastos diarios", tipo: "GASTO", estado: true, montoObjetivo: 0 },
  { idBolsillo: "ingreso-1", nombre: "Nómina", tipo: "INGRESO", estado: true, montoObjetivo: 0 },
];
const MOVIMIENTOS = [
  { idMovimiento: "mov-1", bolsillo: BOLSILLOS[0], categoria: "Gasolina", tipo: "GASTO", monto: 11000, fecha: "2026-11-05" },
];

beforeEach(() => {
  vi.clearAllMocks();
  listarBolsillos.mockResolvedValue(BOLSILLOS);
  listarMovimientos.mockResolvedValue(MOVIMIENTOS);
  obtenerResumenesBolsillos.mockResolvedValue([]);
});
afterEach(cleanup);

function renderPagina() {
  return render(<MemoryRouter><PaginaDashboardContabilidad /></MemoryRouter>);
}

describe("PaginaDashboardContabilidad", () => {
  it("carga bolsillos y consulta los movimientos del usuario en la sección contable", async () => {
    renderPagina();
    expect(await screen.findByRole("heading", { name: "Contabilidad" })).toBeInTheDocument();
    expect(await screen.findByText("Gastos diarios")).toBeInTheDocument();
    expect(listarBolsillos).toHaveBeenCalled();
    await waitFor(() => expect(listarMovimientos).toHaveBeenCalledWith(null, "TODOS"));
    expect(screen.getByRole("heading", { name: "Movimientos de todos los bolsillos" })).toBeInTheDocument();
  });

  it("filtra todos los bolsillos por tipo de movimiento", async () => {
    const usuario = userEvent.setup();
    renderPagina();
    await screen.findByText("Gastos diarios");
    await usuario.click(screen.getByRole("button", { name: "Ingresos" }));
    expect(listarMovimientos).toHaveBeenLastCalledWith(null, "INGRESO");
  });

  it("abre el formulario de movimiento con bolsillos disponibles", async () => {
    const usuario = userEvent.setup();
    renderPagina();
    await screen.findByText("Gastos diarios");
    await usuario.click(screen.getByRole("button", { name: "Nuevo movimiento" }));
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getByLabelText("Bolsillo")).toBeInTheDocument();
    expect(screen.getByLabelText("Fecha")).toBeInTheDocument();
    expect(screen.getByLabelText("Monto (COP)")).toBeInTheDocument();
    expect(screen.getByLabelText("Categoría")).toBeInTheDocument();
    expect(screen.getByLabelText("Concepto (opcional)")).toBeInTheDocument();
  });
});
