/**
 * @uso        Comprueba las rutas públicas, el acceso de prueba, el bloque de tarjetas y el cierre
 *             que navega (spec 011, RF-15)
 * @funciones  Pruebas de raíz, login, subrutas, sección tarjetas y foco en la vista de destino
 * @datos      Renderiza App con ubicaciones de MemoryRouter
 * @eventos    Navegación inicial; cierre de `AuthModal` en /login que navega a /dashboard
 * @estados    N/A
 * @usadoPor   vitest (npm run test)
 */

vi.hoisted(() => {
  vi.stubEnv("VITE_TRIAL_MODE", "true");
});

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

/** Las vistas del dashboard se descargan como chunks: dar margen en la suite completa. */
const ESPERA_CARGA = { timeout: 5000 };

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
  it("redirige la raíz a dashboard si ya hay sesión activa", async () => {
    renderRuta("/");

    expect(await screen.findByRole("heading", { name: "dashboard" }, ESPERA_CARGA)).toBeDefined();
  });

  it("muestra la landing cuando no hay sesión activa", () => {
    vi.spyOn(sessionStorage, "getItem").mockImplementation(() => null);
    renderRuta("/");

    expect(
      screen.getByRole("heading", { name: /Controla tu dinero/ })
    ).toBeDefined();
    expect(screen.queryByRole("heading", { name: "dashboard" })).toBeNull();
  });

  it("redirige /inicio a la landing (/)", () => {
    vi.spyOn(sessionStorage, "getItem").mockImplementation(() => null);
    renderRuta("/inicio");

    expect(
      screen.getByRole("heading", { name: /Controla tu dinero/ })
    ).toBeDefined();
  });

  it("muestra el login en su ruta directa si no hay sesión", async () => {
    vi.spyOn(sessionStorage, "getItem").mockImplementation(() => null);
    renderRuta("/login");

    expect(await screen.findByRole("dialog", {}, ESPERA_CARGA)).toBeDefined();
    expect(screen.getByText("Iniciar sesión")).toBeDefined();
  });

  it("permite abrir el dashboard directamente durante el trial", async () => {
    renderRuta("/dashboard");

    expect(await screen.findByRole("heading", { name: "dashboard" }, ESPERA_CARGA)).toBeDefined();
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

  it("permite abrir Contabilidad dentro del dashboard de demostración", async () => {
    renderRuta("/dashboard/contabilidad");

    expect(await screen.findByRole("heading", { name: "Contabilidad", level: 1 }, ESPERA_CARGA)).toBeDefined();
    expect(screen.getByRole("heading", { name: "Bolsillos", level: 2 })).toBeDefined();
    expect(screen.queryByText("Datos de demostración")).toBeNull();
  });

  it("muestra las tarjetas vacías para el usuario autenticado", async () => {
    renderRuta("/dashboard/tarjetas");

    expect(await screen.findByRole("heading", { name: "Tus tarjetas" })).toBeDefined();
    expect(screen.getByRole("heading", { name: "Tarjetas registradas" })).toBeDefined();
    expect(screen.getByText("Todavía no tienes tarjetas registradas.")).toBeDefined();
    expect(screen.queryByText("Datos de demostración")).toBeNull();
  });

  it("muestra la descripción de gestión en la sección tarjetas", async () => {
    renderRuta("/dashboard/tarjetas");

    expect(await screen.findByText("Administra tus tarjetas y revisa sus saldos.", {}, ESPERA_CARGA)).toBeDefined();
  });

  it("no renderiza las 3 cards fijas por defecto en la sección inicio", async () => {
    renderRuta("/dashboard");

    expect(await screen.findByRole("heading", { name: "dashboard" }, ESPERA_CARGA)).toBeDefined();
    expect(screen.queryByText("Balance disponible")).toBeNull();
    expect(screen.queryByText("Ingresos del mes")).toBeNull();
    expect(screen.queryByText("Gastos del mes")).toBeNull();
  });

  it("redirige la ruta retirada de transacciones al inicio del dashboard", async () => {
    renderRuta("/dashboard/transacciones");

    expect(await screen.findByRole("heading", { name: "dashboard" }, ESPERA_CARGA)).toBeDefined();
  });

  it("conserva el placeholder en configuración", async () => {
    renderRuta("/dashboard/configuracion");

    expect(
      await screen.findByText("Ajusta tus preferencias de cuenta y seguridad.", {}, ESPERA_CARGA)
    ).toBeDefined();
  });

  it("mantiene la redirección de la ruta splat con las future flags v7 activadas", async () => {
    render(
      <MemoryRouter
        initialEntries={["/dashboard/ruta-inexistente"]}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <App />
      </MemoryRouter>
    );

    // El catch-all interno de /dashboard/* sigue llevando al inicio del dashboard
    expect(await screen.findByRole("heading", { name: "dashboard" }, ESPERA_CARGA)).toBeDefined();
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

  const renderLogin = () => {
    vi.spyOn(sessionStorage, "getItem").mockImplementation(() => null);
    return render(
      <MemoryRouter initialEntries={["/login"]}>
        <App />
      </MemoryRouter>
    );
  };

  /** La superficie de origen (`AuthModal`) enfoca su contenedor con la trampa real al abrir. */
  const esperarFocoEnElDialogo = async () => {
    const dialogo = await screen.findByRole("dialog");
    await waitFor(() => expect(document.activeElement).toBe(dialogo));
    return dialogo;
  };

  /** La navegación se completa cuando la vista de destino ya está renderizada. */
  const esperarDestinoLanding = async () => {
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /Controla tu dinero/ })).toBeTruthy();
    });
  };

  it.each([
    ["móvil", 375, 'header a[href="/"]'],
    ["pantallas grandes (≥768px)", 1024, 'header a[href="/"]'],
  ])(
    "AC-22(a): en %s, cerrar con la «X» llega a la landing y enfoca su primer control",
    async (_versionVista, ancho, selectorDestino) => {
      fijarAncho(ancho);
      const usuario = userEvent.setup();
      renderLogin();
      await esperarFocoEnElDialogo();

      await usuario.click(
        screen.getByRole("button", { name: "Cerrar ventana de acceso" })
      );
      await esperarDestinoLanding();

      const controlDestino = document.querySelector(selectorDestino);
      expect(controlDestino).toBeTruthy();
      await waitFor(() => expect(document.activeElement).toBe(controlDestino));
      expect(document.activeElement).not.toBe(document.body);
    }
  );

  it("AC-22(a): con Esc en móvil, el cierre llega a la landing y enfoca el destino", async () => {
    fijarAncho(375);
    const usuario = userEvent.setup();
    renderLogin();
    await esperarFocoEnElDialogo();

    await usuario.keyboard("{Escape}");
    await esperarDestinoLanding();

    const controlDestino = document.querySelector('header a[href="/"]');
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
    await esperarDestinoLanding();

    // Ninguna superficie modal sobrevive a la navegación…
    expect(screen.queryByRole("dialog")).toBeNull();

    // …y el candidato elegido pertenece a la navegación de la vista de destino.
    const controlDestino = document.querySelector('header a[href="/"]');
    await waitFor(() => expect(document.activeElement).toBe(controlDestino));
    expect(document.activeElement.closest('[role="dialog"]')).toBeNull();
    expect(
      document.querySelector("header").contains(document.activeElement)
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
