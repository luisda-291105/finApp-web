import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";

const mocks = vi.hoisted(() => ({
  obtenerUsuarioActivo: vi.fn(),
  guardarUsuario: vi.fn(),
}));

vi.mock("../../features/auth/services/usuarioServicio", () => ({ obtenerUsuarioActivo: mocks.obtenerUsuarioActivo }));
vi.mock("../../context/UsuarioActivoContext", () => ({
  useUsuarioActivo: () => ({ guardarUsuario: mocks.guardarUsuario }),
}));
vi.mock("../../features/auth/components/modals/AuthModal", () => ({
  default: ({ mensajeExterno }) => mensajeExterno ? <div role="alert">{mensajeExterno}</div> : null,
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
    sessionStorage.clear();
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
});
