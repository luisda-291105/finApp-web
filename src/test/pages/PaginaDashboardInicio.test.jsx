import { cleanup, render, screen, waitFor, act, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useNavigate } from "react-router-dom";
import PaginaDashboardInicio from "../../pages/PaginaDashboardInicio";

const muestraMocks = vi.hoisted(() => ({
  listarMuestras: vi.fn(),
  crearMuestra: vi.fn(),
  actualizarMuestra: vi.fn(),
  eliminarMuestra: vi.fn(),
}));

vi.mock("../../context/UsuarioActivoContext", () => ({
  useUsuarioActivo: () => ({ usuario: { idUsuario: "usuario-prueba" } }),
}));

vi.mock("../../services/muestraServicio", () => muestraMocks);

/**
 * Mockeo de useNavigate para poder verificar los destinos de navegación al activar
 * una muestra (T8, AC-21 a AC-25). Se devuelve siempre el mismo vi.fn() para que
 * el componente y el TestWrapper compartan la misma instancia. MemoryRouter y el
 * resto de exportaciones se preservan tal cual.
 */
const navigateMock = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: vi.fn(() => navigateMock),
  };
});

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

const restaurarViewportEscritorio = () => {
  Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: 1024 });
  window.matchMedia = mockMatchMedia((query) => {
    const minimo = /min-width:\s*(\d+)px/.exec(query);
    return minimo ? window.innerWidth >= Number(minimo[1]) : false;
  });
};

beforeEach(() => {
  restaurarViewportEscritorio();
  muestraMocks.listarMuestras.mockReset().mockResolvedValue([]);
  muestraMocks.crearMuestra.mockReset().mockImplementation(async (muestra) => ({
    ...muestra,
    id: `muestra-${muestra.titulo}`,
  }));
  muestraMocks.actualizarMuestra.mockReset().mockImplementation(async (id, muestra) => ({ ...muestra, id }));
  muestraMocks.eliminarMuestra.mockReset().mockResolvedValue(undefined);
});
afterEach(() => {
  cleanup();
  restaurarViewportEscritorio();
});

const renderPagina = () =>
  render(
    <MemoryRouter>
      <PaginaDashboardInicio />
    </MemoryRouter>
  );

const obtenerOverlay = () =>
  document.body.querySelector(".fixed.inset-0.bg-bg-dark\\/80");

const obtenerPanel = () => document.body.querySelector("#modal-crear-muestra-panel");

/** Espera a que la trampa real enfoque el contenedor del diálogo. */
const esperarFocoEnPanel = async (panel) => {
  await waitFor(() => {
    expect(document.activeElement).toBe(panel);
  });
};

/** Despacha un evento de puntero nativo con las propiedades que lee el gesto. */
const dispararPuntero = (elemento, tipo, props = {}) => {
  const evento = new Event(tipo, { bubbles: true, cancelable: true });
  Object.assign(evento, { isPrimary: true, pointerId: 7, clientX: 0, clientY: 0, ...props });
  elemento.dispatchEvent(evento);
};

describe("PaginaDashboardInicio (T1 — header y estado base)", () => {
  it("renderiza el título de la página 'dashboard'", () => {
    renderPagina();
    expect(screen.getByRole("heading", { name: "dashboard" })).toBeInTheDocument();
  });

  it("renderiza el botón 'crear muestra'", () => {
    renderPagina();
    expect(screen.getByRole("button", { name: "crear muestra" })).toBeInTheDocument();
  });

  it("no renderiza las 3 cards fijas por defecto", () => {
    renderPagina();
    expect(screen.queryByText("Balance disponible")).not.toBeInTheDocument();
    expect(screen.queryByText("Ingresos del mes")).not.toBeInTheDocument();
    expect(screen.queryByText("Gastos del mes")).not.toBeInTheDocument();
    expect(screen.queryByText("$12,480.50")).not.toBeInTheDocument();
    expect(screen.queryByText("$4,250.00")).not.toBeInTheDocument();
    expect(screen.queryByText("$1,820.75")).not.toBeInTheDocument();
  });

  it("renderiza sin errores con MemoryRouter", () => {
    expect(() => renderPagina()).not.toThrow();
  });
});

