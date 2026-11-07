import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GruposPage } from "../../features/grupo";
import { obtenerGruposPorUsuario, crearGrupo } from "../../features/grupo/services/gruposService";

vi.mock("../../context/UsuarioActivoContext", () => ({
  useUsuarioActivo: () => ({ usuario: { idUsuario: "usuario-prueba", nombre: "Ana" } }),
}));
vi.mock("../../features/grupo/services/gruposService", () => ({
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
    render(<GruposPage />);
    expect(await screen.findByRole("heading", { level: 1, name: "Grupos" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Crear nuevo grupo" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Abrir grupo Viaje" })).toHaveTextContent("viaje@example.test");
    expect(obtenerGruposPorUsuario).toHaveBeenCalledWith("usuario-prueba");
  });

  it("deja las fuentes y el chat como contenido principal del modal", async () => {
    const usuario = userEvent.setup();
    render(<GruposPage />);
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
    render(<GruposPage />);
    await usuario.click(screen.getByRole("button", { name: "Crear nuevo grupo" }));
    expect(await screen.findByRole("dialog", { name: "Crear grupo" })).toBeInTheDocument();
    expect(screen.getByLabelText("Nombre del grupo")).toBeInTheDocument();
    expect(screen.getByLabelText("Descripción")).toBeInTheDocument();
  });

  it("guarda desde el modal del feature y recarga los grupos", async () => {
    const usuario = userEvent.setup();
    crearGrupo.mockResolvedValue({ idGrupo: "grupo-2", nombre: "Helado" });
    render(<GruposPage />);
    await usuario.click(await screen.findByRole("button", { name: "Crear nuevo grupo" }));
    await usuario.type(screen.getByLabelText("Nombre del grupo"), "Helado");
    await usuario.type(screen.getByLabelText("Descripción"), "Gastos del paseo");
    await usuario.click(screen.getByRole("button", { name: "Guardar registro" }));
    expect(screen.queryByRole("dialog", { name: "Crear grupo" })).not.toBeInTheDocument();
    expect(crearGrupo).toHaveBeenCalledWith(expect.objectContaining({
      nombre: "Helado", descripcion: "Gastos del paseo", usuario: { idUsuario: "usuario-prueba" }, estado: true,
    }));
    expect(obtenerGruposPorUsuario).toHaveBeenCalledTimes(2);
  });
});
