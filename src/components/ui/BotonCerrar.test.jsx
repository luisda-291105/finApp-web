/**
 * @uso        Pruebas unitarias del control de cierre compartido BotonCerrar (spec 010, tarea 3)
 * @funciones  render, type="button", aria-label recibido, icono aria-hidden, llamada única, clases base + tono
 * @datos      N/A
 * @eventos    N/A
 * @estados    N/A
 * @usadoPor   vitest (npm run test)
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BotonCerrar } from "./BotonCerrar";

describe("BotonCerrar", () => {
  it("renderiza un <button type='button'> con el aria-label específico recibido", () => {
    render(<BotonCerrar ariaLabel="Cerrar Cuenta" alCerrar={() => {}} />);

    const boton = screen.getByRole("button", { name: "Cerrar Cuenta" });
    expect(boton).toBeDefined();
    expect(boton.getAttribute("type")).toBe("button");
  });

  it("expone el icono de aspa como decorativo (aria-hidden)", () => {
    const { container } = render(<BotonCerrar ariaLabel="Cerrar menú" alCerrar={() => {}} />);

    const aspa = container.querySelector("svg");
    expect(aspa).toBeDefined();
    expect(aspa.getAttribute("aria-hidden")).toBe("true");
  });

  it("una sola pulsación llama exactamente una vez al callback de cierre", () => {
    const alCerrar = vi.fn();
    render(<BotonCerrar ariaLabel="Cerrar ventana de acceso" alCerrar={alCerrar} />);

    fireEvent.click(screen.getByRole("button", { name: "Cerrar ventana de acceso" }));

    expect(alCerrar).toHaveBeenCalledTimes(1);
  });

  it("aplica las clases base del patrón de cierre", () => {
    render(<BotonCerrar ariaLabel="Cerrar detalle de tarjeta" alCerrar={() => {}} />);

    const clases = screen.getByRole("button", { name: "Cerrar detalle de tarjeta" }).getAttribute("class") || "";
    expect(clases).toContain("rounded-full");
    expect(clases).toContain("p-2");
    expect(clases).toContain("focus-visible:ring-2");
    expect(clases).toContain("outline-none");
  });

  it("respeta las clases de tono inyectadas por el consumidor", () => {
    render(
      <BotonCerrar
        ariaLabel="Cerrar ventana de acceso"
        alCerrar={() => {}}
        className="text-slate-text hover:text-bg-dark focus-visible:ring-emerald-primary"
      />
    );

    const clases = screen.getByRole("button", { name: "Cerrar ventana de acceso" }).getAttribute("class") || "";
    expect(clases).toContain("text-slate-text");
    expect(clases).toContain("hover:text-bg-dark");
    expect(clases).toContain("focus-visible:ring-emerald-primary");
  });
});
