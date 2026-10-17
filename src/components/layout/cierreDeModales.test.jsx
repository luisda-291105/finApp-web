/**
 * @uso        Suite transversal del cierre de las CUATRO superficies modales (spec 010, T9):
 *             canario del andamiaje, matriz superficie × forma, una sola superficie/trampa y
 *             Esc con dos capas forzadas
 * @funciones  render, screen, within, waitFor, userEvent
 * @datos      Superficies REALES montadas con lo mínimo de su entorno (MemoryRouter, fixture de
 *             tarjetas y viewport explícito); NO se mockea focus-trap-react (RF-18, AC-19)
 * @eventos    «X», Esc, clic fuera y gestos de puntero (deslizar hacia abajo solo en móvil);
 *             Tab/Shift+Tab sobre la trampa real
 * @estados    viewport explícito (innerWidth + matchMedia) por caso
 * @usadoPor   Vitest
 */
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import FocusTrap from "focus-trap-react";
import DashboardUserModal from "./DashboardUserModal";
import DashboardDrawer from "./DashboardDrawer";
import SidebarNavContenido from "./SidebarNavContenido";
import DashboardLayout from "../../layout/DashboardLayout";
import AuthModal from "../domain/modales/AuthModal";
import ModalTarjeta from "../domain/modales/ModalTarjeta";
import { TARJETAS_DEMO } from "../../data/tarjetasDemo";

// Mock de `framer-motion`: `motion.div` trivial con `forwardRef` (para que el `ref` del panel
// llegue a la trampa REAL) y animaciones desactivadas en jsdom. NO se mockea `focus-trap-react`:
// la trampa debe ejecutarse de verdad (RF-18, AC-19).
vi.mock("framer-motion", async () => {
  const actual = await vi.importActual("framer-motion");
  const React = await vi.importActual("react");
  return {
    ...actual,
    useReducedMotion: () => false,
    AnimatePresence: ({ children }) => children,
    motion: {
      div: React.forwardRef(({ children, ...props }, ref) => (
        <div ref={ref} {...props}>{children}</div>
      )),
    },
  };
});

/**
 * Mock de `matchMedia` dependiente del ancho simulado: `matches` es verdadero cuando el ancho
 * alcanza el `min-width` de la consulta. Controla de forma explícita el corte único de 768px
 * (RF-20) sin depender del mock global de `vitest.setup.js` (CL-18).
 */
const crearMockMatchMedia = (ancho) =>
  vi.fn().mockImplementation((query) => {
    const minimo = Number((/(\d+)px/.exec(query) || [])[1] ?? 0);
    return {
      matches: ancho >= minimo,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    };
  });

/** Fija el ancho de viewport simulado y su `matchMedia` coherente. */
const fijarViewport = (ancho) => {
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: ancho,
  });
  window.matchMedia = crearMockMatchMedia(ancho);
};

// Por defecto, pantallas grandes (≥768px): el gesto de deslizar solo se registra en los casos
// que fijan explícitamente el viewport móvil.
beforeEach(() => fijarViewport(1024));

afterEach(() => {
  cleanup();
  fijarViewport(1024);
});

/** Espera a que la trampa real (delayInitialFocus) deje el foco dentro del panel. */
const esperarFocoDentro = async (panel) => {
  await waitFor(() => {
    expect(panel.contains(document.activeElement)).toBe(true);
  });
};

/** Despacha un evento de puntero nativo con las propiedades que lee el gesto. */
const dispararPuntero = (elemento, tipo, props = {}) => {
  const evento = new Event(tipo, { bubbles: true, cancelable: true });
  Object.assign(evento, { isPrimary: true, pointerId: 7, clientX: 0, clientY: 0, ...props });
  elemento.dispatchEvent(evento);
};

// ─────────────────────────────────────────────────────────────────────────────────────────────
// Canario del andamiaje de geometría (mantenido de la Tarea 2)
// ─────────────────────────────────────────────────────────────────────────────────────────────

