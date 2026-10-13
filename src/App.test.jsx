/**
 * @uso        Comprueba las rutas públicas, el acceso de prueba y el bloque de tarjetas
 * @funciones  Pruebas de raíz, login, subrutas y sección tarjetas
 * @datos      Renderiza App con ubicaciones de MemoryRouter
 * @eventos    Navegación inicial
 * @estados    N/A
 * @usadoPor   vitest (npm run test)
 */
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";
import App from "./App";

afterEach(cleanup);

function renderRuta(ruta) {
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <App />
    </MemoryRouter>
  );
}

const TITULARES_FIXTURE = [
  "MARÍA GARCÍA",
  "ANA MARTÍNEZ",
  "CARLOS RUIZ",
  "LUCÍA FERNÁNDEZ",
  "DIEGO TORRES",
];

describe("rutas de la aplicación", () => {
  it("redirige la raíz al dashboard durante el trial", () => {
    renderRuta("/");

    expect(screen.getByRole("heading", { name: "Tu dinero, en equilibrio." })).toBeDefined();
    expect(screen.getByText("Balance disponible")).toBeDefined();
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

  it("muestra el conjunto fluido de tarjetas demo en la sección tarjetas (spec 004)", () => {
    renderRuta("/dashboard/tarjetas");

    expect(screen.getByRole("heading", { name: "Tus tarjetas" })).toBeDefined();

    // Doble render por breakpoints: acordeón móvil + grid tablet/escritorio
    const listas = screen.getAllByRole("list", { name: "Tarjetas de demostración" });
    const acordeon = listas.find((el) => el.className.includes("sm:hidden"));
    const grid = listas.find(
      (el) => el.className.includes("hidden") && el.className.includes("sm:grid")
    );
    expect(acordeon).toBeTruthy();
    expect(grid).toBeTruthy();

    // Las 5 tarjetas del fixture accesibles desde el grid
    TITULARES_FIXTURE.forEach((titular) => {
      expect(
        within(grid).getByRole("button", {
          name: `Ver detalle de la tarjeta de ${titular}`,
        })
      ).toBeTruthy();
    });

    // Secciones antiguas eliminadas
    expect(screen.queryByText("Ejemplos de diseño")).toBeNull();
    expect(screen.queryByText("Tus otras tarjetas")).toBeNull();
    expect(screen.queryByText("Tarjeta Oro")).toBeNull();

    expect(screen.getByText("Datos de demostración")).toBeDefined();
  });

  it("no muestra el placeholder en la sección tarjetas", () => {
    renderRuta("/dashboard/tarjetas");

    expect(
      screen.queryByText("Administra tus tarjetas y revisa sus saldos.")
    ).toBeNull();
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
      screen.getByText("Consulta y organiza tus movimientos recientes.")
    ).toBeDefined();
  });

  it("conserva el placeholder en configuración", () => {
    renderRuta("/dashboard/configuracion");

    expect(
      screen.getByText("Ajusta tus preferencias de cuenta y seguridad.")
    ).toBeDefined();
  });
});