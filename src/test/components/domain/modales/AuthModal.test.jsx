/**
 * @uso        Pruebas del modal de autenticación con las cuatro formas de cierre (spec 010, T7)
 * @funciones  render, screen, waitFor, userEvent
 * @datos      Props simuladas: abierto, modoInicial y alCerrar (mock); sin fetch/backend
 * @eventos    clic en la «X», clic fuera (backdrop), Esc con el foco en un campo, clic dentro del
 *             panel y gestos de puntero (deslizar en móvil)
 * @estados    viewport explícito (innerWidth + matchMedia) y estado de apertura en los re-render
 * @usadoPor   Vitest
 */
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import AuthModal from "../../../../components/domain/modales/AuthModal";
import PaginaLogin from "../../../../pages/PaginaLogin";
import PaginaInicio from "../../../../pages/PaginaInicio";

/**
 * Mock **local** de `config/app.config` para los casos nuevos de la spec 011 (Tarea 8). El cierre
 * que navega necesita `TRIAL_ACTIVO = false` para llevar a `/` (con el valor real navegaría a
 * `/dashboard`). Por defecto el getter devuelve el **valor real** del módulo, así que el resto de
 * casos de la suite —que no leen `TRIAL_ACTIVO` (verificado por `grep`)— quedan igual; el valor se
 * ajusta solo dentro del caso que lo necesita y se restaura al terminar.
 */
const estadoTrial = vi.hoisted(() => ({ activo: null }));

vi.mock("../../../../config/app.config", async (importOriginal) => {
  const real = await importOriginal();
  return {
    ...real,
    get TRIAL_ACTIVO() {
      return estadoTrial.activo ?? real.TRIAL_ACTIVO;
    },
  };
});

/**
 * Mock de `matchMedia` dependiente del ancho: `matches` es verdadero cuando el ancho
 * simulado alcanza el `min-width` de la consulta. Así el corte de 768px de `useBreakpoint`
 * (RF-20) se controla de forma explícita, sin depender del mock global de `vitest.setup.js`.
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

// Por defecto, pantallas grandes (≥768px): el gesto de deslizar no debe registrarse salvo
// en los casos que fijan explícitamente el viewport móvil.
beforeEach(() => fijarViewport(1024));

afterEach(() => {
  cleanup();
  fijarViewport(1024);
});

const renderModal = (props = {}) => {
  const propsFinales = { abierto: true, modoInicial: "login", alCerrar: vi.fn(), ...props };
  const utilidades = render(<AuthModal {...propsFinales} />);
  return { ...utilidades, alCerrar: propsFinales.alCerrar };
};

const obtenerDialogo = () => screen.getByRole("dialog");

/**
 * Capa exterior (backdrop) que cierra al tocar/clicar fuera. Con la trampa REAL
 * `focus-trap-react` no envuelve al hijo, así que el panel es hijo directo del backdrop.
 */
const obtenerOverlay = () => {
  const overlay = obtenerDialogo().parentElement;
  expect(overlay.classList.contains("fixed")).toBe(true);
  expect(overlay.classList.contains("inset-0")).toBe(true);
  return overlay;
};

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