/**
 * Monta una trampa real con dos botones dentro y un control enfocable fuera,
 * para poder detectar si el foco se escapa de la trampa.
 */
const renderCanario = () =>
  render(
    <>
      <button type="button">Fuera de la trampa</button>
      <FocusTrap>
        <div data-testid="panel-canario">
          <button type="button">Uno</button>
          <button type="button">Dos</button>
        </div>
      </FocusTrap>
    </>
  );

/**
 * Espera a que la trampa real se active y coloque el foco dentro del contenedor.
 * `focus-trap` difiere el foco inicial (delayInitialFocus), por eso se espera.
 * @returns {Promise<HTMLElement>} el panel de la trampa
 */
const esperarTrampaActiva = async () => {
  const panel = screen.getByTestId("panel-canario");
  await esperarFocoDentro(panel);
  return panel;
};

describe("cierreDeModales — andamiaje de geometría (canario de la Tarea 2)", () => {
  it("crea la trampa real de focus-trap-react y deja el foco dentro del contenedor", async () => {
    renderCanario();

    const panel = await esperarTrampaActiva();

    // La trampa se crea (no lanza "no tabbable nodes") y enfoca el primer tabulable del panel
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Uno" }));
    expect(panel.contains(document.activeElement)).toBe(true);
  });

  it("Tab cicla dentro del contenedor sin escaparse al control de fuera", async () => {
    const usuario = userEvent.setup();
    renderCanario();

    const panel = await esperarTrampaActiva();
    const uno = screen.getByRole("button", { name: "Uno" });
    const dos = screen.getByRole("button", { name: "Dos" });

    await usuario.tab();
    expect(document.activeElement).toBe(dos);

    // Desde el último, Tab vuelve al primero: la trampa no deja salir hacia "Fuera de la trampa"
    await usuario.tab();
    expect(panel.contains(document.activeElement)).toBe(true);
    expect(document.activeElement).toBe(uno);
  });

  it("Shift+Tab desde el primero vuelve al último sin escapar", async () => {
    const usuario = userEvent.setup();
    renderCanario();

    const panel = await esperarTrampaActiva();
    const uno = screen.getByRole("button", { name: "Uno" });
    const dos = screen.getByRole("button", { name: "Dos" });

    expect(document.activeElement).toBe(uno);

    await usuario.tab({ shift: true });
    expect(panel.contains(document.activeElement)).toBe(true);
    expect(document.activeElement).toBe(dos);
  });
});

// ─────────────────────────────────────────────────────────────────────────────────────────────
// Matriz superficie × forma (RF-01, RF-02, RF-04, RF-05; AC-01..AC-06, AC-16)
// ─────────────────────────────────────────────────────────────────────────────────────────────

/**
 * Descriptores de las cuatro superficies modales reales. Cada `montar(alCerrar)` monta la
 * superficie con lo mínimo de su entorno y devuelve el panel y la capa exterior (backdrop).
 * `gesto: true` = es una de las tres superficies de contenido (RF-06); el menú NO lo aplica (DP-08).
 */
