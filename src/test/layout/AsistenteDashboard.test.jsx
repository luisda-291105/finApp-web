/**
 * @uso        Pruebas de integración del asistente de ayuda en las rutas del dashboard (spec 017)
 * @funciones  Montaje único, disparador, accesibilidad, retorno de foco y cierre de otras superficies
 * @datos      Vistas demo del dashboard; sin backend ni datos externos
 * @eventos    Apertura del asistente, cierre por Esc/scrim/X y cruces de superficie
 * @estados    ayudaAbierta, mobileMenuAbierto, userModalAbierto y detalle de tarjeta
 * @usadoPor   Vitest suite
 */
import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import DashboardLayout from "../../layout/DashboardLayout";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import SidebarResponsive from "../../components/layout/SidebarResponsive";

vi.mock("../../hooks/useBreakpoint", () => ({
  useBreakpoint: vi.fn(),
}));

vi.mock("framer-motion", async () => {
  const actual = await vi.importActual("framer-motion");
  const React = await vi.importActual("react");
  const PROPS_DE_ANIMACION = new Set([
    "initial",
    "animate",
    "exit",
    "transition",
    "variants",
    "custom",
    "whileHover",
    "whileTap",
    "whileFocus",
    "whileDrag",
    "whileInView",
    "layout",
    "layoutId",
    "layoutDependency",
    "layoutScroll",
    "drag",
    "dragConstraints",
    "dragElastic",
    "dragMomentum",
    "dragPropagation",
    "dragDirectionLock",
    "dragControls",
    "onDragStart",
    "onDrag",
    "onDragEnd",
    "onAnimationStart",
    "onAnimationComplete",
    "onUpdate",
    "transformTemplate",
    "viewport",
    "inherit",
  ]);
  const propsDom = (props) =>
    Object.fromEntries(Object.entries(props).filter(([clave]) => !PROPS_DE_ANIMACION.has(clave)));

  return {
    ...actual,
    useReducedMotion: vi.fn(() => false),
    AnimatePresence: ({ children }) => children,
    motion: {
      div: React.forwardRef(({ children, ...props }, ref) => (
        <div ref={ref} {...propsDom(props)}>
          {children}
        </div>
      )),
    },
  };
});

vi.mock("../../components/layout/SidebarResponsive", () => ({
  default: vi.fn(({ alAbrirUserModal, ...rest }) => (
    <aside data-testid="sidebar-responsive" role="navigation" {...rest}>
      <button
        type="button"
        aria-label="Abrir cuenta de usuario"
        onClick={alAbrirUserModal}
      />
    </aside>
  )),
}));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

const VERSION_MOVIL = {
  isMobile: true,
  isDesktop: false,
  sidebarColapsada: false,
  toggleSidebar: vi.fn(),
};

const VERSION_ESCRITORIO = {
  isMobile: false,
  isDesktop: true,
  sidebarColapsada: false,
  toggleSidebar: vi.fn(),
};