describe("AuthModal", () => {
  describe("nombres accesibles y estructura del diálogo (RF-16)", () => {
    it("el diálogo tiene role=dialog, aria-modal=true y nombre accesible propio", () => {
      renderModal();
      const dialogo = screen.getByRole("dialog", { name: "Ventana de acceso" });
      expect(dialogo.getAttribute("aria-modal")).toBe("true");
    });

    it("la «X» está dentro del panel y tiene nombre accesible específico (ya no «Cerrar modal»)", async () => {
      const alCerrar = vi.fn();
      renderModal({ alCerrar });
      const dialogo = obtenerDialogo();
      const botonX = screen.getByRole("button", { name: "Cerrar ventana de acceso" });

      expect(dialogo.contains(botonX)).toBe(true);
      expect(screen.queryByRole("button", { name: "Cerrar modal" })).toBeNull();

      await userEvent.click(botonX);
      expect(alCerrar).toHaveBeenCalledTimes(1);
    });

    it("la «X» tiene anillo de foco con tokens sobre el panel oscuro", () => {
      renderModal();
      const botonX = screen.getByRole("button", { name: "Cerrar ventana de acceso" });
      expect(botonX.classList.contains("focus-visible:ring-2")).toBe(true);
      expect(botonX.classList.contains("focus-visible:ring-mint-accent")).toBe(true);
    });

    it("el panel limita su altura, ofrece scroll interno y queda fuera del ciclo de Tab (RF-22)", () => {
      renderModal();
      const dialogo = obtenerDialogo();
      expect(dialogo.classList.contains("max-h-[85vh]")).toBe(true);
      expect(dialogo.classList.contains("overflow-y-auto")).toBe(true);
      expect(dialogo.getAttribute("tabindex")).toBe("-1");
    });
  });

  describe("foco inicial en el contenedor con la trampa real (RF-16)", () => {
    it("el foco inicial queda en el contenedor del diálogo, no en un botón", async () => {
      renderModal();
      const dialogo = obtenerDialogo();
      await esperarFocoEnContenedor(dialogo);
      expect(dialogo.getAttribute("tabindex")).toBe("-1");
    });

    it("la trampa real confina el foco dentro del panel al tabular", async () => {
      const usuario = userEvent.setup();
      renderModal();
      const dialogo = obtenerDialogo();
      await esperarFocoEnContenedor(dialogo);

      await usuario.tab();
      expect(dialogo.contains(document.activeElement)).toBe(true);
      await usuario.tab();
      expect(dialogo.contains(document.activeElement)).toBe(true);
      await usuario.tab();
      expect(dialogo.contains(document.activeElement)).toBe(true);
    });
  });

  describe("cierre del modal (RF-02, RF-04, RF-05)", () => {
    it("Esc cierra una sola vez por pulsación, incluso con el foco en un campo", async () => {
      const alCerrar = vi.fn();
      const usuario = userEvent.setup();
      renderModal({ alCerrar });

      const identificacion = screen.getByPlaceholderText("1234567890");
      await usuario.click(identificacion);
      expect(document.activeElement).toBe(identificacion);

      await usuario.keyboard("{Escape}");
      expect(alCerrar).toHaveBeenCalledTimes(1);

      // Una pulsación ⇒ una llamada: la segunda pulsación añade exactamente otra.
      await usuario.keyboard("{Escape}");
      expect(alCerrar).toHaveBeenCalledTimes(2);
    });

    it("clic/tap fuera cierra con la trampa REAL activa y esta sigue confinando el foco", async () => {
      const alCerrar = vi.fn();
      renderModal({ alCerrar });
      const dialogo = obtenerDialogo();
      await esperarFocoEnContenedor(dialogo);

      await userEvent.click(obtenerOverlay());
      expect(alCerrar).toHaveBeenCalledTimes(1);

      // La trampa NO se desactivó: un foco exterior vuelve al panel (checkFocusIn).
      const externo = document.createElement("button");
      externo.textContent = "Fuera de la trampa";
      document.body.appendChild(externo);
      externo.focus();
      await waitFor(() => {
        expect(dialogo.contains(document.activeElement)).toBe(true);
      });
      document.body.removeChild(externo);
    });

    it("clic dentro del panel NO cierra el modal", async () => {
      const alCerrar = vi.fn();
      renderModal({ alCerrar });
      await userEvent.click(obtenerDialogo());
      expect(alCerrar).not.toHaveBeenCalled();
    });
  });

  describe("gesto de deslizar hacia abajo (solo móvil, RF-06)", () => {
    it("cierra al deslizar hacia abajo en móvil", async () => {
      fijarViewport(375);
      const alCerrar = vi.fn();
      renderModal({ alCerrar });
      const dialogo = obtenerDialogo();
      await esperarFocoEnContenedor(dialogo);

      dispararPuntero(dialogo, "pointerdown", { clientY: 0 });
      dispararPuntero(dialogo, "pointermove", { clientY: 160 });
      dispararPuntero(dialogo, "pointerup", { clientY: 160 });

      expect(alCerrar).toHaveBeenCalledTimes(1);
    });

    it("no cierra con un arrastre corto ni predominantemente horizontal", async () => {
      fijarViewport(375);
      const alCerrar = vi.fn();
      renderModal({ alCerrar });
      const dialogo = obtenerDialogo();
      await esperarFocoEnContenedor(dialogo);

      dispararPuntero(dialogo, "pointerdown", { clientX: 0, clientY: 0 });
      dispararPuntero(dialogo, "pointerup", { clientX: 0, clientY: 40 });
      dispararPuntero(dialogo, "pointerdown", { clientX: 0, clientY: 0 });
      dispararPuntero(dialogo, "pointerup", { clientX: 200, clientY: 120 });

      expect(alCerrar).not.toHaveBeenCalled();
    });

    it("no arranca si el arrastre comienza sobre un campo del formulario", async () => {
      fijarViewport(375);
      const alCerrar = vi.fn();
      renderModal({ alCerrar });
      await esperarFocoEnContenedor(obtenerDialogo());

      const identificacion = screen.getByPlaceholderText("1234567890");
      dispararPuntero(identificacion, "pointerdown", { clientY: 0 });
      dispararPuntero(identificacion, "pointermove", { clientY: 200 });
      dispararPuntero(identificacion, "pointerup", { clientY: 200 });

      expect(alCerrar).not.toHaveBeenCalled();
    });

    it("no aplica en pantallas grandes (≥768px)", async () => {
      fijarViewport(1024);
      const alCerrar = vi.fn();
      renderModal({ alCerrar });
      const dialogo = obtenerDialogo();
      await esperarFocoEnContenedor(dialogo);

      dispararPuntero(dialogo, "pointerdown", { clientY: 0 });
      dispararPuntero(dialogo, "pointermove", { clientY: 200 });
      dispararPuntero(dialogo, "pointerup", { clientY: 200 });

      expect(alCerrar).not.toHaveBeenCalled();
    });
  });

  describe("AC-22: cerrar NO borra lo escrito", () => {
    const escribirCampos = async (usuario) => {
      await usuario.type(screen.getByPlaceholderText("1234567890"), "12345678");
      await usuario.type(screen.getByPlaceholderText("Juan Pérez"), "Ana Pérez");
      await usuario.type(screen.getByPlaceholderText("••••••••"), "secreta123");
    };

    const comprobarCamposConservados = () => {
      expect(screen.getByPlaceholderText("1234567890").value).toBe("12345678");
      expect(screen.getByPlaceholderText("Juan Pérez").value).toBe("Ana Pérez");
      expect(screen.getByPlaceholderText("••••••••").value).toBe("secreta123");
    };

    it("conserva identificación, nombre y contraseña al cerrar con la «X» y reabrir", async () => {
      const usuario = userEvent.setup();
      const alCerrar = vi.fn();
      const { rerender } = render(
        <AuthModal abierto modoInicial="registro" alCerrar={alCerrar} />
      );

      await escribirCampos(usuario);
      await usuario.click(screen.getByRole("button", { name: "Cerrar ventana de acceso" }));
      expect(alCerrar).toHaveBeenCalledTimes(1);

      rerender(<AuthModal abierto={false} modoInicial="registro" alCerrar={alCerrar} />);
      expect(screen.queryByRole("dialog")).toBeNull();

      rerender(<AuthModal abierto modoInicial="registro" alCerrar={alCerrar} />);
      comprobarCamposConservados();
    });

    it("conserva lo escrito al cerrar con Esc y reabrir, sin errores", async () => {
      const usuario = userEvent.setup();
      const alCerrar = vi.fn();
      const spyError = vi.spyOn(console, "error").mockImplementation(() => {});
      const { rerender } = render(
        <AuthModal abierto modoInicial="registro" alCerrar={alCerrar} />
      );

      await escribirCampos(usuario);
      await usuario.keyboard("{Escape}");
      expect(alCerrar).toHaveBeenCalledTimes(1);

      rerender(<AuthModal abierto={false} modoInicial="registro" alCerrar={alCerrar} />);
      rerender(<AuthModal abierto modoInicial="registro" alCerrar={alCerrar} />);

      comprobarCamposConservados();
      expect(spyError).not.toHaveBeenCalled();
      spyError.mockRestore();
    });
  });

  // Casos nuevos de la spec 011 (Tarea 5): el `AuthModal` captura el elemento activo al abrir y
  // devuelve el foco al cerrar mediante la pieza compartida `useRetornoDeFoco`. En la landing el
  // respaldo es el primer control enfocable de la vista; en `/login` rige la limitación explícita
  // (H2: sin ningún enfocable fuera del modal la pieza devuelve `null`). Los casos vigentes de
  // arriba quedan intactos.
  describe("captura y devolución de foco (RF-10, spec 011)", () => {
    /** Nodos DOM creados por estos casos: se retiran tras cada uno para no contaminar la suite. */
    const nodosCreados = [];

    /** Mismo selector real de foco que usa la pieza compartida (RF-05). */
    const SELECTOR_ENFOCABLE =
      'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])';

    const crearBoton = (etiqueta) => {
      const nodo = document.createElement("button");
      nodo.textContent = etiqueta;
      document.body.appendChild(nodo);
      nodosCreados.push(nodo);
      return nodo;
    };

    /** Control de la landing mínima: enlace del logotipo, primer enfocable en orden de documento. */
    const crearEnlaceDeLanding = () => {
      const enlace = document.createElement("a");
      enlace.href = "/";
      enlace.textContent = "FinApp";
      document.body.appendChild(enlace);
      nodosCreados.push(enlace);
      return enlace;
    };

    /** Cierra el modal re-renderizando con `abierto={false}` (transición abierta → cerrada). */
    const cerrarModal = async (rerender, alCerrar) => {
      await act(async () => {
        rerender(<AuthModal abierto={false} alCerrar={alCerrar} />);
      });
    };

    beforeEach(() => {
      // Punto de partida estable: nada enfocado antes de cada caso.
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    });

    afterEach(() => {
      nodosCreados.splice(0).forEach((nodo) => nodo.remove());
    });

    it("AC-10: al cerrar devuelve el foco al disparador enfocado antes del render (1 devolución)", async () => {
      fijarViewport(1024);
      const disparador = crearBoton("Abrir acceso");
      disparador.focus();
      const espiaFocus = vi.spyOn(disparador, "focus");

      const alCerrar = vi.fn();
      const { rerender } = renderModal({ alCerrar });
      await esperarFocoEnContenedor(screen.getByRole("dialog"));

      await cerrarModal(rerender, alCerrar);

      expect(espiaFocus).toHaveBeenCalledTimes(1);
      expect(document.activeElement).toBe(disparador);
    });

    it("AC-06 (landing): sin disparador válido el foco queda en el primer control enfocable de la vista", async () => {
      fijarViewport(1024);
      const enlaceLanding = crearEnlaceDeLanding();

      const alCerrar = vi.fn();
      const { rerender } = renderModal({ alCerrar });
      const dialogo = screen.getByRole("dialog");
      await esperarFocoEnContenedor(dialogo);

      await cerrarModal(rerender, alCerrar);

      expect(document.activeElement).toBe(enlaceLanding);
      expect(document.activeElement).not.toBe(document.body);
      expect(dialogo.contains(document.activeElement)).toBe(false);
    });

    it("AC-06 (/login): sin ningún enfocable fuera del modal no hay focus() sobre body ni excepción", async () => {
      fijarViewport(1024);
      const espiaFocusBody = vi.spyOn(document.body, "focus");

      const alCerrar = vi.fn();
      const { rerender } = renderModal({ alCerrar });
      await esperarFocoEnContenedor(screen.getByRole("dialog"));

      // Evidencia de H2: la vista de `/login` no ofrece ningún enfocable fuera del modal.
      const enfocablesFuera = Array.from(document.querySelectorAll(SELECTOR_ENFOCABLE)).filter(
        (nodo) => !nodo.closest('[role="dialog"]')
      );
      expect(enfocablesFuera.length).toBe(0);

      await cerrarModal(rerender, alCerrar);

      expect(espiaFocusBody).not.toHaveBeenCalled();
      // Limitación documentada (H2/AC-08): no hay control de origen al que volver.
      expect(document.activeElement).toBe(document.body);
      espiaFocusBody.mockRestore();
    });

    it("AC-08 (parte): montado cerrado no captura, no devuelve y no enfoca ningún candidato", () => {
      fijarViewport(1024);
      const disparador = crearBoton("Abrir acceso");
      disparador.focus();
      const espiaDisparador = vi.spyOn(disparador, "focus");
      const enlaceLanding = crearEnlaceDeLanding();
      const espiaLanding = vi.spyOn(enlaceLanding, "focus");
      const focoAntes = document.activeElement;

      renderModal({ abierto: false });

      expect(screen.queryByRole("dialog")).toBeNull();
      expect(espiaDisparador).not.toHaveBeenCalled();
      expect(espiaLanding).not.toHaveBeenCalled();
      expect(document.activeElement).toBe(focoAntes);
    });
  });

  // Casos nuevos de la spec 011 (Tarea 8): el cierre que **cambia de ruta** coloca el foco en la
  // vista de destino (RF-15), después del render de la nueva vista y una sola vez. Origen `/login`
  // con las rutas reales (`PaginaLogin` → `PaginaInicio`) y `TRIAL_ACTIVO` ajustado en el ámbito
  // del caso (mock local de `config/app.config`): sin marcado ni rutas nuevas. Los casos vigentes
  // de la suite quedan **sin modificar**.
  describe("cierre que navega (/login → /): foco en la vista de destino (RF-15, spec 011)", () => {
    /** Mismo selector real de foco que usa la pieza compartida (RF-05). */
    const SELECTOR_ENFOCABLE =
      'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])';

    const renderRutasPublicas = () =>
      render(
        <MemoryRouter initialEntries={["/login"]}>
          <Routes>
            <Route path="/login" element={<PaginaLogin />} />
            <Route path="/" element={<PaginaInicio />} />
          </Routes>
        </MemoryRouter>
      );

    afterEach(() => {
      estadoTrial.activo = null;
    });

    it("AC-22(b): cerrar la «X» en /login navega a / y el foco acaba en el primer control enfocable (logotipo)", async () => {
      estadoTrial.activo = false;
      fijarViewport(1024);
      const usuario = userEvent.setup();
      renderRutasPublicas();
      await esperarFocoEnContenedor(screen.getByRole("dialog"));

      await usuario.click(screen.getByRole("button", { name: "Cerrar ventana de acceso" }));

      // La navegación se completa cuando la vista de destino (la landing) ya está renderizada.
      await waitFor(() => {
        expect(screen.getByRole("heading", { name: /Controla tu dinero/ })).toBeTruthy();
      });

      const logotipo = document.querySelector('header a[href="/"]');
      expect(logotipo).toBeTruthy();
      await waitFor(() => expect(document.activeElement).toBe(logotipo));
      expect(document.activeElement).not.toBe(document.body);

      // Y es, además, el **primer control enfocable** de la vista (lista ordenada de RF-15).
      const primerEnfocable = Array.from(
        document.querySelectorAll(SELECTOR_ENFOCABLE)
      ).find((nodo) => !nodo.closest('[role="dialog"]'));
      expect(primerEnfocable).toBe(logotipo);
    });
  });
});
