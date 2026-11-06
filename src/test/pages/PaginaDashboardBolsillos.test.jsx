import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PaginaDashboardBolsillos from "../../pages/PaginaDashboardBolsillos";
import { obtenerGruposPorUsuario } from "../../services/grupoServicio";

vi.mock("../../context/UsuarioActivoContext", () => ({
  useUsuarioActivo: () => ({ usuario: { idUsuario: "usuario-prueba", nombre: "Ana" } }),
}));
vi.mock("../../services/grupoServicio", () => ({
  obtenerGruposPorUsuario: vi.fn(), crearGrupo: vi.fn(), actualizarGrupo: vi.fn(),
  eliminarGrupo: vi.fn(), vincularFuenteAGrupo: vi.fn(), desvincularFuenteDeGrupo: vi.fn(),
}));
vi.mock("../../services/fuenteServicio", () => ({
  obtenerFuentesPorUsuario: vi.fn().mockResolvedValue([]), crearFuente: vi.fn(),
}));

const GRUPOS = [{
  idGrupo: "grupo-1", nombre: "Viaje", descripcion: "Fuentes para el viaje", estado: true,
  fuentes: [{ idFuente: "fuente-1", tipo: "CORREO", contenido: "viaje@example.test" }],
}];

beforeEach(() => {
  vi.clearAllMocks();
  obtenerGruposPorUsuario.mockResolvedValue(GRUPOS);
});
afterEach(cleanup);

describe("PaginaDashboardBolsillos: página de Grupos", () => {
  it("presenta grupos y fuentes en tarjetas bajo la ruta de Grupos", async () => {
    render(<PaginaDashboardBolsillos />);
    expect(await screen.findByRole("heading", { level: 1, name: "Grupos" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Crear nuevo grupo" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Abrir grupo Viaje" })).toHaveTextContent("viaje@example.test");
    expect(obtenerGruposPorUsuario).toHaveBeenCalledWith("usuario-prueba");
  });

  it("deja las fuentes y el chat como contenido principal del modal", async () => {
    const usuario = userEvent.setup();
    render(<PaginaDashboardBolsillos />);
    await usuario.click(await screen.findByRole("button", { name: "Abrir grupo Viaje" }));
    expect(await screen.findByRole("dialog", { name: "Viaje" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Fuentes" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Chat grupal" })).toBeInTheDocument();
    expect(screen.getAllByText("viaje@example.test").length).toBeGreaterThan(0);
    expect(screen.queryByRole("button", { name: "Editar grupo" })).not.toBeInTheDocument();
    await usuario.click(screen.getByRole("button", { name: "Configuración" }));
    expect(await screen.findByRole("button", { name: "Editar grupo" })).toBeInTheDocument();
  });

  it("abre el formulario para registrar un nuevo grupo", async () => {
    const usuario = userEvent.setup();
    render(<PaginaDashboardBolsillos />);
    await usuario.click(screen.getByRole("button", { name: "Crear nuevo grupo" }));
    expect(await screen.findByRole("dialog", { name: "Crear grupo" })).toBeInTheDocument();
    expect(screen.getByLabelText("Nombre del grupo")).toBeInTheDocument();
    expect(screen.getByLabelText("Descripción")).toBeInTheDocument();
  });
});
