/**
 * @uso        Suite de la pieza compartida useRetornoDeFoco y de su resolutor puro (spec 011, T2)
 * @funciones  describe/it/expect/vi, renderHook
 * @datos      DOM controlado a mano (disparador, capturado, controles estables) y matchMedia coherente con innerWidth
 * @eventos    Transición abierta → cerrada de la superficie falsa (prop `activo`)
 * @estados    N/A
 * @usadoPor   vitest (npm test)
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cleanup, renderHook } from "@testing-library/react";
import { StrictMode } from "react";
import { useRetornoDeFoco, resolverControlDeVista } from "./useRetornoDeFoco";

/** Corte único de versión de vista (spec 009), coherente con useBreakpoint. */
const QUERY_PANTALLAS_GRANDES = "(min-width: 768px)";

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

/** Monta nodos dentro de la escena (document.body) para que los selectores del respaldo los vean. */
const montar = (...nodos) => {
  nodos.forEach((nodo) => escena.appendChild(nodo));
  return nodos;
};

/** Superficie falsa controlable: la transición de `activo` dispara abrir/cerrar de la pieza. */
const usar = (valorInicial) =>
  renderHook(({ activo, triggerRef }) => useRetornoDeFoco({ activo, triggerRef }), {
    initialProps: valorInicial,
  });

/** Ejerce una transición real abre → cierra con el mismo `triggerRef`. */
const ejercerTransicion = (triggerRef) => {
  const { rerender, unmount } = usar({ activo: true, triggerRef });
  rerender({ activo: false, triggerRef });
  return unmount;
};

