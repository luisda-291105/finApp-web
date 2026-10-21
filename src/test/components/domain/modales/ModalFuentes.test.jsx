/**
 * @uso        Pruebas del modal Fuentes: accesibilidad, entrada temporal, no-op y descarte al cerrar
 * @funciones  render, screen, within, fireEvent
 * @datos      Datos introducidos localmente durante el montaje del modal
 * @eventos    Escritura, clic en el botón demo, cierre con «X» y Escape
 * @estados    Arnés controla la apertura y desmonta ModalFuentes al cerrar
 * @usadoPor   Vitest
 */
import { useRef, useState } from "react";
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ModalFuentes from "../../../../components/domain/modales/ModalFuentes";

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

function ArnésModalFuentes() {
  const [abierto, setAbierto] = useState(false);
  const triggerRef = useRef(null);

  return (
    <>
      <button ref={triggerRef} type="button" onClick={() => setAbierto(true)}>
        Abrir registro de fuentes
      </button>
      <ModalFuentes
        abierto={abierto}
        alCerrar={() => setAbierto(false)}
        triggerRef={triggerRef}
      />
    </>
  );
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  fijarViewport(1024);
});

beforeEach(() => fijarViewport(1024));

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

  it("asocia etiquetas accesibles a campos de texto para correo y teléfono", async () => {
    const usuario = userEvent.setup();
    render(<ArnésModalFuentes />);
    await usuario.click(screen.getByRole("button", { name: "Abrir registro de fuentes" }));

    const correo = screen.getByRole("textbox", { name: "Correo electrónico" });
    const telefono = screen.getByRole("textbox", { name: "Teléfono" });

    expect(correo).toHaveAttribute("type", "text");
    expect(telefono).toHaveAttribute("type", "text");

    await usuario.type(correo, "persona@ejemplo.test");
    await usuario.type(telefono, "+1 555 0100");

    expect(correo).toHaveValue("persona@ejemplo.test");
    expect(telefono).toHaveValue("+1 555 0100");
  });

  it("el botón demo es no-op y no envía un formulario ni muestra confirmaciones", async () => {
    const usuario = userEvent.setup();
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    render(<ArnésModalFuentes />);
    await usuario.click(screen.getByRole("button", { name: "Abrir registro de fuentes" }));

    const dialogo = screen.getByRole("dialog", { name: "Registro de fuentes" });
    const correo = within(dialogo).getByRole("textbox", { name: "Correo electrónico" });
    const telefono = within(dialogo).getByRole("textbox", { name: "Teléfono" });
    await usuario.type(correo, "persona@ejemplo.test");
    await usuario.type(telefono, "5550100");
    await usuario.click(within(dialogo).getByRole("button", { name: "Botón de demostración" }));

    expect(correo).toHaveValue("persona@ejemplo.test");
    expect(telefono).toHaveValue("5550100");
    expect(dialogo.querySelector("form")).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(within(dialogo).queryByText(/conectad[oa]|registrad[oa]/i)).not.toBeInTheDocument();
  });

  it("cierra con Escape o con el control accesible y descarta los campos al reabrir", async () => {
    const usuario = userEvent.setup();
    render(<ArnésModalFuentes />);

    const abrir = screen.getByRole("button", { name: "Abrir registro de fuentes" });
    await usuario.click(abrir);
    await usuario.type(screen.getByRole("textbox", { name: "Correo electrónico" }), "uno@ejemplo.test");
    await usuario.type(screen.getByRole("textbox", { name: "Teléfono" }), "123");
    await usuario.keyboard("{Escape}");

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
    expect(abrir).toHaveFocus();

    await usuario.click(abrir);
    expect(screen.getByRole("textbox", { name: "Correo electrónico" })).toHaveValue("");
    expect(screen.getByRole("textbox", { name: "Teléfono" })).toHaveValue("");

    await usuario.type(screen.getByRole("textbox", { name: "Correo electrónico" }), "dos@ejemplo.test");
    await usuario.click(screen.getByRole("button", { name: "Cerrar registro de fuentes" }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    await usuario.click(abrir);
    expect(screen.getByRole("textbox", { name: "Correo electrónico" })).toHaveValue("");
    expect(screen.getByRole("textbox", { name: "Teléfono" })).toHaveValue("");
  });
});
