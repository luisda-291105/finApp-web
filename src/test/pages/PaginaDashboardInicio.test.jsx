import { cleanup, render, screen, waitFor, act, fireEvent, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useNavigate } from "react-router-dom";
import { InicioPage as PaginaDashboardInicio } from "../../features/inicio";

const muestraMocks = vi.hoisted(() => ({
  listarMuestras: vi.fn(),
  crearMuestra: vi.fn(),
  actualizarMuestra: vi.fn(),
  actualizarOrdenMuestras: vi.fn(),
  eliminarMuestra: vi.fn(),
  obtenerDatosMuestra: vi.fn(),
  listarCuentasGmail: vi.fn(),
}));

vi.mock("../../context/UsuarioActivoContext", () => ({
  useUsuarioActivo: () => ({ usuario: { idUsuario: "usuario-prueba" } }),
}));

vi.mock("../../features/inicio/services/muestrasService", () => muestraMocks);
vi.mock("../../features/inicio/services/datosMuestrasService", () => ({
  obtenerDatosMuestra: muestraMocks.obtenerDatosMuestra,
}));
vi.mock("../../services/gmailServicio", async (importOriginal) => ({
  ...(await importOriginal()),
  listarCuentasGmail: muestraMocks.listarCuentasGmail,
}));

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
  muestraMocks.actualizarOrdenMuestras.mockReset().mockResolvedValue(undefined);
  muestraMocks.eliminarMuestra.mockReset().mockResolvedValue(undefined);
  muestraMocks.listarCuentasGmail.mockReset().mockResolvedValue([
    { id: "cuenta-1", email: "personal@example.test" },
    { id: "cuenta-2", email: "trabajo@example.test" },
  ]);
  muestraMocks.obtenerDatosMuestra.mockReset().mockImplementation(async (fuente, _usuario, _segmento, cuentaCorreo = "todas", fuentes = [], cuentasCorreo = null) => {
    const datosPorFuente = {
      suscripciones: { valor: 3, serie: [{ etiqueta: "Netflix", valor: 2, altura: 100 }], unidad: "cantidad" },
      contabilidad: { valor: 3473000, variacion: "+12.4 %", serie: [{ etiqueta: "oct", valor: 3473000, altura: 100 }], intensidades: [[1]], unidad: "moneda" },
      correo: { valor: 5, serie: [{ etiqueta: "ana@example.test", valor: 5, altura: 100 }], unidad: "cantidad" },
      contactos: {
        valor: 4,
        serie: [{ etiqueta: "Contactos", valor: 4, altura: 100 }],
        detalles: [{ etiqueta: "Grupos identificados", valor: "2" }],
        unidad: "cantidad",
      },
    };
    const crearDatosFuente = (fuenteItem) => ({
      fuente: fuenteItem,
      etiqueta: etiquetasFuentes[fuenteItem],
      ...datosPorFuente[fuenteItem],
      ...(fuenteItem === "correo" ? { cuentaCorreoEtiqueta: cuentasCorreo?.length > 1 ? "personal@example.test, trabajo@example.test" : cuentaCorreo === "todas" ? "Todas las cuentas" : cuentaCorreo === "cuenta-1" ? "personal@example.test" : "trabajo@example.test" } : {}),
    });
    return fuentes.length > 1
      ? {
        fuentesDatos: fuentes.map(crearDatosFuente),
        cuentaCorreoEtiqueta: fuentes.includes("correo") ? (cuentasCorreo?.length > 1 ? "personal@example.test, trabajo@example.test" : cuentaCorreo === "todas" ? "Todas las cuentas" : "personal@example.test") : undefined,
      }
      : crearDatosFuente(fuente);
  });
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

const etiquetasFuentes = {
  suscripciones: "Suscripciones",
  contabilidad: "Contabilidad",
  correo: "Correo",
  contactos: "Contactos",
};

