/**
 * @uso        Pruebas del menú superpuesto de móvil con su trampa de foco REAL (spec 010, T5)
 * @funciones  render, screen, waitFor, userEvent
 * @datos      N/A
 * @eventos    «X» superior, ESC (mecanismo único), click en backdrop, click en panel, Tab
 *             (trampa real) y gestos de puntero (el menú NO debe cerrarse al deslizar)
 * @estados    Controlado por prop `abierto`
 * @usadoPor   Vitest
 */
import { StrictMode } from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import DashboardDrawer from "./DashboardDrawer";
import SidebarNavContenido from "./SidebarNavContenido";

// NO se mockea focus-trap-react: la trampa del menú debe crearse de verdad (spec 010, T5).
// El mock de framer-motion solo evita animaciones en jsdom; `motion.div` reenvía el `ref`
// para que la trampa real reciba el nodo del panel (hijo directo corregido).
vi.mock("framer-motion", async () => {
  const React = await vi.importActual("react");
  return {
    __esModule: true,
    motion: {
      div: React.forwardRef(({ children, ...props }, ref) => (
        <div ref={ref} {...props}>{children}</div>
      )),
    },
    AnimatePresence: ({ children }) => children,
  };
});

/** Mismo mock de `matchMedia` que `vitest.setup.js`, para fijar la versión de vista (CL-18). */
const mockMatchMedia = (coincide) =>
  vi.fn().mockImplementation((query) => ({
    matches: typeof coincide === "function" ? coincide(query) : coincide,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));

/** Fija el viewport; el menú superpuesto es la superficie de móvil (<768px). */
const configurarViewport = (ancho) => {
  Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: ancho });
  window.matchMedia = mockMatchMedia(
    (query) => ancho >= 768 && query.includes("min-width: 768px")
  );
};

beforeEach(() => configurarViewport(375));
afterEach(() => {
  cleanup();
  configurarViewport(375);
});

const renderDrawer = (props = {}, initialEntries = ["/dashboard"]) => {
  const defaultProps = {
    abierto: true,
    alCerrar: vi.fn(),
    children: (
      <SidebarNavContenido alAbrirUserModal={vi.fn()} />
    ),
    ...props,
  };

  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <DashboardDrawer {...defaultProps} />
    </MemoryRouter>
  );
};

const obtenerPanel = () => document.body.querySelector("#dashboard-drawer-panel");

const obtenerBackdrop = () =>
  document.body.querySelector('div.fixed.inset-0.bg-bg-dark\\/80[aria-hidden="true"]');

/** Espera a que la trampa real (delayInitialFocus) enfoque el contenedor del panel. */
const esperarFocoEnPanel = async (panel) => {
  await waitFor(() => {
    expect(document.activeElement).toBe(panel);
  });
};

/** Despacha un evento de puntero nativo con las propiedades que lee el gesto. */
const dispararPuntero = (elemento, tipo, props = {}) => {
  const evento = new Event(tipo, { bubbles: true, cancelable: true });
  Object.assign(evento, { isPrimary: true, pointerId: 5, clientX: 0, clientY: 0, ...props });
  elemento.dispatchEvent(evento);
};

