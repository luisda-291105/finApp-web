import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import LimiteDeError from "../../../components/ui/LimiteDeError";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function ContenidoConError() {
  throw new Error("fallo de carga simulado");
}

describe("LimiteDeError", () => {
  it("muestra los hijos cuando no hay error", () => {
    render(<LimiteDeError><p>Contenido de la página</p></LimiteDeError>);

    expect(screen.getByText("Contenido de la página")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("muestra un aviso accesible con reintento cuando falla la carga", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    render(<LimiteDeError><ContenidoConError /></LimiteDeError>);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "No se pudo cargar la página" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Recargar página" })).toBeInTheDocument();
  });
});
