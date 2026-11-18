/**
 * @uso        Riel de medición de la landing: nombres de sección a la derecha, centrados verticalmente, sin fondo; resalta la sección próxima y oculta la posicionada
 * @funciones  Regla({ alCambiarSeccion })
 * @datos      SECCIONES (id, titulo, tono); una entrada (botón) por sección, espaciadas de forma pareja
 * @eventos    scroll/resize/load en window (opacidad por geometría gaussiana); click en una marca (scrollIntoView); alCambiarSeccion(titulo) al cambiar la sección posicionada
 * @estados    data-tone del nav vía ref (light/dark según la sección); activo (number, índice posicionado, oculto del riel); refs a etiquetas y botones — opacidad vía refs en scroll
 * @usadoPor   LandingLayout
 */
import { useEffect, useRef, useState } from "react";

const SECCIONES = [
  { id: "inicio", titulo: "Inicio", tono: "light", destino: "titulo-inicio" },
  {
    id: "funcionalidades",
    titulo: "Funcionalidades",
    tono: "dark",
    destino: "titulo-funcionalidades",
  },
  {
    id: "como-funciona",
    titulo: "Cómo funciona",
    tono: "dark",
    destino: "titulo-como-funciona",
  },
  { id: "empezar", titulo: "Empezar", tono: "light", destino: "titulo-empezar" },
];

const S = SECCIONES.length;

/**
 * Regla
 * Riel fijo en el borde derecho, centrado verticalmente y sin fondo. Lista los nombres de las
 * secciones: la entrada de la sección posicionada se oculta del riel (se muestra en el header) y
 * el resto aparece atenuada, con la proximidad a la posición de lectura como resalte. Click navega.
 */
export default function Regla({ alCambiarSeccion }) {
  const navRef = useRef(null);
  const etiquetasRef = useRef([]);
  const botonesRef = useRef([]);
  const [activo, setActivo] = useState(0);
  const activoRef = useRef(0);
  const notificarRef = useRef(alCambiarSeccion);
  notificarRef.current = alCambiarSeccion;

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return undefined;

    const topes = () =>
      SECCIONES.map((seccion) => {
        const el = document.getElementById(seccion.id);
        return el ? el.getBoundingClientRect().top + window.scrollY : 0;
      });

    const update = () => {
      const y = window.scrollY + window.innerHeight * 0.5;
      const t = topes();

      let s = 0;
      for (let j = 0; j < S; j += 1) {
        if (t[j] <= y) s = j;
      }

      const atEnd =
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 4;

      let p;
      if (atEnd) {
        s = S - 1;
        p = S - 1;
      } else {
        const a = t[s];
        const elActual = document.getElementById(SECCIONES[s].id);
        const b = s + 1 < S ? t[s + 1] : a + (elActual?.offsetHeight ?? 1);
        const f = Math.min(1, Math.max(0, (y - a) / Math.max(b - a, 1)));
        p = Math.min(Math.max(s + f, 0), S - 1);
      }

      nav.dataset.tone = SECCIONES[s].tono;

      if (s !== activoRef.current) {
        activoRef.current = s;
        // Transición de movimiento: una copia del nombre viaja desde su marca en la regla
        // hasta el título visible del componente (h1/h2 de la sección) y se funde con él
        const soportaAnimate =
          typeof Element !== "undefined" &&
          typeof Element.prototype.animate === "function";
        const desde = botonesRef.current[s];
        const destino = document.getElementById(SECCIONES[s].destino);
        const r2 = destino?.getBoundingClientRect();
        const destinoVisible =
          r2 && r2.bottom > 0 && r2.top < window.innerHeight;
        if (
          desde &&
          destino &&
          destinoVisible &&
          soportaAnimate &&
          !window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ) {
          const r1 = desde.getBoundingClientRect();
          const dx =
            r2.left + r2.width / 2 - (r1.left + r1.width / 2);
          const dy =
            r2.top + r2.height / 2 - (r1.top + r1.height / 2);
          const colorOrigen = getComputedStyle(desde).color;
          const clon = document.createElement("span");
          clon.textContent = SECCIONES[s].titulo;
          Object.assign(clon.style, {
            position: "fixed",
            left: `${r1.left}px`,
            top: `${r1.top + r1.height / 2}px`,
            font: "600 0.78rem/1 var(--font-body)",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
            color: colorOrigen,
            zIndex: 1300,
            pointerEvents: "none",
          });
          document.body.appendChild(clon);
          const anim = clon.animate(
            [
              {
                transform: "translate(0px, -50%) scale(1)",
                opacity: 1,
                color: colorOrigen,
              },
              {
                transform: `translate(${dx}px, calc(-50% + ${dy}px)) scale(1.5)`,
                opacity: 0.9,
                offset: 0.7,
              },
              {
                transform: `translate(${dx}px, calc(-50% + ${dy}px)) scale(1.5)`,
                opacity: 0,
              },
            ],
            {
              duration: 700,
              easing: "cubic-bezier(0.22, 1, 0.36, 1)",
              fill: "forwards",
            },
          );
          anim.onfinish = () => clon.remove();
        }
        setActivo(s);
        notificarRef.current?.(SECCIONES[s].titulo);
      }

      for (let i = 0; i < S; i += 1) {
        const d = Math.abs(i - p);
        const g = Math.exp(-(d * d) / (2 * 0.9 * 0.9));
        const op = Math.min(1, Math.max(0.28, 0.28 + 0.72 * g));
        const lab = etiquetasRef.current[i];
        if (lab) lab.style.opacity = op.toFixed(3);
      }
    };

    let ticking = false;
    const req = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        update();
      });
    };

    window.addEventListener("scroll", req, { passive: true });
    window.addEventListener("resize", req);
    window.addEventListener("load", update);
    window.addEventListener("pageshow", update);
    // Las fuentes cargan después del layout inicial y desplazan las secciones
    if (document.fonts?.ready) document.fonts.ready.then(update).catch(() => {});
    // Respaldo para la restauración de scroll del navegador tras recargar
    const respaldo = window.setTimeout(update, 500);
    update();

    return () => {
      window.removeEventListener("scroll", req);
      window.removeEventListener("resize", req);
      window.removeEventListener("load", update);
      window.removeEventListener("pageshow", update);
      window.clearTimeout(respaldo);
    };
  }, []);

  return (
    <nav
      ref={navRef}
      className="regla"
      data-tone="light"
      aria-label="Secciones de la landing"
    >
      {SECCIONES.map(({ id, titulo }, i) => {
        const esActual = i === activo;
        return (
          <button
            key={id}
            ref={(el) => {
              botonesRef.current[i] = el;
            }}
            type="button"
            className={`regla-marca${esActual ? " es-actual" : ""}`}
            aria-label={`Ir a ${titulo}`}
            aria-hidden={esActual ? "true" : undefined}
            tabIndex={esActual ? -1 : undefined}
            onClick={() =>
              document.getElementById(id)?.scrollIntoView({
                behavior: window.matchMedia(
                  "(prefers-reduced-motion: reduce)",
                ).matches
                  ? "auto"
                  : "smooth",
              })
            }
          >
            <span
              ref={(el) => {
                etiquetasRef.current[i] = el;
              }}
              aria-hidden="true"
              className="regla-etiqueta"
            >
              {titulo}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
