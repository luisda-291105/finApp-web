/**
 * @uso        Pruebas unitarias para el componente BottomNav
 * @funciones  test "renderiza 4 items con iconos/etiquetas correctos", test "marca item activo con indicador y color mint", test "click items 1-3 llama alNavegar", test "click en el botón Menú llama alAbrirMenu", test "clase safe-bottom presente", test "landscape oculta etiquetas via CSS global (sin <style> propio)"
 * @datos      N/A
 * @eventos    click en botones, media query mock
 * @estados    N/A
 * @usadoPor   vitest (npm run test)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import BottomNav from "../../../components/layout/BottomNav";

describe("BottomNav", () => {
  const propsBase = {
    itemActivo: "/dashboard",
    alNavegar: vi.fn(),
    alAbrirMenu: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renderiza 4 items fijos con iconos y etiquetas correctos en orden", () => {
    render(<BottomNav {...propsBase} />);

    // Verificar los 3 items de navegación + 1 item Menú = 4 botones
    const botones = screen.getAllByRole("button");
    expect(botones).toHaveLength(4);

    // Verificar etiquetas en orden
    expect(screen.getByText("Inicio")).toBeDefined();
    expect(screen.getByText("Transacciones")).toBeDefined();
    expect(screen.getByText("Tarjetas")).toBeDefined();
    expect(screen.getByText("Menú")).toBeDefined();

    // Verificar que cada item tiene un icono (lucide-react renderiza SVG)
    const svgs = document.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThanOrEqual(4);
  });

  it("marca item activo con color mint y barra indicadora superior", () => {
    render(<BottomNav {...propsBase} />);

    // Item activo (Inicio)
    const botonActivo = screen.getByText("Inicio").closest("button");
    expect(botonActivo).toHaveClass("text-mint-accent");
    expect(botonActivo).not.toHaveClass("text-emerald-primary");

    // Verificar indicador (span absoluto con bg-mint-accent)
    const indicador = botonActivo.querySelector(
      "span.absolute.top-0.left-1\\/2.-translate-x-1\\/2.w-8.h-0\\.5.bg-mint-accent.rounded-full"
    );
    expect(indicador).not.toBeNull();
    expect(indicador).toHaveAttribute("aria-hidden", "true");

    // Items inactivos tienen color crema (AA sobre el fondo compuesto)
    const botonInactivo = screen.getByText("Transacciones").closest("button");
    expect(botonInactivo).toHaveClass("text-bg-cream");
    expect(botonInactivo).not.toHaveClass("text-slate-text");
  });

  it("los cuatro controles usan tokens AA (crema/mint) y no los colores anteriores", () => {
    render(<BottomNav {...propsBase} />);

    const botones = screen.getAllByRole("button");
    const botonActivo = screen.getByText("Inicio").closest("button");

    botones.forEach((boton) => {
      // Los tokens anteriores (`slate-text` y `emerald-primary`) no alcanzaban AA
      // sobre el fondo compuesto de la barra (CL-08/AC-15).
      expect(boton).not.toHaveClass("text-slate-text");
      expect(boton).not.toHaveClass("text-emerald-primary");

      if (boton === botonActivo) {
        expect(boton).toHaveClass("text-mint-accent");
      } else {
        expect(boton).toHaveClass("text-bg-cream");
        expect(boton).toHaveClass("hover:text-mint-accent");
      }
    });

    // El 4.º control («Menú») también queda cubierto por el token claro.
    const botonMenu = screen.getByText("Menú").closest("button");
    expect(botonMenu).toHaveClass("text-bg-cream");
  });

  it("click en items 1-3 llama alNavegar con la ruta correcta", () => {
    render(<BottomNav {...propsBase} />);

    fireEvent.click(screen.getByText("Inicio"));
    expect(propsBase.alNavegar).toHaveBeenCalledWith("/dashboard");

    fireEvent.click(screen.getByText("Transacciones"));
    expect(propsBase.alNavegar).toHaveBeenCalledWith("/dashboard/transacciones");

    fireEvent.click(screen.getByText("Tarjetas"));
    expect(propsBase.alNavegar).toHaveBeenCalledWith("/dashboard/tarjetas");
  });

  it("click en el botón Menú llama alAbrirMenu", () => {
    render(<BottomNav {...propsBase} />);

    fireEvent.click(screen.getByText("Menú"));
    expect(propsBase.alAbrirMenu).toHaveBeenCalledTimes(1);
    expect(propsBase.alNavegar).not.toHaveBeenCalled();
  });

  it("usa safe-bottom (utilidad real de área segura) y no la clase inexistente pb-safe", () => {
    render(<BottomNav {...propsBase} />);

    const nav = screen.getByRole("navigation");
    expect(nav).toHaveClass("safe-bottom");
    expect(nav).not.toHaveClass("pb-safe");
  });

  it("media query landscape oculta etiquetas (clase bottom-nav-label)", () => {
    const { container } = render(<BottomNav {...propsBase} />);

    // Verificar que la clase bottom-nav-label existe en las 4 etiquetas: el CSS
    // global que la oculta en landscape vive en src/styles/index.css (cubierto
    // por src/styles/index.css.test.js)
    const etiquetas = container.querySelectorAll(".bottom-nav-label");
    expect(etiquetas.length).toBe(4);
    etiquetas.forEach((etiqueta) => {
      expect(etiqueta).toHaveClass("bottom-nav-label");
    });

    // El componente ya no emite su propio <style jsx>: las reglas están en el
    // CSS global, así que no debe existir ningún <style> dentro del componente
    expect(container.querySelectorAll("style")).toHaveLength(0);
  });

  it("aplica clases de contenedor correctas (fixed, bottom-0, z-50, grid-cols-4)", () => {
    render(<BottomNav {...propsBase} />);

    const nav = screen.getByRole("navigation");
    expect(nav).toHaveClass("fixed");
    expect(nav).toHaveClass("bottom-0");
    expect(nav).toHaveClass("left-0");
    expect(nav).toHaveClass("right-0");
    expect(nav).toHaveClass("z-50");
    expect(nav).toHaveClass("grid");
    expect(nav).toHaveClass("grid-cols-4");
    expect(nav).toHaveClass("bg-bg-dark/80");
    expect(nav).toHaveClass("glass-surface");
    expect(nav).toHaveClass("border-t");
    expect(nav).toHaveClass("border-border-line/20");
  });

  it("items tienen estructura correcta (flex-col, gap-1, px-2, py-2, min-w-0)", () => {
    render(<BottomNav {...propsBase} />);

    const botones = screen.getAllByRole("button");
    botones.forEach((boton) => {
      expect(boton).toHaveClass("flex");
      expect(boton).toHaveClass("flex-col");
      expect(boton).toHaveClass("items-center");
      expect(boton).toHaveClass("gap-1");
      expect(boton).toHaveClass("px-2");
      expect(boton).toHaveClass("py-2");
      expect(boton).toHaveClass("min-w-0");
      expect(boton).toHaveClass("relative");
    });
  });

  it("iconos tienen tamaño w-6 h-6 y flex-shrink-0", () => {
    render(<BottomNav {...propsBase} />);

    const svgs = document.querySelectorAll("svg");
    svgs.forEach((svg) => {
      expect(svg).toHaveClass("w-6");
      expect(svg).toHaveClass("h-6");
      expect(svg).toHaveClass("flex-shrink-0");
    });
  });

  it("etiquetas tienen clase bottom-nav-label, text-xs, font-medium, truncate", () => {
    render(<BottomNav {...propsBase} />);

    const etiquetas = document.querySelectorAll(".bottom-nav-label");
    etiquetas.forEach((etiqueta) => {
      expect(etiqueta).toHaveClass("bottom-nav-label");
      expect(etiqueta).toHaveClass("text-xs");
      expect(etiqueta).toHaveClass("font-medium");
      expect(etiqueta).toHaveClass("truncate");
    });
  });

  it("item activo tiene aria-current='page'", () => {
    render(<BottomNav {...propsBase} itemActivo="/dashboard/transacciones" />);

    const botonActivo = screen.getByText("Transacciones").closest("button");
    expect(botonActivo).toHaveAttribute("aria-current", "page");

    const botonInactivo = screen.getByText("Inicio").closest("button");
    expect(botonInactivo).not.toHaveAttribute("aria-current");
  });

  it("item Menú tiene aria-label='Abrir menú'", () => {
    render(<BottomNav {...propsBase} />);

    const botonMenu = screen.getByText("Menú").closest("button");
    expect(botonMenu).toHaveAttribute("aria-label", "Abrir menú");
  });

  it("nav tiene role='navigation' y aria-label", () => {
    render(<BottomNav {...propsBase} />);

    const nav = screen.getByRole("navigation");
    expect(nav).toHaveAttribute("aria-label", "Navegación principal móvil");
  });

  it("en rango de 470px a 750px muestra el 4.º ítem del sidebar (Contactos) y usa grid-cols-5", () => {
    window.innerWidth = 500;
    render(<BottomNav {...propsBase} />);

    const botones = screen.getAllByRole("button");
    expect(botones).toHaveLength(5);

    expect(screen.getByText("Inicio")).toBeDefined();
    expect(screen.getByText("Transacciones")).toBeDefined();
    expect(screen.getByText("Tarjetas")).toBeDefined();
    expect(screen.getByText("Contactos")).toBeDefined();
    expect(screen.getByText("Menú")).toBeDefined();

    const nav = screen.getByRole("navigation");
    expect(nav).toHaveClass("grid-cols-5");
    expect(nav).not.toHaveClass("grid-cols-4");

    fireEvent.click(screen.getByText("Contactos"));
    expect(propsBase.alNavegar).toHaveBeenCalledWith("/dashboard/contactos");

    const botonContactos = screen.getByText("Contactos").closest("button");
    expect(botonContactos.querySelector("svg.lucide-contact")).toBeTruthy();
  });

  it("fuera del rango de 470px a 750px (p. ej. 375px) solo muestra 3 items + Menú y usa grid-cols-4", () => {
    window.innerWidth = 375;
    render(<BottomNav {...propsBase} />);

    const botones = screen.getAllByRole("button");
    expect(botones).toHaveLength(4);
    expect(screen.queryByText("Contactos")).toBeNull();

    const nav = screen.getByRole("navigation");
    expect(nav).toHaveClass("grid-cols-4");
    expect(nav).not.toHaveClass("grid-cols-5");
  });
});