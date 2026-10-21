import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import LogMovimientos, { formatearFechaCorta } from "../../../../components/domain/dashboard/LogMovimientos";
import { MOVIMIENTOS_DEMO } from "../../../../data/tarjetasDemo";

describe("LogMovimientos (spec 004, RF8-RF10)", () => {
  it("renderiza los movimientos del fixture con fecha, descripción, categoría y monto con signo", () => {
    render(<LogMovimientos movimientos={MOVIMIENTOS_DEMO["tarjeta-menta"]} />);

    const lista = screen.getByRole("list");
    const entradas = within(lista).getAllByRole("listitem");
    expect(entradas).toHaveLength(3);
    expect(screen.getByText("Farmacia San Roque")).toBeDefined();
    expect(screen.getByText("Salud")).toBeDefined();
    expect(screen.getByText("-23.75")).toBeDefined();
    expect(screen.getByText("+59.90")).toBeDefined();
  });

  it("ordena descendente por fecha aunque la fuente esté desordenada", () => {
    const desordenados = [
      { id: "m1", fecha: "2026-10-03", descripcion: "Antiguo", categoria: "Ocio", monto: -10 },
      { id: "m2", fecha: "2026-10-15", descripcion: "Reciente", categoria: "Ocio", monto: -20 },
      { id: "m3", fecha: "2026-10-08", descripcion: "Medio", categoria: "Ocio", monto: -30 },
    ];
    render(<LogMovimientos movimientos={desordenados} />);

    const entradas = within(screen.getByRole("list")).getAllByRole("listitem");
    const textos = entradas.map((li) => li.textContent);
    expect(textos[0]).toContain("Reciente");
    expect(textos[1]).toContain("Medio");
    expect(textos[2]).toContain("Antiguo");
  });

  it('formatea las fechas ISO como "12 oct 2026" sin depender del locale del SO', () => {
    render(<LogMovimientos movimientos={MOVIMIENTOS_DEMO["tarjeta-azul"]} />);

    expect(screen.getByText("12 oct 2026")).toBeDefined();
    expect(screen.getByText("1 oct 2026")).toBeDefined();
    expect(screen.getByText("8 oct 2026")).toBeDefined();
  });

  it("aplica tokens distintos a montos positivos y negativos y fuente tabular", () => {
    render(<LogMovimientos movimientos={MOVIMIENTOS_DEMO["tarjeta-azul"]} />);

    const ingreso = screen.getByText("+2450.00");
    expect(ingreso.classList.contains("text-cat-income")).toBe(true);
    expect(ingreso.classList.contains("tabular-nums")).toBe(true);

    const gasto = screen.getByText("-82.40");
    expect(gasto.classList.contains("text-cat-expense")).toBe(true);
    expect(gasto.classList.contains("tabular-nums")).toBe(true);
  });

  it('muestra "Sin movimientos este mes" cuando la lista está vacía', () => {
    render(<LogMovimientos movimientos={[]} />);

    expect(screen.getByText("Sin movimientos este mes")).toBeDefined();
    expect(screen.queryByRole("list")).toBeNull();
  });

  it("muestra el estado vacío cuando movimientos es undefined", () => {
    render(<LogMovimientos />);

    expect(screen.getByText("Sin movimientos este mes")).toBeDefined();
    expect(screen.queryByRole("list")).toBeNull();
  });
});

describe("formatearFechaCorta (spec 012, RF-08/RF-09)", () => {
  it.each([
    ["2026-10-12", "12 oct 2026"],
    ["2026-10-01", "1 oct 2026"],
    ["2026-01-01", "1 ene 2026"],
    ["2026-03-31", "31 mar 2026"],
    ["2026-12-31", "31 dic 2026"],
    ["2026-10-99", "99 oct 2026"],
    ["0000-01-01", "1 ene 0"],
  ])('AC-06: formatea la fecha válida "%s" como "%s"', (fechaISO, esperado) => {
    expect(formatearFechaCorta(fechaISO)).toBe(esperado);
  });

  it.each([
    "2026-00-12",
    "2026-13-12",
    "2026-99-12",
    "2026-XX-12",
    "2026-10-1",
    "2026-1-12",
    "26-10-12",
    " 2026-10-12",
    "12-10-2026",
    "no-es-fecha",
    "",
  ])('AC-07: devuelve el texto neutro para la entrada inválida "%s"', (fechaISO) => {
    const resultado = formatearFechaCorta(fechaISO);

    expect(resultado).toBe("—");
    expect(resultado).not.toContain("undefined");
    expect(resultado).not.toContain("NaN");
  });
});
