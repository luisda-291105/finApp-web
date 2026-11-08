import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProtectedRoute } from "../../../components/auth";

const mockUseUsuarioActivo = vi.fn();

vi.mock("../../../context/UsuarioActivoContext", () => ({
  useUsuarioActivo: () => mockUseUsuarioActivo(),
}));

beforeEach(() => {
  mockUseUsuarioActivo.mockReset();
});

describe("ProtectedRoute", () => {
  it("muestra loading mientras verifica la sesión", () => {
    mockUseUsuarioActivo.mockReturnValue({ usuario: null, estadoSesion: "verificando" });

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route path="/" element={<div>landing</div>} />
          <Route path="*" element={<ProtectedRoute><div>secret</div></ProtectedRoute>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole("status")).toHaveTextContent("Verificando sesión…");
  });

  it("renderiza children cuando la sesión está autenticada", () => {
    mockUseUsuarioActivo.mockReturnValue({ usuario: { idUsuario: 1 }, estadoSesion: "autenticado" });

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route path="/" element={<div>landing</div>} />
          <Route path="*" element={<ProtectedRoute><div>secret</div></ProtectedRoute>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("secret")).toBeInTheDocument();
  });

  it("redirige al landing si la sesión no está autenticada", () => {
    mockUseUsuarioActivo.mockReturnValue({ usuario: null, estadoSesion: "sin-sesion" });

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route path="/" element={<div>landing</div>} />
          <Route path="*" element={<ProtectedRoute><div>secret</div></ProtectedRoute>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("landing")).toBeInTheDocument();
  });
});
