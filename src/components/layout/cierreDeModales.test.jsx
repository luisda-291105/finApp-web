/**
 * @uso        Suite transversal del cierre de las CUATRO superficies modales (spec 010, T9) y de la
 *             paridad y convivencia real de su devolución de foco (spec 011, T9): canario del
 *             andamiaje, matriz superficie × forma, paridad del respaldo (AC-10), convivencia del
 *             menú con «Cuenta» (AC-11), cruce de versión de vista con el modal real (AC-14), una
 *             sola superficie/trampa y Esc con dos capas forzadas
 * @funciones  render, screen, within, waitFor, userEvent, act
 * @datos      Superficies REALES montadas con lo mínimo de su entorno (MemoryRouter, fixture de
 *             tarjetas y viewport explícito); NO se mockea focus-trap-react (RF-18, AC-19). La
 *             convivencia usa un mock controlable de matchMedia para forzar el cruce del corte
 * @eventos    «X», Esc, clic fuera y gestos de puntero (deslizar hacia abajo solo en móvil);
 *             Tab/Shift+Tab sobre la trampa real
 * @estados    viewport explícito (innerWidth + matchMedia) por caso
 * @usadoPor   Vitest
 */
import { act, cleanup, render, screen, waitFor, within } from "@testing-library/react";
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

  it("al cerrar «Cuenta» el foco vuelve al respaldo del menú (botón «Menú») sin doble devolución", async () => {
    fijarViewport(375);
    const usuario = userEvent.setup();
    renderLayoutMovil();

    // Abrir el menú superpuesto y, desde el avatar, «Cuenta» (el menú se cierra antes)
    await usuario.click(screen.getByRole("button", { name: "Abrir menú" }));
    const panelMenu = document.body.querySelector("#dashboard-drawer-panel");
    await usuario.click(within(panelMenu).getByRole("button", { name: /Cuenta de/ }));

    const panelModal = document.body.querySelector("#dashboard-user-modal-panel");
    expect(panelModal).toBeTruthy();
    await esperarFocoDentro(panelModal);

    // Espía del respaldo estable de móvil: el mismo nodo que el `triggerRef` del modal (botón «Menú»)
    const botonMenu = screen.getByRole("button", { name: "Abrir menú" });
    const espiaMenu = vi.spyOn(botonMenu, "focus");

    await usuario.click(screen.getByRole("button", { name: "Cerrar Cuenta" }));

    // Una sola devolución por el cierre de «Cuenta» (sin doble devolución) hacia el respaldo del menú
    expect(espiaMenu).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(botonMenu);
    expect(document.activeElement).not.toBe(document.body);
    // El menú superpuesto sigue cerrado y no queda ninguna superficie abierta
    expect(document.body.querySelector("#dashboard-drawer-panel")).toBeNull();
    expect(screen.queryAllByRole("dialog")).toHaveLength(0);
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

// ─────────────────────────────────────────────────────────────────────────────────────────────
// Paridad de la regla común en las cuatro superficies reales (spec 011; RF-06/RF-18; AC-10)
// ─────────────────────────────────────────────────────────────────────────────────────────────

/**
 * Monta los dos controles estables de RF-05 FUERA de cualquier superficie, para que el respaldo
 * del cierre tenga destino en las dos versiones de vista: botón «Menú» (móvil) y control de la
 * navegación lateral (≥768px).
 */
const renderControlesDeVersion = () =>
  render(
    <>
      <button type="button" aria-label="Abrir menú">
        Menú
      </button>
      <aside role="navigation" aria-label="Navegación de prueba">
        <button type="button">Navegación lateral</button>
      </aside>
    </>
  );

/**
 * Descriptores de paridad (AC-10). Cada `montar(triggerRef)` monta la superficie **abierta** con un
 * arnés que la cierra por su propio control; `cerrar()` produce la transición real
 * abierta → cerrada. Mismo escenario en las cuatro: disparador **desconectado** y elemento previo
 * inválido (`body`) ⇒ el cierre solo puede acabar en el respaldo de la versión de vista (RF-05).
 */
const SUPERFICIES_PARIDAD = [
  {
    nombre: "DashboardUserModal (Cuenta)",
    montar: (triggerRef) => {
      function Arnes() {
        const [abierto, setAbierto] = useState(true);
        return (
          <MemoryRouter initialEntries={["/dashboard"]}>
            <DashboardUserModal
              abierto={abierto}
              alCerrar={() => setAbierto(false)}
              triggerRef={triggerRef}
            />
          </MemoryRouter>
        );
      }
      render(<Arnes />);
    },
    cerrar: () => userEvent.click(screen.getByRole("button", { name: "Cerrar Cuenta" })),
  },
  {
    nombre: "DashboardDrawer (menú superpuesto)",
    montar: (triggerRef) => {
      function Arnes() {
        const [abierto, setAbierto] = useState(true);
        return (
          <MemoryRouter initialEntries={["/dashboard"]}>
            <DashboardDrawer
              abierto={abierto}
              alCerrar={() => setAbierto(false)}
              triggerRef={triggerRef}
            >
              <SidebarNavContenido alAbrirUserModal={vi.fn()} />
            </DashboardDrawer>
          </MemoryRouter>
        );
      }
      render(<Arnes />);
    },
    cerrar: () => userEvent.click(screen.getByRole("button", { name: "Cerrar menú" })),
  },
  {
    nombre: "AuthModal (ventana de acceso)",
    montar: () => {
      function Arnes() {
        const [abierto, setAbierto] = useState(true);
        return <AuthModal abierto={abierto} alCerrar={() => setAbierto(false)} />;
      }
      render(<Arnes />);
    },
    cerrar: () =>
      userEvent.click(screen.getByRole("button", { name: "Cerrar ventana de acceso" })),
  },
  {
    nombre: "ModalTarjeta (detalle de tarjeta)",
    montar: () => {
      function Arnes() {
        const [tarjeta, setTarjeta] = useState(TARJETAS_DEMO[0]);
        return <ModalTarjeta tarjeta={tarjeta} onCerrar={() => setTarjeta(null)} />;
      }
      render(<Arnes />);
    },
    cerrar: () =>
      userEvent.click(screen.getByRole("button", { name: "Cerrar detalle de tarjeta" })),
  },
];

describe.each(SUPERFICIES_PARIDAD)("paridad de la regla común (AC-10) — $nombre", (superficie) => {
  it.each([
    ["móvil (375px)", 375, "Abrir menú"],
    ["pantallas grandes (1024px)", 1024, "Navegación lateral"],
  ])(
    "disparador desconectado → el foco acaba en el respaldo de RF-05 en %s, nunca en body",
    async (_etiqueta, ancho, nombreControl) => {
      fijarViewport(ancho);
      renderControlesDeVersion();

      // Disparador desconectado del documento: la cadena lo descarta antes de invocar `focus()`
      const triggerRef = { current: document.createElement("button") };

      superficie.montar(triggerRef);
      await esperarFocoDentro(screen.getByRole("dialog"));

      await superficie.cerrar();

      const controlEsperado = screen.getByRole("button", { name: nombreControl });
      expect(document.activeElement).toBe(controlEsperado);
      expect(document.activeElement).not.toBe(document.body);
    }
  );
});

// ─────────────────────────────────────────────────────────────────────────────────────────────
// Convivencia real con el modal abierto al cruzar el corte (spec 011; D-11; AC-14)
// ─────────────────────────────────────────────────────────────────────────────────────────────

/**
 * Mock **controlable** de `matchMedia` (AC-14): además de derivar `matches` del ancho simulado,
 * registra los oyentes de `change` y permite **forzar el cruce** de versión de vista con
 * `fijarAncho`. El mock de `fijarViewport` no lo permite (sus `addEventListener` son no-ops).
 */
const instalarMatchMediaControlable = (anchoInicial) => {
  let ancho = anchoInicial;
  const listas = new Map();

  const crearLista = (query) => {
    const minimo = Number((/(\d+)px/.exec(query) || [])[1] ?? 0);
    const oyentes = new Set();
    const lista = {
      get matches() {
        return ancho >= minimo;
      },
      media: query,
      onchange: null,
      addListener: (oyente) => oyentes.add(oyente),
      removeListener: (oyente) => oyentes.delete(oyente),
      addEventListener: (_tipo, oyente) => oyentes.add(oyente),
      removeEventListener: (_tipo, oyente) => oyentes.delete(oyente),
      dispatchEvent: (evento) => {
        oyentes.forEach((oyente) => oyente(evento));
        return true;
      },
    };
    listas.set(query, { lista, oyentes });
    return lista;
  };

  window.matchMedia = vi.fn().mockImplementation(
    (query) => listas.get(query)?.lista ?? crearLista(query)
  );

  const fijarAncho = (nuevoAncho) => {
    ancho = nuevoAncho;
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: nuevoAncho,
    });
    listas.forEach(({ lista, oyentes }) => {
      const evento = { matches: lista.matches, media: lista.media };
      oyentes.forEach((oyente) => oyente(evento));
      if (typeof lista.onchange === "function") lista.onchange(evento);
    });
  };

  return { fijarAncho };
};

