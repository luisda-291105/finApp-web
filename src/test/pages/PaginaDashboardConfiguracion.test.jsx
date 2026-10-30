import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import PaginaDashboardConfiguracion from "../../pages/PaginaDashboardConfiguracion";
import { UsuarioActivoProvider } from "../../context/UsuarioActivoContext";
import * as fuenteServicio from "../../services/fuenteServicio";

const USUARIO = { idUsuario: "12345678", nombre: "Ana Pérez" };

beforeEach(() => {
  window.localStorage.getItem.mockReturnValue(JSON.stringify(USUARIO));
  window.matchMedia = vi.fn(() => ({
    matches: true,
    media: "(min-width: 768px)",
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
  vi.spyOn(fuenteServicio, "obtenerFuentesPorUsuario").mockResolvedValue([]);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  window.localStorage.setItem.mockClear();
});

describe("PaginaDashboardConfiguracion", () => {
  it("consulta y registra fuentes del usuario activo y reinicia el campo al reabrir", async () => {
    const usuario = userEvent.setup();
    const crearFuente = vi.spyOn(fuenteServicio, "crearFuente").mockImplementation(async (fuente) => fuente);
    const guardarLocalSpy = vi.spyOn(window.localStorage, "setItem");

    render(
      <UsuarioActivoProvider>
        <PaginaDashboardConfiguracion />
      </UsuarioActivoProvider>
    );

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
    render(<UsuarioActivoProvider><PaginaDashboardConfiguracion /></UsuarioActivoProvider>);

    await usuario.click(await screen.findByRole("button", { name: "Editar fuente ana@ejemplo.test" }));
    await usuario.selectOptions(screen.getByLabelText("Tipo de ana@ejemplo.test"), "TELEFONO");
    await usuario.clear(screen.getByLabelText("Contenido de la fuente"));
    await usuario.type(screen.getByLabelText("Contenido de la fuente"), "+573001234567");
    await usuario.selectOptions(screen.getByLabelText("Estado"), "false");
    await usuario.click(screen.getByRole("button", { name: "Guardar" }));

    await waitFor(() => expect(actualizarFuente).toHaveBeenCalledWith("fuente-1", expect.objectContaining({
      tipo: "TELEFONO",
      contenido: "+573001234567",
      estado: false,
      usuario: { idUsuario: USUARIO.idUsuario },
    }), USUARIO.idUsuario));
    expect(await screen.findByText("Inactivo")).toBeInTheDocument();
    expect(screen.getAllByText("+573001234567")).toHaveLength(2);
  });

  it("elimina una fuente solo después de confirmar la acción", async () => {
    const usuario = userEvent.setup();
    vi.spyOn(fuenteServicio, "obtenerFuentesPorUsuario").mockResolvedValue([{
      idFuente: "fuente-2", tipo: "OTRO", contenido: "Cuenta antigua", estado: true, fechaCreacion: "2026-10-20",
    }]);
    const eliminarFuente = vi.spyOn(fuenteServicio, "eliminarFuente").mockResolvedValue(true);
    render(<UsuarioActivoProvider><PaginaDashboardConfiguracion /></UsuarioActivoProvider>);

    await usuario.click(await screen.findByRole("button", { name: "Eliminar fuente Cuenta antigua" }));
    expect(eliminarFuente).not.toHaveBeenCalled();
    await usuario.click(screen.getByRole("button", { name: "Confirmar" }));

    await waitFor(() => expect(eliminarFuente).toHaveBeenCalledWith("fuente-2", USUARIO.idUsuario));
    expect(screen.queryByText("Cuenta antigua")).not.toBeInTheDocument();
  });

  it("mantiene datos y acciones de fuentes disponibles en la vista móvil", async () => {
    vi.spyOn(fuenteServicio, "obtenerFuentesPorUsuario").mockResolvedValue([{
      idFuente: "fuente-movil", tipo: "CORREO", contenido: "correo-muy-largo@ejemplo.test", estado: false, fechaCreacion: "2026-10-20",
    }]);
    render(<UsuarioActivoProvider><PaginaDashboardConfiguracion /></UsuarioActivoProvider>);
    expect(await screen.findAllByText("correo-muy-largo@ejemplo.test")).toHaveLength(2);
    expect(screen.getByText("CORREO · Inactivo")).toBeInTheDocument();
    expect(screen.getByText("Fecha: 2026-10-20")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Editar fuente correo-muy-largo@ejemplo.test en móvil" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Eliminar fuente correo-muy-largo@ejemplo.test en móvil" })).toBeInTheDocument();
  });

});
