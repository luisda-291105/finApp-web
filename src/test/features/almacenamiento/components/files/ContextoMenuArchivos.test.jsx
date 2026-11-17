/**
 * @uso        Pruebas del menú contextual del navegador de archivos
 * @funciones  ContextoMenuArchivos({ menu, items, vistaActual, alCerrar, alAbrir, alDescargar, alCopiar, alMover, alCortar, alCompartir, alEliminar, alRestaurar, alEliminarDefinitivo, alRenombrar })
 * @datos      Menú { ids, x, y } y items; acciones según vista (unidad vs papelera)
 * @eventos    Clic en acciones, clic exterior para cerrar
 * @estados    Ninguno
 * @usadoPor   Vitest
 */
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ContextoMenuArchivos from "../../../../../features/almacenamiento/components/files/ContextoMenuArchivos";

beforeEach(() => {
  vi.clearAllMocks();
});
afterEach(cleanup);

describe("ContextoMenuArchivos", () => {
  it("abre el menú con las acciones del unidad y corta la selección al pulsar «Cortar»", async () => {
    const usuario = userEvent.setup();
    const alCortar = vi.fn();
    render(
      <ContextoMenuArchivos
        menu={{ ids: ["carp-1"], x: 120, y: 120 }}
        items={[{ id: "carp-1", nombre: "Finanzas", tipo: "carpeta" }]}
        vistaActual="unidad"
        alCerrar={vi.fn()}
        alAbrir={vi.fn()}
        alDescargar={vi.fn()}
        alCopiar={vi.fn()}
        alMover={vi.fn()}
        alCortar={alCortar}
        alCompartir={vi.fn()}
        alEliminar={vi.fn()}
        alRestaurar={vi.fn()}
        alEliminarDefinitivo={vi.fn()}
        alRenombrar={vi.fn()}
      />,
    );

    await usuario.click(screen.getByRole("menuitem", { name: "Cortar" }));

    expect(alCortar).toHaveBeenCalledWith(["carp-1"]);
  });

  it("ofrece las acciones de la unidad: Copiar, Mover y Cortar", () => {
    render(
      <ContextoMenuArchivos
        menu={{ ids: ["carp-1"], x: 120, y: 120 }}
        items={[{ id: "carp-1", nombre: "Finanzas", tipo: "carpeta" }]}
        vistaActual="unidad"
        alCerrar={vi.fn()}
        alAbrir={vi.fn()}
        alDescargar={vi.fn()}
        alCopiar={vi.fn()}
        alMover={vi.fn()}
        alCortar={vi.fn()}
        alCompartir={vi.fn()}
        alEliminar={vi.fn()}
        alRestaurar={vi.fn()}
        alEliminarDefinitivo={vi.fn()}
        alRenombrar={vi.fn()}
      />,
    );

    expect(screen.getByRole("menuitem", { name: "Copiar" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Mover" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Cortar" })).toBeInTheDocument();
  });
});