const SUPERFICIES = [
  {
    nombre: "DashboardUserModal (Cuenta)",
    botonCerrar: "Cerrar Cuenta",
    gesto: true,
    montar: (alCerrar) => {
      render(
        <MemoryRouter initialEntries={["/dashboard"]}>
          <DashboardUserModal abierto alCerrar={alCerrar} triggerRef={{ current: null }} />
        </MemoryRouter>
      );
      return {
        panel: document.body.querySelector("#dashboard-user-modal-panel"),
        capaExterior: document.body.querySelector("div.fixed.inset-0.bg-bg-dark\\/80"),
      };
    },
  },
  {
    nombre: "DashboardDrawer (menú superpuesto)",
    botonCerrar: "Cerrar menú",
    gesto: false,
    montar: (alCerrar) => {
      render(
        <MemoryRouter initialEntries={["/dashboard"]}>
          <DashboardDrawer abierto alCerrar={alCerrar}>
            <SidebarNavContenido alAbrirUserModal={vi.fn()} />
          </DashboardDrawer>
        </MemoryRouter>
      );
      return {
        panel: document.body.querySelector("#dashboard-drawer-panel"),
        capaExterior: document.body.querySelector('div.fixed.inset-0[aria-hidden="true"]'),
      };
    },
  },
  {
    nombre: "AuthModal (ventana de acceso)",
    botonCerrar: "Cerrar ventana de acceso",
    gesto: true,
    montar: (alCerrar) => {
      render(<AuthModal abierto alCerrar={alCerrar} />);
      const panel = screen.getByRole("dialog");
      return { panel, capaExterior: panel.parentElement };
    },
  },
  {
    nombre: "ModalTarjeta (detalle de tarjeta)",
    botonCerrar: "Cerrar detalle de tarjeta",
    gesto: true,
    montar: (alCerrar) => {
      render(<ModalTarjeta tarjeta={TARJETAS_DEMO[0]} onCerrar={alCerrar} />);
      const panel = screen.getByRole("dialog");
      return { panel, capaExterior: panel.parentElement };
    },
  },
];

describe.each(SUPERFICIES)("matriz superficie × forma — $nombre", (superficie) => {
  it("«X»: existe dentro del panel y cierra exactamente una vez", async () => {
    const alCerrar = vi.fn();
    const { panel } = superficie.montar(alCerrar);

    const botonCerrar = screen.getByRole("button", { name: superficie.botonCerrar });
    expect(panel.contains(botonCerrar)).toBe(true);

    await userEvent.click(botonCerrar);
    expect(alCerrar).toHaveBeenCalledTimes(1);
  });

  it("Esc: cierra exactamente una vez por pulsación (mecanismo único)", async () => {
    const alCerrar = vi.fn();
    superficie.montar(alCerrar);

    await userEvent.keyboard("{Escape}");

    expect(alCerrar).toHaveBeenCalledTimes(1);
  });

  it("clic fuera: cierra con la trampa real activa y una sola llamada", async () => {
    const alCerrar = vi.fn();
    const { panel, capaExterior } = superficie.montar(alCerrar);
    await esperarFocoDentro(panel);

    expect(capaExterior).toBeTruthy();
    await userEvent.click(capaExterior);

    expect(alCerrar).toHaveBeenCalledTimes(1);
  });
});

describe.each(SUPERFICIES)("gesto de deslizar hacia abajo — $nombre", (superficie) => {
  it(
    superficie.gesto
      ? "en móvil: cierra al deslizar hacia abajo (>96px, vertical)"
      : "en móvil: NO cierra al deslizar hacia abajo (DP-08: no aplica al menú)",
    async () => {
      fijarViewport(375);
      const alCerrar = vi.fn();
      const { panel } = superficie.montar(alCerrar);

      dispararPuntero(panel, "pointerdown", { clientY: 0 });
      dispararPuntero(panel, "pointermove", { clientY: 180 });
      dispararPuntero(panel, "pointerup", { clientY: 180 });

      if (superficie.gesto) {
        expect(alCerrar).toHaveBeenCalledTimes(1);
      } else {
        expect(alCerrar).not.toHaveBeenCalled();
      }
    }
  );
});

// ─────────────────────────────────────────────────────────────────────────────────────────────
// Una sola superficie y una sola trampa, por diseño (RF-07, RF-13; AC-06)
// ─────────────────────────────────────────────────────────────────────────────────────────────

