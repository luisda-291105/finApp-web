/**
 * @uso        Pruebas del modal Fuentes (spec 025): accesibilidad, selección de tipo, contenido, creación y cierre
 * @funciones  render, screen, within, fireEvent
 * @datos      Datos introducidos durante el montaje del modal
 * @eventos    Selección de tipo, escritura de contenido, submit del formulario, cierre con «X» y Escape
 * @estados    Arnés controla la apertura y desmonta ModalFuentes al cerrar
 * @usadoPor   Vitest
 */
import { useRef, useState } from "react";
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ModalFuentes from "../../../../components/domain/modales/ModalFuentes";
import { UsuarioActivoProvider } from "../../../../context/UsuarioActivoContext";
import * as fuenteServicio from "../../../../services/fuenteServicio";

const USUARIO = { idUsuario: "12345678", nombre: "Ana Pérez" };

/** Fija el breakpoint requerido por el hook compartido de retorno de foco. */
const fijarViewport = (ancho) => {
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: ancho,
  });
  window.matchMedia = vi.fn().mockImplementation((query) => {
    const minimo = Number((/(\d+)px/.exec(query) || [])[1] ?? 0);
    return {
      matches: ancho >= minimo,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    };
  });
};

function ArnésModalFuentes({ alGuardar }) {
  const [abierto, setAbierto] = useState(false);
  const triggerRef = useRef(null);

  return (
    <UsuarioActivoProvider>
      <button ref={triggerRef} type="button" onClick={() => setAbierto(true)}>
        Abrir registro de fuentes
      </button>
      <ModalFuentes
        abierto={abierto}
        alCerrar={() => setAbierto(false)}
        triggerRef={triggerRef}
        alGuardar={alGuardar}
      />
    </UsuarioActivoProvider>
  );
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  fijarViewport(1024);
});

beforeEach(() => {
  fijarViewport(1024);
  window.localStorage.getItem.mockReturnValue(JSON.stringify(USUARIO));
});

describe("ModalFuentes", () => {
  it("no muestra el diálogo hasta que se monta abierto", async () => {
    const usuario = userEvent.setup();
    render(<ArnésModalFuentes />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await usuario.click(screen.getByRole("button", { name: "Abrir registro de fuentes" }));

    const dialogo = screen.getByRole("dialog", { name: "Registro de fuentes" });
    expect(dialogo).toHaveAttribute("aria-modal", "true");
    expect(dialogo).toHaveAttribute("aria-labelledby", "fuentes-titulo");
    expect(dialogo).toHaveClass(
      "inset-shadow-[0_1px_1px_0_rgba(255,255,255,0.25)]",
    );
  });

  it("asocia etiquetas accesibles a selector de tipo y campo de contenido", async () => {
    const usuario = userEvent.setup();
    render(<ArnésModalFuentes />);
    await usuario.click(screen.getByRole("button", { name: "Abrir registro de fuentes" }));

    const tipoSelect = screen.getByRole("combobox", { name: "Tipo de fuente" });
    const contenidoInput = screen.getByRole("textbox", { name: "Contenido de la fuente" });

    expect(tipoSelect).toBeInTheDocument();
    expect(contenidoInput).toBeInTheDocument();

    await usuario.selectOptions(tipoSelect, "TELEFONO");
    await usuario.type(contenidoInput, "+52 55 1234 5678");

    expect(tipoSelect).toHaveValue("TELEFONO");
    expect(contenidoInput).toHaveValue("+52 55 1234 5678");
  });

  it("registra la fuente llamando a crearFuente con los campos esperados", async () => {
    const usuario = userEvent.setup();
    const crearSpy = vi.spyOn(fuenteServicio, "crearFuente").mockResolvedValue({
      idFuente: "123-uuid",
      tipo: "CORREO",
      contenido: "test@correo.com",
      estado: true,
      fechaCreacion: "2026-10-29",
    });
    const alGuardarSpy = vi.fn();

    render(<ArnésModalFuentes alGuardar={alGuardarSpy} />);
    await usuario.click(screen.getByRole("button", { name: "Abrir registro de fuentes" }));

    const dialogo = screen.getByRole("dialog", { name: "Registro de fuentes" });
    const contenido = within(dialogo).getByRole("textbox", { name: "Contenido de la fuente" });
    await usuario.type(contenido, "test@correo.com");

    const botonSubmit = within(dialogo).getByRole("button", { name: "Registrar fuente" });
    await usuario.click(botonSubmit);

    await waitFor(() => {
      expect(crearSpy).toHaveBeenCalledTimes(1);
    });

    const llamada = crearSpy.mock.calls[0][0];
    expect(llamada.usuario).toEqual({ idUsuario: USUARIO.idUsuario });
    expect(llamada.tipo).toBe("CORREO");
    expect(llamada.contenido).toBe("test@correo.com");
    expect(llamada.estado).toBe(true);
    expect(llamada.idFuente).toBeDefined();
    expect(llamada.fechaCreacion).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(alGuardarSpy).toHaveBeenCalled();
  });

  it("cierra con Escape o con el control accesible y descarta los campos al reabrir", async () => {
    const usuario = userEvent.setup();
    render(<ArnésModalFuentes />);

    const abrir = screen.getByRole("button", { name: "Abrir registro de fuentes" });
    await usuario.click(abrir);
    await usuario.type(screen.getByRole("textbox", { name: "Contenido de la fuente" }), "uno@ejemplo.test");
    await usuario.keyboard("{Escape}");

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
    expect(abrir).toHaveFocus();

    await usuario.click(abrir);
    expect(screen.getByRole("textbox", { name: "Contenido de la fuente" })).toHaveValue("");

    await usuario.type(screen.getByRole("textbox", { name: "Contenido de la fuente" }), "dos@ejemplo.test");
    await usuario.click(screen.getByRole("button", { name: "Cerrar registro de fuentes" }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    await usuario.click(abrir);
    expect(screen.getByRole("textbox", { name: "Contenido de la fuente" })).toHaveValue("");
  });
});
