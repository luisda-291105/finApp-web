import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { ContabilidadPage as PaginaDashboardContabilidad } from "../../features/contabilidad";
import { listarBolsillos } from "../../features/contabilidad/services/bolsillosService";
import { listarMovimientos, obtenerResumenesBolsillos, obtenerResumenGlobal } from "../../features/contabilidad/services/movimientosService";

vi.mock("../../context/UsuarioActivoContext", () => ({
  useUsuarioActivo: () => ({ usuario: { idUsuario: "usuario-prueba", nombre: "Ana Pérez" } }),
}));
vi.mock("../../features/contabilidad/services/bolsillosService", () => ({
  listarBolsillos: vi.fn(), crearBolsillo: vi.fn(), actualizarBolsillo: vi.fn(), eliminarBolsillo: vi.fn(),
}));
vi.mock("../../features/contabilidad/services/movimientosService", () => ({
  listarMovimientos: vi.fn(), crearMovimiento: vi.fn(), actualizarMovimiento: vi.fn(),
  eliminarMovimiento: vi.fn(), obtenerResumenesBolsillos: vi.fn(), obtenerResumenGlobal: vi.fn(),
}));
vi.mock("../../features/tarjetas/services/tarjetasService", () => ({ obtenerTarjetasPorUsuario: vi.fn().mockResolvedValue([]) }));

const BOLSILLOS = [
  { idBolsillo: "fijo-ingreso", nombre: "Ingresos", tipo: "INGRESO", estado: true, montoObjetivo: 0 },
  { idBolsillo: "fijo-gasto", nombre: "Gastos", tipo: "GASTO", estado: true, montoObjetivo: 0 },
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
  obtenerResumenGlobal.mockResolvedValue({ ingresos: 0, gastos: 0, ahorros: 0, transferencias: 0, saldoAhorros: 0, porRevisar: 0 });
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
    const ahora = new Date();
    expect(obtenerResumenGlobal).toHaveBeenCalledWith(`${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, "0")}`);
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

  it("solicita nuevamente el resumen cuando cambia el mes", async () => {
    renderPagina();
    const selectorMes = await screen.findByLabelText("Mes");
    fireEvent.change(selectorMes, { target: { value: "2026-05" } });
    await waitFor(() => expect(obtenerResumenGlobal).toHaveBeenLastCalledWith("2026-05"));
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

  it("muestra una sola card dividida para los fijos y preselecciona el bolsillo al registrar", async () => {
    const usuario = userEvent.setup();
    renderPagina();
    const rejilla = await screen.findByRole("region", { name: "Bolsillos" });
    const cardFijos = within(rejilla).getByRole("article", { name: "Bolsillos fijos" });
    expect(within(cardFijos).getByText("Ingresos")).toBeInTheDocument();
    expect(within(cardFijos).getByText("Gastos")).toBeInTheDocument();
    expect(within(rejilla).queryAllByText("Fijo")).toHaveLength(0);

    await usuario.click(within(cardFijos).getByRole("button", { name: "Registrar movimiento en Gastos" }));
    const dialogo = await screen.findByRole("dialog", { name: "Nuevo movimiento" });
    expect(within(dialogo).getByLabelText("Bolsillo").value).toBe("fijo-gasto");
  });

  it("ofrece los bolsillos fijos primero en el formulario de movimiento", async () => {
    const usuario = userEvent.setup();
    renderPagina();
    await screen.findByText("Gastos diarios");
    await usuario.click(screen.getByRole("button", { name: "Nuevo movimiento" }));
    const dialogo = await screen.findByRole("dialog", { name: "Nuevo movimiento" });
    const opciones = within(dialogo).getByLabelText("Bolsillo").querySelectorAll("option:not([disabled])");
    expect(Array.from(opciones).map((opcion) => opcion.textContent)).toEqual([
      "Ingresos · INGRESO · Fijo", "Gastos · GASTO · Fijo", "Gastos diarios · GASTO", "Nómina · INGRESO",
    ]);
  });
});
