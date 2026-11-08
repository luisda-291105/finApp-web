import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ContactosPage } from "../../features/contactos";
import { obtenerContactosPorUsuario, crearContacto } from "../../features/contactos/services/contactosService";

vi.mock("../../context/UsuarioActivoContext", () => ({
  useUsuarioActivo: () => ({ usuario: { idUsuario: "usuario-prueba" } }),
}));

vi.mock("../../features/contactos/services/contactosService", () => ({
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

    render(<ContactosPage />);

    expect(await screen.findByRole("heading", { name: "Laura Gómez" })).toBeInTheDocument();
    expect(screen.getByText("3001234567")).toBeInTheDocument();
    expect(screen.getByText("Contacto de prueba")).toBeInTheDocument();
    expect(obtenerContactosPorUsuario).toHaveBeenCalledWith("usuario-prueba");
    expect(screen.getByRole("list", { name: "Contactos registrados" })).toBeInTheDocument();
  });

  it("muestra el estado vacío cuando no hay contactos registrados", async () => {
    obtenerContactosPorUsuario.mockResolvedValue([]);

    render(<ContactosPage />);

    expect(await screen.findByText("Todavía no tienes contactos registrados.")).toBeInTheDocument();
  });

  it("muestra el error devuelto por el servicio", async () => {
    obtenerContactosPorUsuario.mockRejectedValue(new Error("No se pudo consultar el servicio."));

    render(<ContactosPage />);

    expect(await screen.findByRole("alert")).toHaveTextContent("No se pudo consultar el servicio.");
  });

  it("registra el contacto desde el modal de su propio feature", async () => {
    const usuario = userEvent.setup();
    obtenerContactosPorUsuario.mockResolvedValue([]);
    crearContacto.mockResolvedValue({ idContacto: "contacto-2" });
    render(<ContactosPage />);
    await usuario.click(screen.getByRole("button", { name: "Agregar nuevo contacto" }));
    await usuario.type(screen.getByLabelText("Nombre"), "Laura Gómez");
    await usuario.type(screen.getByLabelText("Teléfono"), "3001234567");
    await usuario.type(screen.getByLabelText("Notas"), "Gastos compartidos");
    await usuario.click(screen.getByRole("button", { name: "Guardar registro" }));
    expect(screen.queryByRole("dialog", { name: "Registrar contacto" })).not.toBeInTheDocument();
    expect(crearContacto).toHaveBeenCalledWith(expect.objectContaining({ nombre: "Laura Gómez", telefono: "3001234567", usuario: { idUsuario: "usuario-prueba" } }));
  });
});
