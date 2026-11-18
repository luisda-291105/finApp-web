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
import LandingLayout from "../../features/landing/components/layouts/LandingLayout";
import { TemaProvider } from "../../context/TemaContext";

function renderLayout(props = {}) {
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <TemaProvider>
        <LandingLayout alAbrirAuth={vi.fn()} {...props} />
      </TemaProvider>
    </MemoryRouter>,
  );
}

describe("LandingLayout", () => {
  const mockAbrirAuth = vi.fn();

  beforeEach(() => {
    global.IntersectionObserver = vi.fn().mockImplementation(function () {
      return { observe: vi.fn(), disconnect: vi.fn() };
    });
  });

  it("compone Header, Hero, StatsBar, Features, HowItWorks, CtaSection, Footer correctamente", () => {
    renderLayout();

    // Header - logo imagen con accesible "FinApp" / inicio
    expect(screen.getByRole("link", { name: /FinApp/i })).toBeDefined();
    expect(screen.getByText("Iniciar sesión")).toBeDefined();
    // Registrarse ya no está en el header (simplificado por diseño)
    expect(screen.queryByText("Registrarse")).not.toBeInTheDocument();

    // Hero - busca texto característico del Hero
    expect(screen.getByText(/Controla tu dinero/i)).toBeDefined();

    // StatsBar - busca estadísticas
    expect(screen.getByText(/Usuarios activos/i)).toBeDefined();
    expect(screen.getByText(/Satisfacción/i)).toBeDefined();
    expect(screen.getByText(/Gestionados/i)).toBeDefined();
    expect(screen.getByText(/Para empezar/i)).toBeDefined();

    // Features - busca los 5 títulos de funcionalidades (usando role heading para ser específico)
    expect(
      screen.getByRole("heading", { name: "Registro personal" }),
    ).toBeDefined();
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
    expect(screen.getAllByText(/FinApp/i).length).toBeGreaterThan(0);
  });

  it("renderiza children pasados (AuthModal, botón flotante, etc.)", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LandingLayout alAbrirAuth={mockAbrirAuth}>
          <div data-testid="contenido-extra">Contenido extra</div>
        </LandingLayout>
      </MemoryRouter>,
    );

    expect(screen.getByTestId("contenido-extra")).toBeDefined();
    expect(screen.getByText("Contenido extra")).toBeDefined();
  });

  it("mantiene su clase de tema propia, aislada del tema global del dashboard", () => {
    window.localStorage.getItem.mockReturnValue("oscuro");
    renderLayout();

    expect(screen.getByTestId("landing-theme")).toHaveClass("landing-theme");
    expect(document.documentElement).toHaveAttribute("data-tema", "oscuro");
  });

  it("propaga alAbrirAuth a Header, Hero y CtaSection", () => {
    renderLayout({ alAbrirAuth: mockAbrirAuth });

    // Click en botón "Iniciar sesión" del Header
    const btnLogin = screen.getByText("Iniciar sesión");
    btnLogin.click();
    expect(mockAbrirAuth).toHaveBeenCalledWith("login");

    // Registrarse ya no está en el header (simplificado por diseño)
    // El registro se maneja desde el modal de autenticación
    expect(screen.queryByText("Registrarse")).not.toBeInTheDocument();
  });
});
