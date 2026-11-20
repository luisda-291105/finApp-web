/**
 * @uso        Pruebas del aviso de acceso cuando no existe la cuenta intentada
 * @funciones  render, screen, waitFor, fireEvent
 * @datos      `iniciarSesion` simulado con distintos mensajes del backend
 * @eventos    Envío del formulario de login y render de la alerta global
 * @estados    Ninguno; la alerta se observa en el proveedor global de alertas
 * @usadoPor   Vitest
 */
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import AuthModal from "../../../../features/auth/components/modals/AuthModal";
import { AlertasProvider } from "../../../../context/AlertasContext";
import { iniciarSesion } from "../../../../features/auth/services/usuarioServicio";

vi.mock("../../../../features/auth/services/usuarioServicio", () => ({
  crearUsuario: vi.fn(),
  iniciarSesion: vi.fn(),
}));

const renderModal = () =>
  render(
    <AlertasProvider>
      <AuthModal abierto modoInicial="login" alCerrar={() => {}} />
    </AlertasProvider>,
  );

const enviarLogin = () => {
  fireEvent.change(
    screen.getByLabelText("Nombre, identificación, correo o teléfono"),
    { target: { value: "ana" } },
  );
  fireEvent.change(screen.getByLabelText("Contraseña"), {
    target: { value: "secreta123" },
  });
  fireEvent.submit(screen.getByRole("button", { name: "Entrar a mi cuenta" }).closest("form"));
};

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("AuthModal: aviso de existencia de cuenta", () => {
  it("muestra una advertencia cuando aún no hay cuentas registradas", async () => {
    iniciarSesion.mockRejectedValueOnce(
      new Error("Aún no hay cuentas registradas. Crea una cuenta para comenzar."),
    );
    renderModal();

    enviarLogin();

    expect(
      await screen.findByText(
        "Usuario no registrado. Crea una cuenta para comenzar.",
      ),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Cerrar alerta de advertencia" }),
    ).toBeTruthy();
  });

  it("conserva el error de credenciales incorrectas cuando ya hay cuentas", async () => {
    iniciarSesion.mockRejectedValueOnce(
      new Error("El usuario o la contraseña no son correctos."),
    );
    renderModal();

    enviarLogin();

    expect(
      await screen.findByText("El usuario o la contraseña no son correctos."),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Cerrar alerta de error" }),
    ).toBeTruthy();
  });

  it("trata la respuesta sin usuario como validación de existencia", async () => {
    iniciarSesion.mockResolvedValueOnce({ datos: null });
    renderModal();

    enviarLogin();

    await waitFor(() => {
      expect(
        screen.getByText("Usuario no registrado. Crea una cuenta para comenzar."),
      ).toBeTruthy();
    });
    expect(
      screen.getByRole("button", { name: "Cerrar alerta de advertencia" }),
    ).toBeTruthy();
  });
});
