import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { AlertasProvider } from "../../../../context/AlertasContext";

const mocksServicio = vi.hoisted(() => ({
  obtenerConexiones: vi.fn(),
  conectarGoogleDrive: vi.fn(),
  listarArchivos: vi.fn(),
  descargarArchivo: vi.fn(),
  enviarAPapelera: vi.fn(),
  urlContenido: vi.fn(() => "http://contenido"),
  urlPrevisualizacion: vi.fn(() => "http://prev"),
}));

vi.mock("../../../../features/almacenamiento/services/almacenamientoServicio", () => mocksServicio);

import AlmacenamientoPage from "../../../../features/almacenamiento/pages/AlmacenamientoPage";

const renderizarPagina = () =>
  render(
    <MemoryRouter>
      <AlertasProvider>
        <AlmacenamientoPage />
      </AlertasProvider>
    </MemoryRouter>
  );

describe("AlmacenamientoPage — navegador de archivos", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.confirm = vi.fn(() => true);
    mocksServicio.obtenerConexiones.mockResolvedValue([
      { id: "cuenta-1", proveedor: "GOOGLE_DRIVE", etiquetaCuenta: "demo@correo.com", estado: "ACTIVA" },
    ]);
    mocksServicio.listarArchivos.mockImplementation(async (_cuentaId, params = {}) => {
      if (params.vista === "papelera") return { items: [{ id: "arch-p", nombre: "Borrado", tipo: "archivo" }] };
      return { items: [
        { id: "carp-1", nombre: "Finanzas", tipo: "carpeta" },
        { id: "arch-1", nombre: "Factura.pdf", tipo: "archivo", mime: "application/pdf", tamanio: 1024 },
      ], ruta: [{ id: "root", nombre: "Mi unidad" }] };
    });
  });

  it("renderiza la navegación de vistas y la cuenta activa", async () => {
    renderizarPagina();

    const navegacion = await screen.findByRole("navigation", { name: "Navegación de archivos" });
    expect(within(navegacion).getByRole("button", { name: "Mi unidad" })).toHaveAttribute("aria-current", "page");
    expect(within(navegacion).getByRole("button", { name: "Destacados" })).toBeInTheDocument();
    expect(await screen.findByLabelText("Cuenta conectada")).toBeInTheDocument();
    expect(await screen.findByText(/Activa/i)).toBeInTheDocument();
  });

  it("muestra los archivos de la cuenta en Mi unidad", async () => {
    renderizarPagina();
    expect(await screen.findByText("Finanzas")).toBeInTheDocument();
    expect(await screen.findByText("Factura.pdf")).toBeInTheDocument();
  });

  it("filtra los archivos visibles con la barra de búsqueda", async () => {
    renderizarPagina();
    const usuario = userEvent.setup();
    const busqueda = await screen.findByLabelText("Buscar en tu unidad");
    await usuario.type(busqueda, "Factura");
    await waitFor(() => expect(mocksServicio.listarArchivos).toHaveBeenCalledWith("cuenta-1", expect.objectContaining({ busqueda: "Factura" })));
  });

  it("envía a papelera desde el menú contextual", async () => {
    mocksServicio.enviarAPapelera.mockResolvedValue({ ok: true });
    renderizarPagina();
    const usuario = userEvent.setup();
    const carpeta = await screen.findByText("Finanzas");

    fireEvent.contextMenu(carpeta, { clientX: 120, clientY: 120 });
    await usuario.click(screen.getByRole("menuitem", { name: "Mover a papelera" }));

    await waitFor(() => expect(mocksServicio.enviarAPapelera).toHaveBeenCalledWith("cuenta-1", { ids: ["carp-1"] }));
  });
});
