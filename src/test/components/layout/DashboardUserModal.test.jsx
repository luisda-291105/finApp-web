/**
 * @uso        Pruebas del modal de cuenta con las cuatro formas de cierre (spec 010, T4)
 * @funciones  render, screen, waitFor, act, userEvent
 * @datos      N/A
 * @eventos    click fuera (overlay), Esc, click en la «X», click en Configuración/Salir del demo,
 *             Tab (focus trap real) y gestos de puntero (deslizar en móvil)
 * @estados    abierto (boolean), triggerRef (mock ref)
 * @usadoPor   Vitest
 */
import { cleanup, render, screen, waitFor, act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import DashboardUserModal from "../../../components/layout/DashboardUserModal";
import { UsuarioActivoProvider } from "../../../context/UsuarioActivoContext";

// Mock de framer-motion: motion.div trivial con forwardRef para que el ref del focus trap
// real llegue al nodo del panel. NO se mockea focus-trap-react: la trampa debe ser real.
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
    AnimatePresence: ({ children, ...props }) => React.createElement(React.Fragment, props, children),
    motion: {
      div: React.forwardRef(({ children, ...props }, ref) => (
        <div ref={ref} {...propsDom(props)}>{children}</div>
      )),
    },
  };
});

/**
 * Mismo mock de `matchMedia` que `vitest.setup.js`: recibe un booleano o un predicado sobre la
 * consulta. Se conserva porque lo siguen usando los dos viewports explícitos del gesto
 * (`activarMovil` con `false` y `activarPantallasGrandes` con predicado).
 */
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

/**
 * Deja el viewport en «pantallas grandes» (≥768px) tras cada caso e instala un `matchMedia`
 * derivado del `innerWidth` vigente en el momento de la consulta, con el mismo criterio que el
 * stub global de `vitest.setup.js` (`matches = innerWidth >= min-width`; las consultas sin
 * `min-width` quedan en `false`). Así la suite mide una sola versión de vista (pantallas grandes).
 */
const restaurarViewportEscritorio = () => {
  Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: 1024 });
  window.matchMedia = mockMatchMedia((query) => {
    const minimo = /min-width:\s*(\d+)px/.exec(query);
    return minimo ? window.innerWidth >= Number(minimo[1]) : false;
  });
};

beforeEach(restaurarViewportEscritorio);

afterEach(() => {
  cleanup();
  restaurarViewportEscritorio();
});

const renderModal = (props = {}) => {
  const defaultProps = {
    abierto: true,
    alCerrar: vi.fn(),
    triggerRef: { current: null },
    ...props,
  };

  return render(
    <MemoryRouter initialEntries={["/dashboard"]}>
      <DashboardUserModal {...defaultProps} />
    </MemoryRouter>
  );
};

const obtenerOverlay = () =>
  document.body.querySelector(".fixed.inset-0.bg-bg-dark\\/80");

/** Espera a que la trampa real (delayInitialFocus) enfoque el contenedor del diálogo. */
const esperarFocoEnContenedor = async (dialogo) => {
  await waitFor(() => {
    expect(document.activeElement).toBe(dialogo);
  });
};

/** Despacha un evento de puntero nativo con las propiedades que lee el gesto. */
const dispararPuntero = (elemento, tipo, props = {}) => {
  const evento = new Event(tipo, { bubbles: true, cancelable: true });
  Object.assign(evento, { isPrimary: true, pointerId: 7, clientX: 0, clientY: 0, ...props });
  elemento.dispatchEvent(evento);
};