/** Layout real del dashboard (mismo entorno que el caso de integración de la 010). */
const renderLayoutReal = () =>
  render(
    <MemoryRouter initialEntries={["/dashboard"]}>
      <Routes>
        <Route path="/dashboard/*" element={<DashboardLayout />}>
          <Route index element={<div>Inicio</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );

describe("convivencia real: cruce con el modal de Cuenta real abierto (AC-14)", () => {
  it("el cruce móvil → pantallas grandes no roba el foco ni cierra el modal real", async () => {
    const { fijarAncho } = instalarMatchMediaControlable(375);
    const usuario = userEvent.setup();
    renderLayoutReal();

    // Abrir «Cuenta» desde el menú superpuesto (móvil): el modal real queda abierto con su trampa
    await usuario.click(screen.getByRole("button", { name: "Abrir menú" }));
    const panelMenu = document.body.querySelector("#dashboard-drawer-panel");
    await usuario.click(within(panelMenu).getByRole("button", { name: /Cuenta de/ }));

    const panelModal = document.body.querySelector("#dashboard-user-modal-panel");
    expect(panelModal).toBeTruthy();
    await esperarFocoDentro(panelModal);
    const focoAntes = document.activeElement;

    // Antes del cruce: composición móvil (sin navegación lateral permanente)
    expect(document.querySelector('aside[role="navigation"]')).toBeNull();

    // El cruce se fuerza en jsdom con el mock controlable de matchMedia (ejecutable, no diferido)
    await act(async () => {
      fijarAncho(1024);
    });

    // Evidencia de que el cruce ocurrió de verdad: la composición ya es de pantallas grandes
    expect(document.querySelector('aside[role="navigation"]')).toBeTruthy();

    // El modal real sigue abierto, con su foco y su trampa intactos: el cruce no le roba el foco
    expect(document.body.querySelector("#dashboard-user-modal-panel")).toBeTruthy();
    expect(screen.getAllByRole("dialog")).toHaveLength(1);
    expect(document.activeElement).toBe(focoAntes);
    expect(panelModal.contains(document.activeElement)).toBe(true);
  });
});