describe("PaginaDashboardInicio (T2 — marco del modal)", () => {
  describe("portal y renderizado", () => {
    it("renderiza overlay y panel en document.body al abrir el modal", async () => {
      renderPagina();
      const trigger = screen.getByRole("button", { name: "crear muestra" });
      await userEvent.click(trigger);

      expect(obtenerOverlay()).toBeTruthy();
      expect(obtenerPanel()).toBeTruthy();
    });

    it("no renderiza nada del modal cuando está cerrado", () => {
      renderPagina();
      expect(obtenerOverlay()).toBeNull();
      expect(obtenerPanel()).toBeNull();
    });

    it("tiene role=dialog, aria-modal=true y aria-labelledby", async () => {
      renderPagina();
      await userEvent.click(screen.getByRole("button", { name: "crear muestra" }));

      const dialog = screen.getByRole("dialog");
      expect(dialog.getAttribute("aria-modal")).toBe("true");
      expect(dialog.getAttribute("aria-labelledby")).toBe("modal-crear-muestra-titulo");
      const titulo = document.getElementById("modal-crear-muestra-titulo");
      expect(titulo).toBeTruthy();
      expect(titulo.textContent).toBe("Crear muestra");
    });
  });

  describe("cierre del modal", () => {
    it("click en la «X» superior cierra el modal", async () => {
      renderPagina();
      await userEvent.click(screen.getByRole("button", { name: "crear muestra" }));
      await esperarFocoEnPanel(screen.getByRole("dialog"));

      const botonCerrar = screen.getByRole("button", { name: "Cerrar creación de muestra" });
      await userEvent.click(botonCerrar);

      expect(obtenerPanel()).toBeNull();
      expect(obtenerOverlay()).toBeNull();
    });

    it("tecla ESC cierra el modal", async () => {
      renderPagina();
      await userEvent.click(screen.getByRole("button", { name: "crear muestra" }));
      await esperarFocoEnPanel(screen.getByRole("dialog"));

      await userEvent.keyboard("{Escape}");

      expect(obtenerPanel()).toBeNull();
      expect(obtenerOverlay()).toBeNull();
    });

    it("click en overlay cierra el modal", async () => {
      renderPagina();
      await userEvent.click(screen.getByRole("button", { name: "crear muestra" }));
      await esperarFocoEnPanel(screen.getByRole("dialog"));

      await userEvent.click(obtenerOverlay());

      expect(obtenerPanel()).toBeNull();
      expect(obtenerOverlay()).toBeNull();
    });

    it("click dentro del panel NO cierra el modal", async () => {
      renderPagina();
      await userEvent.click(screen.getByRole("button", { name: "crear muestra" }));
      await esperarFocoEnPanel(screen.getByRole("dialog"));

      await userEvent.click(screen.getByRole("dialog"));

      expect(obtenerPanel()).not.toBeNull();
      expect(obtenerOverlay()).not.toBeNull();
    });
  });

  describe("focus trap y accesibilidad", () => {
    it("foco inicial queda en el contenedor del panel (tabindex -1)", async () => {
      renderPagina();
      await userEvent.click(screen.getByRole("button", { name: "crear muestra" }));

      const panel = screen.getByRole("dialog");
      await esperarFocoEnPanel(panel);
      expect(panel.getAttribute("tabindex")).toBe("-1");
    });

    it("solo hay un control visible de cierre (la «X»)", async () => {
      renderPagina();
      await userEvent.click(screen.getByRole("button", { name: "crear muestra" }));

      const dialog = screen.getByRole("dialog");
      const cerrares = dialog.querySelectorAll('button[aria-label="Cerrar creación de muestra"]');
      expect(cerrares.length).toBe(1);
    });
  });

  describe("retorno de foco al cerrar", () => {
    it("devuelve el foco al botón 'crear muestra' al cerrar con la X", async () => {
      renderPagina();
      const triggerButton = screen.getByRole("button", { name: "crear muestra" });
      const focusSpy = vi.spyOn(triggerButton, "focus");

      await userEvent.click(triggerButton);
      await esperarFocoEnPanel(screen.getByRole("dialog"));

      const botonCerrar = screen.getByRole("button", { name: "Cerrar creación de muestra" });
      await userEvent.click(botonCerrar);

      await waitFor(() => {
        expect(focusSpy).toHaveBeenCalled();
        expect(document.activeElement).toBe(triggerButton);
      });
      focusSpy.mockRestore();
    });

    it("devuelve el foco al botón 'crear muestra' al cerrar con Esc", async () => {
      renderPagina();
      const triggerButton = screen.getByRole("button", { name: "crear muestra" });
      const focusSpy = vi.spyOn(triggerButton, "focus");

      await userEvent.click(triggerButton);
      await esperarFocoEnPanel(screen.getByRole("dialog"));

      await userEvent.keyboard("{Escape}");

      await waitFor(() => {
        expect(focusSpy).toHaveBeenCalled();
        expect(document.activeElement).toBe(triggerButton);
      });
      focusSpy.mockRestore();
    });
  });

  describe("gesto de deslizar hacia abajo (solo móvil)", () => {
    const activarMovil = () => {
      Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: 375 });
      window.matchMedia = mockMatchMedia(false);
    };

    it("cierra al deslizar hacia abajo en móvil", async () => {
      activarMovil();
      renderPagina();
      await userEvent.click(screen.getByRole("button", { name: "crear muestra" }));
      const panel = screen.getByRole("dialog");
      await esperarFocoEnPanel(panel);

      dispararPuntero(panel, "pointerdown", { clientY: 0 });
      dispararPuntero(panel, "pointermove", { clientY: 160 });
      dispararPuntero(panel, "pointerup", { clientY: 160 });

      await waitFor(() => {
        expect(obtenerPanel()).toBeNull();
        expect(obtenerOverlay()).toBeNull();
      });
    });

    it("no cierra con un arrastre corto en móvil", async () => {
      activarMovil();
      renderPagina();
      await userEvent.click(screen.getByRole("button", { name: "crear muestra" }));
      const panel = screen.getByRole("dialog");
      await esperarFocoEnPanel(panel);

      dispararPuntero(panel, "pointerdown", { clientX: 0, clientY: 0 });
      dispararPuntero(panel, "pointerup", { clientX: 0, clientY: 40 });

      expect(obtenerPanel()).not.toBeNull();
    });

    it("no cierra al deslizar en pantallas grandes (≥768px)", async () => {
      renderPagina();
      await userEvent.click(screen.getByRole("button", { name: "crear muestra" }));
      const panel = screen.getByRole("dialog");
      await esperarFocoEnPanel(panel);

      dispararPuntero(panel, "pointerdown", { clientY: 0 });
      dispararPuntero(panel, "pointermove", { clientY: 200 });
      dispararPuntero(panel, "pointerup", { clientY: 200 });

      expect(obtenerPanel()).not.toBeNull();
    });
  });

  describe("formulario de creación de muestra (T3)", () => {
    const abrirModal = async () => {
      renderPagina();
      await userEvent.click(screen.getByRole("button", { name: "crear muestra" }));
      return screen.getByRole("dialog");
    };

    it("al pulsar «crear muestra» se abre el modal «Crear muestra» (AC-3)", async () => {
      const dialog = await abrirModal();
      const titulo = document.getElementById("modal-crear-muestra-titulo");
      expect(dialog.getAttribute("aria-labelledby")).toBe("modal-crear-muestra-titulo");
      expect(titulo.textContent).toBe("Crear muestra");
    });

    it("presenta los tres campos del RF-04 y el botón «guardar muestra» (AC-5)", async () => {
      await abrirModal();
      const campoTitulo = screen.getByLabelText("Título de la muestra");
      expect(campoTitulo.getAttribute("type")).toBe("text");
      expect(screen.getByLabelText("Fuente")).toBeInTheDocument();
      expect(screen.getByLabelText("Tipo de visualización")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "guardar muestra" })).toBeInTheDocument();
    });

    it("el título de la muestra es un campo de texto controlado", async () => {
      await abrirModal();
      const campoTitulo = screen.getByLabelText("Título de la muestra");
      expect(campoTitulo).toHaveValue("");

      await userEvent.type(campoTitulo, "Ahorros del mes");

      expect(campoTitulo).toHaveValue("Ahorros del mes");
    });

    it("la fuente arranca en placeholder deshabilitado «Elegir fuente» (AC-6)", async () => {
      await abrirModal();
      const selectFuente = screen.getByLabelText("Fuente");
      expect(selectFuente).toHaveValue("");

      const placeholder = [...selectFuente.querySelectorAll("option")].find(
        (opcion) => opcion.value === ""
      );
      expect(placeholder).toBeTruthy();
      expect(placeholder.textContent).toBe("Elegir fuente");
      expect(placeholder.disabled).toBe(true);
    });

    it("la fuente ofrece exactamente las 5 opciones demo del propio modal (AC-6)", async () => {
      await abrirModal();
      const selectFuente = screen.getByLabelText("Fuente");
      const etiquetas = [...selectFuente.querySelectorAll("option")].map(
        (opcion) => opcion.textContent
      );
      expect(etiquetas).toEqual([
        "Elegir fuente",
        "Bolsillos",
        "Contabilidad",
        "Ingresos",
        "Gastos",
        "Tarjetas",
      ]);
    });

    it("seleccionar una fuente actualiza el control del borrador", async () => {
      await abrirModal();
      const selectFuente = screen.getByLabelText("Fuente");

      await userEvent.selectOptions(selectFuente, "bolsillos");

      expect(selectFuente).toHaveValue("bolsillos");

      await userEvent.selectOptions(selectFuente, "tarjetas");

      expect(selectFuente).toHaveValue("tarjetas");
    });

    it("el tipo arranca en placeholder deshabilitado «Elegir tipo» con sus 4 opciones (AC-7)", async () => {
      await abrirModal();
      const selectTipo = screen.getByLabelText("Tipo de visualización");
      expect(selectTipo).toHaveValue("");

      const opciones = [...selectTipo.querySelectorAll("option")];
      const placeholder = opciones.find((opcion) => opcion.value === "");
      expect(placeholder).toBeTruthy();
      expect(placeholder.textContent).toBe("Elegir tipo");
      expect(placeholder.disabled).toBe(true);
      expect(opciones.slice(1).map((opcion) => opcion.textContent)).toEqual([
        "Tarjeta",
        "Gráfica",
        "Métrica",
        "Mapa de calor",
      ]);
    });

    it("seleccionar un tipo actualiza el control del borrador", async () => {
      await abrirModal();
      const selectTipo = screen.getByLabelText("Tipo de visualización");

      await userEvent.selectOptions(selectTipo, "grafica");

      expect(selectTipo).toHaveValue("grafica");

      await userEvent.selectOptions(selectTipo, "mapa_calor");

      expect(selectTipo).toHaveValue("mapa_calor");
    });

    it("abrir el modal y elegir opciones no provoca llamadas a endpoints (AC-6)", async () => {
      const fetchDoble = vi.fn();
      vi.stubGlobal("fetch", fetchDoble);

      await abrirModal();
      await userEvent.type(screen.getByLabelText("Título de la muestra"), "Demo");
      await userEvent.selectOptions(screen.getByLabelText("Fuente"), "tarjetas");
      await userEvent.selectOptions(screen.getByLabelText("Tipo de visualización"), "metrica");

      expect(fetchDoble).not.toHaveBeenCalled();

      vi.unstubAllGlobals();
    });
  });

  describe("estilos y clases Fluid Glass", () => {
    it("overlay usa bg-bg-dark/80 backdrop-blur-sm z-50", async () => {
      renderPagina();
      await userEvent.click(screen.getByRole("button", { name: "crear muestra" }));

      const overlay = obtenerOverlay();
      expect(overlay).toBeTruthy();
      expect(overlay.classList.contains("backdrop-blur-sm")).toBe(true);
      expect(overlay.classList.contains("z-50")).toBe(true);
    });

    it("panel usa glass-surface, borde, radios, sombra y z-60", async () => {
      renderPagina();
      await userEvent.click(screen.getByRole("button", { name: "crear muestra" }));

      const panel = screen.getByRole("dialog");
      expect(panel.classList.contains("glass-surface")).toBe(true);
      expect(panel.classList.contains("border-border-line/30")).toBe(true);
      expect(panel.classList.contains("rounded-2xl")).toBe(true);
      expect(panel.classList.contains("shadow-xl")).toBe(true);
      expect(panel.classList.contains("z-60")).toBe(true);
      expect(panel.classList.contains("bg-bg-cream/95")).toBe(true);
    });
  });

  describe("ciclo de guardado y descarte de muestra (T4)", () => {
    const activarMovil = () => {
      Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: 375 });
      window.matchMedia = mockMatchMedia(false);
    };

    const abrirModalEn = async () => {
      renderPagina();
      await userEvent.click(screen.getByRole("button", { name: "crear muestra" }));
      return screen.getByRole("dialog");
    };

    /** Reabre el modal en la misma instancia de la página (conserva `muestras`). */
    const reabrirModal = async () => {
      await userEvent.click(screen.getByRole("button", { name: "crear muestra" }));
      return screen.getByRole("dialog");
    };

    /** Rellena los campos del borrador con los datos indicados. */
    const rellenarBorrador = async ({ titulo, fuente, tipo }) => {
      if (titulo !== undefined) {
        await userEvent.type(screen.getByLabelText("Título de la muestra"), titulo);
      }
      if (fuente !== undefined) {
        await userEvent.selectOptions(screen.getByLabelText("Fuente"), fuente);
      }
      if (tipo !== undefined) {
        await userEvent.selectOptions(screen.getByLabelText("Tipo de visualización"), tipo);
      }
    };

    const obtenerBotonGuardar = () => screen.getByRole("button", { name: "guardar muestra" });

    describe("guardado válido (AC-8, AC-11)", () => {
      it("añade la muestra, cierra el modal y restablece los campos a los placeholders", async () => {
        await abrirModalEn();
        await rellenarBorrador({ titulo: "Ahorros del mes", fuente: "bolsillos", tipo: "tarjeta" });
        await userEvent.click(obtenerBotonGuardar());

        await waitFor(() => {
          expect(obtenerPanel()).toBeNull();
          expect(obtenerOverlay()).toBeNull();
        });

        // La próxima apertura muestra el formulario vacío (AC-11).
        await reabrirModal();
        expect(screen.getByLabelText("Título de la muestra")).toHaveValue("");
        expect(screen.getByLabelText("Fuente")).toHaveValue("");
        expect(screen.getByLabelText("Tipo de visualización")).toHaveValue("");
      });

      it("la muestra añadida queda en la lista y los guardados anteriores permanecen intactos", async () => {
        await abrirModalEn();
        await rellenarBorrador({ titulo: "Primera", fuente: "bolsillos", tipo: "tarjeta" });
        await userEvent.click(obtenerBotonGuardar());
        await waitFor(() => expect(obtenerPanel()).toBeNull());

        // Segunda muestra distinta, acumulada sin reemplazar la primera.
        await reabrirModal();
        await rellenarBorrador({ titulo: "Segunda", fuente: "contabilidad", tipo: "grafica" });
        await userEvent.click(obtenerBotonGuardar());
        await waitFor(() => expect(obtenerPanel()).toBeNull());

        // El triple de la primera sigue presente: el reintento choca con duplicado.
        await reabrirModal();
        await rellenarBorrador({ titulo: "Primera", fuente: "bolsillos", tipo: "tarjeta" });
        await userEvent.click(obtenerBotonGuardar());
        expect(obtenerPanel()).not.toBeNull();
      });

      it("guardar un duplicado con el título normalizado con trim no añade ni cierra (AC-17)", async () => {
        await abrirModalEn();
        await rellenarBorrador({ titulo: "  Gastos fijos  ", fuente: "gastos", tipo: "metrica" });
        await userEvent.click(obtenerBotonGuardar());
        await waitFor(() => expect(obtenerPanel()).toBeNull());

        await reabrirModal();
        await rellenarBorrador({ titulo: "Gastos fijos", fuente: "gastos", tipo: "metrica" });
        await userEvent.click(obtenerBotonGuardar());
        expect(obtenerPanel()).not.toBeNull();
      });
    });

    describe("formulario incompleto (AC-16)", () => {
      it("guardar sin título no añade, mantiene el modal abierto y sin mensajes", async () => {
        await abrirModalEn();
        await rellenarBorrador({ fuente: "bolsillos", tipo: "tarjeta" });
        await userEvent.click(obtenerBotonGuardar());

        expect(obtenerPanel()).not.toBeNull();
        expect(obtenerOverlay()).not.toBeNull();
        expect(screen.queryByRole("alert")).toBeNull();
        const panel = screen.getByRole("dialog");
        expect(panel.textContent.toLowerCase()).not.toContain("error");
        expect(panel.textContent.toLowerCase()).not.toContain("incompleto");
        // El borrador se conserva para permitir corregir y reintentar.
        expect(screen.getByLabelText("Fuente")).toHaveValue("bolsillos");
        expect(screen.getByLabelText("Tipo de visualización")).toHaveValue("tarjeta");
      });

      it("guardar con un título de solo espacios es formulario incompleto", async () => {
        await abrirModalEn();
        await rellenarBorrador({ titulo: "   ", fuente: "tarjetas", tipo: "metrica" });
        await userEvent.click(obtenerBotonGuardar());

        expect(obtenerPanel()).not.toBeNull();
        expect(screen.getByLabelText("Título de la muestra")).toHaveValue("   ");
      });

      it("guardar con la fuente en su placeholder no añade y mantiene el modal abierto", async () => {
        await abrirModalEn();
        await rellenarBorrador({ titulo: "Sin fuente", tipo: "metrica" });
        await userEvent.click(obtenerBotonGuardar());

        expect(obtenerPanel()).not.toBeNull();
        expect(screen.getByLabelText("Fuente")).toHaveValue("");
      });

      it("guardar con el tipo en su placeholder no añade y mantiene el modal abierto", async () => {
        await abrirModalEn();
        await rellenarBorrador({ titulo: "Sin tipo", fuente: "ingresos" });
        await userEvent.click(obtenerBotonGuardar());

        expect(obtenerPanel()).not.toBeNull();
        expect(screen.getByLabelText("Tipo de visualización")).toHaveValue("");
      });
    });

    describe("muestra duplicada (AC-17)", () => {
      it("guardar un triple ya existente no añade ni cierra, y modificar el título permite reintentar", async () => {
        await abrirModalEn();
        await rellenarBorrador({ titulo: "Presupuesto", fuente: "bolsillos", tipo: "tarjeta" });
        await userEvent.click(obtenerBotonGuardar());
        await waitFor(() => expect(obtenerPanel()).toBeNull());

        // Triple idéntico: duplicado, el modal permanece abierto sin mensajes.
        await reabrirModal();
        await rellenarBorrador({ titulo: "Presupuesto", fuente: "bolsillos", tipo: "tarjeta" });
        await userEvent.click(obtenerBotonGuardar());
        expect(obtenerPanel()).not.toBeNull();
        expect(obtenerOverlay()).not.toBeNull();
        expect(screen.queryByRole("alert")).toBeNull();

        // Reintento con el título modificado: se añade y el modal se cierra.
        const campoTitulo = screen.getByLabelText("Título de la muestra");
        await userEvent.clear(campoTitulo);
        await userEvent.type(campoTitulo, "Presupuesto (copia)");
        await userEvent.click(obtenerBotonGuardar());
        await waitFor(() => expect(obtenerPanel()).toBeNull());
      });
    });

    describe("descarte al cerrar sin guardar (AC-18)", () => {
      it("cerrar con la «X» descarta el borrador: la próxima apertura está vacía", async () => {
        await abrirModalEn();
        await rellenarBorrador({ titulo: "Se descarta", fuente: "ingresos", tipo: "grafica" });
        await userEvent.click(screen.getByRole("button", { name: "Cerrar creación de muestra" }));
        expect(obtenerPanel()).toBeNull();

        await reabrirModal();
        expect(screen.getByLabelText("Título de la muestra")).toHaveValue("");
        expect(screen.getByLabelText("Fuente")).toHaveValue("");
        expect(screen.getByLabelText("Tipo de visualización")).toHaveValue("");
      });

      it("cerrar con Esc descarta el borrador: la próxima apertura está vacía", async () => {
        await abrirModalEn();
        await rellenarBorrador({ titulo: "Se descarta", fuente: "tarjetas", tipo: "metrica" });
        await userEvent.keyboard("{Escape}");
        expect(obtenerPanel()).toBeNull();

        await reabrirModal();
        expect(screen.getByLabelText("Título de la muestra")).toHaveValue("");
        expect(screen.getByLabelText("Fuente")).toHaveValue("");
        expect(screen.getByLabelText("Tipo de visualización")).toHaveValue("");
      });

      it("cerrar con clic fuera descarta el borrador: la próxima apertura está vacía", async () => {
        await abrirModalEn();
        await rellenarBorrador({ titulo: "Se descarta", fuente: "gastos", tipo: "mapa_calor" });
        await userEvent.click(obtenerOverlay());
        expect(obtenerPanel()).toBeNull();

        await reabrirModal();
        expect(screen.getByLabelText("Título de la muestra")).toHaveValue("");
        expect(screen.getByLabelText("Fuente")).toHaveValue("");
        expect(screen.getByLabelText("Tipo de visualización")).toHaveValue("");
      });

      it("deslizar hacia abajo en móvil descarta el borrador: la próxima apertura está vacía", async () => {
        activarMovil();
        await abrirModalEn();
        await rellenarBorrador({ titulo: "Se descarta", fuente: "bolsillos", tipo: "grafica" });

        const panel = screen.getByRole("dialog");
        dispararPuntero(panel, "pointerdown", { clientY: 0 });
        dispararPuntero(panel, "pointermove", { clientY: 160 });
        dispararPuntero(panel, "pointerup", { clientY: 160 });
        await waitFor(() => expect(obtenerPanel()).toBeNull());

        await reabrirModal();
        expect(screen.getByLabelText("Título de la muestra")).toHaveValue("");
        expect(screen.getByLabelText("Fuente")).toHaveValue("");
        expect(screen.getByLabelText("Tipo de visualización")).toHaveValue("");
      });

      it("cerrar sin guardar no altera las muestras ya añadidas", async () => {
        await abrirModalEn();
        await rellenarBorrador({ titulo: "Guardada antes", fuente: "bolsillos", tipo: "tarjeta" });
        await userEvent.click(obtenerBotonGuardar());
        await waitFor(() => expect(obtenerPanel()).toBeNull());

        // Borrador que se descarta con Esc; la lista no debe cambiar.
        await reabrirModal();
        await rellenarBorrador({ titulo: "Borrador perdido", fuente: "tarjetas", tipo: "grafica" });
        await userEvent.keyboard("{Escape}");
        expect(obtenerPanel()).toBeNull();

        // La próxima apertura está vacía y el borrador descartado no se añadió.
        await reabrirModal();
        expect(screen.getByLabelText("Título de la muestra")).toHaveValue("");
        await rellenarBorrador({ titulo: "Borrador perdido", fuente: "tarjetas", tipo: "grafica" });
        await userEvent.click(obtenerBotonGuardar());
        await waitFor(() => expect(obtenerPanel()).toBeNull());

        // La muestra guardada antes del cierre queda intacta (sigue detectándose).
        await reabrirModal();
        await rellenarBorrador({ titulo: "Guardada antes", fuente: "bolsillos", tipo: "tarjeta" });
        await userEvent.click(obtenerBotonGuardar());
        expect(obtenerPanel()).not.toBeNull();
      });
    });
  });
});

