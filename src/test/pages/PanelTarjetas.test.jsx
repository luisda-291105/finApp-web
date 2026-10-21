/**
 * @uso        Pruebas de integración para PanelTarjetas (refactor spec 004, T7)
 * @funciones  doble render por breakpoints (acordeón sm:hidden + grid hidden sm:grid),
 *              apertura/cierre del modal y retorno de foco
 * @datos      TARJETAS_DEMO y MOVIMIENTOS_DEMO (fixture fijo octubre 2026)
 * @eventos    clic/teclado sobre tarjetas, Esc, botón de cierre y backdrop del modal
 * @estados    tarjetaActiva (null = modal cerrado)
 * @usadoPor   vitest (npm run test)
 */
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import PanelTarjetas from "../../pages/PanelTarjetas";
import { TARJETAS_DEMO, MOVIMIENTOS_DEMO } from "../../data/tarjetasDemo";

// Mock parcial de framer-motion: motion.div trivial con forwardRef (el ref del
// diálogo debe llegar al DOM para foco/trap) y useReducedMotion fijo en false
vi.mock("framer-motion", async () => {
  const actual = await vi.importActual("framer-motion");
  const React = await vi.importActual("react");
  const PROPS_DE_ANIMACION = new Set([
    "initial", "animate", "exit", "transition", "variants", "custom",
    "whileHover", "whileTap", "whileFocus", "whileDrag", "whileInView",
    "layout", "layoutId", "layoutDependency", "layoutScroll",
    "drag", "dragConstraints", "dragElastic", "dragMomentum", "dragPropagation",
    "dragDirectionLock", "dragControls",
    "onDragStart", "onDrag", "onDragEnd", "onAnimationStart", "onAnimationComplete",
    "onUpdate", "transformTemplate", "viewport", "inherit",
  ]);
  const propsDom = (props) =>
    Object.fromEntries(Object.entries(props).filter(([clave]) => !PROPS_DE_ANIMACION.has(clave)));
  return {
    ...actual,
    useReducedMotion: vi.fn(() => false),
    motion: {
      div: React.forwardRef(({ children, ...props }, ref) => (
        <div ref={ref} {...propsDom(props)}>{children}</div>
      )),
    },
  };
});

afterEach(cleanup);

const ARIA_LISTA = "Tarjetas de demostración";

function obtenerAcordeon() {
  const listas = screen.getAllByRole("list", { name: ARIA_LISTA });
  const acordeon = listas.find((el) => el.className.includes("sm:hidden"));
  expect(acordeon).toBeTruthy();
  return acordeon;
}

function obtenerGrid() {
  const listas = screen.getAllByRole("list", { name: ARIA_LISTA });
  const grid = listas.find((el) =>
    el.className.includes("hidden") && el.className.includes("sm:grid")
  );
  expect(grid).toBeTruthy();
  return grid;
}

/** Botones activadores del grid: role=button con aria-label por titular, scoping al grid */
function botonesDelGrid(grid) {
  return TARJETAS_DEMO.map((t) =>
    within(grid).getByRole("button", {
      name: `Ver detalle de la tarjeta de ${t.titular}`,
    })
  );
}

