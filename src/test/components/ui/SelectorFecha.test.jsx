/**
 * @uso        Pruebas unitarias del SelectorFecha (popover de calendario personalizado)
 * @funciones  render, apertura del popover, selección de día, Escape, navegación entre meses, botón Hoy
 * @datos      N/A
 * @eventos    N/A
 * @estados    N/A
 * @usadoPor   vitest (npm run test)
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SelectorFecha } from "../../../components/ui";

afterEach(cleanup);

describe("SelectorFecha", () => {
  it("muestra la fecha seleccionada en el disparador y abre el popover al hacer clic", async () => {
    const usuario = userEvent.setup();
    render(
      <SelectorFecha id="fecha-prueba" value="2026-11-18" onChange={() => {}} />,
    );

    const disparador = screen.getByRole("button", {
      name: /18 de noviembre de 2026/i,
    });
    expect(disparador.getAttribute("aria-expanded")).toBe("false");

    await usuario.click(disparador);

    expect(
      screen.getByRole("dialog", { name: "Elegir fecha" }),
    ).toBeInTheDocument();
    expect(disparador.getAttribute("aria-expanded")).toBe("true");
  });

  it("al elegir un día llama a onChange con la cadena ISO y cierra el popover", async () => {
    const usuario = userEvent.setup();
    const onChange = vi.fn();
    render(<SelectorFecha id="fecha-prueba" value="2026-11-18" onChange={onChange} />);

    await usuario.click(
      screen.getByRole("button", { name: /18 de noviembre de 2026/i }),
    );
    await usuario.click(
      screen.getByRole("button", { name: /20 de noviembre de 2026/i }),
    );

    expect(onChange).toHaveBeenCalledWith("2026-11-20");
    expect(screen.queryByRole("dialog", { name: "Elegir fecha" })).toBeNull();
  });

  it("Escape cierra el popover y devuelve el foco al disparador", async () => {
    const usuario = userEvent.setup();
    render(
      <SelectorFecha id="fecha-prueba" value="2026-11-18" onChange={() => {}} />,
    );

    const disparador = screen.getByRole("button", {
      name: /18 de noviembre de 2026/i,
    });
    await usuario.click(disparador);

    const dia = screen.getByRole("button", {
      name: /Miércoles, 18 de noviembre de 2026/i,
    });
    fireEvent.keyDown(dia, { key: "Escape" });

    expect(screen.queryByRole("dialog", { name: "Elegir fecha" })).toBeNull();
    expect(document.activeElement).toBe(disparador);
  });

  it("navega al mes siguiente y al anterior", async () => {
    const usuario = userEvent.setup();
    render(
      <SelectorFecha id="fecha-prueba" value="2026-11-18" onChange={() => {}} />,
    );

    await usuario.click(
      screen.getByRole("button", { name: /18 de noviembre de 2026/i }),
    );
    await usuario.click(screen.getByRole("button", { name: "Mes siguiente" }));
    expect(screen.getByText("Diciembre de 2026")).toBeInTheDocument();

    await usuario.click(screen.getByRole("button", { name: "Mes anterior" }));
    await usuario.click(screen.getByRole("button", { name: "Mes anterior" }));
    expect(screen.getByText("Octubre de 2026")).toBeInTheDocument();
  });
});