describe("PaginaDashboardInicio (T5 — persistencia en backend)", () => {
  it("carga las muestras del usuario desde el servicio", async () => {
    muestraMocks.listarMuestras.mockResolvedValue([
      { id: "muestra-guardada", titulo: "Ahorros guardados", fuente: "bolsillos", tipo: "tarjeta" },
    ]);
    renderPagina();

    expect(await screen.findByRole("heading", { name: "Ahorros guardados" })).toBeInTheDocument();
    expect(muestraMocks.listarMuestras).toHaveBeenCalledTimes(1);
  });

  it("persiste una muestra nueva mediante el servicio del backend", async () => {
    renderPagina();
    await userEvent.click(screen.getByRole("button", { name: "crear muestra" }));
    await userEvent.type(screen.getByLabelText("Título de la muestra"), "Ingresos nuevos");
    await userEvent.selectOptions(screen.getByLabelText("Fuente"), "ingresos");
    await userEvent.selectOptions(screen.getByLabelText("Tipo de visualización"), "tarjeta");
    await userEvent.click(screen.getByRole("button", { name: "guardar muestra" }));

    expect(await screen.findByRole("heading", { name: "Ingresos nuevos" })).toBeInTheDocument();
    expect(muestraMocks.crearMuestra).toHaveBeenCalledWith({
      titulo: "Ingresos nuevos", fuente: "ingresos", tipo: "tarjeta", segmentoContable: "todos",
    });
  });

  it("no envía al backend una muestra incompleta", async () => {
    renderPagina();
    await userEvent.click(screen.getByRole("button", { name: "crear muestra" }));
    await userEvent.click(screen.getByRole("button", { name: "guardar muestra" }));

    expect(muestraMocks.crearMuestra).not.toHaveBeenCalled();
    expect(obtenerPanel()).not.toBeNull();
  });

  it("muestra un error si el backend rechaza el guardado y mantiene el formulario", async () => {
    muestraMocks.crearMuestra.mockRejectedValueOnce(new Error("No se pudo guardar la muestra."));
    renderPagina();
    await userEvent.click(screen.getByRole("button", { name: "crear muestra" }));
    await userEvent.type(screen.getByLabelText("Título de la muestra"), "Pendiente");
    await userEvent.selectOptions(screen.getByLabelText("Fuente"), "bolsillos");
    await userEvent.selectOptions(screen.getByLabelText("Tipo de visualización"), "tarjeta");
    await userEvent.click(screen.getByRole("button", { name: "guardar muestra" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("No se pudo guardar la muestra.");
    expect(obtenerPanel()).not.toBeNull();
  });
});
describe("PaginaDashboardInicio (T6 — renderizado de muestras por tipo)", () => {
  beforeEach(() => {
    window.localStorage.getItem.mockReset();
    window.localStorage.setItem.mockClear();
  });

  afterEach(() => {
    window.localStorage.getItem.mockReset();
  });

  /** Crea una muestra desde el flujo normal de la UI y espera el cierre del modal. */
  const crearMuestra = async ({ titulo, fuente, tipo }) => {
    await userEvent.click(screen.getByRole("button", { name: "crear muestra" }));
    await userEvent.type(screen.getByLabelText("Título de la muestra"), titulo);
    await userEvent.selectOptions(screen.getByLabelText("Fuente"), fuente);
    await userEvent.selectOptions(screen.getByLabelText("Tipo de visualización"), tipo);
    await userEvent.click(screen.getByRole("button", { name: "guardar muestra" }));
    await waitFor(() => expect(obtenerPanel()).toBeNull());
  };

  describe("tarjeta (AC-12, AC-31)", () => {
    it("muestra el título de la muestra y el valor demo de su fuente en formato es-MX", async () => {
      renderPagina();
      await crearMuestra({ titulo: "Ahorros del mes", fuente: "bolsillos", tipo: "tarjeta" });

      expect(screen.getByRole("heading", { name: "Ahorros del mes" })).toBeInTheDocument();
      expect(screen.getAllByText("$2,300.00").length).toBeGreaterThan(0);
    });

    it("cada fuente demo presenta su valor fijo formateado con es-MX y 2 decimales (AC-31)", async () => {
      renderPagina();
      await crearMuestra({ titulo: "Ahorros del mes", fuente: "bolsillos", tipo: "tarjeta" });
      await crearMuestra({ titulo: "Movimientos del mes", fuente: "contabilidad", tipo: "tarjeta" });
      await crearMuestra({ titulo: "Sueldos del mes", fuente: "ingresos", tipo: "tarjeta" });
      await crearMuestra({ titulo: "Gastos fijos del mes", fuente: "gastos", tipo: "tarjeta" });
      await crearMuestra({ titulo: "Uso de tarjeta", fuente: "tarjetas", tipo: "tarjeta" });

      expect(screen.getAllByText("$2,300.00").length).toBeGreaterThan(0);
      expect(screen.getByText("$5,800.00")).toBeInTheDocument();
      expect(screen.getAllByText("$4,250.00").length).toBeGreaterThan(0);
      expect(screen.getByText("$1,820.75")).toBeInTheDocument();
      expect(screen.getByText("$890.40")).toBeInTheDocument();
    });
  });

  describe("gráfica (AC-13)", () => {
    it("renderiza 5 barras con la serie fija y etiquetas mínimas, sin librerías", async () => {
      renderPagina();
      await crearMuestra({ titulo: "Rendimiento semanal", fuente: "bolsillos", tipo: "grafica" });

      const grafica = screen.getByRole("img", { name: "Gráfica de demostración con serie fija" });
      const barras = within(grafica).getAllByTestId("barra-grafica");
      expect(barras).toHaveLength(5);
      // Serie fija: la representación no depende de datos dinámicos.
      expect(barras.map((barra) => barra.style.height)).toEqual([
        "35%",
        "60%",
        "45%",
        "85%",
        "55%",
      ]);
      // Etiquetas mínimas simuladas (días de la semana) en el orden de la serie.
      expect(
        within(grafica)
          .getAllByText(/^[LMXJV]$/)
          .map((etiqueta) => etiqueta.textContent)
      ).toEqual(["L", "M", "X", "J", "V"]);
    });
  });

  describe("métrica (AC-14)", () => {
    it("muestra el valor destacado de la fuente con la variación demostrativa «+12.4 %»", async () => {
      renderPagina();
      await crearMuestra({ titulo: "Ingresos del mes", fuente: "ingresos", tipo: "metrica" });

      expect(screen.getAllByText("$4,250.00").length).toBeGreaterThan(0);
      expect(screen.getByText("+12.4 %")).toBeInTheDocument();
    });
  });

  describe("mapa de calor (AC-15)", () => {
    it("renderiza la cuadrícula 7 × 5 con intensidades simuladas en tokens", async () => {
      renderPagina();
      await crearMuestra({ titulo: "Actividad por franjas", fuente: "contabilidad", tipo: "mapa_calor" });

      const mapa = screen.getByRole("img", {
        name: "Mapa de calor de demostración (7 días × 5 franjas)",
      });
      const celdas = within(mapa).getAllByTestId("celda-mapa-calor");
      expect(celdas).toHaveLength(35); // 7 días × 5 franjas
      expect(mapa.classList.contains("grid-cols-5")).toBe(true); // 5 franjas por fila
      const clasesIntensidad = new Set(
        celdas.map((celda) => /bg-emerald-primary\/\d+/.exec(celda.className)?.[0])
      );
      expect(clasesIntensidad.size).toBeGreaterThan(1);
    });
  });

  describe("acumuladas y orden de creación (AC-9, AC-10)", () => {
    it("las muestras coexisten y cada nueva se añade al final, sin reemplazo", async () => {
      renderPagina();
      await crearMuestra({ titulo: "Primera muestra", fuente: "bolsillos", tipo: "tarjeta" });
      await crearMuestra({ titulo: "Segunda muestra", fuente: "gastos", tipo: "grafica" });
      await crearMuestra({ titulo: "Tercera muestra", fuente: "tarjetas", tipo: "metrica" });

      // Todas permanecen visibles (AC-9).
      expect(screen.getByRole("heading", { name: "Primera muestra" })).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "Segunda muestra" })).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "Tercera muestra" })).toBeInTheDocument();

      // Orden de creación: el DOM respeta el orden en que se guardaron (AC-10).
      const lista = screen.getByTestId("lista-muestras");
      const titulos = [...lista.querySelectorAll("li h2")].map((titulo) => titulo.textContent);
      expect(titulos).toEqual(["Primera muestra", "Segunda muestra", "Tercera muestra"]);
    });
  });

  describe("render defensivo «Sin datos disponibles» (RF-14, AC-26)", () => {
    it("una muestra sin valor válido (fuente ausente en la tabla demo) renderiza el estado vacío", () => {
      // Prueba de unidad: no existe flujo de UI que produzca una muestra sin valor
      // (todas las fuentes demo tienen valor fijo), por lo que se monta el render
      // con una muestra restaurada con una fuente sin valor.
      muestraMocks.listarMuestras.mockResolvedValue([
        { id: "huerfana", titulo: "Fuente huérfana", fuente: "inexistente", tipo: "tarjeta" },
      ]);
      renderPagina();

      expect(await screen.findByText("Sin datos disponibles")).toBeInTheDocument();
      // La muestra sigue identificable por su título (la activación llega en T8).
      expect(screen.getByRole("heading", { name: "Fuente huérfana" })).toBeInTheDocument();
    });

    it("una muestra con un tipo no conocido renderiza el mismo estado vacío defensivo", () => {
      muestraMocks.listarMuestras.mockResolvedValue([
        { id: "raro", titulo: "Contenido raro", fuente: "bolsillos", tipo: "desconocido" },
      ]);
      renderPagina();

      expect(await screen.findByText("Sin datos disponibles")).toBeInTheDocument();
    });
  });
});

