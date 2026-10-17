/**
 * @uso        Tests de DashboardLayout (dos versiones de vista, márgenes, menú de móvil, recomposición)
 * @funciones  Composición por versión (móvil <768 / pantallas grandes ≥768), margen sin prefijo lg:,
 *             main sin padding superior, drawer de móvil sin esMobile, modal global, resize
 * @datos      Mocks: useBreakpoint (4 props), componentes hijos de layout, getUsuarioMock
 * @eventos    Navegación BottomNav, apertura de menú de móvil, apertura del modal, resize del corte
 * @estados    mobileMenuAbierto, userModalAbierto
 * @usadoPor   Vitest suite
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import DashboardLayout from "./DashboardLayout";
import { useBreakpoint } from "../hooks/useBreakpoint";
import SidebarResponsive from "../components/layout/SidebarResponsive";
import DashboardDrawer from "../components/layout/DashboardDrawer";
import BottomNav from "../components/layout/BottomNav";
import DashboardUserModal from "../components/layout/DashboardUserModal";
import SidebarNavContenido from "../components/layout/SidebarNavContenido";
import Container from "../components/layout/Container";

// La lógica de versión de vista se mockea con su contrato real de 4 props (sin isTablet)
vi.mock("../hooks/useBreakpoint", () => ({
  useBreakpoint: vi.fn(),
}));

// Mock de la navegación lateral: aside con role de navegación + el control de colapso real
// (permite verificar el traslado de foco al cruzar el corte).
vi.mock("../components/layout/SidebarResponsive", () => ({
  default: vi.fn(({ colapsada, alToggleColapso, alAbrirUserModal, ...rest }) => (
    <aside data-testid="sidebar-responsive" role="navigation" {...rest}>
      <button type="button" data-testid="sidebar-toggle" onClick={alToggleColapso} />
    </aside>
  )),
}));

// Drawer exclusivo de móvil: solo monta el panel cuando está abierto
vi.mock("../components/layout/DashboardDrawer", () => ({
  default: vi.fn(({ abierto, children }) =>
    abierto ? <div data-testid="dashboard-drawer">{children}</div> : null
  ),
}));

// BottomNav: refleja el botón «Menú» real, que recibe menuTriggerRef (control estable de
// retorno de foco en móvil, spec 010 rf-08/AC-08).
vi.mock("../components/layout/BottomNav", () => ({
  default: vi.fn(({ menuTriggerRef }) => (
    <nav data-testid="bottom-nav">
      <button
        type="button"
        ref={menuTriggerRef}
        data-testid="bottom-nav-menu"
        aria-label="Abrir menú"
      />
    </nav>
  )),
}));

// DashboardUserModal: el mock expone el contrato real (abierto, triggerRef) para poder
// comprobar que el layout cierra el menú antes de abrirlo y le pasa el control estable.
vi.mock("../components/layout/DashboardUserModal", () => ({
  default: vi.fn(({ abierto }) => (
    <div
      data-testid={abierto ? "user-modal-open" : "user-modal-closed"}
      role={abierto ? "dialog" : undefined}
    />
  )),
}));

vi.mock("../components/layout/SidebarNavContenido", () => ({
  default: vi.fn(() => <nav data-testid="sidebar-nav-contenido" />),
}));

vi.mock("../components/layout/Container", () => ({
  default: vi.fn(({ children }) => <div data-testid="container">{children}</div>),
}));

vi.mock("../config/app.config", () => ({
  getUsuarioMock: vi.fn(() => ({
    nombre: "Usuario Demo",
    iniciales: "UD",
    email: "demo@finapp.local",
  })),
}));

// Estados del hook mock. Partición complementaria: isMobile === !isDesktop.
const versionMovil = () => ({
  isMobile: true,
  isDesktop: false,
  sidebarColapsada: false,
  toggleSidebar: vi.fn(),
});
const pantallasGrandes = (sidebarColapsada) => ({
  isMobile: false,
  isDesktop: true,
  sidebarColapsada,
  toggleSidebar: vi.fn(),
});

const LayoutTree = ({ initialPath = "/dashboard" }) => (
  <MemoryRouter initialEntries={[initialPath]}>
    <Routes>
      <Route path="/dashboard/*" element={<DashboardLayout />}>
        <Route index element={<div data-testid="outlet-content">Inicio</div>} />
        <Route
          path="transacciones"
          element={<div data-testid="outlet-content">Transacciones</div>}
        />
      </Route>
    </Routes>
  </MemoryRouter>
);

const configurarVersión = (breakpoint) => {
  useBreakpoint.mockReturnValue(breakpoint);
};

const renderLayout = (breakpoint, initialPath = "/dashboard") => {
  configurarVersión(breakpoint);
  return render(<LayoutTree initialPath={initialPath} />);
};

const wrapperPrincipal = (container) => container.querySelector('[class*="min-h-screen"]');

const propsDe = (ComponenteMock, indice = 0) => ComponenteMock.mock.calls[indice]?.[0];

describe("DashboardLayout — dos versiones de vista", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  describe("Pantallas grandes (≥768px)", () => {
    it.each([
      ["768px", true],
      ["800px", true],
      ["1023px", true],
    ])("en %s: navegación lateral colapsada, margen ml-[72px] y sin BottomNav", (_ancho, colapsada) => {
      const { container } = renderLayout(pantallasGrandes(colapsada));

      const sidebarProps = propsDe(SidebarResponsive);
      expect(sidebarProps.colapsada).toBe(true);
      expect(sidebarProps.alToggleColapso).toBeTypeOf("function");
      expect(sidebarProps.alAbrirUserModal).toBeTypeOf("function");

      expect(BottomNav).not.toHaveBeenCalled();
      expect(DashboardDrawer).not.toHaveBeenCalled();

      const wrapper = wrapperPrincipal(container);
      expect(wrapper).toHaveClass("ml-[72px]");
      expect(wrapper).not.toHaveClass("ml-64");
    });

    it.each([
      ["1024px", false],
      ["1440px", false],
    ])("en %s: navegación lateral expandida y margen ml-64", (_ancho, colapsada) => {
      const { container } = renderLayout(pantallasGrandes(colapsada));

      expect(propsDe(SidebarResponsive).colapsada).toBe(false);
      expect(wrapperPrincipal(container)).toHaveClass("ml-64");
      expect(wrapperPrincipal(container)).not.toHaveClass("ml-[72px]");
    });

    it("no reserva la navegación con prefijos lg: (espacio desde 768px)", () => {
      const { container } = renderLayout(pantallasGrandes(true));

      const wrapper = wrapperPrincipal(container);
      expect(wrapper.className).not.toMatch(/lg:ml-/);
    });

    it("no renderiza la composición tablet (una sola navegación, sin menú superpuesto)", () => {
      renderLayout(pantallasGrandes(true));

      expect(SidebarResponsive).toHaveBeenCalledTimes(1);
      expect(DashboardDrawer).not.toHaveBeenCalled();
    });
  });

  describe("Móvil (<768px)", () => {
    it.each(["375px", "700px", "767px"])(
      "en %s: BottomNav + menú superpuesto, sin navegación lateral y margen ml-0",
      () => {
        const { container } = renderLayout(versionMovil());

        expect(screen.getByTestId("bottom-nav")).toBeDefined();
        expect(SidebarResponsive).not.toHaveBeenCalled();
        expect(wrapperPrincipal(container)).toHaveClass("ml-0");
        expect(wrapperPrincipal(container).className).not.toMatch(/lg:ml-/);
      }
    );

    it("pasa al drawer solo abierto/alCerrar/children/triggerRef y no esMobile", () => {
      renderLayout(versionMovil());

      const drawerProps = propsDe(DashboardDrawer);
      expect(drawerProps.abierto).toBe(false);
      expect(drawerProps.alCerrar).toBeTypeOf("function");
      expect(drawerProps.children).toBeDefined();
      expect(drawerProps).toHaveProperty("triggerRef");
      expect(drawerProps).not.toHaveProperty("esMobile");
    });

    it("abre el menú superpuesto al llamar alAbrirMenu del BottomNav", () => {
      renderLayout(versionMovil());

      act(() => {
        propsDe(BottomNav).alAbrirMenu();
      });

      expect(screen.getByTestId("dashboard-drawer")).toBeDefined();
      const ultimaLlamada = DashboardDrawer.mock.calls.at(-1)[0];
      expect(ultimaLlamada.abierto).toBe(true);
      expect(ultimaLlamada).not.toHaveProperty("esMobile");
    });

    it("abrir «Cuenta» desde el menú cierra el menú y deja una sola superficie", () => {
      renderLayout(versionMovil());

      act(() => {
        propsDe(BottomNav).alAbrirMenu();
      });
      expect(screen.getByTestId("dashboard-drawer")).toBeDefined();

      // El avatar del menú dispara la apertura del modal (mismo callback que la navegación lateral)
      act(() => {
        propsDe(SidebarNavContenido).alAbrirUserModal();
      });

      // Una sola superficie: el menú superpuesto se cierra y solo queda el modal abierto
      expect(screen.queryByTestId("dashboard-drawer")).toBeNull();
      expect(screen.getByTestId("user-modal-open")).toBeDefined();
      expect(screen.getAllByRole("dialog")).toHaveLength(1);

      const modalProps = DashboardUserModal.mock.calls.at(-1)[0];
      expect(modalProps.abierto).toBe(true);
      expect(modalProps).not.toHaveProperty("esMobile");
    });

    it("navega con alNavegar y marca la ruta activa en BottomNav", () => {
      renderLayout(versionMovil(), "/dashboard/transacciones");

      // El árbol de rutas cambia: BottomNav recibe la ruta activa y el callback de navegación
      expect(propsDe(BottomNav).itemActivo).toBe("/dashboard/transacciones");
      expect(propsDe(BottomNav).alNavegar).toBeTypeOf("function");
    });
  });

  describe("Área principal y contenido", () => {
    it("renderiza Container + Outlet en ambas versiones", () => {
      renderLayout(pantallasGrandes(false));
      expect(Container).toHaveBeenCalled();
      expect(screen.getByTestId("outlet-content")).toBeDefined();
    });

    it("el main conserva pb-20 y no tiene padding superior de header", () => {
      renderLayout(pantallasGrandes(false));

      const main = screen.getByRole("main");
      expect(main).toHaveClass("pb-20");
      expect(main).not.toHaveClass("pt-[var(--header-height)]");
    });
  });

  describe("Modal de cuenta global", () => {
    it("está presente (cerrado) en móvil y en pantallas grandes", () => {
      renderLayout(versionMovil());
      expect(screen.getByTestId("user-modal-closed")).toBeDefined();

      cleanup();
      renderLayout(pantallasGrandes(false));
      expect(screen.getByTestId("user-modal-closed")).toBeDefined();
    });

    it("se abre al llamar alAbrirUserModal del avatar", () => {
      renderLayout(pantallasGrandes(true));

      act(() => {
        propsDe(SidebarResponsive).alAbrirUserModal();
      });

      expect(screen.getByTestId("user-modal-open")).toBeDefined();
      // En ≥768px el ref no tiene elemento (no hay BottomNav): la cadena de M4 cae al control lateral
      const modalProps = DashboardUserModal.mock.calls.at(-1)[0];
      expect(modalProps.triggerRef).toBeDefined();
      expect(modalProps.triggerRef.current).toBeNull();
    });

    it("recibe el triggerRef del botón «Menú» sin cambiar las firmas del layout", () => {
      renderLayout(versionMovil());

      const modalProps = propsDe(DashboardUserModal);
      expect(modalProps.triggerRef).toBeDefined();
      expect(modalProps.triggerRef.current).toBe(screen.getByTestId("bottom-nav-menu"));
      expect(modalProps.triggerRef.current).toHaveAttribute("aria-label", "Abrir menú");
      // Firmas intactas: el modal no recibe props nuevas
      expect(Object.keys(modalProps).sort()).toEqual(
        ["abierto", "alCerrar", "triggerRef"].sort()
      );

      // El drawer conserva exactamente su contrato (sin props nuevas en sidebars)
      const drawerProps = propsDe(DashboardDrawer);
      expect(Object.keys(drawerProps).sort()).toEqual(
        ["abierto", "alCerrar", "children", "triggerRef"].sort()
      );
      expect(drawerProps).not.toHaveProperty("esMobile");
    });
  });

  describe("Canario del mecanismo focusin (jsdom)", () => {
    // Canario §2.3/M5: la verificabilidad de AC-12(ii)/AC-13 depende de que jsdom despache
    // `focusin` tanto en `.focus()` programático como en el clic de `userEvent`.
    it("despacha focusin en .focus() y en el clic de userEvent", async () => {
      const recibidos = [];
      const manejar = (evento) => recibidos.push(evento.target);
      document.addEventListener("focusin", manejar);
      try {
        const boton = document.createElement("button");
        document.body.appendChild(boton);

        boton.focus();
        expect(recibidos).toEqual([boton]);

        boton.blur();
        recibidos.length = 0;
        await userEvent.click(boton);
        expect(recibidos).toEqual([boton]);

        boton.remove();
      } finally {
        document.removeEventListener("focusin", manejar);
      }
    });
  });

  describe("Recomposición al cruzar el corte de 768px", () => {
    it("móvil → pantallas grandes cierra el menú y traslada el foco al control lateral", () => {
      const { rerender } = renderLayout(versionMovil());

      act(() => {
        propsDe(BottomNav).alAbrirMenu();
      });
      expect(screen.getByTestId("dashboard-drawer")).toBeDefined();

      configurarVersión(pantallasGrandes(true));
      rerender(<LayoutTree initialPath="/dashboard" />);

      expect(screen.queryByTestId("dashboard-drawer")).toBeNull();
      expect(document.activeElement).toBe(screen.getByTestId("sidebar-toggle"));
    });

    it("pantallas grandes → móvil con el modal abierto: el modal permanece", () => {
      const { rerender } = renderLayout(pantallasGrandes(false));

      act(() => {
        propsDe(SidebarResponsive).alAbrirUserModal();
      });
      expect(screen.getByTestId("user-modal-open")).toBeDefined();

      configurarVersión(versionMovil());
      rerender(<LayoutTree initialPath="/dashboard" />);

      expect(screen.getByTestId("user-modal-open")).toBeDefined();
    });

    it("móvil → pantallas grandes sin menú: traslada el foco de la navegación inferior al control lateral (AC-12(ii))", () => {
      const { rerender } = renderLayout(versionMovil());

      const itemInferior = screen.getByTestId("bottom-nav-menu");
      act(() => {
        itemInferior.focus();
      });
      expect(document.activeElement).toBe(itemInferior);

      configurarVersión(pantallasGrandes(true));
      rerender(<LayoutTree initialPath="/dashboard" />);

      expect(document.activeElement).toBe(screen.getByTestId("sidebar-toggle"));
    });

    it("pantallas grandes → móvil sin panel: traslada el foco de la navegación lateral al botón «Menú» (AC-13)", () => {
      const { rerender } = renderLayout(pantallasGrandes(true));

      const controlLateral = screen.getByTestId("sidebar-toggle");
      act(() => {
        controlLateral.focus();
      });
      expect(document.activeElement).toBe(controlLateral);

      configurarVersión(versionMovil());
      rerender(<LayoutTree initialPath="/dashboard" />);

      expect(document.activeElement).toBe(screen.getByTestId("bottom-nav-menu"));
    });

    it.each([
      ["móvil → pantallas grandes", false],
      ["pantallas grandes → móvil", true],
    ])(
      "cruce %s con el foco en el contenido principal: no mueve el foco (AC-14)",
      (_nombre, cruzaAMovil) => {
        const versionOrigen = cruzaAMovil ? pantallasGrandes(true) : versionMovil();
        const versionDestino = cruzaAMovil ? versionMovil() : pantallasGrandes(true);
        const { rerender } = renderLayout(versionOrigen);

        // Contenido principal fuera de toda navegación: sobrevive al cruce
        const contenido = screen.getByTestId("outlet-content");
        contenido.tabIndex = -1;
        act(() => {
          contenido.focus();
        });
        expect(document.activeElement).toBe(contenido);

        configurarVersión(versionDestino);
        rerender(<LayoutTree initialPath="/dashboard" />);

        expect(document.activeElement).toBe(contenido);
      }
    );

    it("cruce sin el control estable de destino: cae al primer control enfocable (AC-15 variante)", () => {
      const { rerender } = renderLayout(versionMovil());

      const itemInferior = screen.getByTestId("bottom-nav-menu");
      act(() => {
        itemInferior.focus();
      });

      // La versión de destino (≥768px) se monta sin su control estable (aside sin botones)
      SidebarResponsive.mockImplementationOnce(() => (
        <aside data-testid="sidebar-responsive" role="navigation" />
      ));

      // Primer control enfocable de la vista (fuera de toda navegación y de un diálogo)
      const contenidoEnfocable = document.createElement("button");
      document.body.appendChild(contenidoEnfocable);
      try {
        configurarVersión(pantallasGrandes(true));
        rerender(<LayoutTree initialPath="/dashboard" />);

        expect(document.activeElement).toBe(contenidoEnfocable);
      } finally {
        contenidoEnfocable.remove();
      }
    });

    it("1200px → 800px sin preferencia: el margen pasa a ml-[72px] (colapsada)", () => {
      const { container, rerender } = renderLayout(pantallasGrandes(false));
      expect(wrapperPrincipal(container)).toHaveClass("ml-64");

      configurarVersión(pantallasGrandes(true));
      rerender(<LayoutTree initialPath="/dashboard" />);

      expect(wrapperPrincipal(container)).toHaveClass("ml-[72px]");
    });

    it("con preferencia guardada, el estado se conserva al cruzar la banda", () => {
      const { container, rerender } = renderLayout(pantallasGrandes(true));
      expect(wrapperPrincipal(container)).toHaveClass("ml-[72px]");

      configurarVersión(pantallasGrandes(true));
      rerender(<LayoutTree initialPath="/dashboard" />);

      expect(wrapperPrincipal(container)).toHaveClass("ml-[72px]");
    });
  });
});
