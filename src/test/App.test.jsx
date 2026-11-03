/**
 * @uso        Comprueba las rutas públicas, el acceso de prueba, el bloque de tarjetas y el cierre
 *             que navega (spec 011, RF-15)
 * @funciones  Pruebas de raíz, login, subrutas, sección tarjetas y foco en la vista de destino
 * @datos      Renderiza App con ubicaciones de MemoryRouter
 * @eventos    Navegación inicial; cierre de `AuthModal` en /login que navega a /dashboard
 * @estados    N/A
 * @usadoPor   vitest (npm run test)
 */

// Mock window.matchMedia para jsdom (usado por useBreakpoint hook) - DEBE ir ANTES de imports
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

// Mock window.innerWidth para breakpoint tests (default: pantallas grandes)
Object.defineProperty(window, "innerWidth", {
  writable: true,
  configurable: true,
  value: 1024,
});

// Mocks de servicios - DEBEN ir ANTES de cualquier import (vitest los hoistea al tope)
vi.mock("../services/grupoServicio", () => ({
  listarGrupos: () => Promise.resolve([]),
  crearGrupo: () => Promise.resolve({ ok: true }),
  actualizarGrupo: () => Promise.resolve({ ok: true }),
  eliminarGrupo: () => Promise.resolve({ ok: true }),
}));

vi.mock("../services/tarjetaServicio", () => ({
  obtenerTarjetasPorUsuario: () => Promise.resolve([]),
  crearTarjeta: () => Promise.resolve({ ok: true }),
  actualizarTarjeta: () => Promise.resolve({ ok: true }),
  eliminarTarjeta: () => Promise.resolve({ ok: true }),
}));

vi.mock("../services/muestraServicio", () => ({
  listarMuestras: () => Promise.resolve([]),
  crearMuestra: () => Promise.resolve({ ok: true }),
  actualizarMuestra: () => Promise.resolve({ ok: true }),
  eliminarMuestra: () => Promise.resolve({ ok: true }),
}));

vi.mock("../services/fuenteServicio", () => ({
  listarFuentes: () => Promise.resolve([]),
  crearFuente: () => Promise.resolve({ ok: true }),
  actualizarFuente: () => Promise.resolve({ ok: true }),
  eliminarFuente: () => Promise.resolve({ ok: true }),
  obtenerFuentePorId: () => Promise.resolve(null),
  obtenerFuentesPorUsuario: () => Promise.resolve([]),
}));

vi.mock("../services/gmailServicio", () => ({
  GMAIL_CONFIGURADO: false,
  listarCuentasGmail: () => Promise.resolve([]),
  obtenerConexionCuentaGmail: () => Promise.resolve({}),
  canjearCodigoGmail: () => Promise.resolve({}),
  eliminarCuentaGmail: () => Promise.resolve({}),
  iniciarCodigoAutorizacionGmail: () => Promise.resolve(""),
  prepararGoogleIdentityServices: () => Promise.resolve(),
}));

// Mock del contexto de usuario activo - respeta sessionStorage
vi.mock("../context/UsuarioActivoContext", () => {
  const useUsuarioActivo = () => {
    const haySesion = sessionStorage.getItem("finapp_sesion_pestana") === "activa";
    return {
      usuario: haySesion ? { idUsuario: "usuario-prueba", nombre: "Ana Prueba", fechaCreacion: "2026-01-01" } : null,
      estadoSesion: haySesion ? "autenticado" : "sin-sesion",
      guardarUsuario: vi.fn(),
      limpiarUsuario: vi.fn(),
      cerrarSesion: vi.fn().mockResolvedValue(undefined),
    };
  };
  return {
    UsuarioActivoProvider: ({ children }) => children,
    useUsuarioActivo,
  };
});

// Mock del contexto de Gmail - evita efectos secundarios
vi.mock("../context/GmailContext", () => ({
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

import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import App from "../App";

beforeEach(() => {
  vi.spyOn(sessionStorage, "getItem").mockImplementation((key) =>
    key === "finapp_sesion_pestana" ? "activa" : null
  );
});

afterEach(() => {
  vi.restoreAllMocks();
  sessionStorage.removeItem("finapp_sesion_pestana");
});

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
    expect(screen.queryByRole("heading", { name: "dashboard" })).toBeNull();
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

    expect(screen.getByRole("heading", { name: "dashboard" })).toBeDefined();
    expect(screen.getByRole("button", { name: "crear muestra" })).toBeDefined();
  });

  it("redirige al inicio si no hay una sesión activa", async () => {
      // Sobrescribe el spy para este test: sin sesión activa
      vi.spyOn(sessionStorage, "getItem").mockImplementation((key) =>
        key === "finapp_sesion_pestana" ? null : null
      );
      renderRuta("/dashboard");
      expect(await screen.findByRole("heading", { name: /Controla tu dinero/ })).toBeInTheDocument();
    });

  it("permite abrir Contabilidad dentro del dashboard de demostración", () => {
    renderRuta("/dashboard/contabilidad");

    expect(screen.getByRole("heading", { name: "Contabilidad", level: 1 })).toBeDefined();
    expect(screen.getByText("Datos de demostración")).toBeDefined();
  });

  it("muestra las tarjetas vacías para el usuario autenticado", async () => {
    renderRuta("/dashboard/tarjetas");

    expect(await screen.findByRole("heading", { name: "Tus tarjetas" })).toBeDefined();
    expect(screen.getByRole("heading", { name: "Tarjetas registradas" })).toBeDefined();
    expect(screen.getByText("Todavía no tienes tarjetas registradas.")).toBeDefined();
    expect(screen.queryByText("Datos de demostración")).toBeNull();
  });

  it("muestra la descripción de gestión en la sección tarjetas", () => {
    renderRuta("/dashboard/tarjetas");

    expect(screen.getByText("Administra tus tarjetas y revisa sus saldos.")).toBeDefined();
  });

  it("no renderiza las 3 cards fijas por defecto en la sección inicio", () => {
    renderRuta("/dashboard");

    expect(screen.getByRole("heading", { name: "dashboard" })).toBeDefined();
    expect(screen.queryByText("Balance disponible")).toBeNull();
    expect(screen.queryByText("Ingresos del mes")).toBeNull();
    expect(screen.queryByText("Gastos del mes")).toBeNull();
  });

  it("redirige la ruta retirada de transacciones al inicio del dashboard", () => {
    renderRuta("/dashboard/transacciones");

    expect(screen.getByRole("heading", { name: "dashboard" })).toBeDefined();
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
    expect(screen.getByRole("heading", { name: "dashboard" })).toBeDefined();
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
      expect(screen.getByRole("heading", { name: "dashboard" })).toBeTruthy();
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
