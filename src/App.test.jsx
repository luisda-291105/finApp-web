/**
 * @uso        Comprueba las rutas públicas y el acceso de prueba al dashboard
 * @funciones  Pruebas de raíz, login y subrutas
 * @datos      Renderiza App con ubicaciones de MemoryRouter
 * @eventos    Navegación inicial
 * @estados    N/A
 * @usadoPor   vitest (npm run test)
 */
import { cleanup, render, screen } from "@testing-library/react";
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
});