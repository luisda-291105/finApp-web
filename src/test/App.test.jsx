/**
 * @uso        Comprueba las rutas públicas, el acceso de prueba, el bloque de tarjetas y el cierre
 *             que navega (spec 011, RF-15)
 * @funciones  Pruebas de raíz, login, subrutas, sección tarjetas y foco en la vista de destino
 * @datos      Renderiza App con ubicaciones de MemoryRouter
 * @eventos    Navegación inicial; cierre de `AuthModal` en /login que navega a /dashboard
 * @estados    N/A
 * @usadoPor   vitest (npm run test)
 */
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import App from "../App";

afterEach(cleanup);

function renderRuta(ruta) {
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <App />
    </MemoryRouter>
  );
}

describe("rutas de la aplicación", () => {
  it("muestra siempre la landing en la raíz, con independencia del trial", () => {
    renderRuta("/");

    expect(
      screen.getByRole("heading", { name: /Controla tu dinero/ })
    ).toBeDefined();
    // Es la landing (PaginaInicio), no el dashboard
    expect(screen.queryByRole("heading", { name: "Tu dinero, en equilibrio." })).toBeNull();
  });

  it("redirige /inicio a la landing (/)", () => {
    renderRuta("/inicio");

    expect(
      screen.getByRole("heading", { name: /Controla tu dinero/ })
    ).toBeDefined();
  });

  it("muestra el login en su ruta directa", () => {
    renderRuta("/login");

    expect(screen.getByRole("dialog")).toBeDefined();
    expect(screen.getByText("Iniciar sesión")).toBeDefined();
  });

  it("permite abrir el dashboard directamente durante el trial", () => {
    renderRuta("/dashboard");

    expect(screen.getByRole("heading", { name: "Tu dinero, en equilibrio." })).toBeDefined();
  });

  it("permite abrir una subruta de dashboard durante el trial", () => {
    renderRuta("/dashboard/transacciones");

    expect(screen.getByRole("heading", { name: "Transacciones" })).toBeDefined();
  });

  it("muestra los registros de tarjetas por usuario y el estado sin sesión", () => {
    renderRuta("/dashboard/tarjetas");

    expect(screen.getByRole("heading", { name: "Tus tarjetas" })).toBeDefined();
    expect(screen.getByRole("heading", { name: "Tarjetas registradas" })).toBeDefined();
    expect(screen.getByText("Inicia sesión para ver tus tarjetas.")).toBeDefined();
    expect(screen.queryByText("Datos de demostración")).toBeNull();
  });

  it("muestra la descripción de gestión en la sección tarjetas", () => {
    renderRuta("/dashboard/tarjetas");

    expect(screen.getByText("Administra tus tarjetas y revisa sus saldos.")).toBeDefined();
  });

  it("conserva las tres cifras en la sección inicio", () => {
    renderRuta("/dashboard");

    expect(screen.getByText("Balance disponible")).toBeDefined();
    expect(screen.getByText("Ingresos del mes")).toBeDefined();
    expect(screen.getByText("Gastos del mes")).toBeDefined();
  });

  it("conserva el placeholder en transacciones", () => {
    renderRuta("/dashboard/transacciones");

    expect(
      screen.getAllByText("Consulta y organiza tus movimientos recientes.", { selector: "p" }).length
    ).toBeGreaterThan(0);
  });

  it("conserva el placeholder en configuración", () => {
    renderRuta("/dashboard/configuracion");

    expect(
      screen.getByText("Ajusta tus preferencias de cuenta y seguridad.")
    ).toBeDefined();
  });

  it("mantiene la redirección de la ruta splat con las future flags v7 activadas", () => {
    render(
      <MemoryRouter
        initialEntries={["/dashboard/ruta-inexistente"]}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <App />
      </MemoryRouter>
    );

    // El catch-all interno de /dashboard/* sigue llevando al inicio del dashboard
    expect(screen.getByRole("heading", { name: "Tu dinero, en equilibrio." })).toBeDefined();
  });
});

