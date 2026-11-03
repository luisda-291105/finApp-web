/**
 * @uso        Rutas informativas spec 016: contactos y correos dentro del dashboard demo
 * @funciones  it.each con rutas /dashboard/contactos y /dashboard/correos
 * @datos      N/A
 * @eventos    Navegación a rutas de demo
 * @estados    N/A
 * @usadoPor   vitest
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

// Mocks de servicios - DEBEN ir ANTES de imports (vitest hoistea)
vi.mock("../services/fuenteServicio", () => ({
  listarFuentes: () => Promise.resolve([]),
  crearFuente: () => Promise.resolve({ ok: true }),
  actualizarFuente: () => Promise.resolve({ ok: true }),
  eliminarFuente: () => Promise.resolve({ ok: true }),
  obtenerFuentePorId: () => Promise.resolve(null),
  obtenerFuentesPorUsuario: () => Promise.resolve([]),
}));

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

vi.mock("../services/gmailServicio", () => ({
  GMAIL_CONFIGURADO: false,
  listarCuentasGmail: () => Promise.resolve([]),
  obtenerConexionCuentaGmail: () => Promise.resolve({}),
  canjearCodigoGmail: () => Promise.resolve({}),
  eliminarCuentaGmail: () => Promise.resolve({}),
  iniciarCodigoAutorizacionGmail: () => Promise.resolve(""),
  prepararGoogleIdentityServices: () => Promise.resolve(),
}));

// Mock contextos
vi.mock("../context/UsuarioActivoContext", () => {
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

vi.mock("../context/TemaContext", () => ({
  TemaProvider: ({ children }) => children,
  useTema: () => ({ tema: "claro", alternarTema: vi.fn() }),
}));

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

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";
import App from "../App";

describe("rutas informativas de la spec 016", () => {
  it.each([
    ["/dashboard/contactos", "Contactos"],
    ["/dashboard/correos", "Correos"],
  ])("muestra %s dentro del dashboard de demostración", (ruta, titulo) => {
    render(
      <MemoryRouter initialEntries={[ruta]}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: titulo, level: 1 })).toBeInTheDocument();
  });
});