describe("una sola superficie activa — integración con DashboardLayout real", () => {
  const renderLayoutMovil = () =>
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route path="/dashboard/*" element={<DashboardLayout />}>
            <Route index element={<div>Inicio</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

  it("abrir «Cuenta» desde el menú cierra el menú y deja una sola superficie y una sola trampa", async () => {
    fijarViewport(375);
    const usuario = userEvent.setup();
    renderLayoutMovil();

    // Abrir el menú superpuesto desde el botón «Menú» real de la navegación inferior
    await usuario.click(screen.getByRole("button", { name: "Abrir menú" }));
    const panelMenu = document.body.querySelector("#dashboard-drawer-panel");
    expect(panelMenu).toBeTruthy();

    // El avatar del menú es el disparador real del modal de Cuenta (mismo callback del layout)
    const avatar = within(panelMenu).getByRole("button", { name: /Cuenta de/ });
    await usuario.click(avatar);

    // Una sola superficie: el menú se cierra y queda solo el modal
    expect(document.body.querySelector("#dashboard-drawer-panel")).toBeNull();
    expect(screen.getAllByRole("dialog")).toHaveLength(1);

    const panelModal = document.body.querySelector("#dashboard-user-modal-panel");
    expect(panelModal).toBeTruthy();

    // Una sola trampa: el foco queda confinado en el modal (no en la superficie inferior)
    await esperarFocoDentro(panelModal);
    await usuario.tab();
    expect(panelModal.contains(document.activeElement)).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────────────────────
// Esc con dos capas forzadas (defensa CL-02; AC-07, AC-16)
// ─────────────────────────────────────────────────────────────────────────────────────────────

describe("Esc con dos capas forzadas — defensa CL-02", () => {
  it("cierra solo la capa superior (mayor z-*) con una sola llamada y la inferior se conserva", async () => {
    const cerrarCuenta = vi.fn();
    const cerrarAcceso = vi.fn();

    function DosCapas() {
      const [cuentaAbierta, setCuentaAbierta] = useState(true);
      const [accesoAbierto, setAccesoAbierto] = useState(true);
      return (
        <>
          <MemoryRouter initialEntries={["/dashboard"]}>
            <DashboardUserModal
              abierto={cuentaAbierta}
              alCerrar={() => {
                cerrarCuenta();
                setCuentaAbierta(false);
              }}
              triggerRef={{ current: null }}
            />
          </MemoryRouter>
          <AuthModal
            abierto={accesoAbierto}
            alCerrar={() => {
              cerrarAcceso();
              setAccesoAbierto(false);
            }}
          />
        </>
      );
    }

    render(<DosCapas />);

    // El modal de Cuenta declara capa 60; AuthModal, capa 50 ⇒ la superior es Cuenta.
    await userEvent.keyboard("{Escape}");

    expect(cerrarCuenta).toHaveBeenCalledTimes(1);
    expect(cerrarAcceso).not.toHaveBeenCalled();
    expect(document.body.querySelector("#dashboard-user-modal-panel")).toBeNull();
    expect(screen.getByRole("dialog", { name: "Ventana de acceso" })).toBeTruthy();

    // Una segunda pulsación cierra la siguiente capa (el registro queda coherente)
    await userEvent.keyboard("{Escape}");
    expect(cerrarAcceso).toHaveBeenCalledTimes(1);
  });

  it("en empate de capa (z-50) cierra solo la montada más tarde, con una sola llamada", async () => {
    const cerrarAcceso = vi.fn();
    const cerrarTarjeta = vi.fn();

    function EmpateDeCapa() {
      const [accesoAbierto, setAccesoAbierto] = useState(true);
      const [tarjeta, setTarjeta] = useState(TARJETAS_DEMO[0]);
      return (
        <>
          <AuthModal
            abierto={accesoAbierto}
            alCerrar={() => {
              cerrarAcceso();
              setAccesoAbierto(false);
            }}
          />
          <ModalTarjeta
            tarjeta={tarjeta}
            onCerrar={() => {
              cerrarTarjeta();
              setTarjeta(null);
            }}
          />
        </>
      );
    }

    render(<EmpateDeCapa />);

    // Ambas declaran capa 50 (empate) ⇒ gana la montada más tarde (ModalTarjeta).
    await userEvent.keyboard("{Escape}");

    expect(cerrarTarjeta).toHaveBeenCalledTimes(1);
    expect(cerrarAcceso).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog", { name: "Ventana de acceso" })).toBeTruthy();
  });
});
