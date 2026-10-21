/**
 * @uso        Pruebas del disparador del asistente y su integración en la landing (spec 014, T7)
 * @funciones  test "muestra el disparador..." y siguientes (RF-01, AC-01)
 * @datos      Literales de la spec 014 §4.3 y className heredado copiado verbatim; sin datos externos
 * @eventos    Clic sobre el disparador y apertura del diálogo de ayuda
 * @estados    N/A
 * @usadoPor   vitest (npm run test)
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import PaginaInicio from "../../pages/PaginaInicio";

// Literal heredado del disparador (src/pages/PaginaInicio.jsx): se copia verbatim para el aserto
// literal de AC-01. Es un valor heredado, no un hexadecimal nuevo.
const CLASSNAME_DISPARADOR =
  "fixed bottom-6 right-6 z-40 w-11 h-11 rounded-full bg-[#0f1117]/80 hover:bg-[#1a7a5e] text-white border border-white/20 backdrop-blur-md flex items-center justify-center text-sm font-bold shadow-xl transition-all cursor-pointer hover:scale-105";

function renderPagina() {
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <PaginaInicio />
    </MemoryRouter>
  );
}

describe("PaginaInicio — disparador del asistente de ayuda (spec 014)", () => {
  beforeEach(() => {
    global.IntersectionObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      disconnect: vi.fn(),
    }));
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("expone el nombre accesible nuevo y no conserva el anterior", () => {
    renderPagina();

    expect(
      screen.getByRole("button", { name: "Abrir el asistente de ayuda" })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Ayuda y preguntas frecuentes" })
    ).toBeNull();
  });

  it("muestra el icono BotMessageSquare de 20×20 con aria-hidden y sin el glifo «?»", () => {
    renderPagina();

    const disparador = screen.getByRole("button", {
      name: "Abrir el asistente de ayuda",
    });
    const icono = disparador.querySelector("svg");

    expect(icono).not.toBeNull();
    expect(icono).toHaveAttribute("width", "20");
    expect(icono).toHaveAttribute("height", "20");
    expect(icono).toHaveAttribute("aria-hidden", "true");
    expect(screen.queryByText("?")).toBeNull();
  });

  it("conserva literalmente el className heredado y no añade aria-haspopup ni aria-expanded", () => {
    renderPagina();

    const disparador = screen.getByRole("button", {
      name: "Abrir el asistente de ayuda",
    });

    expect(disparador.className).toBe(CLASSNAME_DISPARADOR);
    expect(disparador).not.toHaveAttribute("aria-haspopup");
    expect(disparador).not.toHaveAttribute("aria-expanded");
  });

  it("abre el asistente de ayuda al pulsarlo y no la ventana de acceso", async () => {
    const usuario = userEvent.setup();
    renderPagina();

    const disparador = screen.getByRole("button", {
      name: "Abrir el asistente de ayuda",
    });

    await usuario.click(disparador);

    expect(
      screen.getByRole("dialog", { name: "Asistente de ayuda" })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("dialog", { name: "Ventana de acceso" })
    ).toBeNull();
  });

  it("no realiza peticiones de red al abrir la ayuda", async () => {
    const usuario = userEvent.setup();
    renderPagina();

    await usuario.click(
      screen.getByRole("button", { name: "Abrir el asistente de ayuda" })
    );

    expect(fetch).not.toHaveBeenCalled();
  });
});
