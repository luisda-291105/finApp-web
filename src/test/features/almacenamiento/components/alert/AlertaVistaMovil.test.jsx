/**
 * @uso        Pruebas del aviso temporal top-right del feature almacenamiento
 * @funciones  AlertaVistaMovil({ mensaje, alCerrar })
 * @datos      Ninguno
 * @eventos    Autocierre, clic en «Cerrar aviso»
 * @estados    Ninguno
 * @usadoPor   Vitest
 */
import { cleanup, render, screen, act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AlertaVistaMovil from "../../../../../features/almacenamiento/components/alert/AlertaVistaMovil";

beforeEach(() => { vi.useFakeTimers(); });
afterEach(() => { vi.useRealTimers(); cleanup(); });

describe("AlertaVistaMovil", () => {
  it("muestra el mensaje como aviso accesible y se oculta al cerrar", () => {
    const alCerrar = vi.fn();
    render(<AlertaVistaMovil mensaje="En móvil solo está disponible la vista de lista." alCerrar={alCerrar} />);

    expect(screen.getByRole("alert")).toHaveTextContent("En móvil solo está disponible la vista de lista.");
    screen.getByRole("button", { name: "Cerrar aviso" }).click();
    expect(alCerrar).toHaveBeenCalledTimes(1);
  });

  it("se cierra sola al cabo de unos segundos", () => {
    const alCerrar = vi.fn();
    render(<AlertaVistaMovil mensaje="En móvil solo está disponible la vista de lista." alCerrar={alCerrar} />);

    expect(alCerrar).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(4000); });
    expect(alCerrar).toHaveBeenCalledTimes(1);
  });

  it("no renderiza nada sin mensaje", () => {
    const { container } = render(<AlertaVistaMovil mensaje="" alCerrar={vi.fn()} />);

    expect(container).toBeEmptyDOMElement();
  });
});
