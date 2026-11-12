import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";

const mocks = vi.hoisted(() => ({
  obtenerUsuarioActivo: vi.fn(),
  guardarUsuario: vi.fn(),
  obtenerRegistroGooglePendiente: vi.fn(),
}));

vi.mock("../../features/auth/services/usuarioServicio", () => ({ obtenerUsuarioActivo: mocks.obtenerUsuarioActivo }));
vi.mock("../../features/auth/services/authGoogleServicio", () => ({
  obtenerRegistroGooglePendiente: mocks.obtenerRegistroGooglePendiente,
}));
vi.mock("../../context/UsuarioActivoContext", () => ({
  useUsuarioActivo: () => ({ guardarUsuario: mocks.guardarUsuario }),
}));
vi.mock("../../features/auth/components/modals/AuthModal", () => ({
  default: ({ mensajeExterno, modoInicial }) => (
    <div data-testid="auth-modal" data-modo={modoInicial}>
      {mensajeExterno ? <div role="alert">{mensajeExterno}</div> : null}
    </div>
  ),
}));

import PaginaLogin from "../../features/auth/pages/LoginPage";

function renderLogin(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/login" element={<PaginaLogin />} />
        <Route path="/dashboard" element={<p>Panel autenticado</p>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("PaginaLogin — callback de Google", () => {
  beforeEach(() => {
    mocks.obtenerUsuarioActivo.mockReset();
    mocks.guardarUsuario.mockReset();
    mocks.obtenerRegistroGooglePendiente.mockReset();
    localStorage.clear();
  });

  it("verifica la sesión y abre el dashboard después del callback exitoso", async () => {
    mocks.obtenerUsuarioActivo.mockResolvedValue({ datos: { idUsuario: "google-user", nombre: "Google User" } });
    renderLogin("/login?google=success");

    expect(await screen.findByText("Panel autenticado")).toBeInTheDocument();
    await waitFor(() => expect(mocks.guardarUsuario).toHaveBeenCalledWith({ idUsuario: "google-user", nombre: "Google User" }));
    expect(mocks.obtenerUsuarioActivo).toHaveBeenCalledOnce();
  });

  it("muestra un mensaje si el usuario cancela la autorización", async () => {
    renderLogin("/login?google=cancelled");
    expect(await screen.findByRole("alert")).toHaveTextContent("Cancelaste el inicio de sesión con Google.");
    expect(mocks.obtenerUsuarioActivo).not.toHaveBeenCalled();
  });

  it("muestra un mensaje y coloca modo registro si el usuario no está registrado", async () => {
    renderLogin("/login?google=not_registered");
    expect(await screen.findByRole("alert")).toHaveTextContent("No existe una cuenta registrada con este correo de Google. Por favor, regístrate.");
    expect(screen.getByTestId("auth-modal")).toHaveAttribute("data-modo", "registro");
  });

  it("muestra un mensaje y coloca modo login si el usuario ya está registrado al intentar registro", async () => {
    renderLogin("/login?google=already_registered");
    expect(await screen.findByRole("alert")).toHaveTextContent("Esta cuenta de Google ya está registrada. Por favor inicia sesión.");
    expect(screen.getByTestId("auth-modal")).toHaveAttribute("data-modo", "login");
  });

  it("recupera datos de registro pendiente y abre modo completar_google cuando google=pending_registration", async () => {
    mocks.obtenerRegistroGooglePendiente.mockResolvedValue({ correo: "nuevo@gmail.com", nombre: "Nuevo" });
    renderLogin("/login?google=pending_registration");

    await waitFor(() => {
      expect(screen.getByTestId("auth-modal")).toHaveAttribute("data-modo", "completar_google");
    });
    expect(mocks.obtenerRegistroGooglePendiente).toHaveBeenCalledOnce();
  });
});
