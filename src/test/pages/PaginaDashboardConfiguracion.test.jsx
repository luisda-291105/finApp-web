import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import PaginaDashboardConfiguracion from "./PaginaDashboardConfiguracion";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  window.localStorage.setItem.mockClear();
});

describe("PaginaDashboardConfiguracion", () => {
  it("abre Fuentes, mantiene el botón en modo demo y descarta los valores al cerrar", async () => {
    const usuario = userEvent.setup();
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const guardarLocalSpy = vi.spyOn(window.localStorage, "setItem");
    const guardarSesionSpy = vi.spyOn(window.sessionStorage, "setItem");

    render(<PaginaDashboardConfiguracion />);

    expect(
      screen.getByRole("heading", { name: "Configuración", level: 1 })
    ).toBeInTheDocument();
    expect(
      screen.getByText("Ajusta tus preferencias de cuenta y seguridad.")
    ).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    const disparador = screen.getByRole("button", { name: "Registrar fuentes" });
    await usuario.click(disparador);

    const dialogo = screen.getByRole("dialog", { name: "Registro de fuentes" });
    const correo = within(dialogo).getByRole("textbox", {
      name: "Correo electrónico",
    });
    const telefono = within(dialogo).getByRole("textbox", { name: "Teléfono" });

    await usuario.type(correo, "persona@ejemplo.test");
    await usuario.type(telefono, "5550100");
    await usuario.click(
      within(dialogo).getByRole("button", { name: "Botón de demostración" })
    );

    expect(correo).toHaveValue("persona@ejemplo.test");
    expect(telefono).toHaveValue("5550100");
    expect(dialogo.querySelector("form")).toBeNull();
    expect(
      within(dialogo).queryByText(/conectad[oa]|registrad[oa]/i)
    ).not.toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(guardarLocalSpy).not.toHaveBeenCalled();
    expect(guardarSesionSpy).not.toHaveBeenCalled();

    await usuario.click(
      within(dialogo).getByRole("button", { name: "Cerrar registro de fuentes" })
    );
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
    expect(disparador).toHaveFocus();

    await usuario.click(disparador);
    expect(
      screen.getByRole("textbox", { name: "Correo electrónico" })
    ).toHaveValue("");
    expect(screen.getByRole("textbox", { name: "Teléfono" })).toHaveValue("");
  });
});
