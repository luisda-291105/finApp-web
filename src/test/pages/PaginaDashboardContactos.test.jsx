import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import PaginaDashboardContactos from "../../pages/PaginaDashboardContactos";
import { obtenerContactosPorUsuario } from "../../services/contactoServicio";

vi.mock("../../context/UsuarioActivoContext", () => ({
  useUsuarioActivo: () => ({ usuario: { idUsuario: "usuario-prueba" } }),
}));

vi.mock("../../services/contactoServicio", () => ({
  obtenerContactosPorUsuario: vi.fn(),
  crearContacto: vi.fn(),
}));

const CONTACTO = {
  idContacto: "contacto-1",
  nombre: "Laura Gómez",
  telefono: "3001234567",
  notas: "Contacto de prueba",
};

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(cleanup);

describe("PaginaDashboardContactos", () => {
  it("consulta por usuario y presenta cada contacto en una tarjeta", async () => {
    obtenerContactosPorUsuario.mockResolvedValue([CONTACTO]);

    render(<PaginaDashboardContactos />);

    expect(await screen.findByRole("heading", { name: "Laura Gómez" })).toBeInTheDocument();
    expect(screen.getByText("3001234567")).toBeInTheDocument();
    expect(screen.getByText("Contacto de prueba")).toBeInTheDocument();
    expect(obtenerContactosPorUsuario).toHaveBeenCalledWith("usuario-prueba");
    expect(screen.getByRole("list", { name: "Contactos registrados" })).toBeInTheDocument();
  });

  it("muestra el estado vacío cuando no hay contactos registrados", async () => {
    obtenerContactosPorUsuario.mockResolvedValue([]);

    render(<PaginaDashboardContactos />);

    expect(await screen.findByText("Todavía no tienes contactos registrados.")).toBeInTheDocument();
  });

  it("muestra el error devuelto por el servicio", async () => {
    obtenerContactosPorUsuario.mockRejectedValue(new Error("No se pudo consultar el servicio."));

    render(<PaginaDashboardContactos />);

    expect(await screen.findByRole("alert")).toHaveTextContent("No se pudo consultar el servicio.");
  });
});
