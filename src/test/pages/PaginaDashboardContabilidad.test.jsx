/**
 * @uso        Verifica el resumen y los movimientos demostrativos de Contabilidad
 * @funciones  Pruebas de renderizado, navegación y estado vacío
 * @datos      Datos locales de demostración; no usa servicios ni persistencia
 * @eventos    Clic en el botón deshabilitado "Nuevo movimiento"
 * @estados    N/A
 * @usadoPor   vitest (npm test)
 */

// Mock window.matchMedia para jsdom
Object.defineProperty(window, "matchMedia", {
  writable: true,
  configurable: true,
  value: (query) => {
    const minimo = /min-width:\s*(\d+)px/.exec(query);
    return {
      matches: minimo ? window.innerWidth >= Number(minimo[1]) : false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => {},
    };
  },
});
Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: 1024 });

// Mock contextos
vi.mock("../../context/UsuarioActivoContext", () => {
  const USUARIO = { idUsuario: "12345678", nombre: "Ana Pérez", fechaCreacion: "2026-01-01" };
  return {
    UsuarioActivoProvider: ({ children }) => children,
    useUsuarioActivo: () => ({
      usuario: USUARIO,
      estadoSesion: "autenticado",
      guardarUsuario: vi.fn(),
      limpiarUsuario: vi.fn(),
      cerrarSesion: vi.fn().mockResolvedValue(undefined),
    }),
  };
});

vi.mock("../../context/TemaContext", () => ({
  TemaProvider: ({ children }) => children,
  useTema: () => ({ tema: "claro", alternarTema: vi.fn() }),
}));

vi.mock("../../context/GmailContext", () => ({
  GmailProvider: ({ children }) => children,
  useGmail: () => ({
    tokenGmail: "",
    cuentaGmail: "",
    cuentasGmail: [],
    cuentaSeleccionadaId: null,
    gisListo: true,
    conexionCargando: false,
    errorGmail: "",
    conectarGmail: vi.fn(),
    desconectarGmail: vi.fn(),
    seleccionarCuentaGmail: vi.fn(),
    limpiarErrorGmail: vi.fn(),
  }),
}));

import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import PaginaDashboardContabilidad from "../../pages/PaginaDashboardContabilidad";

afterEach(cleanup);

function renderPagina(props = {}) {
  return render(
    <MemoryRouter>
      <PaginaDashboardContabilidad {...props} />
    </MemoryRouter>
  );
}

describe("PaginaDashboardContabilidad", () => {
  it("muestra el encabezado, las métricas y marca los importes como demostración", () => {
    renderPagina();

    expect(screen.getByRole("heading", { name: "Contabilidad", level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Resumen contable", level: 2 })).toBeInTheDocument();
    expect(screen.getByText("Datos de demostración")).toBeInTheDocument();

    ["Gastos", "Ahorros", "Balance disponible"].forEach((etiqueta) => {
      expect(screen.getByRole("heading", { name: etiqueta, level: 3 })).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: "Ver detalle de Gastos" })).toHaveTextContent("277.000");
    expect(screen.getByRole("button", { name: "Ver detalle de Ahorros" })).toHaveTextContent("450.000");
    expect(screen.getByRole("button", { name: "Ver detalle de Balance disponible" })).toHaveTextContent("3.073.000");
  });

  it("muestra fecha, concepto, monto y tipo de cada movimiento de ejemplo", () => {
    renderPagina();

    const lista = screen.getByRole("list", { name: "Movimientos de demostración" });
    expect(within(lista).getAllByRole("listitem")).toHaveLength(7);
    const pagosNomina = within(lista).getAllByText("Pago de nómina");
    expect(pagosNomina.length).toBeGreaterThanOrEqual(1);
    const fechaActual = new Date();
    const fechaDeDemo = new Date(Date.UTC(fechaActual.getFullYear(), fechaActual.getMonth(), 13)).toISOString().slice(0, 10);
    expect(pagosNomina[0].parentElement.querySelector("time")).toHaveAttribute("dateTime", fechaDeDemo);
    const ingresos = within(lista).getAllByText("Ingreso");
    expect(ingresos.length).toBeGreaterThanOrEqual(1);
    expect(within(lista).getByText(/\+\$.*3\.800\.000/)).toBeInTheDocument();
    expect(within(lista).getByText("Mercado semanal")).toBeInTheDocument();
    const ahorros = within(lista).getAllByText("Ahorro");
    expect(ahorros.length).toBeGreaterThanOrEqual(1);
  });

  it("deja claro que Nuevo movimiento no registra operaciones reales", async () => {
    const usuario = userEvent.setup();
    renderPagina();

    const boton = screen.getByRole("button", { name: "Nuevo movimiento" });
    expect(boton).toBeDisabled();
    await usuario.click(boton);
    expect(boton).toBeDisabled();
    expect(screen.getByText("El registro de movimientos no está disponible en esta demostración.")).toBeInTheDocument();
  });

  it("muestra el estado vacío cuando no hay movimientos", () => {
    renderPagina({ movimientos: [] });

    expect(screen.getByRole("heading", { name: "Movimientos recientes", level: 2 })).toBeInTheDocument();
    expect(screen.getByText("Sin movimientos registrados")).toBeInTheDocument();
    expect(screen.queryByRole("list", { name: "Movimientos de demostración" })).toBeNull();
  });
});
