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
import CrearTarjetaModal from "../../../features/tarjetas/components/modals/CrearTarjetaModal";
import { useUsuarioActivo } from "../../../context/UsuarioActivoContext";

vi.mock("../../../context/UsuarioActivoContext", () => ({ useUsuarioActivo: vi.fn() }));

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
  });
});
