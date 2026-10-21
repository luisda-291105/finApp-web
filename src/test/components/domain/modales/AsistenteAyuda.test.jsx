/**
 * @uso        Pruebas de estructura, ARIA, estados estáticos y cromo de AsistenteAyuda (spec 014, T2–T6)
 * @funciones  render, screen, within, waitFor
 * @datos      Props simuladas: abierto, estadoVisual, alCerrar y triggerRef; sin datos externos
 * @eventos    Clic en «X»/scrim/panel, Esc, punteros del gesto y transición abierta → cerrada del foco
 * @estados    Arnés local abierto/cerrado y viewport simulado (innerWidth + matchMedia) para el gesto
 * @usadoPor   Vitest
 */
import { useRef, useState } from "react";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import AsistenteAyuda from "./AsistenteAyuda";

// Literales copiados carácter a carácter de la spec 014 §4.3 (no importados del componente,
// para que la prueba no sea tautológica).
const TITULO = "Asistente de ayuda";
const MARCA_DEMO = "Demostración · No es una IA real";
const NOTA_DISENO = "Vista de diseño: contenido de ejemplo; aún no responde preguntas.";
const ARIA_CERRAR = "Cerrar asistente de ayuda";
const TEXTO_VACIO =
  "Aún no hay mensajes. Cuando la ayuda esté activa, podrás elegir una sugerencia o escribir una pregunta.";
const ARIA_LOG = "Mensajes del asistente";
const SUGERENCIAS = [
  "¿Cómo entro al panel?",
  "¿Dónde veo mis tarjetas?",
  "¿Se guardan mis datos?",
  "¿Cómo salgo del demo?",
];
const TEXTO_EJEMPLO = "Conversación de ejemplo";
const AVISO_RESERVA =
  "Cuando la ayuda esté activa, si tu pregunta no coincide verás una respuesta de reserva.";
const LABEL_ENTRADA = "Tu pregunta";
const PLACEHOLDER = "Escribe una pregunta…";
const BOTON_ENVIAR = "Enviar";
const BURBUJAS = [
  "¿Cómo entro al panel?",
  "En esta demo el panel se abre directamente desde la portada. Dentro, la barra lateral te permite ir a Inicio, Transacciones y Tarjetas.",
  "¿Se guardan mis datos?",
  "Esta es una demostración: no hay backend ni datos financieros reales. Las cifras y las tarjetas que ves son de ejemplo.",
];

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

/** Despacha un evento de puntero nativo con las propiedades que lee el gesto. */
const dispararPuntero = (elemento, tipo, props = {}) => {
  const evento = new Event(tipo, { bubbles: true, cancelable: true });
  Object.assign(evento, { isPrimary: true, pointerId: 7, clientX: 0, clientY: 0, ...props });
  elemento.dispatchEvent(evento);
};

afterEach(() => {
  cleanup();
  fijarViewport(1024);
});

