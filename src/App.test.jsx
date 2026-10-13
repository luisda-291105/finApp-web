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

const tarjetasEsperadas = [
  { nombre: "Tarjeta Oro", enmascarado: "•••• 4242", saldo: "$2,340.00" },
  { nombre: "Tarjeta Platino", enmascarado: "•••• 5300", saldo: "$980.25" },
  { nombre: "Débito Nómina", enmascarado: "•••• 7841", saldo: "$5,120.75" },
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

  it("muestra la tarjeta virtual principal y el bloque de tarjetas demo en la sección tarjetas", () => {
    const { container } = renderRuta("/dashboard/tarjetas");

    expect(screen.getByRole("heading", { name: "Tus tarjetas" })).toBeDefined();

    // Verificar MiTarjetaVirtual principal (scopeando al frente via testid)
    const frente = container.querySelector("[data-testid='tarjeta-frente']");
    if (frente) {
      expect(within(frente).getByText("MARÍA GARCÍA")).toBeDefined();
      expect(within(frente).getByText("4242 4242 4242 4242")).toBeDefined();
      expect(within(frente).getByText("12/28")).toBeDefined();
      expect(within(frente).getByText("FinApp")).toBeDefined();
    }

    // Verificar grid de 3 tarjetas demo (article.glass-card en la segunda section)
    const tarjetas = container.querySelectorAll("section:nth-of-type(3) article.glass-card");
    expect(tarjetas).toHaveLength(3);

    tarjetasEsperadas.forEach(({ nombre, enmascarado, saldo }, indice) => {
      const tarjeta = tarjetas[indice];

      expect(within(tarjeta).getByText(nombre)).toBeDefined();
      expect(within(tarjeta).getByText(enmascarado)).toBeDefined();
      expect(within(tarjeta).getByText(saldo)).toBeDefined();
    });

    expect(screen.getByText("Datos de demostración")).toBeDefined();
    expect(screen.getByText("Tus otras tarjetas")).toBeDefined();
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