import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import PaginaDashboardTarjetas from "../../pages/PaginaDashboardTarjetas";
import { useUsuarioActivo } from "../../context/UsuarioActivoContext";
import { crearTarjeta, obtenerTarjetasPorUsuario } from "../../services/tarjetaServicio";

vi.mock("../../context/UsuarioActivoContext", () => ({
  useUsuarioActivo: vi.fn(),
}));

vi.mock("../../services/tarjetaServicio", () => ({
  obtenerTarjetasPorUsuario: vi.fn(),
  crearTarjeta: vi.fn(),
}));

const TARJETA = {
  idTarjeta: "tarjeta-1",
  titular: "Ana Pérez",
  entidad: "Banco FinApp",
  numero: "4111 1111 1111 1111",
  expiracion: "2028-12-01",
  cvv: "987",
};

beforeEach(() => {
  vi.clearAllMocks();
  useUsuarioActivo.mockReturnValue({ usuario: { idUsuario: "usuario-prueba" } });
  obtenerTarjetasPorUsuario.mockResolvedValue([TARJETA]);
});

afterEach(cleanup);

describe("PaginaDashboardTarjetas", () => {
  it("consulta por usuario y presenta tarjetas registradas sin exponer número completo ni CVV", async () => {
    render(<PaginaDashboardTarjetas />);

    expect(await screen.findByRole("heading", { name: "Ana Pérez" })).toBeInTheDocument();
    expect(obtenerTarjetasPorUsuario).toHaveBeenCalledWith("usuario-prueba");
    expect(screen.getByLabelText("Número de tarjeta enmascarado")).toHaveTextContent("•••• 1111");
    expect(screen.getByText("Vence 12/28")).toBeInTheDocument();
    expect(document.body).not.toHaveTextContent(TARJETA.numero);
    expect(document.body).not.toHaveTextContent(TARJETA.cvv);
  });

  it("abre el detalle registrado en el modal común sin revelar CVV o número completo", async () => {
    const usuario = userEvent.setup();
    render(<PaginaDashboardTarjetas />);
    await usuario.click(await screen.findByRole("button", { name: "Ver tarjeta de Ana Pérez" }));
    const dialogo = screen.getByRole("dialog", { name: "Tarjeta de Ana Pérez" });
    expect(dialogo).toHaveTextContent("•••• 1111");
    expect(dialogo).toHaveTextContent("no tiene movimientos registrados");
    expect(dialogo).not.toHaveTextContent(TARJETA.numero);
    expect(dialogo).not.toHaveTextContent(TARJETA.cvv);

    const tarjetaVirtual = within(dialogo).getByRole("button", { name: "Ver reverso de la tarjeta virtual" });
    await usuario.click(tarjetaVirtual);
    expect(tarjetaVirtual).toHaveAttribute("aria-pressed", "true");
    expect(dialogo).not.toHaveTextContent(TARJETA.cvv);
  });

  it("no envía una tarjeta con número menor a 14 dígitos y no ofrece tema visual", async () => {
    const usuario = userEvent.setup();
    render(<PaginaDashboardTarjetas />);
    await usuario.click(screen.getByRole("button", { name: "Agregar nueva tarjeta" }));
    expect(screen.queryByLabelText("Tema visual")).not.toBeInTheDocument();
    await usuario.type(screen.getByLabelText("Titular"), "Ana Pérez");
    await usuario.type(screen.getByLabelText("Número de tarjeta"), "4111111111111");
    await usuario.type(screen.getByLabelText("Vencimiento (MM/AA)"), "12/30");
    await usuario.type(screen.getByLabelText("CVV"), "123");
    await usuario.type(screen.getByLabelText("Entidad financiera"), "Banco FinApp");
    await usuario.click(screen.getByRole("button", { name: "Guardar registro" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("14 a 19");
    expect(screen.getByLabelText("Número de tarjeta")).toHaveFocus();
    expect(crearTarjeta).not.toHaveBeenCalled();
  });

  it("muestra el estado vacío cuando no hay tarjetas registradas", async () => {
    obtenerTarjetasPorUsuario.mockResolvedValue([]);

    render(<PaginaDashboardTarjetas />);

    expect(await screen.findByText("Todavía no tienes tarjetas registradas.")).toBeInTheDocument();
  });

  it("muestra el error devuelto por el servicio", async () => {
    obtenerTarjetasPorUsuario.mockRejectedValue(new Error("Error al cargar tarjetas"));

    render(<PaginaDashboardTarjetas />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Error al cargar tarjetas");
  });

  it("no consulta tarjetas si no hay usuario activo", () => {
    useUsuarioActivo.mockReturnValue({ usuario: null });

    render(<PaginaDashboardTarjetas />);

    expect(screen.getByText("Inicia sesión para ver tus tarjetas.")).toBeInTheDocument();
    expect(obtenerTarjetasPorUsuario).not.toHaveBeenCalled();
  });
});
