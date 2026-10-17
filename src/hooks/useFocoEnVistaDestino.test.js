/**
 * @uso        Suite de la pieza del cierre que navega: colocación del foco en la vista de destino
 *             (spec 011, T8; RF-15)
 * @funciones  describe/it/expect/vi, render, useFocoEnVistaDestino
 * @datos      DOM controlado a mano (control estable por versión de vista, logotipo, diálogo) y
 *             matchMedia coherente con innerWidth
 * @eventos    Montaje de la vista de destino con y sin la marca de `location.state`
 * @estados    N/A
 * @usadoPor   vitest (npm test)
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cleanup, render, act } from "@testing-library/react";
import { StrictMode, createElement } from "react";
import { MemoryRouter, useNavigate } from "react-router-dom";
import { useFocoEnVistaDestino } from "./useFocoEnVistaDestino";

/** Mismo selector real de foco que usa la pieza compartida (RF-05). */
const SELECTOR_ENFOCABLE =
  'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])';

let escena;
let originalMatchMedia;
let originalInnerWidthDescriptor;

/** Mock de matchMedia cuyo `matches` deriva del `innerWidth` vigente (coherencia obligatoria). */
const configurarViewport = (ancho) => {
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: ancho,
  });
  window.matchMedia = vi.fn().mockImplementation((query) => ({
    matches:
      /min-width:\s*(\d+)px/.exec(query) !== null
        ? ancho >= Number(/min-width:\s*(\d+)px/.exec(query)[1])
        : false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
};

const crearBoton = ({ etiquetaAria, texto = "botón", disabled = false } = {}) => {
  const boton = document.createElement("button");
  boton.type = "button";
  boton.textContent = texto;
  if (etiquetaAria) boton.setAttribute("aria-label", etiquetaAria);
  if (disabled) boton.disabled = true;
  return boton;
};

const crearLateral = () => {
  const aside = document.createElement("aside");
  aside.setAttribute("role", "navigation");
  const boton = crearBoton({ texto: "Inicio" });
  aside.appendChild(boton);
  return { aside, boton };
};

const crearLogotipo = () => {
  const enlace = document.createElement("a");
  enlace.setAttribute("href", "/");
  enlace.textContent = "FinApp";
  return enlace;
};

/** Monta nodos dentro de la escena (document.body) para que los selectores de la pieza los vean. */
const montar = (...nodos) => {
  nodos.forEach((nodo) => escena.appendChild(nodo));
  return nodos;
};

/** Vista de destino mínima: solo consume la pieza bajo prueba y no renderiza controles. */
const VistaDestino = () => {
  useFocoEnVistaDestino();
  return null;
};

/** Vista de destino que empuja una nueva entrada de historial con la marca. */
const VistaDestinoConNavegacion = () => {
  useFocoEnVistaDestino();
  const navigate = useNavigate();
  return createElement(
    "button",
    {
      type: "button",
      "data-navegar": "true",
      onClick: () =>
        navigate("/destino-2", { state: { focoEnDestino: true } }),
    },
    "Empujar entrada con marca"
  );
};

/** Entrada de historial con la marca escrita por el cierre que navega (RF-15/M6). */
const ENTRADA_CON_MARCA = {
  pathname: "/destino",
  state: { focoEnDestino: true },
};

/** Entrada de historial ordinaria: sin la marca, la pieza no debe tocar el foco (AC-25). */
const ENTRADA_SIN_MARCA = { pathname: "/destino" };

const montarDestino = ({
  entradas = [ENTRADA_CON_MARCA],
  componente = VistaDestino,
  envoltorio,
} = {}) => {
  const arbol = createElement(
    MemoryRouter,
    { initialEntries: entradas },
    createElement(componente)
  );
  return render(envoltorio ? createElement(envoltorio, null, arbol) : arbol);
};

beforeEach(() => {
  originalMatchMedia = window.matchMedia;
  originalInnerWidthDescriptor = Object.getOwnPropertyDescriptor(window, "innerWidth");
  escena = document.createElement("div");
  escena.id = "escena-011-t8";
  document.body.appendChild(escena);
  // Punto de partida estable: nada enfocado antes de cada caso.
  if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  configurarViewport(375);
});

afterEach(() => {
  cleanup();
  escena.remove();
  window.matchMedia = originalMatchMedia;
  if (originalInnerWidthDescriptor) {
    Object.defineProperty(window, "innerWidth", originalInnerWidthDescriptor);
  }
  vi.restoreAllMocks();
});

describe("useFocoEnVistaDestino — colocación con la marca (RF-15)", () => {
  it("AC-22 (móvil): el foco queda en el control estable de la versión y una sola vez", () => {
    const menu = crearBoton({ etiquetaAria: "Abrir menú" });
    const { aside, boton } = crearLateral();
    montar(menu, aside);
    const espiaMenu = vi.spyOn(menu, "focus");
    const espiaLateral = vi.spyOn(boton, "focus");

    montarDestino();

    expect(espiaMenu).toHaveBeenCalledTimes(1);
    expect(espiaLateral).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(menu);
    expect(document.activeElement).not.toBe(document.body);
  });

  it("AC-22 (≥768px): el foco queda en el control de la navegación lateral", () => {
    configurarViewport(1024);
    const menu = crearBoton({ etiquetaAria: "Abrir menú" });
    const { aside, boton } = crearLateral();
    montar(menu, aside);
    const espiaMenu = vi.spyOn(menu, "focus");
    const espiaLateral = vi.spyOn(boton, "focus");

    montarDestino();

    expect(espiaLateral).toHaveBeenCalledTimes(1);
    expect(espiaMenu).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(boton);
  });

  it("AC-22 (destino sin dashboard): primer control enfocable, excluyendo [role=\"dialog\"] (CL-18)", () => {
    // Vista de destino tipo landing: un diálogo (superficie que se cierra), un disabled y el logotipo.
    const dialogo = document.createElement("div");
    dialogo.setAttribute("role", "dialog");
    const dentroDialogo = crearBoton({ texto: "Cerrar ventana de acceso" });
    dialogo.appendChild(dentroDialogo);
    const deshabilitado = crearBoton({ texto: "disabled", disabled: true });
    const logo = crearLogotipo();
    montar(dialogo, deshabilitado, logo);
    const espiaDialogo = vi.spyOn(dentroDialogo, "focus");
    const espiaDeshabilitado = vi.spyOn(deshabilitado, "focus");
    const espiaLogo = vi.spyOn(logo, "focus");

    montarDestino();

    expect(espiaLogo).toHaveBeenCalledTimes(1);
    expect(espiaDialogo).not.toHaveBeenCalled();
    expect(espiaDeshabilitado).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(logo);
    expect(document.activeElement).not.toBe(document.body);
  });

  it("AC-22/CL-18: el candidato nunca pertenece a un subárbol [role=\"dialog\"]", () => {
    const dialogo = document.createElement("div");
    dialogo.setAttribute("role", "dialog");
    const botonDeLaSuperficie = crearBoton({ texto: "Dentro de la superficie" });
    dialogo.appendChild(botonDeLaSuperficie);
    montar(dialogo);
    const espiaDialogo = vi.spyOn(botonDeLaSuperficie, "focus");

    montarDestino();

    expect(espiaDialogo).not.toHaveBeenCalled();
    expect(dialogo.contains(document.activeElement)).toBe(false);
  });
});

describe("useFocoEnVistaDestino — límites de la colocación (RF-15/AC-23/AC-25)", () => {
  it("AC-25: sin la marca no mueve el foco (navegación ordinaria)", () => {
    const menu = crearBoton({ etiquetaAria: "Abrir menú" });
    const logo = crearLogotipo();
    montar(menu, logo);
    const espiaMenu = vi.spyOn(menu, "focus");
    const espiaLogo = vi.spyOn(logo, "focus");

    montarDestino({ entradas: [ENTRADA_SIN_MARCA] });

    expect(espiaMenu).not.toHaveBeenCalled();
    expect(espiaLogo).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(document.body);
  });

  it("AC-23: con la marca y sin ningún enfocable no hay focus(), ni excepción, ni marcado nuevo", () => {
    const parrafo = document.createElement("p");
    parrafo.textContent = "vista sin controles";
    montar(parrafo);
    const espiaBody = vi.spyOn(document.body, "focus");
    const nodosAntes = escena.querySelectorAll("*").length;

    expect(() => montarDestino()).not.toThrow();

    expect(espiaBody).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(document.body);
    // Limitación explícita: no se inventa ningún control para «cumplir» con el destino.
    expect(escena.querySelectorAll(SELECTOR_ENFOCABLE).length).toBe(0);
    expect(escena.querySelectorAll("*").length).toBe(nodosAntes);
  });

  it("AC-25: los re-renders posteriores no repiten la colocación (StrictMode incluido)", () => {
    const menu = crearBoton({ etiquetaAria: "Abrir menú" });
    montar(menu);
    const espiaMenu = vi.spyOn(menu, "focus");

    const { rerender } = montarDestino({ envoltorio: StrictMode });
    rerender(
      createElement(
        StrictMode,
        null,
        createElement(
          MemoryRouter,
          { initialEntries: [ENTRADA_CON_MARCA] },
          createElement(VistaDestino)
        )
      )
    );

    expect(espiaMenu).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(menu);
  });

  it("AC-25: una entrada de historial nueva con la marca sí vuelve a colocar el foco", async () => {
    const menu = crearBoton({ etiquetaAria: "Abrir menú" });
    montar(menu);
    const espiaMenu = vi.spyOn(menu, "focus");

    const { container } = montarDestino({ componente: VistaDestinoConNavegacion });
    expect(espiaMenu).toHaveBeenCalledTimes(1);

    const botonNavegar = container.querySelector("[data-navegar='true']");
    expect(botonNavegar).toBeTruthy();
    // El clic empuja una entrada de historial nueva con la marca: la pieza vuelve a colocar el foco.
    await act(async () => {
      botonNavegar.click();
    });

    expect(espiaMenu).toHaveBeenCalledTimes(2);
    expect(document.activeElement).toBe(menu);
  });
});