describe("PaginaDashboardInicio (T7 — superficie mixta y rejilla responsiva)", () => {
  beforeEach(() => {
    window.localStorage.getItem.mockReset();
    window.localStorage.setItem.mockClear();
  });

  afterEach(() => {
    window.localStorage.getItem.mockReset();
  });

  const crearMuestras = async (cantidad = 5) => {
    for (let i = 1; i <= cantidad; i++) {
      await userEvent.click(screen.getByRole("button", { name: "crear muestra" }));
      await userEvent.type(screen.getByLabelText("Título de la muestra"), `Muestra ${i}`);
      await userEvent.selectOptions(screen.getByLabelText("Fuente"), "bolsillos");
      await userEvent.selectOptions(screen.getByLabelText("Tipo de visualización"), "tarjeta");
      await userEvent.click(screen.getByRole("button", { name: "guardar muestra" }));
      await waitFor(() => expect(obtenerPanel()).toBeNull());
    }
  };

  it("las 3 primeras muestras usan glass-surface y el resto superficie sólida (AC-33)", async () => {
    renderPagina();
    await crearMuestras(5);

    const items = screen.getByTestId("lista-muestras").querySelectorAll("li");
    expect(items).toHaveLength(5);

    // Las 3 primeras son translúcidas.
    for (let i = 0; i < 3; i++) {
      expect(items[i]).toHaveClass("glass-surface");
    }

    // Las restantes son sólidas (sin glass-surface).
    for (let i = 3; i < 5; i++) {
      expect(items[i]).not.toHaveClass("glass-surface");
      expect(items[i]).toHaveClass("border-border-line/20");
      expect(items[i]).toHaveClass("bg-bg-cream/90");
    }
  });

  it("el contenedor de muestras usa rejilla responsiva con columnas desde sm: (AC-34)", () => {
    renderPagina();

    const lista = screen.getByTestId("lista-muestras");
    expect(lista.classList.contains("grid")).toBe(true);
    expect(lista.classList.contains("gap-4")).toBe(true);
    expect(lista.classList.contains("sm:grid-cols-2")).toBe(true);
    expect(lista.classList.contains("lg:grid-cols-3")).toBe(true);
  });
});

