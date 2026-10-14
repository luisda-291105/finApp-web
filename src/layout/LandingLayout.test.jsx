/**
 * @uso        Pruebas unitarias para el componente LandingLayout
 * @funciones  test "compone Header, Hero, StatsBar, Features, HowItWorks, CtaSection, Footer correctamente"
 * @datos      Mock de IntersectionObserver para componentes que lo usan
 * @eventos    N/A
 * @estados    N/A
 * @usadoPor   vitest (npm run test)
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LandingLayout from "./LandingLayout";

function renderLayout(props = {}) {
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <LandingLayout alAbrirAuth={vi.fn()} {...props} />
    </MemoryRouter>
  );
}

describe("LandingLayout", () => {
  const mockAbrirAuth = vi.fn();

  beforeEach(() => {
    global.IntersectionObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      disconnect: vi.fn(),
    }));
  });

  it("compone Header, Hero, StatsBar, Features, HowItWorks, CtaSection, Footer correctamente", () => {
    renderLayout();

    // Header - usa el link del logo que contiene "Fin" y "App"
    expect(screen.getByRole("link", { name: /Fin App/i })).toBeDefined();
    expect(screen.getByText("Iniciar sesión")).toBeDefined();
    expect(screen.getByText("Registrarse")).toBeDefined();

    // Hero - busca texto característico del Hero
    expect(screen.getByText(/Controla tu dinero/i)).toBeDefined();

    // StatsBar - busca estadísticas
    expect(screen.getByText(/Usuarios activos/i)).toBeDefined();
    expect(screen.getByText(/Satisfacción/i)).toBeDefined();
    expect(screen.getByText(/Gestionados/i)).toBeDefined();
    expect(screen.getByText(/Para empezar/i)).toBeDefined();

    // Features - busca los 5 títulos de funcionalidades (usando role heading para ser específico)
    expect(screen.getByRole("heading", { name: "Registro personal" })).toBeDefined();
    expect(screen.getByRole("heading", { name: "Ahorro" })).toBeDefined();
    expect(screen.getByRole("heading", { name: "Gastos" })).toBeDefined();
    expect(screen.getByRole("heading", { name: "Ingresos" })).toBeDefined();
    expect(screen.getByRole("heading", { name: "Otro" })).toBeDefined();

    // HowItWorks - busca los 3 pasos por sus títulos
    expect(screen.getByText("Crea tu cuenta en minutos")).toBeDefined();
    expect(screen.getByText("Registra tus movimientos")).toBeDefined();
    expect(screen.getByText("Toma el control financiero")).toBeDefined();

    // CtaSection - busca llamada a la acción
    expect(screen.getByText(/empezar/i)).toBeDefined();

    // Footer - busca copyright o marca
    expect(screen.getByText(/FinApp/i)).toBeDefined();
  });

  it("renderiza children pasados (AuthModal, botón flotante, etc.)", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LandingLayout alAbrirAuth={mockAbrirAuth}>
          <div data-testid="contenido-extra">Contenido extra</div>
        </LandingLayout>
      </MemoryRouter>
    );

    expect(screen.getByTestId("contenido-extra")).toBeDefined();
    expect(screen.getByText("Contenido extra")).toBeDefined();
  });

  it("propaga alAbrirAuth a Header, Hero y CtaSection", () => {
    renderLayout({ alAbrirAuth: mockAbrirAuth });

    // Click en botón "Iniciar sesión" del Header
    const btnLogin = screen.getByText("Iniciar sesión");
    btnLogin.click();
    expect(mockAbrirAuth).toHaveBeenCalledWith("login");

    // Click en botón "Registrarse" del Header
    const btnRegistro = screen.getByText("Registrarse");
    btnRegistro.click();
    expect(mockAbrirAuth).toHaveBeenCalledWith("registro");
  });
});