const seleccionarFuente = async (fuente) => {
  const opcion = screen.getByRole("checkbox", { name: etiquetasFuentes[fuente] });
  if (!opcion.checked) await userEvent.click(opcion);
};

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
      expect(screen.getByRole("group", { name: "Fuentes de la muestra" })).toBeInTheDocument();
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

    it("las fuentes empiezan sin seleccionar", async () => {
      await abrirModal();
      Object.values(etiquetasFuentes).forEach((etiqueta) => {
        expect(screen.getByRole("checkbox", { name: etiqueta })).not.toBeChecked();
      });
    });

    it("ofrece los módulos disponibles como selección múltiple", async () => {
      await abrirModal();
      expect(screen.getByRole("group", { name: "Fuentes de la muestra" })).toHaveTextContent(
        "SuscripcionesContabilidadCorreoContactos"
      );
    });

    it("permite elegir el ancho de la tarjeta en la cuadrícula", async () => {
      await abrirModal();

      const ancho = screen.getByLabelText("Ancho de la tarjeta en el dashboard");
      expect([...ancho.options].map((opcion) => opcion.textContent)).toEqual([
        "1 espacio (normal)",
        "2 espacios laterales",
        "3 espacios (ancho completo)",
      ]);
      await userEvent.selectOptions(ancho, "2");
      expect(ancho).toHaveValue("2");
    });

    it("permite seleccionar varias fuentes simultáneamente", async () => {
      await abrirModal();
      await seleccionarFuente("contactos");
      await seleccionarFuente("correo");

      expect(screen.getByRole("checkbox", { name: "Contactos" })).toBeChecked();
      expect(screen.getByRole("checkbox", { name: "Correo" })).toBeChecked();
    });

    it("permite elegir todas las cuentas o varias cuentas específicas", async () => {
      await abrirModal();
      await seleccionarFuente("correo");

      const todas = await screen.findByRole("checkbox", { name: "Todos los correos" });
      const personal = screen.getByRole("checkbox", { name: "personal@example.test" });
      const trabajo = screen.getByRole("checkbox", { name: "trabajo@example.test" });
      expect(todas).toBeChecked();
      expect(personal).toBeChecked();
      expect(trabajo).toBeChecked();

      await userEvent.click(trabajo);
      expect(todas).not.toBeChecked();
      expect(personal).toBeChecked();
      expect(trabajo).not.toBeChecked();
      await userEvent.click(trabajo);
      expect(personal).toBeChecked();
      expect(trabajo).toBeChecked();
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
      await seleccionarFuente("correo");
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
      if (fuente !== undefined) await seleccionarFuente(fuente);
      if (tipo !== undefined) {
        await userEvent.selectOptions(screen.getByLabelText("Tipo de visualización"), tipo);
      }
    };

    const obtenerBotonGuardar = () => screen.getByRole("button", { name: "guardar muestra" });

    describe("guardado válido (AC-8, AC-11)", () => {
      it("añade la muestra, cierra el modal y restablece los campos a los placeholders", async () => {
        await abrirModalEn();
        await rellenarBorrador({ titulo: "Ahorros del mes", fuente: "contactos", tipo: "tarjeta" });
        await userEvent.click(obtenerBotonGuardar());

        await waitFor(() => {
          expect(obtenerPanel()).toBeNull();
          expect(obtenerOverlay()).toBeNull();
        });

        // La próxima apertura muestra el formulario vacío (AC-11).
        await reabrirModal();
        expect(screen.getByLabelText("Título de la muestra")).toHaveValue("");
        expect(screen.getByRole("checkbox", { name: "Contactos" })).not.toBeChecked();
        expect(screen.getByLabelText("Tipo de visualización")).toHaveValue("");
      });

      it("la muestra añadida queda en la lista y los guardados anteriores permanecen intactos", async () => {
        await abrirModalEn();
        await rellenarBorrador({ titulo: "Primera", fuente: "contactos", tipo: "tarjeta" });
        await userEvent.click(obtenerBotonGuardar());
        await waitFor(() => expect(obtenerPanel()).toBeNull());

        // Segunda muestra distinta, acumulada sin reemplazar la primera.
        await reabrirModal();
        await rellenarBorrador({ titulo: "Segunda", fuente: "contabilidad", tipo: "grafica" });
        await userEvent.click(obtenerBotonGuardar());
        await waitFor(() => expect(obtenerPanel()).toBeNull());

        // El triple de la primera sigue presente: el reintento choca con duplicado.
        await reabrirModal();
        await rellenarBorrador({ titulo: "Primera", fuente: "contactos", tipo: "tarjeta" });
        await userEvent.click(obtenerBotonGuardar());
        expect(obtenerPanel()).not.toBeNull();
      });

      it("guardar un duplicado con el título normalizado con trim no añade ni cierra (AC-17)", async () => {
        await abrirModalEn();
        await rellenarBorrador({ titulo: "  Gastos fijos  ", fuente: "contabilidad", tipo: "metrica" });
        await userEvent.click(obtenerBotonGuardar());
        await waitFor(() => expect(obtenerPanel()).toBeNull());

        await reabrirModal();
        await rellenarBorrador({ titulo: "Gastos fijos", fuente: "contabilidad", tipo: "metrica" });
        await userEvent.click(obtenerBotonGuardar());
        expect(obtenerPanel()).not.toBeNull();
      });
    });

    describe("formulario incompleto (AC-16)", () => {
      it("guardar sin título no añade, mantiene el modal abierto y sin mensajes", async () => {
        await abrirModalEn();
        await rellenarBorrador({ fuente: "contactos", tipo: "tarjeta" });
        await userEvent.click(obtenerBotonGuardar());

        expect(obtenerPanel()).not.toBeNull();
        expect(obtenerOverlay()).not.toBeNull();
        expect(screen.queryByRole("alert")).toBeNull();
        const panel = screen.getByRole("dialog");
        expect(panel.textContent.toLowerCase()).not.toContain("error");
        expect(panel.textContent.toLowerCase()).not.toContain("incompleto");
        // El borrador se conserva para permitir corregir y reintentar.
        expect(screen.getByRole("checkbox", { name: "Contactos" })).toBeChecked();
        expect(screen.getByLabelText("Tipo de visualización")).toHaveValue("tarjeta");
      });

      it("guardar con un título de solo espacios es formulario incompleto", async () => {
        await abrirModalEn();
        await rellenarBorrador({ titulo: "   ", fuente: "correo", tipo: "metrica" });
        await userEvent.click(obtenerBotonGuardar());

        expect(obtenerPanel()).not.toBeNull();
        expect(screen.getByLabelText("Título de la muestra")).toHaveValue("   ");
      });

      it("guardar con la fuente en su placeholder no añade y mantiene el modal abierto", async () => {
        await abrirModalEn();
        await rellenarBorrador({ titulo: "Sin fuente", tipo: "metrica" });
        await userEvent.click(obtenerBotonGuardar());

        expect(obtenerPanel()).not.toBeNull();
        expect(screen.getByRole("checkbox", { name: "Contabilidad" })).not.toBeChecked();
      });

      it("guardar con el tipo en su placeholder no añade y mantiene el modal abierto", async () => {
        await abrirModalEn();
        await rellenarBorrador({ titulo: "Sin tipo", fuente: "contabilidad" });
        await userEvent.click(obtenerBotonGuardar());

        expect(obtenerPanel()).not.toBeNull();
        expect(screen.getByLabelText("Tipo de visualización")).toHaveValue("");
      });
    });

    describe("muestra duplicada (AC-17)", () => {
      it("guardar un triple ya existente no añade ni cierra, y modificar el título permite reintentar", async () => {
        await abrirModalEn();
        await rellenarBorrador({ titulo: "Presupuesto", fuente: "contactos", tipo: "tarjeta" });
        await userEvent.click(obtenerBotonGuardar());
        await waitFor(() => expect(obtenerPanel()).toBeNull());

        // Triple idéntico: duplicado, el modal permanece abierto sin mensajes.
        await reabrirModal();
        await rellenarBorrador({ titulo: "Presupuesto", fuente: "contactos", tipo: "tarjeta" });
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
        await rellenarBorrador({ titulo: "Se descarta", fuente: "contabilidad", tipo: "grafica" });
        await userEvent.click(screen.getByRole("button", { name: "Cerrar creación de muestra" }));
        expect(obtenerPanel()).toBeNull();

        await reabrirModal();
        expect(screen.getByLabelText("Título de la muestra")).toHaveValue("");
        expect(screen.getByRole("checkbox", { name: "Contabilidad" })).not.toBeChecked();
        expect(screen.getByLabelText("Tipo de visualización")).toHaveValue("");
      });

      it("cerrar con Esc descarta el borrador: la próxima apertura está vacía", async () => {
        await abrirModalEn();
        await rellenarBorrador({ titulo: "Se descarta", fuente: "correo", tipo: "metrica" });
        await userEvent.keyboard("{Escape}");
        expect(obtenerPanel()).toBeNull();

        await reabrirModal();
        expect(screen.getByLabelText("Título de la muestra")).toHaveValue("");
        expect(screen.getByRole("checkbox", { name: "Contabilidad" })).not.toBeChecked();
        expect(screen.getByLabelText("Tipo de visualización")).toHaveValue("");
      });

      it("cerrar con clic fuera descarta el borrador: la próxima apertura está vacía", async () => {
        await abrirModalEn();
        await rellenarBorrador({ titulo: "Se descarta", fuente: "contabilidad", tipo: "mapa_calor" });
        await userEvent.click(obtenerOverlay());
        expect(obtenerPanel()).toBeNull();

        await reabrirModal();
        expect(screen.getByLabelText("Título de la muestra")).toHaveValue("");
        expect(screen.getByRole("checkbox", { name: "Correo" })).not.toBeChecked();
        expect(screen.getByLabelText("Tipo de visualización")).toHaveValue("");
      });

      it("deslizar hacia abajo en móvil descarta el borrador: la próxima apertura está vacía", async () => {
        activarMovil();
        await abrirModalEn();
        await rellenarBorrador({ titulo: "Se descarta", fuente: "contactos", tipo: "grafica" });

        const panel = screen.getByRole("dialog");
        dispararPuntero(panel, "pointerdown", { clientY: 0 });
        dispararPuntero(panel, "pointermove", { clientY: 160 });
        dispararPuntero(panel, "pointerup", { clientY: 160 });
        await waitFor(() => expect(obtenerPanel()).toBeNull());

        await reabrirModal();
        expect(screen.getByLabelText("Título de la muestra")).toHaveValue("");
        expect(screen.getByRole("checkbox", { name: "Contabilidad" })).not.toBeChecked();
        expect(screen.getByLabelText("Tipo de visualización")).toHaveValue("");
      });

      it("cerrar sin guardar no altera las muestras ya añadidas", async () => {
        await abrirModalEn();
        await rellenarBorrador({ titulo: "Guardada antes", fuente: "contactos", tipo: "tarjeta" });
        await userEvent.click(obtenerBotonGuardar());
        await waitFor(() => expect(obtenerPanel()).toBeNull());

        // Borrador que se descarta con Esc; la lista no debe cambiar.
        await reabrirModal();
        await rellenarBorrador({ titulo: "Borrador perdido", fuente: "correo", tipo: "grafica" });
        await userEvent.keyboard("{Escape}");
        expect(obtenerPanel()).toBeNull();

        // La próxima apertura está vacía y el borrador descartado no se añadió.
        await reabrirModal();
        expect(screen.getByLabelText("Título de la muestra")).toHaveValue("");
        await rellenarBorrador({ titulo: "Borrador perdido", fuente: "correo", tipo: "grafica" });
        await userEvent.click(obtenerBotonGuardar());
        await waitFor(() => expect(obtenerPanel()).toBeNull());

        // La muestra guardada antes del cierre queda intacta (sigue detectándose).
        await reabrirModal();
        await rellenarBorrador({ titulo: "Guardada antes", fuente: "contactos", tipo: "tarjeta" });
        await userEvent.click(obtenerBotonGuardar());
        expect(obtenerPanel()).not.toBeNull();
      });
    });
  });
});