describe("PaginaDashboardInicio (T8 — muestras clicables y redirección por fuente)", () => {
  let navigateRef;

  const TestWrapper = ({ children }) => {
    const navigate = useNavigate(); // vi.fn() mockeado arriba
    navigateRef = navigate;
    return <>{children}</>;
  };

  const renderConNavegacion = () =>
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <TestWrapper>
          <PaginaDashboardInicio />
        </TestWrapper>
      </MemoryRouter>
    );

  const obtenerPanelDetalle = () =>
    document.body.querySelector("#modal-detalle-muestra-panel");

  beforeEach(() => {
    window.localStorage.getItem.mockReset();
    window.localStorage.setItem.mockClear();
    navigateRef = null;
  });

  afterEach(() => {
    window.localStorage.getItem.mockReset();
    navigateRef = null;
  });

  /** Crea una muestra desde la UI y espera el cierre del modal de creación. */
  const crearMuestra = async ({ titulo, fuente, tipo }) => {
    await userEvent.click(screen.getByRole("button", { name: "crear muestra" }));
    await userEvent.type(screen.getByLabelText("Título de la muestra"), titulo);
    await userEvent.selectOptions(screen.getByLabelText("Fuente"), fuente);
    await userEvent.selectOptions(screen.getByLabelText("Tipo de visualización"), tipo);
    await userEvent.click(screen.getByRole("button", { name: "guardar muestra" }));
    await waitFor(() => expect(obtenerPanel()).toBeNull());
  };

  /** Abre el modal de detalle de la muestra creada y hace clic en "Ir a la fuente". */
  const abrirDetalleYIrAFuente = async () => {
    const heading = screen.getByRole("heading", { name: "Muestra prueba" });
    const button = heading.closest("button");
    await userEvent.click(button);

    await waitFor(() => expect(obtenerPanelDetalle()).toBeTruthy());

    const botonIrAFuente = screen.getByRole("button", { name: "Ir a la fuente" });
    await userEvent.click(botonIrAFuente);
  };

  it("activar una muestra Bolsillos navega a /dashboard/bolsillos (AC-21)", async () => {
    renderConNavegacion();
    await crearMuestra({ titulo: "Muestra prueba", fuente: "bolsillos", tipo: "tarjeta" });
    await abrirDetalleYIrAFuente();
    expect(navigateRef).toHaveBeenCalledWith("/dashboard/bolsillos");
  });

  it("activar una muestra Contabilidad navega a /dashboard/contabilidad (AC-22)", async () => {
    renderConNavegacion();
    await crearMuestra({ titulo: "Muestra prueba", fuente: "contabilidad", tipo: "tarjeta" });
    await abrirDetalleYIrAFuente();
    expect(navigateRef).toHaveBeenCalledWith("/dashboard/contabilidad");
  });

  it("activar una muestra Ingresos navega a /dashboard/contabilidad (AC-22)", async () => {
    renderConNavegacion();
    await crearMuestra({ titulo: "Muestra prueba", fuente: "ingresos", tipo: "tarjeta" });
    await abrirDetalleYIrAFuente();
    expect(navigateRef).toHaveBeenCalledWith("/dashboard/contabilidad");
  });

  it("activar una muestra Gastos navega a /dashboard/contabilidad (AC-22)", async () => {
    renderConNavegacion();
    await crearMuestra({ titulo: "Muestra prueba", fuente: "gastos", tipo: "tarjeta" });
    await abrirDetalleYIrAFuente();
    expect(navigateRef).toHaveBeenCalledWith("/dashboard/contabilidad");
  });

  it("activar una muestra Tarjetas navega a /dashboard/tarjetas (AC-23)", async () => {
    renderConNavegacion();
    await crearMuestra({ titulo: "Muestra prueba", fuente: "tarjetas", tipo: "tarjeta" });
    await abrirDetalleYIrAFuente();
    expect(navigateRef).toHaveBeenCalledWith("/dashboard/tarjetas");
  });

  it("activar por teclado (Enter) en «Ir a la fuente» navega al destino (AC-24)", async () => {
    renderConNavegacion();
    await crearMuestra({ titulo: "Muestra teclado", fuente: "tarjetas", tipo: "tarjeta" });

    const heading = screen.getByRole("heading", { name: "Muestra teclado" });
    const button = heading.closest("button");
    await userEvent.click(button);

    await waitFor(() => expect(obtenerPanelDetalle()).toBeTruthy());

    const botonIrAFuente = screen.getByRole("button", { name: "Ir a la fuente" });
    await userEvent.keyboard("{Enter}");

    expect(navigateRef).toHaveBeenCalledWith("/dashboard/tarjetas");
  });

  it("activar por teclado (Espacio) en «Ir a la fuente» navega al destino (AC-24)", async () => {
    renderConNavegacion();
    await crearMuestra({ titulo: "Muestra espacio", fuente: "ingresos", tipo: "metrica" });

    const heading = screen.getByRole("heading", { name: "Muestra espacio" });
    const button = heading.closest("button");
    await userEvent.click(button);

    await waitFor(() => expect(obtenerPanelDetalle()).toBeTruthy());

    const botonIrAFuente = screen.getByRole("button", { name: "Ir a la fuente" });
    await userEvent.keyboard(" ");

    expect(navigateRef).toHaveBeenCalledWith("/dashboard/contabilidad");
  });
});