beforeEach(() => {
  originalMatchMedia = window.matchMedia;
  originalInnerWidthDescriptor = Object.getOwnPropertyDescriptor(window, "innerWidth");
  escena = document.createElement("div");
  escena.id = "escena-011";
  document.body.appendChild(escena);
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

describe("useRetornoDeFoco — montaje y re-renders cerrados (RF-01/RF-02)", () => {
  it("con la superficie cerrada desde el montaje: 0 focus() y activeElement sin cambios", () => {
    const disparador = crearBoton({ etiquetaAria: "Abrir menú" });
    montar(disparador);
    const espia = vi.spyOn(disparador, "focus");
    const activoAntes = document.activeElement;

    usar({ activo: false, triggerRef: { current: disparador } });

    expect(espia).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(activoAntes);
  });

  it("con dos re-renders cerrados tampoco mueve el foco (ni con disparador de identidad nueva)", () => {
    const disparador = crearBoton({ etiquetaAria: "Abrir menú" });
    montar(disparador);
    const espia = vi.spyOn(disparador, "focus");
    const activoAntes = document.activeElement;
    const { rerender } = usar({ activo: false, triggerRef: { current: disparador } });

    rerender({ activo: false, triggerRef: { current: disparador } });
    rerender({ activo: false, triggerRef: { current: { current: disparador } } });

    expect(espia).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(activoAntes);
  });
});

describe("useRetornoDeFoco — una devolución por cierre (RF-02/CL-14)", () => {
  it("la transición abre → cierra ejecuta una sola devolución al disparador", () => {
    const disparador = crearBoton({ texto: "avatar" });
    montar(disparador);
    const espia = vi.spyOn(disparador, "focus");
    const { rerender } = usar({ activo: true, triggerRef: { current: disparador } });

    rerender({ activo: false, triggerRef: { current: disparador } });

    expect(espia).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(disparador);
  });

  it("re-renders posteriores al cierre no repiten la devolución", () => {
    const disparador = crearBoton({ texto: "avatar" });
    montar(disparador);
    const espia = vi.spyOn(disparador, "focus");
    const { rerender } = usar({ activo: true, triggerRef: { current: disparador } });

    rerender({ activo: false, triggerRef: { current: disparador } });
    rerender({ activo: false, triggerRef: { current: disparador } });
    rerender({ activo: false, triggerRef: { current: { current: disparador } } });

    expect(espia).toHaveBeenCalledTimes(1);
  });

  it("cerrar sin haber abierto (activo inicial false) ejecuta cero devoluciones", () => {
    const disparador = crearBoton({ etiquetaAria: "Abrir menú" });
    montar(disparador);
    const espia = vi.spyOn(disparador, "focus");
    const { rerender } = usar({ activo: false, triggerRef: { current: disparador } });

    rerender({ activo: false, triggerRef: { current: disparador } });

    expect(espia).not.toHaveBeenCalled();
  });

  it("con StrictMode, el montaje abierto solo captura y el cierre devuelve una vez", () => {
    const disparador = crearBoton({ texto: "avatar" });
    montar(disparador);
    const espia = vi.spyOn(disparador, "focus");
    const { rerender } = renderHook(
      ({ activo, triggerRef }) => useRetornoDeFoco({ activo, triggerRef }),
      {
        initialProps: { activo: true, triggerRef: { current: disparador } },
        wrapper: StrictMode,
      }
    );

    expect(espia).not.toHaveBeenCalled();

    rerender({ activo: false, triggerRef: { current: disparador } });

    expect(espia).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(disparador);
  });
});

describe("useRetornoDeFoco — captura incondicional al abrir (RF-03)", () => {
  it("captura sin triggerRef y devuelve el foco al elemento activo previo", () => {
    const capturado = crearBoton({ texto: "capturado" });
    montar(capturado);
    capturado.focus();
    const espia = vi.spyOn(capturado, "focus");

    const { rerender } = usar({ activo: true });
    rerender({ activo: false });

    expect(espia).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(capturado);
  });

  it("captura al abrir aunque el candidato null previsto esté desconectado", () => {
    const capturado = crearBoton({ texto: "capturado" });
    const desconectado = crearBoton({ texto: "fuera del DOM" });
    montar(capturado);
    capturado.focus();
    const espiaDesconectado = vi.spyOn(desconectado, "focus");

    ejercerTransicion({ current: desconectado });

    expect(espiaDesconectado).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(capturado);
  });

  it("con el foco en body al abrir, body se descarta y se usa el respaldo móvil", () => {
    const menu = crearBoton({ etiquetaAria: "Abrir menú" });
    montar(menu);
    const espiaMenu = vi.spyOn(menu, "focus");

    ejercerTransicion({ current: null });

    expect(espiaMenu).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(menu);
  });
});

describe("useRetornoDeFoco — cadena determinista (RF-04/AC-24)", () => {
  it("continúa cuando el disparador es null", () => {
    const capturado = crearBoton({ texto: "capturado" });
    montar(capturado);
    capturado.focus();

    ejercerTransicion({ current: null });

    expect(document.activeElement).toBe(capturado);
  });

  it("continúa cuando el disparador es document.body", () => {
    const capturado = crearBoton({ texto: "capturado" });
    montar(capturado);
    capturado.focus();

    ejercerTransicion({ current: document.body });

    expect(document.activeElement).toBe(capturado);
  });

  it("continúa cuando el disparador está desconectado", () => {
    const capturado = crearBoton({ texto: "capturado" });
    const desconectado = crearBoton({ texto: "fuera del DOM" });
    montar(capturado);
    capturado.focus();

    ejercerTransicion({ current: desconectado });

    expect(document.activeElement).toBe(capturado);
  });

  it("continúa cuando el disparador conectado está disabled", () => {
    const capturado = crearBoton({ texto: "capturado" });
    const deshabilitado = crearBoton({ texto: "disabled", disabled: true });
    montar(capturado, deshabilitado);
    capturado.focus();
    const espiaDeshabilitado = vi.spyOn(deshabilitado, "focus");

    ejercerTransicion({ current: deshabilitado });

    expect(espiaDeshabilitado).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(capturado);
  });

  it("continúa cuando el disparador está dentro de un subárbol inert", () => {
    const capturado = crearBoton({ texto: "capturado" });
    const inerte = document.createElement("div");
    inerte.setAttribute("inert", "");
    const disparadorInerte = crearBoton({ texto: "inerte" });
    inerte.appendChild(disparadorInerte);
    montar(capturado, inerte);
    capturado.focus();

    ejercerTransicion({ current: disparadorInerte });

    expect(document.activeElement).toBe(capturado);
  });

  it("continúa cuando el disparador está dentro de un subárbol aria-hidden", () => {
    const capturado = crearBoton({ texto: "capturado" });
    const oculto = document.createElement("div");
    oculto.setAttribute("aria-hidden", "true");
    const disparadorOculto = crearBoton({ texto: "oculto" });
    oculto.appendChild(disparadorOculto);
    montar(capturado, oculto);
    capturado.focus();

    ejercerTransicion({ current: disparadorOculto });

    expect(document.activeElement).toBe(capturado);
  });

  it("continúa cuando el candidato conectado no queda enfocado (div sin tabindex)", () => {
    const capturado = crearBoton({ texto: "capturado" });
    const noEnfocable = document.createElement("div");
    noEnfocable.textContent = "no enfocable";
    montar(capturado, noEnfocable);
    capturado.focus();
    const espiaNoEnfocable = vi.spyOn(noEnfocable, "focus");

    ejercerTransicion({ current: noEnfocable });

    expect(espiaNoEnfocable).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(capturado);
  });

  it("con toda la cadena inválida usa el respaldo y nunca deja el foco en body", () => {
    const menu = crearBoton({ etiquetaAria: "Abrir menú" });
    montar(menu);
    const deshabilitado = crearBoton({ texto: "disabled", disabled: true });
    montar(deshabilitado);
    const espiaMenu = vi.spyOn(menu, "focus");

    ejercerTransicion({ current: document.body });

    expect(espiaMenu).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(menu);
    expect(document.activeElement).not.toBe(document.body);
  });
});

describe("useRetornoDeFoco — respaldo por versión de vista (RF-05/AC-06)", () => {
  it("móvil del dashboard: enfoca button[aria-label=\"Abrir menú\"]", () => {
    configurarViewport(375);
    const menu = crearBoton({ etiquetaAria: "Abrir menú" });
    montar(menu);
    const espiaMenu = vi.spyOn(menu, "focus");

    ejercerTransicion({ current: null });

    expect(espiaMenu).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(menu);
    expect(document.activeElement).not.toBe(document.body);
  });

  it("≥768px del dashboard: enfoca aside[role=\"navigation\"] button", () => {
    configurarViewport(1024);
    const { aside, boton } = crearLateral();
    montar(aside);
    const espiaBoton = vi.spyOn(boton, "focus");

    ejercerTransicion({ current: null });

    expect(espiaBoton).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(boton);
    expect(document.activeElement).not.toBe(document.body);
  });

  it("landing: primer control enfocable, excluyendo [role=\"dialog\"] y disabled", () => {
    configurarViewport(1024);
    const dialogo = document.createElement("div");
    dialogo.setAttribute("role", "dialog");
    const dentroDialogo = crearBoton({ texto: "X" });
    dialogo.appendChild(dentroDialogo);
    const deshabilitado = crearBoton({ texto: "disabled", disabled: true });
    const logo = document.createElement("a");
    logo.setAttribute("href", "/");
    logo.textContent = "FinApp";
    const accion = crearBoton({ texto: "Entrar" });
    montar(dialogo, deshabilitado, logo, accion);

    const espiaDialogo = vi.spyOn(dentroDialogo, "focus");
    const espiaDeshabilitado = vi.spyOn(deshabilitado, "focus");
    const espiaLogo = vi.spyOn(logo, "focus");

    ejercerTransicion({ current: null });

    expect(espiaDialogo).not.toHaveBeenCalled();
    expect(espiaDeshabilitado).not.toHaveBeenCalled();
    expect(espiaLogo).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(logo);
    expect(document.activeElement).not.toBe(document.body);
  });

  it("resolverControlDeVista prioriza el control de la versión actual", () => {
    configurarViewport(375);
    const menu = crearBoton({ etiquetaAria: "Abrir menú" });
    const { aside, boton } = crearLateral();
    montar(menu, aside);

    expect(resolverControlDeVista(true)).toBe(menu);
    expect(resolverControlDeVista(false)).toBe(boton);
  });
});

describe("useRetornoDeFoco — limitación explícita sin candidato (AC-15/AC-23)", () => {
  it("el resolutor devuelve null sin control estable ni ningún enfocable", () => {
    const parrafo = document.createElement("p");
    parrafo.textContent = "vista sin controles";
    montar(parrafo);

    expect(resolverControlDeVista(true)).toBeNull();
    expect(resolverControlDeVista(false)).toBeNull();
  });

  it("la transición sin ningún candidato no enfoca ni lanza excepción", () => {
    const parrafo = document.createElement("p");
    parrafo.textContent = "vista sin controles";
    montar(parrafo);

    expect(() => ejercerTransicion({ current: null })).not.toThrow();

    expect(document.activeElement).toBe(document.body);
  });
});

describe("useRetornoDeFoco — precedencia del disparador (AC-05)", () => {
  it("con triggerRef conectado devuelve el foco a ese nodo y no al respaldo", () => {
    const disparador = crearBoton({ texto: "avatar" });
    const menu = crearBoton({ etiquetaAria: "Abrir menú" });
    const capturado = crearBoton({ texto: "capturado" });
    montar(disparador, menu, capturado);
    capturado.focus();
    const espiaDisparador = vi.spyOn(disparador, "focus");
    const espiaMenu = vi.spyOn(menu, "focus");
    const espiaCapturado = vi.spyOn(capturado, "focus");

    ejercerTransicion({ current: disparador });

    expect(espiaDisparador).toHaveBeenCalledTimes(1);
    expect(espiaCapturado).not.toHaveBeenCalled();
    expect(espiaMenu).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(disparador);
  });

  it("con triggerRef desconectado cae al elemento capturado", () => {
    const capturado = crearBoton({ texto: "capturado" });
    const desconectado = crearBoton({ texto: "fuera del DOM" });
    montar(capturado);
    capturado.focus();

    ejercerTransicion({ current: desconectado });

    expect(document.activeElement).toBe(capturado);
  });

  it("sin triggerRef y sin captura válida cae al respaldo", () => {
    const menu = crearBoton({ etiquetaAria: "Abrir menú" });
    montar(menu);
    const espiaMenu = vi.spyOn(menu, "focus");

    const { rerender } = usar({ activo: true });
    rerender({ activo: false });

    expect(espiaMenu).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(menu);
  });
});

describe("useRetornoDeFoco — firma sin props nuevas (RF-07)", () => {
  it("funciona solo con `activo` (triggerRef opcional)", () => {
    const capturado = crearBoton({ texto: "capturado" });
    montar(capturado);
    capturado.focus();

    const { rerender } = usar({ activo: true });
    rerender({ activo: false });

    expect(document.activeElement).toBe(capturado);
  });

  it("acepta la llamada sin argumentos y no lanza", () => {
    expect(() => renderHook(() => useRetornoDeFoco())).not.toThrow();
  });

  it("exporta el resolutor puro resolverControlDeVista", () => {
    expect(typeof resolverControlDeVista).toBe("function");
  });
});