describe("PaginaDashboardInicio (T5 — persistencia en backend)", () => {
  it("carga las muestras del usuario desde el servicio", async () => {
    muestraMocks.listarMuestras.mockResolvedValue([
      { id: "muestra-guardada", titulo: "Ahorros guardados", fuente: "contactos", tipo: "tarjeta" },
    ]);
    renderPagina();

    expect(await screen.findByRole("heading", { name: "Ahorros guardados" })).toBeInTheDocument();
    expect(muestraMocks.listarMuestras).toHaveBeenCalledTimes(1);
  });

  it("restaura el ancho guardado al editar una muestra", async () => {
    muestraMocks.listarMuestras.mockResolvedValue([
      { id: "muestra-ancha", titulo: "Fuentes anchas", fuente: "contactos", tipo: "tarjeta", columnasDashboard: 2 },
    ]);
    renderPagina();

    await userEvent.click(await screen.findByRole("button", { name: /Fuentes anchas/ }));
    await userEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Editar" }));

    expect(await screen.findByLabelText("Ancho de la tarjeta en el dashboard")).toHaveValue("2");
  });

  it("persiste una muestra nueva mediante el servicio del backend", async () => {
    renderPagina();
    await userEvent.click(screen.getByRole("button", { name: "crear muestra" }));
    await userEvent.type(screen.getByLabelText("Título de la muestra"), "Ingresos nuevos");
    await seleccionarFuente("contabilidad");
    await userEvent.selectOptions(screen.getByLabelText("Tipo de visualización"), "tarjeta");
    await userEvent.click(screen.getByRole("button", { name: "guardar muestra" }));

    expect(await screen.findByRole("heading", { name: "Ingresos nuevos" })).toBeInTheDocument();
    expect(muestraMocks.crearMuestra).toHaveBeenCalledWith({
      titulo: "Ingresos nuevos", fuente: "contabilidad", tipo: "tarjeta", segmentoContable: "todos", fuentes: ["contabilidad"],
      columnasDashboard: "1", ordenDashboard: 0,
    });
  });

  it("guarda una muestra de dos columnas y la expande lateralmente en el dashboard", async () => {
    renderPagina();
    await userEvent.click(screen.getByRole("button", { name: "crear muestra" }));
    await userEvent.type(screen.getByLabelText("Título de la muestra"), "Fuentes anchas");
    await seleccionarFuente("contabilidad");
    await seleccionarFuente("contactos");
    await userEvent.selectOptions(screen.getByLabelText("Tipo de visualización"), "tarjeta");
    await userEvent.selectOptions(screen.getByLabelText("Ancho de la tarjeta en el dashboard"), "2");
    await userEvent.click(screen.getByRole("button", { name: "guardar muestra" }));

    const tarjeta = await screen.findByRole("button", { name: /Fuentes anchas/ });
    expect(muestraMocks.crearMuestra).toHaveBeenCalledWith(expect.objectContaining({ columnasDashboard: "2" }));
    expect(tarjeta.parentElement).toHaveClass("sm:col-span-2", "lg:col-span-2");
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
    await seleccionarFuente("contactos");
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
  const crearMuestra = async ({ titulo, fuente, fuentes, tipo }) => {
    await userEvent.click(screen.getByRole("button", { name: "crear muestra" }));
    await userEvent.type(screen.getByLabelText("Título de la muestra"), titulo);
    for (const seleccionada of (fuentes || [fuente])) await seleccionarFuente(seleccionada);
    await userEvent.selectOptions(screen.getByLabelText("Tipo de visualización"), tipo);
    await userEvent.click(screen.getByRole("button", { name: "guardar muestra" }));
    await waitFor(() => expect(obtenerPanel()).toBeNull());
  };

  describe("tarjeta (AC-12, AC-31)", () => {
    it("muestra el título y el total actual de contactos de la fuente", async () => {
      renderPagina();
      await crearMuestra({ titulo: "Ahorros del mes", fuente: "contactos", tipo: "tarjeta" });

      expect(screen.getByRole("heading", { name: "Ahorros del mes" })).toBeInTheDocument();
      expect(muestraMocks.obtenerDatosMuestra).toHaveBeenCalledWith("contactos", "usuario-prueba", "todos", "todas");
      const tarjeta = screen.getByRole("button", { name: /Ahorros del mes/ });
      expect(await within(tarjeta).findByText("4")).toBeInTheDocument();
      expect(within(tarjeta).getByText("Grupos identificados")).toBeInTheDocument();
    });

    it("muestra valores actuales de suscripciones, contabilidad, correo y contactos", async () => {
      renderPagina();
      await crearMuestra({ titulo: "Suscripciones", fuente: "suscripciones", tipo: "tarjeta" });
      await crearMuestra({ titulo: "Contabilidad", fuente: "contabilidad", tipo: "tarjeta" });
      await crearMuestra({ titulo: "Correo", fuente: "correo", tipo: "tarjeta" });
      await crearMuestra({ titulo: "Contactos", fuente: "contactos", tipo: "tarjeta" });

      const valoresPorMuestra = [
        ["Suscripciones", "3"],
        ["Contabilidad", "$3.473.000"],
        ["Correo", "5"],
        ["Contactos", "4"],
      ];
      for (const [titulo, valor] of valoresPorMuestra) {
        const tarjeta = screen.getByRole("button", { name: new RegExp(titulo) });
        expect(within(tarjeta).getAllByText(valor)).toHaveLength(1);
      }
    });

    it("muestra cada fuente por separado en todos los tipos de visualización", async () => {
      renderPagina();
      const tipos = ["tarjeta", "grafica", "metrica", "mapa_calor"];
      for (const tipo of tipos) {
        const titulo = `Muestra conjunta ${tipo}`;
        await crearMuestra({
          titulo,
          fuentes: ["contabilidad", "contactos"],
          tipo,
        });

        const tarjeta = screen.getByRole("button", { name: new RegExp(titulo) });
        expect(within(tarjeta).getByRole("heading", { name: "Contabilidad" })).toBeInTheDocument();
        expect(within(tarjeta).getByRole("heading", { name: "Contactos" })).toBeInTheDocument();
        if (tipo === "tarjeta") {
          expect(within(tarjeta).getByText("$3.473.000")).toBeInTheDocument();
          expect(within(tarjeta).getByText("4")).toBeInTheDocument();
        }
        if (tipo === "grafica") {
          expect(within(tarjeta).getByRole("img", { name: /Gráfica de Contabilidad/ })).toBeInTheDocument();
          expect(within(tarjeta).getByRole("img", { name: /Gráfica de Contactos/ })).toBeInTheDocument();
        }
        if (tipo === "metrica") {
          expect(within(tarjeta).getByText("$3.473.000")).toBeInTheDocument();
          expect(within(tarjeta).getByText("4")).toBeInTheDocument();
        }
        if (tipo === "mapa_calor") {
          expect(within(tarjeta).getByRole("img", { name: "Mapa de actividad de los últimos 35 días" })).toBeInTheDocument();
          expect(within(tarjeta).getByText("Esta fuente no incluye fechas para construir un mapa de actividad.")).toBeInTheDocument();
        }
      }
      expect(muestraMocks.obtenerDatosMuestra).toHaveBeenCalledWith(
        "contabilidad", "usuario-prueba", "todos", "todas", ["contabilidad", "contactos"]
      );
    });
  });

  describe("gráfica (AC-13)", () => {
    it("representa la serie real devuelta para la fuente seleccionada", async () => {
      renderPagina();
      await crearMuestra({ titulo: "Rendimiento semanal", fuente: "contabilidad", tipo: "grafica" });

      const grafica = await screen.findByRole("img", { name: "Gráfica de Contabilidad basada en datos guardados" });
      const barras = within(grafica).getAllByTestId("barra-grafica");
      expect(barras).toHaveLength(1);
      expect(barras[0].querySelector("div").style.height).toBe("100%");
      expect(within(grafica).getByText("oct")).toBeInTheDocument();
    });

    it("consulta los mensajes de la cuenta elegida y guarda esa selección", async () => {
      renderPagina();
      await userEvent.click(screen.getByRole("button", { name: "crear muestra" }));
      await userEvent.type(screen.getByLabelText("Título de la muestra"), "Correo personal");
      await seleccionarFuente("correo");
      await userEvent.click(screen.getByRole("checkbox", { name: "trabajo@example.test" }));
      await userEvent.selectOptions(screen.getByLabelText("Tipo de visualización"), "tarjeta");
      await userEvent.click(screen.getByRole("button", { name: "guardar muestra" }));

      await waitFor(() => {
        expect(muestraMocks.crearMuestra).toHaveBeenCalledWith(expect.objectContaining({
          fuente: "correo",
          cuentaCorreo: "cuenta-1",
          cuentasCorreo: ["cuenta-1"],
        }));
        expect(muestraMocks.obtenerDatosMuestra).toHaveBeenCalledWith("correo", "usuario-prueba", "todos", "cuenta-1", [], ["cuenta-1"]);
      });
      const tarjeta = screen.getByRole("button", { name: /Correo personal/ });
      expect(within(tarjeta).getByText(/personal@example\.test/)).toBeInTheDocument();
    });
  });

  describe("métrica (AC-14)", () => {
    it("muestra el valor y la variación calculada desde la contabilidad", async () => {
      renderPagina();
      await crearMuestra({ titulo: "Balance", fuente: "contabilidad", tipo: "metrica" });

      const tarjeta = screen.getByRole("button", { name: /Balance/ });
      expect(await within(tarjeta).findByText("$3.473.000")).toBeInTheDocument();
      expect(screen.getByText("+12.4 %")).toBeInTheDocument();
    });
  });

  it("muestra la información una sola vez en la tarjeta y en el modal de detalle", async () => {
    renderPagina();
    await crearMuestra({ titulo: "Balance sin duplicados", fuente: "contabilidad", tipo: "metrica" });

    const tarjeta = screen.getByRole("button", { name: /Balance sin duplicados/ });
    expect(within(tarjeta).getAllByText("$3.473.000")).toHaveLength(1);
    expect(within(tarjeta).getAllByText("Fuente")).toHaveLength(1);

    await userEvent.click(tarjeta);
    const dialogo = await screen.findByRole("dialog");
    expect(within(dialogo).getByRole("heading", { name: "Balance sin duplicados" })).toBeInTheDocument();
    expect(within(dialogo).getAllByText("$3.473.000")).toHaveLength(1);
    expect(within(dialogo).getAllByText("Fuente")).toHaveLength(1);
    expect(within(dialogo).queryByText("Título")).not.toBeInTheDocument();
  });

  describe("mapa de calor (AC-15)", () => {
    it("renderiza la actividad real por fecha en el mapa de calor", async () => {
      renderPagina();
      await crearMuestra({ titulo: "Actividad por franjas", fuente: "contabilidad", tipo: "mapa_calor" });

      const mapa = screen.getByRole("img", {
        name: "Mapa de actividad de los últimos 35 días",
      });
      const celdas = within(mapa).getAllByTestId("celda-mapa-calor");
      expect(celdas).toHaveLength(1);
      expect(mapa.classList.contains("grid-cols-7")).toBe(true);
    });
  });

  describe("acumuladas y orden de creación (AC-9, AC-10)", () => {
    it("las muestras coexisten y cada nueva se añade al final, sin reemplazo", async () => {
      renderPagina();
      await crearMuestra({ titulo: "Primera muestra", fuente: "contactos", tipo: "tarjeta" });
      await crearMuestra({ titulo: "Segunda muestra", fuente: "contabilidad", tipo: "grafica" });
      await crearMuestra({ titulo: "Tercera muestra", fuente: "correo", tipo: "metrica" });

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
    it("una fuente no compatible renderiza el estado sin datos", async () => {
      muestraMocks.listarMuestras.mockResolvedValue([
        { id: "huerfana", titulo: "Fuente huérfana", fuente: "inexistente", tipo: "tarjeta" },
      ]);
      renderPagina();

      expect((await screen.findAllByText("Sin datos disponibles")).length).toBeGreaterThan(0);
      // La muestra sigue identificable por su título (la activación llega en T8).
      expect(screen.getByRole("heading", { name: "Fuente huérfana" })).toBeInTheDocument();
    });

    it("una muestra con un tipo no conocido renderiza el mismo estado vacío defensivo", async () => {
      muestraMocks.listarMuestras.mockResolvedValue([
        { id: "raro", titulo: "Contenido raro", fuente: "contactos", tipo: "desconocido" },
      ]);
      renderPagina();

      expect((await screen.findAllByText("Sin datos disponibles")).length).toBeGreaterThan(0);
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
      await seleccionarFuente("contactos");
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
    expect(lista.classList.contains("auto-rows-auto")).toBe(true);
    expect(lista.classList.contains("gap-4")).toBe(true);
    expect(lista.classList.contains("sm:auto-rows-fr")).toBe(true);
    expect(lista.classList.contains("sm:grid-cols-2")).toBe(true);
    expect(lista.classList.contains("lg:grid-cols-3")).toBe(true);
  });

  it("permite mover tarjetas con controles accesibles y guarda el orden", async () => {
    muestraMocks.listarMuestras.mockResolvedValue([
      { id: "1", titulo: "Primera", fuente: "contactos", tipo: "tarjeta" },
      { id: "2", titulo: "Segunda", fuente: "contactos", tipo: "tarjeta" },
    ]);
    renderPagina();

    const grupoReordenamiento = await screen.findByRole("group", { name: "Cambiar posición de Segunda" });
    await userEvent.click(within(grupoReordenamiento).getByRole("button", { name: "Mover antes" }));

    await waitFor(() => expect(muestraMocks.actualizarOrdenMuestras).toHaveBeenCalledWith([2, 1]));
    const titulos = [...screen.getByTestId("lista-muestras").querySelectorAll("li h2")].map((titulo) => titulo.textContent);
    expect(titulos).toEqual(["Segunda", "Primera"]);
  });

  it("permite arrastrar una tarjeta a otra posición de la cuadrícula", async () => {
    muestraMocks.listarMuestras.mockResolvedValue([
      { id: "1", titulo: "Primera", fuente: "contactos", tipo: "tarjeta" },
      { id: "2", titulo: "Segunda", fuente: "contactos", tipo: "tarjeta" },
    ]);
    renderPagina();
    const lista = screen.getByTestId("lista-muestras");
    const origen = await screen.findByText("Primera");
    const handle = origen.closest("li").querySelector('[draggable="true"]');
    const destino = lista.querySelector('[data-muestra-id="2"]');
    const dataTransfer = {
      effectAllowed: "",
      setData: vi.fn(),
      getData: vi.fn(() => "1"),
    };
    vi.spyOn(destino, "getBoundingClientRect").mockReturnValue({ top: 0, height: 100 });

    fireEvent.dragStart(handle, { dataTransfer });
    const dropEvent = new Event("drop", { bubbles: true, cancelable: true });
    Object.defineProperties(dropEvent, {
      dataTransfer: { value: dataTransfer },
      clientY: { value: 100 },
    });
    fireEvent(destino, dropEvent);

    await waitFor(() => expect(muestraMocks.actualizarOrdenMuestras).toHaveBeenCalledWith([2, 1]));
    const titulos = [...lista.querySelectorAll("li h2")].map((titulo) => titulo.textContent);
    expect(titulos).toEqual(["Segunda", "Primera"]);
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
    await seleccionarFuente(fuente);
    await userEvent.selectOptions(screen.getByLabelText("Tipo de visualización"), tipo);
    await userEvent.click(screen.getByRole("button", { name: "guardar muestra" }));
    await waitFor(() => expect(obtenerPanel()).toBeNull());
  };

  /** Abre el modal de detalle de la muestra creada y hace clic en "Ir a la fuente". */
  const abrirDetalleYIrAFuente = async () => {
    const heading = screen.getByRole("heading", { name: "Muestra prueba" });
    const button = heading.closest('[role="button"]');
    await userEvent.click(button);

    await waitFor(() => expect(obtenerPanelDetalle()).toBeTruthy());

    const botonIrAFuente = screen.getByRole("button", { name: "Ir a la fuente" });
    expect(screen.queryByRole("button", { name: "Nueva muestra" })).not.toBeInTheDocument();
    await userEvent.click(botonIrAFuente);
  };

  it("activar una muestra Suscripciones navega a su módulo (AC-21)", async () => {
    renderConNavegacion();
    await crearMuestra({ titulo: "Muestra prueba", fuente: "suscripciones", tipo: "tarjeta" });
    await abrirDetalleYIrAFuente();
    expect(navigateRef).toHaveBeenCalledWith("/dashboard/suscripciones");
  });

  it("activar una muestra Contabilidad navega a /dashboard/contabilidad (AC-22)", async () => {
    renderConNavegacion();
    await crearMuestra({ titulo: "Muestra prueba", fuente: "contabilidad", tipo: "tarjeta" });
    await abrirDetalleYIrAFuente();
    expect(navigateRef).toHaveBeenCalledWith("/dashboard/contabilidad");
  });

  it("activar una muestra Correo navega a su módulo (AC-23)", async () => {
    renderConNavegacion();
    await crearMuestra({ titulo: "Muestra prueba", fuente: "correo", tipo: "tarjeta" });
    await abrirDetalleYIrAFuente();
    expect(navigateRef).toHaveBeenCalledWith("/dashboard/correos");
  });

  it("activar una muestra Contactos navega a su módulo (AC-24)", async () => {
    renderConNavegacion();
    await crearMuestra({ titulo: "Muestra prueba", fuente: "contactos", tipo: "tarjeta" });
    await abrirDetalleYIrAFuente();
    expect(navigateRef).toHaveBeenCalledWith("/dashboard/contactos");
  });

  it("activar por teclado (Enter) en «Ir a la fuente» navega al destino (AC-24)", async () => {
    renderConNavegacion();
    await crearMuestra({ titulo: "Muestra teclado", fuente: "correo", tipo: "tarjeta" });

    const heading = screen.getByRole("heading", { name: "Muestra teclado" });
    const button = heading.closest('[role="button"]');
    await userEvent.click(button);

    await waitFor(() => expect(obtenerPanelDetalle()).toBeTruthy());

    const botonIrAFuente = screen.getByRole("button", { name: "Ir a la fuente" });
    await userEvent.keyboard("{Enter}");

    expect(navigateRef).toHaveBeenCalledWith("/dashboard/correos");
  });

  it("activar por teclado (Espacio) en «Ir a la fuente» navega al destino (AC-24)", async () => {
    renderConNavegacion();
    await crearMuestra({ titulo: "Muestra espacio", fuente: "contabilidad", tipo: "metrica" });

    const heading = screen.getByRole("heading", { name: "Muestra espacio" });
    const button = heading.closest('[role="button"]');
    await userEvent.click(button);

    await waitFor(() => expect(obtenerPanelDetalle()).toBeTruthy());

    const botonIrAFuente = screen.getByRole("button", { name: "Ir a la fuente" });
    await userEvent.keyboard(" ");

    expect(navigateRef).toHaveBeenCalledWith("/dashboard/contabilidad");
  });
});