describe("AsistenteAyuda — diálogo y ARIA (T2)", () => {
  it("no renderiza nada cuando está cerrado", () => {
    render(<AsistenteAyuda abierto={false} alCerrar={vi.fn()} />);

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("expone el rol de diálogo con el nombre del título y aria-modal", () => {
    renderizar();

    const dialogo = obtenerDialogo();

    expect(dialogo).toHaveAttribute("aria-modal", "true");
    expect(dialogo).toHaveAttribute("aria-labelledby", "asistente-titulo");
    expect(dialogo).toHaveAttribute(
      "aria-describedby",
      "asistente-marca asistente-nota asistente-reserva"
    );
    expect(dialogo).toHaveAttribute("tabindex", "-1");
  });

  it("deja el foco inicial en el contenedor del diálogo (tabIndex -1)", () => {
    renderizar();

    expect(obtenerDialogo()).toHaveAttribute("tabindex", "-1");
  });

  it("el botón de cierre del panel tiene el nombre accesible del asistente", () => {
    renderizar();

    expect(screen.getByRole("button", { name: ARIA_CERRAR })).toBeInTheDocument();
  });
});

describe("AsistenteAyuda — panel, scrim y cabecera (T2)", () => {
  it("el panel lleva las clases de la spec y el scrim cierra el contexto centrado", () => {
    renderizar();

    const dialogo = obtenerDialogo();
    const scrim = dialogo.parentElement;

    expect(dialogo).toHaveClass(
      "relative",
      "z-60",
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

  it("la cabecera muestra el título, la marca y la nota, con la «X» a la derecha", () => {
    renderizar();

    const titulo = screen.getByRole("heading", { name: TITULO });
    const header = titulo.closest("header");

    expect(header).not.toBeNull();
    expect(header).toHaveClass("shrink-0");
    expect(screen.getByText(MARCA_DEMO)).toBeInTheDocument();
    expect(screen.getByText(NOTA_DISENO)).toBeInTheDocument();
    expect(header).toContainElement(screen.getByRole("button", { name: ARIA_CERRAR }));
  });

  it("la marca y la nota quedan fuera del contenedor con scroll", () => {
    renderizar();

    const marca = screen.getByText(MARCA_DEMO);
    const nota = screen.getByText(NOTA_DISENO);

    expect(marca.closest(".overflow-y-auto")).toBeNull();
    expect(nota.closest(".overflow-y-auto")).toBeNull();
  });
});

describe("AsistenteAyuda — sin promesa de IA real (T2)", () => {
  it("la única aparición de «IA» es la marca de demostración", () => {
    renderizar();

    const apariciones = screen.getAllByText(/IA/);

    expect(apariciones).toHaveLength(1);
    expect(screen.getByText(MARCA_DEMO)).toContainElement(apariciones[0]);
  });

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
  it("muestra el texto de vacío y las cuatro sugerencias como chips", () => {
    renderizar();

    expect(screen.getByText(TEXTO_VACIO)).toBeInTheDocument();

    SUGERENCIAS.forEach((sugerencia) => {
      const chip = screen.getByRole("button", { name: sugerencia });

      expect(chip).toBeInTheDocument();
      expect(chip).toHaveAttribute("aria-disabled", "true");
    });
  });

  it("el log existe desde la apertura con sus atributos ARIA y sin hijos", () => {
    renderizar();

    const log = screen.getByRole("log");

    expect(log).toHaveAttribute("aria-live", "polite");
    expect(log).toHaveAttribute("aria-relevant", "additions");
    expect(log).toHaveAttribute("aria-atomic", "false");
    expect(log).toHaveAttribute("aria-label", ARIA_LOG);
    expect(log.childElementCount).toBe(0);
  });

  it("el texto de vacío y los chips quedan fuera del log", () => {
    renderizar();

    const log = screen.getByRole("log");

    expect(within(log).queryByText(TEXTO_VACIO)).toBeNull();
    SUGERENCIAS.forEach((sugerencia) => {
      expect(within(log).queryByRole("button", { name: sugerencia })).toBeNull();
    });
  });

  it("pulsar los chips no añade mensajes al log (solo diseño)", () => {
    renderizar();

    const log = screen.getByRole("log");

    SUGERENCIAS.forEach((sugerencia) => {
      fireEvent.click(screen.getByRole("button", { name: sugerencia }));
    });

    expect(log.childElementCount).toBe(0);
  });
});

describe("AsistenteAyuda — estado conversación: TEXTO_EJEMPLO y burbujas (T4)", () => {
  it("muestra TEXTO_EJEMPLO fuera del log y las cuatro burbujas dentro", () => {
    renderizar({ estadoVisual: "conversacion" });

    const log = screen.getByRole("log");

    expect(screen.getByText(TEXTO_EJEMPLO)).toBeInTheDocument();
    expect(within(log).queryByText(TEXTO_EJEMPLO)).toBeNull();

    BURBUJAS.forEach((texto) => {
      expect(screen.getByText(texto)).toBeInTheDocument();
      expect(within(log).getByText(texto)).toBeInTheDocument();
    });

    expect(log.childElementCount).toBe(4);
  });

  it("respeta el orden DOM de las cuatro burbujas", () => {
    renderizar({ estadoVisual: "conversacion" });

    const burbujas = BURBUJAS.map((texto) => screen.getByText(texto));

    burbujas.slice(1).forEach((burbuja, indice) => {
      expect(
        burbujas[indice].compareDocumentPosition(burbuja) &
          Node.DOCUMENT_POSITION_FOLLOWING
      ).toBeTruthy();
    });
  });

  it("etiqueta cada burbuja con Tú o Asistente en un span sr-only", () => {
    renderizar({ estadoVisual: "conversacion" });

    const etiquetasTu = screen.getAllByText("Tú");

    expect(etiquetasTu).toHaveLength(2);
    etiquetasTu.forEach((nodo) => expect(nodo).toHaveClass("sr-only"));

    const etiquetasAsistente = screen.getAllByText("Asistente");

    expect(etiquetasAsistente).toHaveLength(2);
    etiquetasAsistente.forEach((nodo) => expect(nodo).toHaveClass("sr-only"));
  });

  it("en conversación solo hay cuatro mensajes y ningún chip ni control de cambio", () => {
    renderizar({ estadoVisual: "conversacion" });

    const log = screen.getByRole("log");

    expect(log.childElementCount).toBe(4);
    expect(screen.queryByText(TEXTO_VACIO)).toBeNull();
    SUGERENCIAS.forEach((sugerencia) => {
      expect(screen.queryByRole("button", { name: sugerencia })).toBeNull();
    });
    expect(
      screen.queryByRole("button", { name: /cambiar|conversaci[oó]n|vac[ií]o|alternar/i })
    ).toBeNull();
    expect(screen.queryByRole("switch")).toBeNull();
  });
});

describe("AsistenteAyuda — pie: aviso, campo y «Enviar» presentacionales (T5)", () => {
  it("muestra el aviso de reserva en un pie fijo fuera del área con scroll", () => {
    renderizar();

    const aviso = screen.getByText(AVISO_RESERVA);
    const pie = aviso.closest("footer");

    expect(pie).not.toBeNull();
    expect(obtenerDialogo()).toContainElement(pie);
    expect(pie).toHaveClass("shrink-0");
    expect(pie.closest(".overflow-y-auto")).toBeNull();
    expect(aviso).toHaveAttribute("id", "asistente-reserva");
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

  it("el campo es editable, sin value controlado, y escribir no altera el log", async () => {
    const usuario = userEvent.setup();

    renderizar();

    const entrada = screen.getByLabelText(LABEL_ENTRADA);
    const log = screen.getByRole("log");

    expect(entrada).not.toHaveAttribute("value");
    expect(entrada).toHaveValue("");

    await usuario.type(entrada, "¿Cómo salgo del demo?");

    expect(entrada).toHaveFocus();
    expect(entrada).toHaveValue("¿Cómo salgo del demo?");
    expect(entrada).not.toHaveAttribute("value");
    expect(log.childElementCount).toBe(0);
  });

  it("el botón «Enviar» está marcado como no disponible y no añade mensajes", () => {
    const alCerrar = vi.fn();

    renderizar({ alCerrar });

    const enviar = screen.getByRole("button", { name: BOTON_ENVIAR });
    const log = screen.getByRole("log");

    expect(enviar).toHaveAttribute("aria-disabled", "true");
    expect(enviar).toHaveAttribute("type", "button");

    fireEvent.click(enviar);

    expect(log.childElementCount).toBe(0);
    expect(alCerrar).not.toHaveBeenCalled();
  });

  it("no hay formulario ni envío: el pie no usa <form> y el campo no envía con Enter", async () => {
    const usuario = userEvent.setup();

    renderizar();

    const entrada = screen.getByLabelText(LABEL_ENTRADA);
    const log = screen.getByRole("log");

    expect(obtenerDialogo().querySelector("form")).toBeNull();

    await usuario.type(entrada, "¿Se guardan mis datos?{Enter}");

    expect(obtenerDialogo().querySelector("form")).toBeNull();
    expect(log.childElementCount).toBe(0);
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

  it("cierra con Esc con una sola llamada", async () => {
    const usuario = userEvent.setup();
    const alCerrar = vi.fn();

    renderizar({ alCerrar });

    await usuario.keyboard("{Escape}");

    expect(alCerrar).toHaveBeenCalledTimes(1);
  });

  it("cierra con Esc aunque el foco esté en el campo del pie", async () => {
    const usuario = userEvent.setup();
    const alCerrar = vi.fn();

    renderizar({ alCerrar });

    const entrada = screen.getByLabelText(LABEL_ENTRADA);

    entrada.focus();
    expect(entrada).toHaveFocus();

    await usuario.keyboard("{Escape}");

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

    await waitFor(() => expect(document.activeElement).toBe(dialogo));

    const primero = screen.getByRole("button", { name: ARIA_CERRAR });
    const ultimo = screen.getByRole("button", { name: BOTON_ENVIAR });

    // Del último control se vuelve al primero (Tab) y del primero al último (Shift+Tab):
    // el ciclo es circular y no escapa del panel.
    ultimo.focus();
    expect(ultimo).toHaveFocus();

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
          <button ref={triggerRef} type="button" onClick={() => setEstaAbierto(true)}>
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

    expect(() => rerender(<AsistenteAyuda abierto={false} alCerrar={alCerrar} />)).not.toThrow();

    expect(espiaFocoBody).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).toBeNull();

    espiaFocoBody.mockRestore();
  });
});

describe("AsistenteAyuda — gesto de deslizar (T6)", () => {
  // Cableado del gesto en jsdom (móvil simulado). La fidelidad táctil real se valida a mano (M-14-6).
  it("en móvil, un arrastre vertical de más de 96 px sobre el panel cierra una vez", () => {
    fijarViewport(375);

    const alCerrar = vi.fn();

    renderizar({ alCerrar });

    const dialogo = obtenerDialogo();

    dispararPuntero(dialogo, "pointerdown", { clientY: 0 });
    dispararPuntero(dialogo, "pointermove", { clientY: 160 });
    dispararPuntero(dialogo, "pointerup", { clientY: 160 });

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
      dispararPuntero(control, "pointerdown", { clientY: 0 });
      dispararPuntero(control, "pointermove", { clientY: 200 });
      dispararPuntero(control, "pointerup", { clientY: 200 });
    });

    expect(alCerrar).not.toHaveBeenCalled();
  });

  it("no cierra por gesto en pantallas grandes (≥768 px)", () => {
    fijarViewport(1024);

    const alCerrar = vi.fn();

    renderizar({ alCerrar });

    const dialogo = obtenerDialogo();

    dispararPuntero(dialogo, "pointerdown", { clientY: 0 });
    dispararPuntero(dialogo, "pointermove", { clientY: 200 });
    dispararPuntero(dialogo, "pointerup", { clientY: 200 });

    expect(alCerrar).not.toHaveBeenCalled();
  });
});