function LayoutTree({ initialPath = "/dashboard" }) {
  return (
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/dashboard/*" element={<DashboardLayout />}>
          <Route index element={<ContenidoDashboard etiqueta="Inicio" />} />
          <Route path="transacciones" element={<ContenidoDashboard etiqueta="Transacciones" />} />
          <Route path="tarjetas" element={<ContenidoDashboard etiqueta="Tarjetas" />} />
          <Route path="configuracion" element={<ContenidoDashboard etiqueta="Configuración" />} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

function ContenidoDashboard({ etiqueta }) {
  return (
    <div data-testid="contenido-dashboard">
      <h1>{etiqueta}</h1>
      <button type="button" data-testid="control-contenido">
        Control de contenido
      </button>
    </div>
  );
}

function renderDashboard(initialPath = "/dashboard", version = VERSION_MOVIL) {
  useBreakpoint.mockReturnValue(version);
  return render(<LayoutTree initialPath={initialPath} />);
}

async function abrirAsistente(user = userEvent.setup()) {
  await user.click(screen.getByRole("button", {
    name: "Abrir el asistente de ayuda",
    exact: true,
  }));
  return screen.getByRole("dialog", { name: "Asistente de ayuda" });
}

function obtenerDisparador() {
  return screen.getByRole("button", {
    name: "Abrir el asistente de ayuda",
    exact: true,
  });
}

function obtenerScrim() {
  const dialogo = screen.getByRole("dialog", { name: "Asistente de ayuda" });
  return dialogo.parentElement;
}

describe("Asistente en dashboard — montaje, alcance y disparador", () => {
  beforeEach(() => {
    useBreakpoint.mockReturnValue(VERSION_MOVIL);
    SidebarResponsive.mockImplementation(({ alAbrirUserModal, ...rest }) => (
      <aside data-testid="sidebar-responsive" role="navigation" {...rest}>
        <button
          type="button"
          aria-label="Abrir cuenta de usuario"
          onClick={alAbrirUserModal}
        />
      </aside>
    ));
  });

  it("monta un solo asistente, ids únicos y una sola trampa de diálogo", async () => {
    const user = userEvent.setup();
    renderDashboard();

    const dialogo = await abrirAsistente(user);

    expect(document.querySelectorAll("#asistente-titulo")).toHaveLength(1);
    expect(screen.getAllByRole("dialog")).toHaveLength(1);
    expect(dialogo.contains(document.activeElement)).toBe(true);
  });

  it("monta el scrim después del BottomNav y no lo convierte en superficie translúcida", async () => {
    const user = userEvent.setup();
    renderDashboard();
    await abrirAsistente(user);

    const nav = screen.getByRole("navigation", { name: "Navegación principal móvil" });
    const scrim = obtenerScrim();
    expect(nav.compareDocumentPosition(scrim) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(scrim.className).toMatch(/\bz-50\b/);
    expect(scrim.className).not.toMatch(/backdrop-(blur|filter)|glass-surface/);
  });

  it("expone robot accesible con icono, tamaño, clases tokenizadas y microinteracción de hover y escala", () => {
    renderDashboard();
    const disparador = obtenerDisparador();
    const icono = disparador.querySelector("svg");

    expect(disparador).toHaveAttribute("type", "button");
    expect(disparador).not.toHaveAttribute("aria-haspopup");
    expect(disparador).not.toHaveAttribute("aria-expanded");
    expect(disparador).toHaveAttribute("data-respaldo-foco", "excluir");
    expect(icono).toHaveAttribute("aria-hidden", "true");
    expect(icono).toHaveAttribute("width", "20");
    expect(icono).toHaveAttribute("height", "20");
    expect(icono).toHaveClass("lucide-bot-message-square");
    expect(disparador.className).toContain("w-11");
    expect(disparador.className).toContain("h-11");
    expect(disparador.className).toContain("z-40");
    expect(disparador.className).toContain("cursor-pointer");
    expect(disparador.className).toContain("transition-all");
    expect(disparador.className).toContain("hover:scale-105");
    expect(disparador.className).toContain("hover:bg-emerald-hover");
    expect(disparador.className).toContain("focus-visible:ring-2");
    expect(disparador.className).toContain("focus-visible:ring-mint-accent/60");
    expect(disparador.className).not.toMatch(
      /#|backdrop-|glass-|text-(?:white|black|slate-\d+)|bg-(?:black|white|slate-\d+)/
    );
  });

  it("ubica el disparador sobre la navegación móvil y aplica el offset de área segura", () => {
    renderDashboard();
    const disparador = obtenerDisparador();

    expect(disparador.className).toContain("right-6");
    expect(disparador.className).toContain(
      "bottom-[calc(60px_+_env(safe-area-inset-bottom,0px)_+_16px)]"
    );
    expect(disparador.className).not.toContain("safe-bottom");
    expect(disparador.getAttribute("style") ?? "").toBe("");
  });

  it.each([
    ["/dashboard", "Inicio"],
    ["/dashboard/transacciones", "Transacciones"],
    ["/dashboard/tarjetas", "Tarjeta"],
    ["/dashboard/configuracion", "Configuración"],
  ])("permite abrir una sola instancia en %s", async (ruta, contenido) => {
    const user = userEvent.setup();
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    renderDashboard(ruta);

    expect(obtenerDisparador()).toBeInTheDocument();
    if (ruta !== "/dashboard/tarjetas") {
      expect(screen.getByRole("heading", { name: contenido })).toBeInTheDocument();
    }
    await abrirAsistente(user);

    expect(screen.getAllByRole("dialog")).toHaveLength(1);
    expect(document.querySelectorAll("#asistente-titulo")).toHaveLength(1);
    if (ruta === "/dashboard/transacciones" || ruta === "/dashboard/configuracion") {
      expect(errorSpy).not.toHaveBeenCalled();
    }
  });
});

describe("Asistente en dashboard — contenido, ARIA y foco", () => {
  beforeEach(() => {
    useBreakpoint.mockReturnValue(VERSION_MOVIL);
  });

  it("conserva los textos estáticos aprobados de la 014", async () => {
    const user = userEvent.setup();
    renderDashboard();
    const dialogo = await abrirAsistente(user);

    [
      "Asistente de ayuda",
      "Demostración · No es una IA real",
      "Vista de diseño: contenido de ejemplo; aún no responde preguntas.",
      "Aún no hay mensajes. Cuando la ayuda esté activa, podrás elegir una sugerencia o escribir una pregunta.",
      "¿Cómo entro al panel?",
      "¿Dónde veo mis tarjetas?",
      "¿Se guardan mis datos?",
      "¿Cómo salgo del demo?",
      "Cuando la ayuda esté activa, si tu pregunta no coincide verás una respuesta de reserva.",
      "Enviar",
    ].forEach((texto) => expect(within(dialogo).getByText(texto)).toBeInTheDocument());

    expect(within(dialogo).getByLabelText("Tu pregunta")).toBeInTheDocument();
    expect(within(dialogo).getByPlaceholderText("Escribe una pregunta…")).toBeInTheDocument();
    expect(within(dialogo).getByRole("button", { name: "Cerrar asistente de ayuda" })).toBeInTheDocument();
    expect(within(dialogo).getByRole("log", { name: "Mensajes del asistente" })).toBeInTheDocument();
    expect(within(dialogo).queryByText("Conversación de ejemplo")).not.toBeInTheDocument();
  });

  it("abre únicamente el estado vacío, sin control de cambio de variante", async () => {
    const user = userEvent.setup();
    renderDashboard();
    const dialogo = await abrirAsistente(user);

    expect(within(dialogo).getByText(/Aún no hay mensajes/)).toBeInTheDocument();
    expect(within(dialogo).queryByText("Conversación de ejemplo")).not.toBeInTheDocument();
    expect(within(dialogo).queryByRole("button", { name: /conversación/i })).not.toBeInTheDocument();
  });

  it("cumple el contrato ARIA, desactiva Enviar y cierra con Escape", async () => {
    const user = userEvent.setup();
    renderDashboard();
    const dialogo = await abrirAsistente(user);
    const log = within(dialogo).getByRole("log");

    expect(dialogo).toHaveAttribute("aria-modal", "true");
    expect(dialogo).toHaveAttribute("aria-labelledby", "asistente-titulo");
    expect(dialogo).toHaveAttribute(
      "aria-describedby",
      "asistente-marca asistente-nota asistente-reserva"
    );
    expect(log).toHaveAttribute("aria-live", "polite");
    expect(log).toHaveAttribute("aria-relevant", "additions");
    expect(log).toHaveAttribute("aria-atomic", "false");
    expect(within(dialogo).getByLabelText("Tu pregunta")).toHaveAttribute("id", "asistente-entrada");
    expect(within(dialogo).getByRole("button", { name: "Enviar" })).toHaveAttribute(
      "aria-disabled",
      "true"
    );
    expect(document.activeElement).toBe(dialogo);
    expect(document.activeElement).not.toBe(
      within(dialogo).getByRole("button", { name: "Cerrar asistente de ayuda" })
    );

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: "Asistente de ayuda" })).not.toBeInTheDocument();
  });

  it.each([
    ["la X", async (dialogo) => {
      fireEvent.click(within(dialogo).getByRole("button", { name: "Cerrar asistente de ayuda" }));
    }],
    ["Escape", async () => {
      fireEvent.keyDown(document, { key: "Escape" });
    }],
    ["el scrim", async () => {
      fireEvent.click(obtenerScrim());
    }],
  ])("devuelve el foco al robot al cerrar por %s", async (_metodo, cerrar) => {
    const user = userEvent.setup();
    renderDashboard();
    const dialogo = await abrirAsistente(user);

    await cerrar(dialogo);

    await waitFor(() => expect(document.activeElement).toBe(obtenerDisparador()));
  });
});

describe("Asistente en dashboard — superficies y cruce de foco", () => {
  beforeEach(() => {
    useBreakpoint.mockReturnValue(VERSION_MOVIL);
    SidebarResponsive.mockImplementation(({ alAbrirUserModal, ...rest }) => (
      <aside data-testid="sidebar-responsive" role="navigation" {...rest}>
        <button
          type="button"
          aria-label="Abrir cuenta de usuario"
          onClick={alAbrirUserModal}
        />
      </aside>
    ));
  });

  it("al abrir el asistente cierra el drawer móvil", async () => {
    const user = userEvent.setup();
    renderDashboard();
    await user.click(screen.getByRole("button", { name: "Abrir menú" }));
    expect(screen.getByRole("dialog", { name: "Menú de navegación" })).toBeInTheDocument();

    fireEvent.click(obtenerDisparador());

    await waitFor(() => {
      expect(screen.getAllByRole("dialog")).toHaveLength(1);
      expect(screen.getByRole("dialog", { name: "Asistente de ayuda" })).toContainElement(
        document.activeElement
      );
    });
    expect(screen.queryByRole("dialog", { name: "Menú de navegación" })).not.toBeInTheDocument();
  });

  it("al abrir el asistente cierra el modal de Cuenta y deja foco dentro del chat", async () => {
    const user = userEvent.setup();
    renderDashboard();
    await user.click(screen.getByRole("button", { name: "Abrir menú" }));
    await user.click(screen.getByRole("button", { name: "Cuenta de Usuario Demo" }));
    expect(screen.getByRole("dialog", { name: "Cuenta de Usuario Demo" })).toBeInTheDocument();

    fireEvent.click(obtenerDisparador());

    await waitFor(() => {
      const dialogo = screen.getByRole("dialog", { name: "Asistente de ayuda" });
      expect(screen.getAllByRole("dialog")).toHaveLength(1);
      expect(dialogo).toContainElement(document.activeElement);
    });
    expect(screen.queryByRole("dialog", { name: "Cuenta de Usuario Demo" })).not.toBeInTheDocument();
  });

  it("excluye el robot del respaldo de foco al cruzar de móvil a escritorio", () => {
    const { rerender } = renderDashboard("/dashboard", VERSION_MOVIL);
    const botonMenu = screen.getByRole("button", { name: "Abrir menú" });
    act(() => botonMenu.focus());

    SidebarResponsive.mockImplementationOnce(() => (
      <aside data-testid="sidebar-responsive" role="navigation" />
    ));
    const controlContenido = screen.getByTestId("control-contenido");
    useBreakpoint.mockReturnValue(VERSION_ESCRITORIO);

    rerender(<LayoutTree />);

    expect(document.activeElement).toBe(controlContenido);
    expect(document.activeElement).not.toBe(obtenerDisparador());
  });
});
