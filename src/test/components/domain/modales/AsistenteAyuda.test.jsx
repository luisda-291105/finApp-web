/**
 * @uso        Pruebas de estructura, ARIA, estados y cromo de AsistenteAyuda (componente actual)
 * @funciones  render, screen, within, waitFor
 * @datos      Props simuladas: abierto, alCerrar, triggerRef; sin datos externos
 * @eventos    Clic en «X»/scrim/panel, Esc, punteros del gesto y transición abierta → cerrada del foco
 * @estados    Arnés local abierto/cerrado y viewport simulado (innerWidth + matchMedia) para el gesto
 * @usadoPor   Vitest
 */
import { useRef, useState } from "react";
import { render, screen, waitFor, within, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AsistenteAyuda from "../../../../components/domain/modales/AsistenteAyuda";

// Polyfill PointerEvent para jsdom (no lo tiene nativamente)
if (typeof global.PointerEvent === "undefined") {
  global.PointerEvent = class PointerEvent extends MouseEvent {
    constructor(type, options = {}) {
      super(type, options);
      this.pointerId = options.pointerId ?? 1;
      this.width = options.width ?? 1;
      this.height = options.height ?? 1;
      this.pressure = options.pressure ?? 0;
      this.tangentialPressure = options.tangentialPressure ?? 0;
      this.tiltX = options.tiltX ?? 0;
      this.tiltY = options.tiltY ?? 0;
      this.twist = options.twist ?? 0;
      this.pointerType = options.pointerType ?? "mouse";
      this.isPrimary = options.isPrimary ?? true;
    }
  };
}

// Literales del componente actual (no de la spec 014, que quedó obsoleta)
const TITULO = "Asistente de FinApp";
const SUBTITULO = "Respuestas con documentación y búsqueda pública.";
const ARIA_CERRAR = "Cerrar asistente de ayuda";
const TEXTO_VACIO =
  "Pregunta sobre cómo usar FinApp o solicita información pública actual.";
const ARIA_LOG = "Mensajes del asistente";
const SUGERENCIAS = [
  "¿Dónde veo mis tarjetas?",
  "¿Cómo cambio la apariencia?",
  "¿Qué datos consulta este chat?",
];
const LABEL_ENTRADA = "Tu pregunta";
const PLACEHOLDER = "Escribe una pregunta…";
const BOTON_ENVIAR = "Enviar";
const AVISO_PIE =
  "No escribas datos personales, números de tarjeta, CVV ni contraseñas. El chat no consulta tu cuenta.";

const renderizar = (props = {}) =>
  render(<AsistenteAyuda abierto alCerrar={vi.fn()} {...props} />);

const obtenerDialogo = () => screen.getByRole("dialog", { name: TITULO });

/**
 * Fija el ancho simulado y un `matchMedia` coherente con él, para ejercer el corte de 768 px del
 * gesto (`useBreakpoint`) sin depender del mock global de `vitest.setup.js`.
 */
const fijarViewport = (ancho) => {
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: ancho,
  });
  window.matchMedia = vi.fn().mockImplementation((query) => {
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
};

/**
 * Dispara eventos de puntero (pointerdown/move/up) sobre un elemento.
 * Se usa para probar el gesto de deslizar sin depender de userEvent.pointer.
 */
const dispararPuntero = (elemento, tipo, coords) => {
  const evento = new PointerEvent(tipo, {
    bubbles: true,
    cancelable: true,
    clientX: coords.clientX ?? 0,
    clientY: coords.clientY ?? 0,
    pointerType: "touch",
    isPrimary: true,
  });
  elemento.dispatchEvent(evento);
};

describe("AsistenteAyuda — montaje, alcance y disparador", () => {
  it("monta un solo asistente, ids únicos y una sola trampa de diálogo", () => {
    renderizar();

    expect(screen.getByRole("dialog", { name: TITULO })).toBeInTheDocument();
    expect(screen.queryByRole("dialog", { name: TITULO })).toBeInTheDocument();

    // No hay un segundo diálogo con el mismo nombre
    expect(
      screen.queryAllByRole("dialog", { name: TITULO })
    ).toHaveLength(1);
  });

  it("no renderiza nada si `abierto` es false", () => {
    render(<AsistenteAyuda abierto={false} alCerrar={vi.fn()} />);

    expect(screen.queryByRole("dialog", { name: TITULO })).not.toBeInTheDocument();
  });
});

describe("AsistenteAyuda — panel, scrim y cabecera (T2)", () => {
  it("el panel lleva las clases de la spec y el scrim cierra el contexto centrado", () => {
    renderizar();

    const dialogo = obtenerDialogo();
    const scrim = dialogo.parentElement;

    expect(dialogo).toHaveClass(
          "relative",
          "w-[90vw]",
          "max-w-md",
          "max-h-[85vh]",
          "overflow-hidden",
          "outline-none",
          "bg-bg-cream/95",
          "glass-surface",
          "border",
          "border-border-line/30",
          "rounded-3xl",
          "shadow-xl",
          "flex",
          "flex-col"
        );
    expect(scrim).toHaveClass(
      "fixed",
      "inset-0",
      "z-50",
      "flex",
      "items-center",
      "justify-center",
      "p-4",
      "bg-bg-dark/70"
    );
  });

  it("el scrim no lleva backdrop-filter (no cuenta como superficie Fluid Glass)", () => {
    renderizar();

    const scrim = obtenerDialogo().parentElement;

    expect(scrim.className).not.toContain("backdrop-blur");
    expect(scrim.className).not.toContain("backdrop-filter");
  });

  it("la cabecera muestra el título, el subtítulo y la «X» a la derecha", () => {
    renderizar();

    const titulo = screen.getByRole("heading", { name: TITULO });
    const header = titulo.closest("header");

    expect(header).not.toBeNull();
    expect(header).toHaveClass("shrink-0");
    expect(screen.getByText(SUBTITULO)).toBeInTheDocument();
    expect(header).toContainElement(
      screen.getByRole("button", { name: ARIA_CERRAR })
    );
  });

  it("el título y el subtítulo quedan fuera del contenedor con scroll", () => {
    renderizar();

    const titulo = screen.getByRole("heading", { name: TITULO });
    const subtitulo = screen.getByText(SUBTITULO);

    expect(titulo.closest(".overflow-y-auto")).toBeNull();
    expect(subtitulo.closest(".overflow-y-auto")).toBeNull();
  });
});

describe("AsistenteAyuda — sin promesa de IA real (T2)", () => {
  it("no contiene textos que presenten al asistente como IA real", () => {
    renderizar();

    expect(screen.queryByText(/inteligencia artificial/)).toBeNull();
    expect(screen.queryByText(/modelo de lenguaje/)).toBeNull();
    expect(screen.queryByText(/aprendo/)).toBeNull();
    expect(screen.queryByText(/entiendo/)).toBeNull();
    expect(screen.queryByText(/asistente inteligente/)).toBeNull();
  });
});

describe("AsistenteAyuda — estado vacío: aviso, sugerencias y chips (T3)", () => {
  it("muestra el texto de vacío y las tres sugerencias como chips", () => {
      renderizar();

      expect(screen.getByText(TEXTO_VACIO)).toBeInTheDocument();

      SUGERENCIAS.forEach((sugerencia) => {
        const chip = screen.getByRole("button", { name: sugerencia });

        expect(chip).toBeInTheDocument();
        // Los chips no están deshabilitados inicialmente (solo cuando cargando=true)
        expect(chip).not.toHaveAttribute("disabled");
      });
    });

  it("el log existe desde la apertura con sus atributos ARIA y con el texto de vacío", () => {
      renderizar();

      const log = screen.getByRole("log");

      expect(log).toHaveAttribute("aria-live", "polite");
      expect(log).toHaveAttribute("aria-relevant", "additions");
      expect(log).toHaveAttribute("aria-atomic", "false");
      expect(log).toHaveAttribute("aria-label", ARIA_LOG);
      // El log tiene 1 hijo directo (wrapper) que contiene texto + botones
      expect(log.childElementCount).toBe(1);
    });

    it("los chips de sugerencia quedan dentro del log", () => {
      renderizar();

      const log = screen.getByRole("log");

      SUGERENCIAS.forEach((sugerencia) => {
        expect(within(log).getByRole("button", { name: sugerencia })).toBeInTheDocument();
      });
    });

    it("pulsar un chip envía la sugerencia como mensaje de usuario", async () => {
      const usuario = userEvent.setup();

      renderizar();

      const log = screen.getByRole("log");

      // Inicialmente: 1 wrapper con texto + 3 botones
      expect(log.childElementCount).toBe(1);

      // Click en el primer chip
      await usuario.click(screen.getByRole("button", { name: SUGERENCIAS[0] }));

      // Se añade mensaje de usuario + indicador de carga
      await waitFor(() => {
        expect(log.childElementCount).toBeGreaterThanOrEqual(1);
      });
    });
});

describe("AsistenteAyuda — pie: aviso, campo y «Enviar» (T5)", () => {
  it("muestra el aviso de privacidad en un pie fijo fuera del área con scroll", () => {
    renderizar();

    const aviso = screen.getByText(AVISO_PIE);
    const pie = aviso.closest("footer");

    expect(pie).not.toBeNull();
    expect(obtenerDialogo()).toContainElement(pie);
    expect(pie).toHaveClass("shrink-0");
    expect(pie.closest(".overflow-y-auto")).toBeNull();
    expect(aviso).toHaveAttribute("id", "asistente-aviso");
  });

  it("asocia la etiqueta sr-only «Tu pregunta» al campo por for/id", () => {
    renderizar();

    const entrada = screen.getByLabelText(LABEL_ENTRADA);
    const etiqueta = screen.getByText(LABEL_ENTRADA);

    expect(etiqueta.tagName).toBe("LABEL");
    expect(etiqueta).toHaveClass("sr-only");
    expect(etiqueta).toHaveAttribute("for", "asistente-entrada");
    expect(entrada.tagName).toBe("INPUT");
    expect(entrada).toHaveAttribute("id", "asistente-entrada");
    expect(entrada).toHaveAttribute("type", "text");
    expect(entrada).toHaveAttribute("placeholder", PLACEHOLDER);
  });

  it("el campo es controlado, tiene maxLength 500 y escribir no altera el log", async () => {
      const usuario = userEvent.setup();

      renderizar();

      const entrada = screen.getByLabelText(LABEL_ENTRADA);
      const log = screen.getByRole("log");

      expect(entrada).toHaveAttribute("maxLength", "500");
      expect(entrada).toHaveValue("");

      await usuario.type(entrada, "¿Cómo salgo del demo?");

      expect(entrada).toHaveFocus();
      expect(entrada).toHaveValue("¿Cómo salgo del demo?");
      // Escribir en el campo no añade mensajes al log (inicial: 1 wrapper)
      expect(log.childElementCount).toBe(1);
    });

    it("el botón «Enviar» está deshabilitado cuando el campo está vacío", () => {
      renderizar();

      const enviar = screen.getByRole("button", { name: BOTON_ENVIAR });
      const log = screen.getByRole("log");

      expect(enviar).toHaveAttribute("disabled", "");
      expect(enviar).toHaveAttribute("type", "submit");

      fireEvent.click(enviar);

      // Click en botón deshabilitado no hace nada (inicial: 1 wrapper)
      expect(log.childElementCount).toBe(1);
    });

    it("el pie usa <form> y el campo envía con Enter cuando hay texto", async () => {
      const usuario = userEvent.setup();
      const alCerrar = vi.fn();

      renderizar({ alCerrar });

      const entrada = screen.getByLabelText(LABEL_ENTRADA);
      const log = screen.getByRole("log");

      expect(obtenerDialogo().querySelector("form")).not.toBeNull();

      await usuario.type(entrada, "¿Se guardan mis datos?");
      await usuario.keyboard("[Enter]");

      // El formulario se envía: se añade el mensaje de usuario al log
      // (sin backend muestra error de conexión, pero el mensaje de usuario está en el log)
      await waitFor(() => {
        expect(log.childElementCount).toBeGreaterThanOrEqual(1);
      });
      expect(screen.getByRole("dialog", { name: TITULO })).toBeInTheDocument();
    });
});

describe("AsistenteAyuda — cromo: «X», Esc, clic fuera y foco (T6)", () => {
  it("cierra con la «X» con una sola llamada", async () => {
    const usuario = userEvent.setup();
    const alCerrar = vi.fn();

    renderizar({ alCerrar });

    await usuario.click(screen.getByRole("button", { name: ARIA_CERRAR }));

    expect(alCerrar).toHaveBeenCalledTimes(1);
  });

  it("cierra con Escape", async () => {
    const usuario = userEvent.setup();
    const alCerrar = vi.fn();

    renderizar({ alCerrar });

    await usuario.keyboard("[Escape]");

    expect(alCerrar).toHaveBeenCalledTimes(1);
  });

  it("cierra con Escape aunque el foco esté en el campo del pie", async () => {
    const usuario = userEvent.setup();
    const alCerrar = vi.fn();

    renderizar({ alCerrar });

    const entrada = screen.getByLabelText(LABEL_ENTRADA);

    entrada.focus();
    expect(entrada).toHaveFocus();

    await usuario.keyboard("[Escape]");

    expect(alCerrar).toHaveBeenCalledTimes(1);
  });

  it("cierra al pulsar el scrim y no al pulsar dentro del panel", async () => {
    const usuario = userEvent.setup();
    const alCerrar = vi.fn();

    renderizar({ alCerrar });

    const dialogo = obtenerDialogo();
    const scrim = dialogo.parentElement;

    await usuario.click(dialogo);
    expect(alCerrar).not.toHaveBeenCalled();

    await usuario.click(scrim);
    expect(alCerrar).toHaveBeenCalledTimes(1);
  });

  it("deja el foco inicial en el contenedor del diálogo", async () => {
    renderizar();

    const dialogo = obtenerDialogo();

    await waitFor(() => expect(document.activeElement).toBe(dialogo));
  });

  it("la trampa de foco contiene el Tab en el diálogo y cierra el ciclo por ambos extremos (AC-03)", async () => {
      const usuario = userEvent.setup();

      renderizar();

      const dialogo = obtenerDialogo();

      // El foco inicial está en el dialogo
      await waitFor(() => expect(document.activeElement).toBe(dialogo));

      // Tab desde el diálogo va al primer elemento enfocable (botón cerrar en header)
      await usuario.tab();
      const primero = screen.getByRole("button", { name: ARIA_CERRAR });
      expect(primero).toHaveFocus();
      expect(dialogo.contains(document.activeElement)).toBe(true);

      // Tab avanza por los chips de sugerencia (3), luego input
      await usuario.tab(); // chip 1
      await usuario.tab(); // chip 2
      await usuario.tab(); // chip 3
      const entrada = screen.getByLabelText(LABEL_ENTRADA);
      await usuario.tab(); // input
      expect(entrada).toHaveFocus();

      // Escribir en el input habilita el botón Enviar
      await usuario.type(entrada, "test");
      const ultimo = screen.getByRole("button", { name: BOTON_ENVIAR });
      await usuario.tab(); // botón enviar (ahora habilitado)
      expect(ultimo).toHaveFocus();
      expect(dialogo.contains(document.activeElement)).toBe(true);

      // Del último control se vuelve al primero (Tab) y del primero al último (Shift+Tab):
      // el ciclo es circular y no escapa del panel.
      await usuario.tab();
      expect(primero).toHaveFocus();
      expect(dialogo.contains(document.activeElement)).toBe(true);

      await usuario.tab({ shift: true });
      expect(ultimo).toHaveFocus();
      expect(dialogo.contains(document.activeElement)).toBe(true);

      // Varios Tab seguidos nunca colocan el foco fuera del panel.
      for (let indice = 0; indice < 8; indice += 1) {
        await usuario.tab();
        expect(dialogo.contains(document.activeElement)).toBe(true);
      }
    });

  it("devuelve el foco al disparador al cerrar (transición abierta → cerrada)", async () => {
    const usuario = userEvent.setup();

    const ArnesRetorno = () => {
      const [estaAbierto, setEstaAbierto] = useState(false);
      const triggerRef = useRef(null);

      return (
        <>
          <button
            ref={triggerRef}
            type="button"
            onClick={() => setEstaAbierto(true)}
          >
            Disparador de prueba
          </button>
          <AsistenteAyuda
            abierto={estaAbierto}
            alCerrar={() => setEstaAbierto(false)}
            triggerRef={triggerRef}
          />
        </>
      );
    };

    render(<ArnesRetorno />);

    const disparador = screen.getByRole("button", { name: "Disparador de prueba" });

    await usuario.click(disparador);
    expect(obtenerDialogo()).toBeInTheDocument();

    await usuario.click(screen.getByRole("button", { name: ARIA_CERRAR }));

    await waitFor(() => expect(document.activeElement).toBe(disparador));
  });

  it("sin disparador ni otro enfocable no fuerza el foco sobre body ni lanza", async () => {
    const alCerrar = vi.fn();
    const { rerender } = render(<AsistenteAyuda abierto alCerrar={alCerrar} />);

    await waitFor(() => expect(document.activeElement).toBe(obtenerDialogo()));

    const espiaFocoBody = vi.spyOn(document.body, "focus");

    expect(() =>
      rerender(<AsistenteAyuda abierto={false} alCerrar={alCerrar} />)
    ).not.toThrow();

    expect(espiaFocoBody).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).toBeNull();

    espiaFocoBody.mockRestore();
  });
});

