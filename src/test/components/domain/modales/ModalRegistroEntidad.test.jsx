/**
 * @uso        Pruebas del modal de registro de tarjetas
 * @funciones  describe, it
 * @datos      Placeholders configurados para los campos de tarjeta
 * @eventos    Apertura del modal y lectura de sus atributos
 * @estados    Modal abierto con usuario activo
 * @usadoPor   Vitest
 */
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ModalRegistroEntidad from "../../../../components/domain/modales/ModalRegistroEntidad";
import { useUsuarioActivo } from "../../../../context/UsuarioActivoContext";

vi.mock("../../../../context/UsuarioActivoContext", () => ({
  useUsuarioActivo: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
  useUsuarioActivo.mockReturnValue({
    usuario: { idUsuario: "usuario-prueba", nombre: "Ana Pérez" },
  });
});

describe("ModalRegistroEntidad", () => {
  it("muestra placeholders en todos los campos para registrar una tarjeta", () => {
    render(
      <ModalRegistroEntidad
        tipo="tarjeta"
        abierto
        alCerrar={vi.fn()}
        alGuardar={vi.fn()}
      />,
    );

    expect(screen.getByLabelText("Titular")).toHaveAttribute("placeholder", "Ej. Ana Pérez");
    expect(screen.getByLabelText("Número de tarjeta")).toHaveAttribute("placeholder", "Ej. 4111111111111111");
    expect(screen.getByLabelText("Vencimiento (MM/AA)")).toHaveAttribute("placeholder", "MM/AA");
    expect(screen.getByLabelText("Entidad financiera")).toHaveAttribute("placeholder", "Ej. Banco Nacional");
  });
});
