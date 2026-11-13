import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import AlmacenamientoPage from "../../../../features/almacenamiento/pages/AlmacenamientoPage";

vi.mock("../../../features/almacenamiento/services/almacenamientoServicio", () => ({
  obtenerConexiones: vi.fn().mockResolvedValue([]),
  desconectarCuenta: vi.fn().mockResolvedValue(undefined),
  completarConexion: vi.fn().mockResolvedValue(undefined),
}));

const renderizarPagina = () =>
  render(
    <MemoryRouter>
      <AlmacenamientoPage />
    </MemoryRouter>
  );

describe("AlmacenamientoPage — navegador de archivos tipo Google Drive", () => {
  it("renderiza la navegación de vistas con Mi unidad como vista activa", () => {
    renderizarPagina();

    const navegacion = screen.getByRole("navigation", { name: "Navegación de archivos" });
    expect(within(navegacion).getByRole("button", { name: "Mi unidad" })).toHaveAttribute("aria-current", "page");
    expect(within(navegacion).getByRole("button", { name: "Recientes" })).toBeInTheDocument();
    expect(within(navegacion).getByRole("button", { name: "Compartidos conmigo" })).toBeInTheDocument();
    expect(within(navegacion).getByRole("button", { name: "Papelera" })).toBeInTheDocument();
  });

  it("muestra las carpetas del árbol demo en Mi unidad", async () => {
    renderizarPagina();

    expect(await screen.findByText("Finanzas")).toBeInTheDocument();
    expect(screen.getByText("Personal")).toBeInTheDocument();
  });

  it("filtra los archivos visibles con la barra de búsqueda", async () => {
    renderizarPagina();

    const busqueda = screen.getByLabelText("Buscar en tu unidad");
    await userEvent.type(busqueda, "finanzas");

    expect(await screen.findByText("Finanzas")).toBeInTheDocument();

    await userEvent.clear(busqueda);
    await userEvent.type(busqueda, "inexistente");
    expect(await screen.findByText("No hay coincidencias")).toBeInTheDocument();
  });

  it("abre el menú contextual y elimina el item a la papelera", async () => {
    renderizarPagina();

    const usuario = userEvent.setup();
    const carpeta = await screen.findByText("Finanzas");

    fireEvent.contextMenu(carpeta, { clientX: 120, clientY: 120 });
    await usuario.click(screen.getByRole("menuitem", { name: "Eliminar" }));

    await usuario.click(screen.getByRole("button", { name: "Papelera" }));

    expect(await screen.findByText("Finanzas")).toBeInTheDocument();
  });
});
