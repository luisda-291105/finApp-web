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
vi.mock("../../services/fuenteServicio", () => ({
  obtenerFuentesPorUsuario: () => Promise.resolve([]),
  crearFuente: () => Promise.resolve({ ok: true }),
  actualizarFuente: () => Promise.resolve({ ok: true }),
  eliminarFuente: () => Promise.resolve({ ok: true }),
  listarFuentes: () => Promise.resolve([]),
  obtenerFuentePorId: () => Promise.resolve(null),
}));

vi.mock("../../services/gmailServicio", () => ({
  GMAIL_CONFIGURADO: false,
  listarCuentasGmail: () => Promise.resolve([]),
  obtenerConexionCuentaGmail: () => Promise.resolve({}),
  canjearCodigoGmail: () => Promise.resolve({}),
  eliminarCuentaGmail: () => Promise.resolve({}),
  iniciarCodigoAutorizacionGmail: () => Promise.resolve(""),
  prepararGoogleIdentityServices: () => Promise.resolve(),
}));

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

import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ConfiguracionPage as PaginaDashboardConfiguracion } from "../../features/configuracion";
import * as fuenteServicio from "../../services/fuenteServicio";

const USUARIO = { idUsuario: "12345678", nombre: "Ana Pérez" };

beforeEach(() => {
  vi.spyOn(fuenteServicio, "obtenerFuentesPorUsuario").mockResolvedValue([]);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("PaginaDashboardConfiguracion", () => {
  it("consulta y registra fuentes del usuario activo y reinicia el campo al reabrir", async () => {
    const usuario = userEvent.setup();
    const crearFuente = vi.spyOn(fuenteServicio, "crearFuente").mockImplementation(async (fuente) => fuente);
    const guardarLocalSpy = vi.spyOn(window.localStorage, "setItem");

    render(<PaginaDashboardConfiguracion />);

    expect(
      screen.getByRole("heading", { name: "Configuración", level: 1 })
    ).toBeInTheDocument();
    expect(
      screen.getByText("Ajusta tus preferencias de cuenta y seguridad.")
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Fuentes registradas" })).toBeInTheDocument();
    expect(screen.getByText("Consulta y administra las fuentes asociadas a tu usuario.")).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    const disparador = screen.getByRole("button", { name: "Registrar fuentes" });
    await usuario.click(disparador);

    const dialogo = screen.getByRole("dialog", { name: "Registro de fuentes" });
    expect(within(dialogo).getByRole("button", { name: /Configura Gmail/ })).toBeDisabled();
    expect(screen.queryByRole("button", { name: /Agregar cuenta Gmail/ })).not.toBeInTheDocument();
    const contenido = within(dialogo).getByRole("textbox", { name: "Contenido de la fuente" });

    await usuario.type(contenido, "persona@ejemplo.test");
    await usuario.click(within(dialogo).getByRole("button", { name: "Registrar fuente" }));

    await waitFor(() => expect(crearFuente).toHaveBeenCalledWith(expect.objectContaining({
      usuario: { idUsuario: USUARIO.idUsuario },
      tipo: "CORREO",
      contenido: "persona@ejemplo.test",
    })));
    await waitFor(() => expect(dialogo).not.toBeInTheDocument());
    expect(guardarLocalSpy).not.toHaveBeenCalled();

    expect(disparador).toHaveFocus();

    await usuario.click(disparador);
    expect(screen.getByRole("textbox", { name: "Contenido de la fuente" })).toHaveValue("");
  });

  it("edita tipo, contenido y estado de una fuente registrada", async () => {
    const usuario = userEvent.setup();
    vi.spyOn(fuenteServicio, "obtenerFuentesPorUsuario").mockResolvedValue([{
      idFuente: "fuente-1", tipo: "CORREO", contenido: "ana@ejemplo.test", estado: true, fechaCreacion: "2026-10-20",
    }]);
    const actualizarFuente = vi.spyOn(fuenteServicio, "actualizarFuente").mockImplementation(async (idFuente, fuente) => ({ idFuente, ...fuente }));
    render(<PaginaDashboardConfiguracion />);

    await usuario.click(await screen.findByRole("button", { name: "Ver fuente ana@ejemplo.test" }));
    await usuario.click(screen.getByRole("button", { name: "Editar", exact: true }));
    await usuario.selectOptions(screen.getByLabelText("Tipo"), "TELEFONO");
    await usuario.clear(screen.getByLabelText("Contenido"));
    await usuario.type(screen.getByLabelText("Contenido"), "+573001234567");
    await usuario.selectOptions(screen.getByLabelText("Estado"), "false");
    await usuario.click(screen.getByRole("button", { name: "Guardar cambios" }));

    await waitFor(() => expect(actualizarFuente).toHaveBeenCalledWith("fuente-1", expect.objectContaining({
      tipo: "TELEFONO",
      contenido: "+573001234567",
      estado: false,
      usuario: { idUsuario: USUARIO.idUsuario },
    }), USUARIO.idUsuario));
    expect((await screen.findAllByText("Inactiva")).length).toBeGreaterThan(0);
    expect(screen.getAllByText("+573001234567")).toHaveLength(2);
  });

  it("elimina una fuente solo después de confirmar la acción", async () => {
    const usuario = userEvent.setup();
    vi.spyOn(fuenteServicio, "obtenerFuentesPorUsuario").mockResolvedValue([{
      idFuente: "fuente-2", tipo: "OTRO", contenido: "Cuenta antigua", estado: true, fechaCreacion: "2026-10-20",
    }]);
    const eliminarFuente = vi.spyOn(fuenteServicio, "eliminarFuente").mockResolvedValue(true);
    render(<PaginaDashboardConfiguracion />);

    await usuario.click(await screen.findByRole("button", { name: "Ver fuente Cuenta antigua" }));
    await usuario.click(screen.getByRole("button", { name: "Eliminar", exact: true }));
    expect(eliminarFuente).not.toHaveBeenCalled();
    await usuario.click(screen.getByRole("button", { name: "Confirmar eliminación" }));

    await waitFor(() => expect(eliminarFuente).toHaveBeenCalledWith("fuente-2", USUARIO.idUsuario));
    expect(screen.queryByText("Cuenta antigua")).not.toBeInTheDocument();
  });

  it("mantiene datos y acciones de fuentes disponibles en la vista móvil", async () => {
    vi.spyOn(fuenteServicio, "obtenerFuentesPorUsuario").mockResolvedValue([{
      idFuente: "fuente-movil", tipo: "CORREO", contenido: "correo-muy-largo@ejemplo.test", estado: false, fechaCreacion: "2026-10-20",
    }]);
    render(<PaginaDashboardConfiguracion />);
    expect(await screen.findAllByText("correo-muy-largo@ejemplo.test")).toHaveLength(1);
    expect(screen.getAllByText("CORREO").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Inactiva").length).toBeGreaterThan(0);
    expect(screen.queryByText("Cuenta Gmail conectada")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ver fuente correo-muy-largo@ejemplo.test" })).toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole("button", { name: "Ver fuente correo-muy-largo@ejemplo.test" }));
    expect(screen.getByRole("dialog", { name: "Detalle de fuente" })).toBeInTheDocument();
    expect(screen.getByText("2026-10-20")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Editar", exact: true })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Eliminar", exact: true })).toBeInTheDocument();
  });

});
