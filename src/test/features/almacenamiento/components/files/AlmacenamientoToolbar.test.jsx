/**
 * @uso        Pruebas del toolbar del navegador de archivos
 * @funciones  AlmacenamientoToolbar({ ... })
 * @datos      Mocks de useBreakpoint para móvil/escritorio y callbacks
 * @eventos    Clic en «Vista de cuadrícula» y «Vista de lista»
 * @estados    avisoVista
 * @usadoPor   Vitest
 */
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import AlmacenamientoToolbar from "../../../../../features/almacenamiento/components/files/AlmacenamientoToolbar";
import { useBreakpoint } from "../../../../../hooks/useBreakpoint";

vi.mock("../../../../../hooks/useBreakpoint", () => ({ useBreakpoint: vi.fn() }));

beforeEach(() => {
  vi.clearAllMocks();
  useBreakpoint.mockReturnValue({ isMobile: false });
});
afterEach(cleanup);

describe("AlmacenamientoToolbar", () => {
  it("en escritorio cambia a vista de cuadrícula al pulsar «Vista de cuadrícula»", async () => {
    const usuario = userEvent.setup();
    const alCambiarModoVista = vi.fn();
    useBreakpoint.mockReturnValue({ isMobile: false });
    render(<AlmacenamientoToolbar busqueda="" alCambiarBusqueda={vi.fn()} modoVista="lista" alCambiarModoVista={alCambiarModoVista} alCrearCarpeta={vi.fn()} alSubirArchivos={vi.fn()} />);

    await usuario.click(screen.getByRole("button", { name: "Vista de cuadrícula" }));

    expect(alCambiarModoVista).toHaveBeenCalledWith("grid");
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("en móvil no cambia a cuadrícula y muestra un aviso temporal", async () => {
    const usuario = userEvent.setup();
    const alCambiarModoVista = vi.fn();
    useBreakpoint.mockReturnValue({ isMobile: true });
    render(<AlmacenamientoToolbar busqueda="" alCambiarBusqueda={vi.fn()} modoVista="lista" alCambiarModoVista={alCambiarModoVista} alCrearCarpeta={vi.fn()} alSubirArchivos={vi.fn()} />);

    await usuario.click(screen.getByRole("button", { name: "Vista de cuadrícula" }));

    expect(alCambiarModoVista).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent("En móvil solo está disponible la vista de lista.");
  });

  it("el botón de lista sigue activo en móvil", () => {
    useBreakpoint.mockReturnValue({ isMobile: true });
    render(<AlmacenamientoToolbar busqueda="" alCambiarBusqueda={vi.fn()} modoVista="grid" alCambiarModoVista={vi.fn()} alCrearCarpeta={vi.fn()} alSubirArchivos={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Vista de lista" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Vista de cuadrícula" })).toHaveAttribute("aria-pressed", "false");
  });
});
