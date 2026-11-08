import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import AsistenteAyuda from "../../../../features/asistenteia/components/modals/AsistenteAyudaModal";

vi.mock("../../../../features/asistenteia/hooks/useAsistenteHistorial", () => ({
  useAsistenteHistorial: () => ({
    mensajes: [
      { rol: "user", contenido: "¿Cuánto gasté este mes?" },
      { rol: "assistant", contenido: "Todavía no tienes movimientos registrados." },
    ],
    setMensajes: vi.fn(),
    limpiar: vi.fn(),
  }),
}));

afterEach(cleanup);

describe("AsistenteAyuda — distinción visual de mensajes", () => {
  it("distingue la burbuja del asistente del fondo del panel y la etiqueta como tal", () => {
    render(<AsistenteAyuda abierto alCerrar={vi.fn()} />);

    const respuesta = screen.getByText("Todavía no tienes movimientos registrados.");
    const burbujaAsistente = respuesta.closest("div");

    expect(burbujaAsistente).toHaveClass("bg-white");
    expect(burbujaAsistente).toHaveClass("border-border-line/70");
    expect(burbujaAsistente).toHaveTextContent("Asistente");
  });

  it("mantiene la burbuja del usuario diferenciada y anunciada para lectores de pantalla", () => {
    render(<AsistenteAyuda abierto alCerrar={vi.fn()} />);

    const pregunta = screen.getByText("¿Cuánto gasté este mes?");
    const burbujaUsuario = pregunta.closest("div");

    expect(burbujaUsuario).toHaveClass("bg-emerald-primary");
    expect(screen.getByText("Tú:")).toHaveClass("sr-only");
  });
});