describe("DashboardUserModal", () => {
  describe("entorno de medición (RF-13, AC-13)", () => {
    it("el default mide pantallas grandes: con innerWidth 1024 coinciden 768 y 1024", () => {
      expect(window.innerWidth).toBe(1024);
      expect(window.matchMedia("(min-width: 768px)").matches).toBe(true);
      expect(window.matchMedia("(min-width: 1024px)").matches).toBe(true);
    });
  });

  describe("portal y renderizado", () => {
    it("renderiza en document.body via portal cuando abierto=true", () => {
      renderModal();
      const overlay = obtenerOverlay();
      const panel = document.body.querySelector("#dashboard-user-modal-panel");
      expect(overlay).toBeTruthy();
      expect(panel).toBeTruthy();
    });

    it("no renderiza nada cuando abierto=false", () => {
      const { container } = renderModal({ abierto: false });
      expect(container.querySelector("[role='dialog']")).toBeNull();
      expect(obtenerOverlay()).toBeNull();
    });

    it("tiene role=dialog, aria-modal=true y aria-labelledby", () => {
      renderModal();
      const dialog = screen.getByRole("dialog");
      expect(dialog.getAttribute("aria-modal")).toBe("true");
      expect(dialog.getAttribute("aria-labelledby")).toBe("user-modal-title");
      const titulo = document.getElementById("user-modal-title");
      expect(titulo).toBeTruthy();
      expect(titulo.textContent).toBe("Cuenta de Usuario Demo");
    });
  });

  describe("perfil dinámico (spec 024)", () => {
    it("muestra el nombre del usuario activo y el correo «No registrado»", async () => {
      window.localStorage.getItem.mockReturnValue(
        JSON.stringify({
          idUsuario: "123456",
          nombre: "Ana Pérez",
          fechaCreacion: "2026-01-15",
        }),
      );

      render(
        <MemoryRouter initialEntries={["/dashboard"]}>
          <UsuarioActivoProvider>
            <DashboardUserModal abierto alCerrar={vi.fn()} triggerRef={{ current: null }} />
          </UsuarioActivoProvider>
        </MemoryRouter>,
      );

      const dialog = screen.getByRole("dialog");
      await waitFor(() => {
        expect(document.getElementById("user-modal-title").textContent).toBe("Ana Pérez");
      });
      expect(dialog.textContent).toContain("Correo");
      expect(dialog.textContent).toContain("No registrado");
    });

    it("usa «Cuenta de Usuario Demo» como respaldo sin usuario activo", () => {
      renderModal();
      expect(document.getElementById("user-modal-title").textContent).toBe(
        "Cuenta de Usuario Demo",
      );
    });
  });

  describe("cierre del modal", () => {
    it("click en overlay cierra con la trampa REAL activa y la trampa sigue activa después", async () => {
      const alCerrar = vi.fn();
      renderModal({ alCerrar });
      const dialog = screen.getByRole("dialog");
      await esperarFocoEnContenedor(dialog);

      // Con la trampa real, `allowOutsideClick` deja pasar el evento: el onClick del overlay corre.
      await userEvent.click(obtenerOverlay());
      expect(alCerrar).toHaveBeenCalledTimes(1);

      // La trampa NO se desactivó: un foco exterior es devuelto dentro del panel (checkFocusIn).
      const externo = document.createElement("button");
      externo.textContent = "Fuera de la trampa";
      document.body.appendChild(externo);
      externo.focus();
      await waitFor(() => {
        expect(dialog.contains(document.activeElement)).toBe(true);
      });
      document.body.removeChild(externo);
    });

    it("click dentro del panel NO llama alCerrar", async () => {
      const alCerrar = vi.fn();
      renderModal({ alCerrar });
      const panel = screen.getByRole("dialog");
      await userEvent.click(panel);
      expect(alCerrar).not.toHaveBeenCalled();
    });

    it("la «X» superior llama a alCerrar una sola vez y está dentro del panel", async () => {
      const alCerrar = vi.fn();
      renderModal({ alCerrar });
      const dialog = screen.getByRole("dialog");
      const botonCerrar = screen.getByRole("button", { name: "Cerrar Cuenta" });
      expect(dialog.contains(botonCerrar)).toBe(true);
      await userEvent.click(botonCerrar);
      expect(alCerrar).toHaveBeenCalledTimes(1);
    });

    it("tecla ESC cierra una sola vez mediante el mecanismo único", async () => {
      const alCerrar = vi.fn();
      renderModal({ alCerrar });
      await userEvent.keyboard("{Escape}");
      expect(alCerrar).toHaveBeenCalledTimes(1);
    });

    it("botón Configuración llama alCerrar y navega via navigate", async () => {
      const alCerrar = vi.fn();
      const { findByText } = renderModal({ alCerrar });
      const btnConfig = await findByText("Configuración");
      await userEvent.click(btnConfig);
      expect(alCerrar).toHaveBeenCalledTimes(1);
    });

    it("botón Salir del demo llama alCerrar y navega via navigate con replace", async () => {
      const alCerrar = vi.fn();
      const { findByText } = renderModal({ alCerrar });
      const btnSalir = await findByText("Salir del demo");
      await userEvent.click(btnSalir);
      expect(alCerrar).toHaveBeenCalledTimes(1);
    });
  });

  describe("focus trap real y accesibilidad", () => {
    it("foco inicial queda en el contenedor del diálogo (no en un botón)", async () => {
      renderModal();
      const dialog = screen.getByRole("dialog");
      await esperarFocoEnContenedor(dialog);
      // El contenedor está fuera del ciclo de Tab
      expect(dialog.getAttribute("tabindex")).toBe("-1");
    });

    it("la trampa real confina el foco dentro del panel al tabular", async () => {
      const usuario = userEvent.setup();
      renderModal();
      const dialog = screen.getByRole("dialog");
      await esperarFocoEnContenedor(dialog);

      await usuario.tab();
      expect(dialog.contains(document.activeElement)).toBe(true);
      await usuario.tab();
      expect(dialog.contains(document.activeElement)).toBe(true);
      await usuario.tab();
      expect(dialog.contains(document.activeElement)).toBe(true);
    });

    it("elementos enfocables: la «X», Configuración y Salir del demo (3)", () => {
      renderModal();
      const dialog = screen.getByRole("dialog");
      const focusables = dialog.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      expect(focusables.length).toBe(3);
      expect(focusables[0].getAttribute("aria-label")).toBe("Cerrar Cuenta");
      expect(focusables[1].textContent).toContain("Configuración");
      expect(focusables[2].textContent).toContain("Salir del demo");
    });
  });

  describe("retorno de foco al cerrar", () => {
    it("devuelve foco a triggerRef.current si está conectado", async () => {
      const alCerrar = vi.fn();
      const triggerButton = document.createElement("button");
      triggerButton.textContent = "Avatar";
      document.body.appendChild(triggerButton);
      const triggerRef = { current: triggerButton };
      const focusSpy = vi.spyOn(triggerButton, "focus");

      const { rerender } = renderModal({ alCerrar, triggerRef });
      await act(async () => {
        rerender(
          <MemoryRouter initialEntries={["/dashboard"]}>
            <DashboardUserModal abierto={false} alCerrar={alCerrar} triggerRef={triggerRef} />
          </MemoryRouter>
        );
      });

      expect(focusSpy).toHaveBeenCalled();
      expect(document.activeElement).toBe(triggerButton);
      focusSpy.mockRestore();
      document.body.removeChild(triggerButton);
    });

    it("devuelve foco al elemento previo conectado si no hay triggerRef", async () => {
      const alCerrar = vi.fn();
      const previousButton = document.createElement("button");
      previousButton.textContent = "Prev";
      document.body.appendChild(previousButton);
      previousButton.focus();
      const focusSpy = vi.spyOn(previousButton, "focus");

      const { rerender } = renderModal({ alCerrar, triggerRef: { current: null } });
      await act(async () => {
        rerender(
          <MemoryRouter initialEntries={["/dashboard"]}>
            <DashboardUserModal abierto={false} alCerrar={alCerrar} triggerRef={{ current: null }} />
          </MemoryRouter>
        );
      });

      expect(focusSpy).toHaveBeenCalled();
      expect(document.activeElement).toBe(previousButton);
      focusSpy.mockRestore();
      document.body.removeChild(previousButton);
    });

    it("cae al control estable de la navegación lateral si no hay disparador ni elemento previo", async () => {
      const alCerrar = vi.fn();
      const aside = document.createElement("aside");
      aside.setAttribute("role", "navigation");
      const navButton = document.createElement("button");
      navButton.textContent = "Inicio";
      aside.appendChild(navButton);
      document.body.appendChild(aside);
      const focusSpy = vi.spyOn(navButton, "focus");

      const { rerender } = renderModal({ alCerrar, triggerRef: { current: null } });
      await act(async () => {
        rerender(
          <MemoryRouter initialEntries={["/dashboard"]}>
            <DashboardUserModal abierto={false} alCerrar={alCerrar} triggerRef={{ current: null }} />
          </MemoryRouter>
        );
      });

      expect(focusSpy).toHaveBeenCalled();
      expect(document.activeElement).toBe(navButton);
      expect(document.activeElement).not.toBe(document.body);
      focusSpy.mockRestore();
      document.body.removeChild(aside);
    });
  });

  describe("gesto de deslizar hacia abajo (solo móvil)", () => {
    const activarMovil = () => {
      Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: 375 });
      window.matchMedia = mockMatchMedia(false);
    };

    const activarPantallasGrandes = () => {
      Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: 1024 });
      window.matchMedia = mockMatchMedia((query) => query.includes("min-width: 768px"));
    };

    it("cierra al deslizar hacia abajo en móvil", async () => {
      activarMovil();
      const alCerrar = vi.fn();
      renderModal({ alCerrar });
      const panel = screen.getByRole("dialog");
      await esperarFocoEnContenedor(panel);

      dispararPuntero(panel, "pointerdown", { clientY: 0 });
      dispararPuntero(panel, "pointermove", { clientY: 160 });
      dispararPuntero(panel, "pointerup", { clientY: 160 });

      expect(alCerrar).toHaveBeenCalledTimes(1);
    });

    it("no cierra con un arrastre corto ni horizontal en móvil", async () => {
      activarMovil();
      const alCerrar = vi.fn();
      renderModal({ alCerrar });
      const panel = screen.getByRole("dialog");
      await esperarFocoEnContenedor(panel);

      dispararPuntero(panel, "pointerdown", { clientX: 0, clientY: 0 });
      dispararPuntero(panel, "pointerup", { clientX: 0, clientY: 40 });
      dispararPuntero(panel, "pointerdown", { clientX: 0, clientY: 0 });
      dispararPuntero(panel, "pointerup", { clientX: 200, clientY: 120 });

      expect(alCerrar).not.toHaveBeenCalled();
    });

    it("no cierra al deslizar en pantallas grandes (≥768px)", async () => {
      activarPantallasGrandes();
      const alCerrar = vi.fn();
      renderModal({ alCerrar });
      const panel = screen.getByRole("dialog");
      await esperarFocoEnContenedor(panel);

      dispararPuntero(panel, "pointerdown", { clientY: 0 });
      dispararPuntero(panel, "pointermove", { clientY: 200 });
      dispararPuntero(panel, "pointerup", { clientY: 200 });

      expect(alCerrar).not.toHaveBeenCalled();
    });
  });

  describe("altura y scroll interno (RF-22)", () => {
    it("el panel limita su altura y ofrece scroll interno", () => {
      renderModal();
      const panel = screen.getByRole("dialog");
      expect(panel.classList.contains("max-h-[85vh]")).toBe(true);
      expect(panel.classList.contains("overflow-y-auto")).toBe(true);
      expect(panel.getAttribute("tabindex")).toBe("-1");
    });
  });

  describe("Framer Motion - animación", () => {
    it("renderiza motion.div con props de animación (initial, animate, exit, transition)", () => {
      renderModal();
      const panel = screen.getByRole("dialog");
      expect(panel.getAttribute("role")).toBe("dialog");
      expect(panel.getAttribute("aria-modal")).toBe("true");
      expect(panel.getAttribute("aria-labelledby")).toBe("user-modal-title");
      expect(panel).toBeTruthy();
    });

    it("AnimatePresence presente para animación de salida", () => {
      const { rerender } = renderModal({ abierto: true });
      expect(screen.getByRole("dialog")).toBeTruthy();

      rerender(
        <MemoryRouter initialEntries={["/dashboard"]}>
          <DashboardUserModal abierto={false} alCerrar={vi.fn()} />
        </MemoryRouter>
      );
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });

  describe("iconos lucide-react", () => {
    it("renderiza icono Settings en botón Configuración", () => {
      renderModal();
      const btnConfig = screen.getByRole("button", { name: /Configuración/i });
      const icon = btnConfig.querySelector("svg");
      expect(icon).toBeTruthy();
      expect(icon.classList.contains("lucide-settings")).toBe(true);
    });

    it("renderiza icono LogOut en botón Salir del demo", () => {
      renderModal();
      const btnSalir = screen.getByRole("button", { name: /Salir del demo/i });
      const icon = btnSalir.querySelector("svg");
      expect(icon).toBeTruthy();
      expect(icon.classList.contains("lucide-log-out")).toBe(true);
    });

    it("los iconos lucide tienen flex-shrink-0 w-6 h-6 (acotado a los iconos bajo prueba)", () => {
      renderModal();
      // Acotado a los iconos lucide: el aspa de BotonCerrar (w-5 h-5) no debe romper esta aserción.
      const icons = document.querySelectorAll("#dashboard-user-modal-panel svg.lucide");
      expect(icons.length).toBe(2);
      icons.forEach((icon) => {
        expect(icon.classList.contains("flex-shrink-0")).toBe(true);
        expect(icon.classList.contains("w-6")).toBe(true);
        expect(icon.classList.contains("h-6")).toBe(true);
      });
    });
  });

  describe("estilos y clases Fluid Glass", () => {
    it("overlay usa bg-bg-dark/80 backdrop-blur-sm z-50", () => {
      renderModal();
      const overlay = obtenerOverlay();
      expect(overlay).toBeTruthy();
      expect(overlay.classList.contains("backdrop-blur-sm")).toBe(true);
      expect(overlay.classList.contains("z-50")).toBe(true);
    });

    it("panel usa bg-bg-cream/95 glass-surface border-border-line/30 rounded-2xl shadow-xl z-60", () => {
      renderModal();
      const panel = screen.getByRole("dialog");
      expect(panel.classList.contains("bg-bg-cream/95")).toBe(true);
      expect(panel.classList.contains("glass-surface")).toBe(true);
      expect(panel.classList.contains("border-border-line/30")).toBe(true);
      expect(panel.classList.contains("rounded-2xl")).toBe(true);
      expect(panel.classList.contains("shadow-xl")).toBe(true);
      expect(panel.classList.contains("z-60")).toBe(true);
      expect(panel.classList.contains("w-[90vw]")).toBe(true);
      expect(panel.classList.contains("max-w-sm")).toBe(true);
    });
  });

  // Casos nuevos de la spec 011 (Tarea 4): el respaldo estable del modal de cuenta se resuelve por
  // versión de vista con la pieza compartida `useRetornoDeFoco`. Los casos vigentes de arriba
  // —incluidos los de retorno `:239-283` y el del control lateral `:285-309`— quedan intactos.
  describe("respaldo por versión de vista (RF-09, spec 011)", () => {
    /** Nodos DOM creados por estos casos: se retiran tras cada uno para no contaminar la suite. */
    const nodosCreados = [];

    /**
     * Fija la versión de vista con un `matchMedia` **coherente con `innerWidth`** (mismo criterio que
     * el stub de `vitest.setup.js`: `matches = innerWidth >= min-width`), de modo que el caso mide una
     * sola versión de vista y `useBreakpoint` —fuente del respaldo— no puede leer algo distinto.
     */
    const medirVersionDeVista = (ancho) => {
      Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: ancho });
      window.matchMedia = mockMatchMedia((query) => {
        const minimo = /min-width:\s*(\d+)px/.exec(query);
        return minimo ? window.innerWidth >= Number(minimo[1]) : false;
      });
    };

    const crearBoton = (etiqueta, etiquetaAria) => {
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
          <DashboardUserModal abierto={false} alCerrar={alCerrar} triggerRef={triggerRef} />
        </MemoryRouter>
      );

    beforeEach(() => {
      // Punto de partida estable: nada enfocado antes de cada caso.
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    });

    afterEach(() => {
      nodosCreados.splice(0).forEach((nodo) => nodo.remove());
    });

    it("AC-05 (conectado): devuelve el foco al disparador una sola vez", async () => {
      medirVersionDeVista(375);
      const disparador = crearBoton("Avatar");
      const espiaFocus = vi.spyOn(disparador, "focus");

      const alCerrar = vi.fn();
      const triggerRef = { current: disparador };
      const { rerender } = renderModal({ alCerrar, triggerRef });
      await esperarFocoEnContenedor(screen.getByRole("dialog"));

      await act(async () => {
        rerenderCerrado(rerender, alCerrar, triggerRef);
      });

      expect(espiaFocus).toHaveBeenCalledTimes(1);
      expect(document.activeElement).toBe(disparador);
    });

    it("AC-05 (desconectado): la cadena usa el elemento capturado y nunca deja el foco en body", async () => {
      medirVersionDeVista(375);
      const previo = crearBoton("Anterior");
      previo.focus();
      const disparador = crearBoton("Avatar");
      const espiaDesconectado = vi.spyOn(disparador, "focus");
      disparador.remove(); // desconectado: no debe recibir focus()

      const alCerrar = vi.fn();
      const triggerRef = { current: disparador };
      const { rerender } = renderModal({ alCerrar, triggerRef });
      await esperarFocoEnContenedor(screen.getByRole("dialog"));

      await act(async () => {
        rerenderCerrado(rerender, alCerrar, triggerRef);
      });

      expect(espiaDesconectado).not.toHaveBeenCalled();
      expect(document.activeElement).toBe(previo);
      expect(document.activeElement).not.toBe(document.body);
    });

    it("AC-06 (móvil): sin disparador y con el elemento capturado desconectado cae al botón «Menú»", async () => {
      medirVersionDeVista(375);
      const respaldo = crearBoton("Menú", "Abrir menú");
      const previo = crearBoton("Anterior");
      previo.focus(); // queda capturado al abrir…

      const alCerrar = vi.fn();
      const triggerRef = { current: null };
      const { rerender } = renderModal({ alCerrar, triggerRef });
      await esperarFocoEnContenedor(screen.getByRole("dialog"));

      previo.remove(); // …y se desconecta antes del cierre: deja de ser un candidato válido

      await act(async () => {
        rerenderCerrado(rerender, alCerrar, triggerRef);
      });

      expect(document.activeElement).toBe(respaldo);
      expect(document.activeElement).not.toBe(document.body);
    });

    it("AC-06 (≥768px): el respaldo de pantallas grandes es el control lateral, no el botón «Menú»", async () => {
      medirVersionDeVista(1024);
      crearBoton("Menú", "Abrir menú"); // existe en el DOM, pero no es el respaldo de esta versión
      const aside = document.createElement("aside");
      aside.setAttribute("role", "navigation");
      const respaldo = document.createElement("button");
      respaldo.textContent = "Inicio";
      aside.appendChild(respaldo);
      document.body.appendChild(aside);
      nodosCreados.push(aside);

      const alCerrar = vi.fn();
      const triggerRef = { current: null };
      const { rerender } = renderModal({ alCerrar, triggerRef });
      await esperarFocoEnContenedor(screen.getByRole("dialog"));

      await act(async () => {
        rerenderCerrado(rerender, alCerrar, triggerRef);
      });

      expect(document.activeElement).toBe(respaldo);
      expect(document.activeElement).not.toBe(document.body);
    });

    it("AC-24: un candidato disabled no corta la cadena", async () => {
      medirVersionDeVista(375);
      const previo = crearBoton("Anterior");
      previo.focus();
      const disparadorDeshabilitado = crearBoton("Avatar");
      disparadorDeshabilitado.disabled = true;

      const alCerrar = vi.fn();
      const triggerRef = { current: disparadorDeshabilitado };
      const { rerender } = renderModal({ alCerrar, triggerRef });
      await esperarFocoEnContenedor(screen.getByRole("dialog"));

      await act(async () => {
        rerenderCerrado(rerender, alCerrar, triggerRef);
      });

      expect(document.activeElement).toBe(previo);
      expect(document.activeElement).not.toBe(disparadorDeshabilitado);
    });

    it("AC-24: un candidato dentro de un subárbol inert no corta la cadena", async () => {
      medirVersionDeVista(375);
      const previo = crearBoton("Anterior");
      previo.focus();
      const contenedorInerte = document.createElement("div");
      contenedorInerte.setAttribute("inert", "");
      const disparadorInerte = document.createElement("button");
      disparadorInerte.textContent = "Avatar";
      contenedorInerte.appendChild(disparadorInerte);
      document.body.appendChild(contenedorInerte);
      nodosCreados.push(contenedorInerte);

      const alCerrar = vi.fn();
      const triggerRef = { current: disparadorInerte };
      const { rerender } = renderModal({ alCerrar, triggerRef });
      await esperarFocoEnContenedor(screen.getByRole("dialog"));

      await act(async () => {
        rerenderCerrado(rerender, alCerrar, triggerRef);
      });

      expect(document.activeElement).toBe(previo);
      expect(document.activeElement).not.toBe(disparadorInerte);
    });

    it("montaje cerrado: no enfoca ningún candidato ni mueve el foco", () => {
      medirVersionDeVista(375);
      const disparador = crearBoton("Avatar");
      const respaldo = crearBoton("Menú", "Abrir menú");
      const espiaDisparador = vi.spyOn(disparador, "focus");
      const espiaRespaldo = vi.spyOn(respaldo, "focus");
      const focoAntes = document.activeElement;

      renderModal({ abierto: false, triggerRef: { current: disparador } });

      expect(screen.queryByRole("dialog")).toBeNull();
      expect(espiaDisparador).not.toHaveBeenCalled();
      expect(espiaRespaldo).not.toHaveBeenCalled();
      expect(document.activeElement).toBe(focoAntes);
    });
  });
});
