/**
 * @uso        Pruebas del formulario de creación de tarjetas
 * @funciones  Verifica campos y placeholders del modal del feature
 * @datos      Usuario activo simulado
 * @eventos    Apertura del modal
 * @estados    Modal visible
 * @usadoPor   Vitest
 */
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import CrearTarjetaModal from "../../../features/tarjetas/components/modals/CrearTarjetaModal";
import { useUsuarioActivo } from "../../../context/UsuarioActivoContext";
import { crearTarjeta } from "../../../features/tarjetas/services/tarjetasService";

vi.mock("../../../context/UsuarioActivoContext", () => ({ useUsuarioActivo: vi.fn() }));
vi.mock("../../../features/tarjetas/services/tarjetasService", () => ({ crearTarjeta: vi.fn() }));

beforeEach(() => {
  vi.clearAllMocks();
  useUsuarioActivo.mockReturnValue({ usuario: { idUsuario: "usuario-prueba", nombre: "Ana Pérez" } });
});

describe("CrearTarjetaModal", () => {
  it("muestra placeholders claros para los datos de la tarjeta", () => {
    render(<CrearTarjetaModal abierto alCerrar={vi.fn()} alGuardar={vi.fn()} />);
    expect(screen.getByLabelText("Titular")).toHaveAttribute("placeholder", "Ej. Ana Pérez");
    expect(screen.getByLabelText("Número de tarjeta")).toHaveAttribute("placeholder", "Ej. 4111111111111111");
    expect(screen.getByLabelText("Vencimiento (MM/AA)")).toHaveAttribute("placeholder", "MM/AA");
    expect(screen.getByLabelText("Entidad financiera")).toHaveAttribute("placeholder", "Ej. Banco Nacional");
    expect(screen.getByLabelText("Tipo de cuenta")).toBeInTheDocument();
  });

  it("exige elegir el tipo de cuenta antes de guardar", async () => {
    const usuario = userEvent.setup();
    render(<CrearTarjetaModal abierto alCerrar={vi.fn()} alGuardar={vi.fn()} />);

    await usuario.type(screen.getByLabelText("Titular"), "Ana Pérez");
    await usuario.type(screen.getByLabelText("Número de tarjeta"), "4111111111111111");
    await usuario.type(screen.getByLabelText("Vencimiento (MM/AA)"), "1230");
    await usuario.type(screen.getByLabelText("Entidad financiera"), "Banco Nacional");
    await usuario.click(screen.getByRole("button", { name: "Guardar registro" }));

    expect(screen.getByRole("alert")).toHaveTextContent("Elige el tipo de cuenta.");
    expect(crearTarjeta).not.toHaveBeenCalled();
  });

  it("guarda la tarjeta con el tipo de cuenta elegido", async () => {
    const usuario = userEvent.setup();
    crearTarjeta.mockResolvedValue({ idTarjeta: "tarjeta-1" });
    const alGuardar = vi.fn();
    render(<CrearTarjetaModal abierto alCerrar={vi.fn()} alGuardar={alGuardar} />);

    await usuario.type(screen.getByLabelText("Titular"), "Ana Pérez");
    await usuario.type(screen.getByLabelText("Número de tarjeta"), "4111111111111111");
    await usuario.type(screen.getByLabelText("Vencimiento (MM/AA)"), "1230");
    await usuario.type(screen.getByLabelText("Entidad financiera"), "Banco Nacional");
    await usuario.selectOptions(screen.getByLabelText("Tipo de cuenta"), "CREDITO");
    await usuario.click(screen.getByRole("button", { name: "Guardar registro" }));

    expect(crearTarjeta).toHaveBeenCalledWith(expect.objectContaining({ tipoCuenta: "CREDITO", entidad: "Banco Nacional" }));
    expect(alGuardar).toHaveBeenCalled();
  });
});