describe("PanelTarjetas (spec 004)", () => {
  describe("layout doble por breakpoint", () => {
    it("renderiza el acordeón móvil con clase sm:hidden y el grid con hidden sm:grid", () => {
      render(<PanelTarjetas />);

      const acordeon = obtenerAcordeon();
      const grid = obtenerGrid();
      expect(acordeon.className).toContain("sm:hidden");
      expect(grid.className).toContain("hidden");
      expect(grid.className).toContain("sm:grid");
      expect(grid.className).toContain("sm:grid-cols-2");
      expect(grid.className).toContain("lg:grid-cols-3");
    });

    it("muestra las 5 tarjetas del fixture en cada presentación", () => {
      render(<PanelTarjetas />);

      const acordeon = obtenerAcordeon();
      const grid = obtenerGrid();

      // Acordeón: 5 encabezados con aria-expanded
      const encabezados = within(acordeon).getAllByRole("button");
      const encabezadosAcordeon = encabezados.filter((b) =>
        b.hasAttribute("aria-expanded")
      );
      expect(encabezadosAcordeon).toHaveLength(TARJETAS_DEMO.length);

      // Grid: 5 celdas activables
      expect(botonesDelGrid(grid)).toHaveLength(TARJETAS_DEMO.length);

      // Titulares del fixture presentes (el titular aparece en encabezado y tarjeta)
      TARJETAS_DEMO.forEach((t) => {
        expect(within(acordeon).getAllByText(t.titular).length).toBeGreaterThanOrEqual(1);
        expect(within(grid).getAllByText(t.titular).length).toBeGreaterThanOrEqual(1);
      });
    });

    it("no renderiza las secciones antiguas ni datos hardcodeados", () => {
      render(<PanelTarjetas />);

      expect(screen.queryByText("Ejemplos de diseño")).toBeNull();
      expect(screen.queryByText("Tus otras tarjetas")).toBeNull();
      expect(screen.queryByText("Tarjeta Oro")).toBeNull();
      expect(screen.queryByText("Tarjeta Platino")).toBeNull();
      expect(screen.queryByText("Débito Nómina")).toBeNull();
      expect(screen.queryByText("$2,340.00")).toBeNull();
    });

    it("muestra la nota 'Datos de demostración'", () => {
      render(<PanelTarjetas />);
      expect(screen.getByText("Datos de demostración")).toBeTruthy();
    });

    it("inicia con el modal cerrado", () => {
      render(<PanelTarjetas />);
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });

  describe("modal desde el grid", () => {
    it("clic en una tarjeta del grid abre el modal con su log de movimientos", async () => {
      const user = userEvent.setup();
      render(<PanelTarjetas />);

      const [boton] = botonesDelGrid(obtenerGrid());
      await user.click(boton);

      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeTruthy();
      expect(dialog.getAttribute("aria-modal")).toBe("true");

      // Log de MARÍA GARCÍA (tarjeta-azul): descripción del fixture presente
      MOVIMIENTOS_DEMO["tarjeta-azul"].forEach((mov) => {
        expect(within(dialog).getByText(mov.descripcion)).toBeTruthy();
      });
    });

    it("cerrar con el botón devuelve el foco al activador del grid", async () => {
      const user = userEvent.setup();
      render(<PanelTarjetas />);

      const [boton] = botonesDelGrid(obtenerGrid());
      await user.click(boton);

      const cerrar = await screen.findByRole("button", {
        name: "Cerrar detalle de tarjeta",
      });
      await user.click(cerrar);

      expect(screen.queryByRole("dialog")).toBeNull();
      expect(document.activeElement).toBe(boton);
    });

    it("cerrar con Esc devuelve el foco al activador", async () => {
      const user = userEvent.setup();
      render(<PanelTarjetas />);

      const [boton] = botonesDelGrid(obtenerGrid());
      await user.click(boton);
      expect(screen.getByRole("dialog")).toBeTruthy();

      await user.keyboard("{Escape}");
      expect(screen.queryByRole("dialog")).toBeNull();
      expect(document.activeElement).toBe(boton);
    });

    it("clic en el backdrop cierra el modal", async () => {
      const user = userEvent.setup();
      render(<PanelTarjetas />);

      const [boton] = botonesDelGrid(obtenerGrid());
      await user.click(boton);

      const dialog = screen.getByRole("dialog");
      // El backdrop es el padre directo del diálogo
      await user.click(dialog.parentElement);
      expect(screen.queryByRole("dialog")).toBeNull();
    });

    it("muestra el estado vacío para tarjeta-azul-2 (sin movimientos)", async () => {
      const user = userEvent.setup();
      render(<PanelTarjetas />);

      const grid = obtenerGrid();
      const boton = within(grid).getByRole("button", {
        name: "Ver detalle de la tarjeta de LUCÍA FERNÁNDEZ",
      });
      await user.click(boton);

      const dialog = screen.getByRole("dialog");
      expect(within(dialog).getByText("Sin movimientos este mes")).toBeTruthy();
    });
  });

  describe("modal desde el acordeón", () => {
    it("segundo gesto sobre la tarjeta expandida abre el modal", async () => {
      const user = userEvent.setup();
      render(<PanelTarjetas />);

      const acordeon = obtenerAcordeon();

      // Expandir una tarjeta colapsada (CARLOS RUIZ)
      const encabezado = within(acordeon).getByRole("button", {
        name: /CARLOS RUIZ/,
      });
      await user.click(encabezado);
      expect(encabezado.getAttribute("aria-expanded")).toBe("true");

      // Solo un panel de acordeón expandido montado (role=region con aria-labelledby)
      const paneles = document.querySelectorAll("[id^='panel-tarjeta-']");
      expect(paneles).toHaveLength(1);
      const panelId = encabezado.getAttribute("aria-controls");
      expect(paneles[0].id).toBe(panelId);

      // Toque sobre la tarjeta ya expandida (wrapper con aria-label)
      const tarjetaExpandida = within(paneles[0]).getByRole("button", {
        name: "Ver detalle de la tarjeta de CARLOS RUIZ",
      });
      await user.click(tarjetaExpandida);

      const dialog = screen.getByRole("dialog");
      expect(within(dialog).getByText(/Tarjeta de CARLOS RUIZ/)).toBeTruthy();
      MOVIMIENTOS_DEMO["tarjeta-morado"].forEach((mov) => {
        expect(within(dialog).getByText(mov.descripcion)).toBeTruthy();
      });
    });

    it("solo un modal abierto a la vez", async () => {
      const user = userEvent.setup();
      render(<PanelTarjetas />);

      const botones = botonesDelGrid(obtenerGrid());
      await user.click(botones[0]);
      expect(screen.getAllByRole("dialog")).toHaveLength(1);

      await user.keyboard("{Escape}");
      expect(screen.queryByRole("dialog")).toBeNull();

      await user.click(botones[2]);
      expect(screen.getAllByRole("dialog")).toHaveLength(1);
    });
  });
});