// Casos nuevos de la spec 011 (Tarea 8): el cierre de la superficie modal que **cambia de ruta**
// deja el foco en la **vista de destino**, una sola vez y después del render de la nueva vista
// (RF-15). La versión de vista se fija con el `innerWidth` vigente porque el stub global de
// `matchMedia` (vitest.setup.js) deriva `matches` de él (una sola fuente de medición); los casos
// vigentes de arriba quedan **sin editar**.
describe("cierre que navega: foco en la vista de destino (RF-15, spec 011)", () => {
  /** Ancho de viewport simulado, coherente con el stub global de `matchMedia`. */
  const fijarAncho = (ancho) => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: ancho,
    });
  };

  afterEach(() => {
    fijarAncho(1024);
  });

  const renderLogin = () =>
    render(
      <MemoryRouter initialEntries={["/login"]}>
        <App />
      </MemoryRouter>
    );

  /** La superficie de origen (`AuthModal`) enfoca su contenedor con la trampa real al abrir. */
  const esperarFocoEnElDialogo = async () => {
    const dialogo = screen.getByRole("dialog");
    await waitFor(() => expect(document.activeElement).toBe(dialogo));
    return dialogo;
  };

  /** La navegación se completa cuando la vista de destino ya está renderizada. */
  const esperarDestinoDashboard = async () => {
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Tu dinero, en equilibrio." })
      ).toBeTruthy();
    });
  };

  it.each([
    ["móvil", 375, 'nav[role="navigation"] button[aria-label="Abrir menú"]'],
    ["pantallas grandes (≥768px)", 1024, 'aside[role="navigation"] button'],
  ])(
    "AC-22(a): en %s, cerrar con la «X» navega a /dashboard y el foco queda en el control estable de la versión",
    async (_versionVista, ancho, selectorDestino) => {
      fijarAncho(ancho);
      const usuario = userEvent.setup();
      renderLogin();
      await esperarFocoEnElDialogo();

      await usuario.click(
        screen.getByRole("button", { name: "Cerrar ventana de acceso" })
      );
      await esperarDestinoDashboard();

      const controlDestino = document.querySelector(selectorDestino);
      expect(controlDestino).toBeTruthy();
      await waitFor(() => expect(document.activeElement).toBe(controlDestino));
      expect(document.activeElement).not.toBe(document.body);
    }
  );

  it("AC-22(a): con Esc en móvil, el cierre que navega también deja el foco en el destino", async () => {
    fijarAncho(375);
    const usuario = userEvent.setup();
    renderLogin();
    await esperarFocoEnElDialogo();

    await usuario.keyboard("{Escape}");
    await esperarDestinoDashboard();

    const controlDestino = document.querySelector(
      'nav[role="navigation"] button[aria-label="Abrir menú"]'
    );
    expect(controlDestino).toBeTruthy();
    await waitFor(() => expect(document.activeElement).toBe(controlDestino));
  });

  it("CL-18: el destino usa sus propios nodos y la superficie de origen ya no existe", async () => {
    fijarAncho(375);
    const usuario = userEvent.setup();
    renderLogin();
    await esperarFocoEnElDialogo();

    await usuario.click(
      screen.getByRole("button", { name: "Cerrar ventana de acceso" })
    );
    await esperarDestinoDashboard();

    // Ninguna superficie modal sobrevive a la navegación…
    expect(screen.queryByRole("dialog")).toBeNull();

    // …y el candidato elegido pertenece a la navegación de la vista de destino.
    const controlDestino = document.querySelector(
      'nav[role="navigation"] button[aria-label="Abrir menú"]'
    );
    await waitFor(() => expect(document.activeElement).toBe(controlDestino));
    expect(document.activeElement.closest('[role="dialog"]')).toBeNull();
    expect(
      document.querySelector('nav[role="navigation"]').contains(document.activeElement)
    ).toBe(true);
  });

  it("AC-25: una navegación ordinaria al dashboard no mueve el foco", () => {
    fijarAncho(1024);
    renderRuta("/dashboard");

    expect(document.activeElement).toBe(document.body);
  });

  it("AC-25: la landing sin la marca no mueve el foco al montar", () => {
    fijarAncho(375);
    renderRuta("/");

    expect(document.activeElement).toBe(document.body);
  });
});