describe("DashboardDrawer", () => {
  describe("portal y renderizado condicional", () => {
    it("renderiza el panel en document.body (portal) y solo una vez", () => {
      renderDrawer({ abierto: true });

      // El panel debe estar en document.body (portal) y no estar duplicado
      const paneles = document.body.querySelectorAll("#dashboard-drawer-panel");
      expect(paneles.length).toBe(1);
    });

    it("no renderiza nada cuando abierto=false", () => {
      const { container } = renderDrawer({ abierto: false });

      expect(container.firstChild).toBeNull();
      // Verificar que no hay elementos en document.body
      expect(obtenerPanel()).toBeNull();
    });

    it("renderiza backdrop + panel en el portal", () => {
      renderDrawer({ abierto: true });

      const backdrop = obtenerBackdrop();
      expect(backdrop).toBeTruthy();
      expect(backdrop).toHaveClass("fixed");
      expect(backdrop).toHaveClass("inset-0");
      expect(backdrop).toHaveClass("bg-bg-dark/80");
      expect(backdrop).toHaveClass("backdrop-blur-sm");
      expect(backdrop).toHaveClass("z-50");

      expect(obtenerPanel()).toBeTruthy();
    });
  });

  describe("panel del drawer (menú de móvil)", () => {
    it("panel: fixed inset-y-0 right-0 w-[85vw] max-w-sm (altura completa, Spec 008)", () => {
      renderDrawer({ abierto: true });

      const panel = obtenerPanel();
      const classList = panel.classList;

      expect(classList.contains("fixed")).toBe(true);
      expect(classList.contains("inset-y-0")).toBe(true);
      expect(classList.contains("right-0")).toBe(true);
      expect(classList.contains("w-[85vw]")).toBe(true);
      expect(classList.contains("max-w-sm")).toBe(true);
    });

    it("panel: bg-bg-dark/95 glass-surface border-l border-border-line/20 z-55", () => {
      renderDrawer({ abierto: true });

      const panel = obtenerPanel();
      const classList = panel.classList;

      expect(classList.contains("bg-bg-dark/95")).toBe(true);
      expect(classList.contains("glass-surface")).toBe(true);
      expect(classList.contains("border-l")).toBe(true);
      expect(classList.contains("border-border-line/20")).toBe(true);
      expect(classList.contains("z-55")).toBe(true);
    });

    it("panel: aria-label='Menú de navegación'", () => {
      renderDrawer({ abierto: true });

      expect(obtenerPanel()).toHaveAttribute("aria-label", "Menú de navegación");
    });

    it("la trampa REAL se crea con el hijo directo corregido (el panel es hijo directo de body)", async () => {
      renderDrawer({ abierto: true });

      const panel = obtenerPanel();

      // Con el hijo directo corregido (`motion.div` dentro de `FocusTrap`, y `AnimatePresence`
      // envolviendo a la trampa), `focus-trap-react` recibe el nodo del panel y crea la trampa:
      // el foco inicial queda en el contenedor. Antes (hijo directo = `AnimatePresence`) la
      // trampa NO se creaba.
      await esperarFocoEnPanel(panel);

      // `focus-trap-react` no envuelve al hijo en ningún contenedor: el panel es hijo directo del
      // portal (`document.body`), no de un wrapper de la librería.
      expect(panel.parentElement).toBe(document.body);
      expect(panel.getAttribute("tabindex")).toBe("-1");
    });

    it("usa motion.div para la animación de entrada (renderizado como div)", () => {
      renderDrawer({ abierto: true });

      const panel = obtenerPanel();
      expect(panel).toBeTruthy();
      expect(panel.tagName).toBe("DIV");
    });
  });

  describe("cierre del menú", () => {
    it("la «X» superior cierra una sola vez y está dentro del panel (sin ser el foco inicial)", async () => {
      const alCerrar = vi.fn();
      renderDrawer({ abierto: true, alCerrar });
      const panel = obtenerPanel();
      await esperarFocoEnPanel(panel);

      const botonCerrar = screen.getByRole("button", { name: "Cerrar menú" });
      expect(panel.contains(botonCerrar)).toBe(true);
      expect(document.activeElement).not.toBe(botonCerrar);

      await userEvent.click(botonCerrar);
      expect(alCerrar).toHaveBeenCalledTimes(1);
    });

    it("presionar ESC cierra una sola vez mediante el mecanismo único", async () => {
      const alCerrar = vi.fn();
      renderDrawer({ abierto: true, alCerrar });

      await userEvent.keyboard("{Escape}");

      expect(alCerrar).toHaveBeenCalledTimes(1);
    });

    it("click en backdrop cierra con la trampa real activa", async () => {
      const alCerrar = vi.fn();
      renderDrawer({ abierto: true, alCerrar });
      const panel = obtenerPanel();
      await esperarFocoEnPanel(panel);

      // `allowOutsideClick: true` deja pasar el evento sin desactivar la trampa.
      await userEvent.click(obtenerBackdrop());

      expect(alCerrar).toHaveBeenCalledTimes(1);
    });

    it("click dentro del panel NO cierra el menú", async () => {
      const alCerrar = vi.fn();
      renderDrawer({ abierto: true, alCerrar });
      const panel = obtenerPanel();
      await esperarFocoEnPanel(panel);

      await userEvent.click(panel);

      expect(alCerrar).not.toHaveBeenCalled();
    });
  });

  describe("focus trap real (sin mock)", () => {
    it("el foco inicial queda en el contenedor del panel, no en un botón", async () => {
      renderDrawer({ abierto: true });
      const panel = obtenerPanel();

      await esperarFocoEnPanel(panel);

      expect(panel.getAttribute("tabindex")).toBe("-1");
      expect(screen.getByRole("button", { name: "Cerrar menú" })).not.toBe(document.activeElement);
    });

    it("la trampa real confina el foco dentro del panel al tabular (no escapa)", async () => {
      const usuario = userEvent.setup();
      renderDrawer({ abierto: true });

      // Control enfocable FUERA del panel: la trampa no debe dejar llegar a él con Tab.
      const externo = document.createElement("button");
      externo.textContent = "Fuera del menú";
      document.body.appendChild(externo);

      const panel = obtenerPanel();
      await esperarFocoEnPanel(panel);

      await usuario.tab();
      expect(panel.contains(document.activeElement)).toBe(true);
      await usuario.tab();
      expect(panel.contains(document.activeElement)).toBe(true);
      await usuario.tab();
      expect(panel.contains(document.activeElement)).toBe(true);
      await usuario.tab();
      expect(panel.contains(document.activeElement)).toBe(true);
      expect(document.activeElement).not.toBe(externo);

      document.body.removeChild(externo);
    });

    it("elementos enfocables: la «X» + 3 enlaces + el avatar del menú (5), en orden", () => {
      renderDrawer({ abierto: true });

      const panel = obtenerPanel();
      const focusables = panel.querySelectorAll(
        'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      // Orden de tabulación: el cromo superior (la «X») precede al contenido del menú.
      expect(focusables.length).toBe(5);
      expect(focusables[0].getAttribute("aria-label")).toBe("Cerrar menú");
      expect(focusables[1].tagName).toBe("A"); // Inicio
      expect(focusables[2].tagName).toBe("A"); // Transacciones
      expect(focusables[3].tagName).toBe("A"); // Tarjetas
      expect(focusables[4].tagName).toBe("BUTTON"); // Avatar
      expect(focusables[4].getAttribute("aria-label")).toContain("Cuenta de");
    });

    it("el contenedor del panel queda fuera del ciclo de Tab (tabindex=-1)", () => {
      renderDrawer({ abierto: true });

      const panel = obtenerPanel();
      const focusables = panel.querySelectorAll(
        '[tabindex]:not([tabindex="-1"])'
      );

      expect([...focusables].includes(panel)).toBe(false);
    });
  });

  describe("gesto de deslizar hacia abajo (DP-08: NO aplica al menú)", () => {
    it("deslizar hacia abajo sobre el panel NO cierra el menú (móvil)", async () => {
      const alCerrar = vi.fn();
      renderDrawer({ abierto: true, alCerrar });
      const panel = obtenerPanel();
      await esperarFocoEnPanel(panel);

      dispararPuntero(panel, "pointerdown", { clientY: 0 });
      dispararPuntero(panel, "pointermove", { clientY: 200 });
      dispararPuntero(panel, "pointerup", { clientY: 200 });

      expect(alCerrar).not.toHaveBeenCalled();
    });
  });

  describe("contenido del menú un poco más abajo (RF-15) y altura con scroll (RF-22)", () => {
    it("la fila de cromo superior con la «X» precede al contenido desplazable", () => {
      renderDrawer({ abierto: true });
      const panel = obtenerPanel();

      expect(panel.classList.contains("flex")).toBe(true);
      expect(panel.classList.contains("flex-col")).toBe(true);

      const filaCromo = panel.firstElementChild;
      expect(filaCromo.contains(screen.getByRole("button", { name: "Cerrar menú" }))).toBe(true);

      const envoltorio = filaCromo.nextElementSibling;
      expect(envoltorio.classList.contains("min-h-0")).toBe(true);
      expect(envoltorio.classList.contains("flex-1")).toBe(true);
      expect(envoltorio.classList.contains("overflow-y-auto")).toBe(true);

      // El contenido cuelga del envoltorio (más abajo que antes), no directamente del panel.
      expect(
        envoltorio.querySelector("nav[aria-label='Navegación principal del dashboard']")
      ).toBeTruthy();
      expect([...panel.children].some((hijo) => hijo.tagName === "NAV")).toBe(false);
    });
  });

  describe("restauración de foco al cerrar", () => {
    it("devuelve foco a triggerRef.current al cerrar", async () => {
      const alCerrar = vi.fn();
      const triggerRef = { current: document.createElement("button") };
      triggerRef.current.textContent = "Trigger";
      document.body.appendChild(triggerRef.current);

      const { rerender } = renderDrawer({ abierto: true, alCerrar, triggerRef });

      // Cerrar el drawer
      rerender(
        <MemoryRouter initialEntries={["/dashboard"]}>
          <DashboardDrawer abierto={false} alCerrar={alCerrar} children={<SidebarNavContenido alAbrirUserModal={vi.fn()} />} triggerRef={triggerRef} />
        </MemoryRouter>
      );

      // El foco debería estar en el trigger
      expect(document.activeElement).toBe(triggerRef.current);

      document.body.removeChild(triggerRef.current);
    });

    it("devuelve foco al elemento previo si no hay triggerRef", async () => {
      const alCerrar = vi.fn();
      const previousElement = document.createElement("button");
      previousElement.textContent = "Previous";
      document.body.appendChild(previousElement);
      previousElement.focus();

      const { rerender } = renderDrawer({ abierto: true, alCerrar });

      // Cerrar el drawer
      rerender(
        <MemoryRouter initialEntries={["/dashboard"]}>
          <DashboardDrawer abierto={false} alCerrar={alCerrar} children={<SidebarNavContenido alAbrirUserModal={vi.fn()} />} />
        </MemoryRouter>
      );

      // El foco debería volver al elemento previo
      expect(document.activeElement).toBe(previousElement);

      document.body.removeChild(previousElement);
    });
  });

  describe("children renderizado", () => {
    it("renderiza children dentro del panel (SidebarNavContenido)", () => {
      renderDrawer({ abierto: true });

      const panel = obtenerPanel();
      const nav = panel.querySelector("nav[aria-label='Navegación principal del dashboard']");
      expect(nav).toBeTruthy();

      // Verificar 3 enlaces (NavLink renderiza <a> con href)
      const links = panel.querySelectorAll("a[href]");
      expect(links.length).toBe(3);

      // Verificar avatar button
      const avatarButton = panel.querySelector("button[aria-label*='Cuenta de']");
      expect(avatarButton).toBeTruthy();
    });
  });

  describe("accesibilidad", () => {
    it("panel tiene role=dialog y aria-modal=true", () => {
      renderDrawer({ abierto: true });

      const panel = obtenerPanel();
      expect(panel).toHaveAttribute("role", "dialog");
      expect(panel).toHaveAttribute("aria-modal", "true");
    });

    it("backdrop tiene aria-hidden=true", () => {
      renderDrawer({ abierto: true });

      const backdrop = document.body.querySelector('[aria-hidden="true"]');
      expect(backdrop).toHaveAttribute("aria-hidden", "true");
    });
  });

  // Casos nuevos de la spec 011 (Tarea 3): paridad M4 de la devolución de foco. Los casos
  // vigentes, incluidos los dos de «restauración de foco al cerrar», quedan intactos arriba.
  describe("paridad M4 de la devolución de foco (spec 011)", () => {
    /** Nodos DOM creados por estos casos: se retiran tras cada uno para no contaminar la suite. */
    const nodosCreados = [];

    const crearDisparador = (etiqueta, etiquetaAria) => {
      const nodo = document.createElement("button");
      nodo.textContent = etiqueta;
      if (etiquetaAria) nodo.setAttribute("aria-label", etiquetaAria);
      document.body.appendChild(nodo);
      nodosCreados.push(nodo);
      return nodo;
    };

    const rerenderCerrado = (rerender, alCerrar, triggerRef) =>
      rerender(
        <MemoryRouter initialEntries={["/dashboard"]}>
          <DashboardDrawer
            abierto={false}
            alCerrar={alCerrar}
            children={<SidebarNavContenido alAbrirUserModal={vi.fn()} />}
            triggerRef={triggerRef}
          />
        </MemoryRouter>
      );

    beforeEach(() => {
      // Punto de partida estable: nada enfocado antes de cada caso.
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    });

    afterEach(() => {
      nodosCreados.splice(0).forEach((nodo) => nodo.remove());
    });

    it("AC-01: montado cerrado con el disparador conectado no invoca focus() ni mueve el foco", () => {
      const disparador = crearDisparador("Menú", "Abrir menú");
      const espiaFocus = vi.spyOn(disparador, "focus");
      const focoAntes = document.activeElement;

      renderDrawer({ abierto: false, triggerRef: { current: disparador } });

      expect(espiaFocus).not.toHaveBeenCalled();
      expect(document.activeElement).toBe(focoAntes);
    });

    it("AC-02: la devolución al disparador ocurre una sola vez y los re-renders cerrados no repiten", () => {
      const disparador = crearDisparador("Menú", "Abrir menú");
      const espiaFocus = vi.spyOn(disparador, "focus");
      const alCerrar = vi.fn();
      const triggerRef = { current: disparador };

      const { rerender } = renderDrawer({ abierto: true, alCerrar, triggerRef });

      rerenderCerrado(rerender, alCerrar, triggerRef);

      expect(espiaFocus).toHaveBeenCalledTimes(1);
      expect(document.activeElement).toBe(disparador);

      // Re-render posterior cerrado con identidad NUEVA del ref: no repite la devolución.
      rerenderCerrado(rerender, alCerrar, { current: disparador });

      expect(espiaFocus).toHaveBeenCalledTimes(1);
    });

    it("AC-02: montado cerrado dentro de StrictMode no invoca focus() ni mueve el foco (superficie de D1)", () => {
      const disparador = crearDisparador("Menú", "Abrir menú");
      const espiaFocus = vi.spyOn(disparador, "focus");
      const focoAntes = document.activeElement;

      // Montaje cerrado DENTRO de <StrictMode>: es la superficie del defecto D1 (el dashboard
      // monta el drawer cerrado con el disparador asignado y los efectos dobles de desarrollo).
      render(
        <StrictMode>
          <MemoryRouter initialEntries={["/dashboard"]}>
            <DashboardDrawer
              abierto={false}
              alCerrar={vi.fn()}
              children={<SidebarNavContenido alAbrirUserModal={vi.fn()} />}
              triggerRef={{ current: disparador }}
            />
          </MemoryRouter>
        </StrictMode>
      );

      expect(espiaFocus).not.toHaveBeenCalled();
      expect(document.activeElement).toBe(focoAntes);
    });

    it("AC-05: con el disparador desconectado la cadena usa el elemento capturado", () => {
      const previo = crearDisparador("Anterior");
      previo.focus();
      const disparador = crearDisparador("Menú", "Abrir menú");
      const espiaDesconectado = vi.spyOn(disparador, "focus");
      disparador.remove(); // desconectado: no debe recibir focus()

      const alCerrar = vi.fn();
      const triggerRef = { current: disparador };
      const { rerender } = renderDrawer({ abierto: true, alCerrar, triggerRef });

      rerenderCerrado(rerender, alCerrar, triggerRef);

      expect(espiaDesconectado).not.toHaveBeenCalled();
      expect(document.activeElement).toBe(previo);
      expect(document.activeElement).not.toBe(document.body);
    });

    it("AC-05: sin elemento capturado válido la cadena cae al respaldo móvil (botón «Menú»)", () => {
      const respaldo = crearDisparador("Menú", "Abrir menú");
      const disparador = crearDisparador("Menú viejo");
      disparador.remove(); // desconectado y sin captura válida ⇒ respaldo por versión de vista

      const alCerrar = vi.fn();
      const triggerRef = { current: disparador };
      const { rerender } = renderDrawer({ abierto: true, alCerrar, triggerRef });

      rerenderCerrado(rerender, alCerrar, triggerRef);

      expect(document.activeElement).toBe(respaldo);
      expect(document.activeElement).not.toBe(document.body);
    });

    it("AC-24: un candidato disabled no corta la cadena", () => {
      const previo = crearDisparador("Anterior");
      previo.focus();
      const disparadorDeshabilitado = crearDisparador("Menú", "Abrir menú");
      disparadorDeshabilitado.disabled = true;

      const alCerrar = vi.fn();
      const triggerRef = { current: disparadorDeshabilitado };
      const { rerender } = renderDrawer({ abierto: true, alCerrar, triggerRef });

      rerenderCerrado(rerender, alCerrar, triggerRef);

      expect(document.activeElement).toBe(previo);
      expect(document.activeElement).not.toBe(disparadorDeshabilitado);
    });
  });
});
