import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import GridTarjetas from "./GridTarjetas";
import { TARJETAS_DEMO } from "../../../data/tarjetasDemo";

describe("GridTarjetas (tablet/desktop)", () => {
  it("renderiza las 5 tarjetas con frente completo visible (titular, número, expiración, entidad)", () => {
    render(<GridTarjetas tarjetas={TARJETAS_DEMO} onSeleccionarTarjeta={vi.fn()} />);
    for (const tarjeta of TARJETAS_DEMO) {
      expect(screen.getByText(tarjeta.titular)).toBeTruthy();
      expect(screen.getByText(tarjeta.numero)).toBeTruthy();
      expect(screen.getByText(tarjeta.expiracion)).toBeTruthy();
    }
    expect(screen.getAllByTestId("tarjeta-frente")).toHaveLength(5);
  });

  it("las tarjetas no exponen flip (sin aria-pressed ni pill de CVV); un control accesible por tarjeta", () => {
    render(<GridTarjetas tarjetas={TARJETAS_DEMO} onSeleccionarTarjeta={vi.fn()} />);
    expect(screen.queryByText("Toca para ver CVV")).toBeNull();
    expect(screen.queryAllByRole("button", { pressed: undefined }).length).toBeGreaterThanOrEqual(5);
    expect(screen.queryByRole("button", { name: /reverso de la tarjeta/i })).toBeNull();
    const controles = screen.getAllByRole("button", { name: /Ver detalle de la tarjeta de/i });
    expect(controles).toHaveLength(5);
  });

  it("el contenedor usa doble render por clases: hidden sm:grid sm:grid-cols-2 lg:grid-cols-3", () => {
    const { container } = render(
      <GridTarjetas tarjetas={TARJETAS_DEMO} onSeleccionarTarjeta={vi.fn()} />
    );
    const grid = container.firstChild;
    for (const clase of ["hidden", "sm:grid", "sm:grid-cols-2", "lg:grid-cols-3"]) {
      expect(grid.className).toContain(clase);
    }
  });

  it("un clic sobre una tarjeta dispara onSeleccionarTarjeta con la tarjeta correcta, una sola vez", async () => {
    const usuario = userEvent.setup();
    const onSeleccionarTarjeta = vi.fn();
    render(<GridTarjetas tarjetas={TARJETAS_DEMO} onSeleccionarTarjeta={onSeleccionarTarjeta} />);
    const control = screen.getByRole("button", {
      name: `Ver detalle de la tarjeta de ${TARJETAS_DEMO[2].titular}`,
    });
    await usuario.click(control);
    expect(onSeleccionarTarjeta).toHaveBeenCalledTimes(1);
    expect(onSeleccionarTarjeta).toHaveBeenCalledWith(TARJETAS_DEMO[2]);
  });

  it("Enter y Espacio disparan onSeleccionarTarjeta por teclado", async () => {
    const usuario = userEvent.setup();
    const onSeleccionarTarjeta = vi.fn();
    render(<GridTarjetas tarjetas={TARJETAS_DEMO} onSeleccionarTarjeta={onSeleccionarTarjeta} />);
    const control = screen.getByRole("button", {
      name: `Ver detalle de la tarjeta de ${TARJETAS_DEMO[1].titular}`,
    });
    control.focus();
    await usuario.keyboard("{Enter}");
    expect(onSeleccionarTarjeta).toHaveBeenCalledWith(TARJETAS_DEMO[1]);
    await usuario.keyboard(" ");
    expect(onSeleccionarTarjeta).toHaveBeenCalledTimes(2);
  });

  it("el wrapper interactivo no colisiona con flipDeshabilitado interno (único role=button por celda)", () => {
    render(<GridTarjetas tarjetas={TARJETAS_DEMO} onSeleccionarTarjeta={vi.fn()} />);
    const controles = screen.getAllByRole("button");
    expect(controles).toHaveLength(5);
  });
});
