import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PublicRoute } from "../../../components/auth";

const mockUseUsuarioActivo = vi.fn();

vi.mock("../../../context/UsuarioActivoContext", () => ({
  useUsuarioActivo: () => mockUseUsuarioActivo(),
}));

beforeEach(() => {
  mockUseUsuarioActivo.mockReset();
});

describe("PublicRoute", () => {
  it("muestra children cuando no hay sesión", () => {
    mockUseUsuarioActivo.mockReturnValue({ usuario: null, estadoSesion: "sin-sesion" });

    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<PublicRoute><div>landing</div></PublicRoute>} />
          <Route path="/dashboard" element={<div>dashboard</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("landing")).toBeInTheDocument();
  });

  it("redirige a dashboard cuando la sesión está autenticada", () => {
    mockUseUsuarioActivo.mockReturnValue({ usuario: { idUsuario: 1 }, estadoSesion: "autenticado" });

    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<PublicRoute><div>landing</div></PublicRoute>} />
          <Route path="/dashboard" element={<div>dashboard</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("dashboard")).toBeInTheDocument();
  });

  it("muestra loading mientras verifica la sesión", () => {
    mockUseUsuarioActivo.mockReturnValue({ usuario: null, estadoSesion: "verificando" });

    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<PublicRoute><div>landing</div></PublicRoute>} />
          <Route path="/dashboard" element={<div>dashboard</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole("status")).toHaveTextContent("Verificando sesión…");
  });
});