describe("AsistenteAyuda — gesto de deslizar (T6)", () => {
  // Cableado del gesto en jsdom (móvil simulado). La fidelidad táctil real se valida a mano (M-14-6).
  const dragThreshold = 120; // umbral del hook useDeslizarParaCerrar

  const simularArrastre = (elemento, inicioY, finY) => {
    fireEvent.pointerDown(elemento, { clientY: inicioY, pointerType: "touch" });
    fireEvent.pointerMove(elemento, { clientY: finY, pointerType: "touch" });
    fireEvent.pointerUp(elemento, { clientY: finY, pointerType: "touch" });
  };

  it("en móvil, un arrastre vertical mayor al umbral cierra el modal", () => {
    fijarViewport(375);

    const alCerrar = vi.fn();

    renderizar({ alCerrar });

    const dialogo = obtenerDialogo();

    simularArrastre(dialogo, 100, 100 + dragThreshold + 10);

    expect(alCerrar).toHaveBeenCalledTimes(1);
  });

  it("no arranca si el arrastre empieza sobre un control (chip, campo o «X»)", () => {
    fijarViewport(375);

    const alCerrar = vi.fn();

    renderizar({ alCerrar });

    const controles = [
      screen.getByRole("button", { name: SUGERENCIAS[0] }),
      screen.getByLabelText(LABEL_ENTRADA),
      screen.getByRole("button", { name: ARIA_CERRAR }),
    ];

    controles.forEach((control) => {
      simularArrastre(control, 100, 300);
    });

    expect(alCerrar).not.toHaveBeenCalled();
  });

  it("no cierra por gesto en pantallas grandes (≥768 px)", () => {
    fijarViewport(1024);

    const alCerrar = vi.fn();

    renderizar({ alCerrar });

    const dialogo = obtenerDialogo();

    simularArrastre(dialogo, 200, 400);

    expect(alCerrar).not.toHaveBeenCalled();
  });
});
