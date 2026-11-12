import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

const mocks = vi.hoisted(() => ({
  iniciarLoginGoogle: vi.fn(),
  completarRegistroGoogle: vi.fn(),
}));

vi.mock("../../../../features/auth/services/authGoogleServicio", () => ({
  GOOGLE_AUTH_CONFIGURADO: true,
  iniciarLoginGoogle: mocks.iniciarLoginGoogle,
  completarRegistroGoogle: mocks.completarRegistroGoogle,
}));

import AuthModal from "../../../../features/auth/components/modals/AuthModal";

describe("AuthModal — acceso con Google", () => {
  it("muestra el botón de iniciar sesión en modo login y pasa el parámetro de login", async () => {
    const usuario = userEvent.setup();
    render(
      <MemoryRouter>
        <AuthModal abierto modoInicial="login" alCerrar={vi.fn()} />
      </MemoryRouter>
    );

    const boton = screen.getByRole("button", { name: "Iniciar sesión con Google" });
    await usuario.click(boton);
    expect(mocks.iniciarLoginGoogle).toHaveBeenCalledWith("login");
  });

  it("muestra el botón de registrarse en modo registro y pasa el parámetro de registro", async () => {
    const usuario = userEvent.setup();
    render(
      <MemoryRouter>
        <AuthModal abierto modoInicial="registro" alCerrar={vi.fn()} />
      </MemoryRouter>
    );

    const boton = screen.getByRole("button", { name: "Registrarse con Google" });
    await usuario.click(boton);
    expect(mocks.iniciarLoginGoogle).toHaveBeenCalledWith("registro");
  });

  it("despliega el formulario de completar registro con identificación y contraseña cuando hay datos pendientes", async () => {
    const usuario = userEvent.setup();
    mocks.completarRegistroGoogle.mockResolvedValue({
      datos: { idUsuario: "123456", nombre: "Juan Google" },
    });

    render(
      <MemoryRouter>
        <AuthModal
          abierto
          datosGooglePendiente={{ correo: "juan@gmail.com", nombre: "Juan Google" }}
          alCerrar={vi.fn()}
        />
      </MemoryRouter>
    );

    expect(screen.getByText("Completar registro")).toBeInTheDocument();
    expect(screen.getByText("juan@gmail.com")).toBeInTheDocument();

    const inputIdentificacion = screen.getByLabelText("Cédula o identificación");
    const inputContrasena = screen.getByLabelText("Contraseña");

    await usuario.type(inputIdentificacion, "123456");
    await usuario.type(inputContrasena, "claveSegura123");

    const botonFinalizar = screen.getByRole("button", { name: "Finalizar registro y acceder" });
    await usuario.click(botonFinalizar);

    await waitFor(() => {
      expect(mocks.completarRegistroGoogle).toHaveBeenCalledWith(
        expect.objectContaining({
          idUsuario: "123456",
          contrasena: "claveSegura123",
          nombre: "Juan Google",
        })
      );
    });
  });
});
