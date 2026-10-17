/**
 * @uso        Pruebas del modal de autenticación con las cuatro formas de cierre (spec 010, T7)
 * @funciones  render, screen, waitFor, userEvent
 * @datos      Props simuladas: abierto, modoInicial y alCerrar (mock); sin fetch/backend
 * @eventos    clic en la «X», clic fuera (backdrop), Esc con el foco en un campo, clic dentro del
 *             panel y gestos de puntero (deslizar en móvil)
 * @estados    viewport explícito (innerWidth + matchMedia) y estado de apertura en los re-render
 * @usadoPor   Vitest
 */
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import AuthModal from "./AuthModal";

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

      const correo = screen.getByPlaceholderText("tu@correo.com");
      await usuario.click(correo);
      expect(document.activeElement).toBe(correo);

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

      const correo = screen.getByPlaceholderText("tu@correo.com");
      dispararPuntero(correo, "pointerdown", { clientY: 0 });
      dispararPuntero(correo, "pointermove", { clientY: 200 });
      dispararPuntero(correo, "pointerup", { clientY: 200 });

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
      await usuario.type(screen.getByPlaceholderText("Juan Pérez"), "Ana Pérez");
      await usuario.type(screen.getByPlaceholderText("tu@correo.com"), "ana@correo.com");
      await usuario.type(screen.getByPlaceholderText("••••••••"), "secreta123");
    };

    const comprobarCamposConservados = () => {
      expect(screen.getByPlaceholderText("Juan Pérez").value).toBe("Ana Pérez");
      expect(screen.getByPlaceholderText("tu@correo.com").value).toBe("ana@correo.com");
      expect(screen.getByPlaceholderText("••••••••").value).toBe("secreta123");
    };

    it("conserva nombre, correo y contraseña al cerrar con la «X» y reabrir", async () => {
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
});
