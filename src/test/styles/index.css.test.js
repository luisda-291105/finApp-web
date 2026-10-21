import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const rutaCss = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "styles", "index.css");
const css = readFileSync(rutaCss, "utf8");
const rutaHtml = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "index.html");
const html = readFileSync(rutaHtml, "utf8");

describe("RF2 — prefers-reduced-transparency en index.css", () => {
  it("existe el bloque @media (prefers-reduced-transparency: reduce)", () => {
    expect(css).toContain("@media (prefers-reduced-transparency: reduce)");
  });

  it("fija fondo semisólido y desactiva backdrop-filter en .glass-hero", () => {
    const bloque = css.match(/@media \(prefers-reduced-transparency: reduce\)\s*\{([\s\S]*?)\n\}/);
    expect(bloque?.[1]).toContain(".glass-hero");
    expect(bloque?.[1]).toContain("rgba(15, 17, 23, 0.92)");
    expect(bloque?.[1]).toContain("backdrop-filter: none");
    expect(bloque?.[1]).toContain("-webkit-backdrop-filter: none");
  });
});

describe("RF4 — prefers-reduced-motion en index.css", () => {
  it("existe el bloque @media (prefers-reduced-motion: reduce)", () => {
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
  });

  it("muestra .reveal, .reveal-left y .reveal-stagger > * sin transformaciones ni transiciones", () => {
    const bloque = css.match(/@media \(prefers-reduced-motion: reduce\)\s*\{([\s\S]*?)\n\}/);
    expect(bloque).not.toBeNull();
    expect(bloque?.[1]).toContain(".reveal");
    expect(bloque?.[1]).toContain(".reveal-left");
    expect(bloque?.[1]).toContain(".reveal-stagger > *");
    expect(bloque?.[1]).toContain("opacity: 1");
    expect(bloque?.[1]).toContain("transform: none");
    expect(bloque?.[1]).toContain("transition: none");
  });
});

describe("RF3 — hover de glass-card solo en dispositivos con hover", () => {
  it("existe el bloque @media (hover: hover)", () => {
    expect(css).toContain("@media (hover: hover)");
  });

  it("el hover de .glass-card está dentro de la media query y no suelto", () => {
    const bloque = css.match(/@media \(hover: hover\)\s*\{([\s\S]*?)\n\}/);
    expect(bloque).not.toBeNull();
    expect(bloque?.[1]).toContain(".glass-card:hover");
    expect(bloque?.[1]).toContain("transform: translateY(-4px)");
    // Sin hover suelto fuera de la media query
    const sinBloque = css.replace(/@media \(hover: hover\)\s*\{[\s\S]*?\n\}/, "");
    expect(sinBloque).not.toContain(".glass-card:hover");
  });
});

describe("RF5 — blur reducido ≤ 640px en index.css", () => {
  it("existe el bloque @media (max-width: 640px)", () => {
    expect(css).toContain("@media (max-width: 640px)");
  });

  it("fija el blur de .glass-hero entre 12px y 16px sin tocar saturate()", () => {
    const bloque = css.match(/@media \(max-width: 640px\)\s*\{([\s\S]*?)\n\}/);
    expect(bloque).not.toBeNull();
    expect(bloque?.[1]).toContain(".glass-hero");
    expect(bloque?.[1]).toMatch(/backdrop-filter: blur\((1[2-6])px\) saturate\(180%\)/);
    expect(bloque?.[1]).toMatch(/-webkit-backdrop-filter: blur\((1[2-6])px\) saturate\(180%\)/);
  });
});

describe("RF7 — escalonado con --i en index.css", () => {
  it("no quedan reglas nth-child de stagger", () => {
    expect(css).not.toMatch(/reveal-stagger[^{]*:nth-child/);
  });

  it("aplica transition-delay: calc(var(--i, 0) * 90ms) en el estado revelado", () => {
    const bloque = css.match(/\.reveal-stagger\.revealed > \*\s*\{([\s\S]*?)\}/);
    expect(bloque).not.toBeNull();
    expect(bloque?.[1]).toContain("transition-delay: calc(var(--i, 0) * 90ms)");
  });
});

describe("RF8 — fallback sin JS en index.css e index.html", () => {
  it("index.html añade la clase js en <html> con un script inline", () => {
    expect(html).toMatch(/<script>[^<]*classList\.add\(\s*["']js["']\s*\)[^<]*<\/script>/);
  });

  it("las reglas de ocultamiento de reveal solo aplican bajo .js", () => {
    expect(css).toContain(".js .reveal");
    expect(css).toContain(".js .reveal-left");
    expect(css).toContain(".js .reveal-stagger > *");
  });

  it("no hay regla .reveal suelta que oculte por defecto", () => {
    expect(css).not.toMatch(/^\.reveal\s*\{/m);
    expect(css).not.toMatch(/^\.reveal-left\s*\{/m);
    expect(css).not.toMatch(/^\.reveal-stagger > \*\s*\{/m);
  });
});

describe("RF9 — :focus-visible con tokens en interactivos Glass", () => {
  it("existe una regla :focus-visible", () => {
    expect(css).toContain(":focus-visible");
  });

  it("usa el anillo mint-accent sobre superficies oscuras y emerald-primary sobre crema", () => {
    const bloque = css.match(/:focus-visible\s*\{[\s\S]*?\}/g) ?? [];
    const conjunto = bloque.join("\n");
    expect(conjunto).toContain("var(--color-mint-accent)");
    expect(conjunto).toContain("var(--color-emerald-primary)");
    expect(css).toMatch(/outline:\s*3px/);
  });
});

describe("RF1 — fallback @supports not en index.css", () => {
  it("aplica el fallback solo cuando ni backdrop-filter ni -webkit-backdrop-filter soportan", () => {
    expect(css).toContain(
      "@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)))",
    );
  });

  it("mantiene el fondo semisólido dentro del fallback", () => {
    const bloque = css.match(/@supports not[^{]*\{[\s\S]*?\n\}/);
    expect(bloque?.[0]).toContain("rgba(15, 17, 23, 0.88)");
  });
});

describe("RF10 — bloques presentes en index.css", () => {
  it("el fuente contiene @supports y las media queries relevantes", () => {
    expect(css).toContain("@supports");
    expect(css).toContain("@media (prefers-reduced-transparency: reduce)");
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(css).toContain("@media (hover: hover)");
    expect(css).toContain("@media (max-width: 640px)");
  });

  it("el fuente contiene el escalonado con --i y :focus-visible", () => {
    expect(css).toContain("calc(var(--i, 0) * 90ms)");
    expect(css).toContain(":focus-visible");
  });
});

describe("BottomNav — etiquetas en landscape (CSS global en index.css)", () => {
  it("define .bottom-nav-label como bloque", () => {
    const bloque = css.match(/\.bottom-nav-label\s*\{([\s\S]*?)\}/);
    expect(bloque).not.toBeNull();
    expect(bloque?.[1]).toContain("display: block");
  });

  it("oculta .bottom-nav-label dentro de @media (orientation: landscape)", () => {
    const bloque = css.match(/@media \(orientation: landscape\)\s*\{([\s\S]*?)\n\}/);
    expect(bloque).not.toBeNull();
    expect(bloque?.[1]).toContain(".bottom-nav-label");
    expect(bloque?.[1]).toContain("display: none");
  });
});

describe("013 — superficies de vidrio y H-1", () => {
  const reglaDe = (texto, selector) => {
    const escapado = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return texto?.match(new RegExp(`${escapado}\\s*\\{([\\s\\S]*?)\\}`))?.[1];
  };
  const declaracion = (bloque, propiedad) =>
    (bloque ?? "")
      .split("\n")
      .map((linea) => linea.trim())
      .filter((linea) => linea.startsWith(`${propiedad}:`))
      .join("\n");
  const bloquePequeno = () =>
    css.match(/@media \(max-width: 640px\)\s*\{([\s\S]*?)\n\}/)?.[1];
  const bloqueTransparencia = () =>
    css.match(/@media \(prefers-reduced-transparency: reduce\)\s*\{([\s\S]*?)\n\}/)?.[1];

  it(".glass-surface existe y declara solo el filtro, sin fondo, radio ni sombra", () => {
    const regla = reglaDe(css, ".glass-surface");
    expect(regla).toBeDefined();
    expect(regla).not.toMatch(/(?:^|\s)background(?:-|:)/);
    expect(regla).not.toContain("border-radius");
    expect(regla).not.toContain("box-shadow");
  });

  it(">640px: backdrop-filter de .glass-surface usa blur 20–30px y saturación 160–200 %", () => {
    const filtro = declaracion(reglaDe(css, ".glass-surface"), "backdrop-filter");
    expect(filtro).not.toBe("");
    expect(filtro).toMatch(/blur\((?:2\d|30)px\)/);
    expect(filtro).toMatch(/saturate\((?:1[6-9]\d|200)%\)/);
  });

  it(">640px: -webkit-backdrop-filter de .glass-surface usa blur 20–30px y saturación 160–200 %", () => {
    const filtro = declaracion(reglaDe(css, ".glass-surface"), "-webkit-backdrop-filter");
    expect(filtro).not.toBe("");
    expect(filtro).toMatch(/blur\((?:2\d|30)px\)/);
    expect(filtro).toMatch(/saturate\((?:1[6-9]\d|200)%\)/);
  });

  it("≤640px: .glass-surface reduce el blur a 12–16px en ambos prefijos", () => {
    const filtros = reglaDe(bloquePequeno(), ".glass-surface")?.match(
      /backdrop-filter:\s*blur\([^)]+\)\s+saturate\([^)]+\)/g,
    ) ?? [];
    expect(filtros).toHaveLength(2);
    filtros.forEach((filtro) => expect(filtro).toMatch(/blur\((?:1[2-6])px\)/));
  });

  it("≤640px: .glass-surface mantiene saturate(180%) intacta", () => {
    const filtros = reglaDe(bloquePequeno(), ".glass-surface")?.match(
      /backdrop-filter:\s*blur\([^)]+\)\s+saturate\([^)]+\)/g,
    ) ?? [];
    expect(filtros).toHaveLength(2);
    filtros.forEach((filtro) => expect(filtro).toContain("saturate(180%)"));
  });

  it("la transparencia reducida se declara después del ajuste de ≤640px (prevalece)", () => {
    expect(css.indexOf("@media (max-width: 640px)"))
      .toBeLessThan(css.indexOf("@media (prefers-reduced-transparency: reduce)"));
  });

  it("la transparencia reducida desactiva el blur de .glass-surface", () => {
    expect(declaracion(reglaDe(bloqueTransparencia(), ".glass-surface"), "backdrop-filter"))
      .toBe("backdrop-filter: none;");
  });

  it("la transparencia reducida desactiva también el prefijo -webkit- de .glass-surface", () => {
    expect(declaracion(reglaDe(bloqueTransparencia(), ".glass-surface"), "-webkit-backdrop-filter"))
      .toBe("-webkit-backdrop-filter: none;");
  });

  it("el none de transparencia reducida queda después de los contextos >640px y ≤640px", () => {
    const reglaBase = css.match(/\.glass-surface\s*\{[\s\S]*?\}/)?.[0];
    const mediaPequena = css.match(/@media \(max-width: 640px\)\s*\{[\s\S]*?\n\}/)?.[0];
    const mediaTransparencia = css.match(/@media \(prefers-reduced-transparency: reduce\)\s*\{[\s\S]*?\n\}/)?.[0];
    expect(reglaBase).toBeDefined();
    expect(mediaPequena).toBeDefined();
    expect(mediaTransparencia).toBeDefined();
    expect(css.indexOf(mediaTransparencia)).toBeGreaterThan(css.indexOf(reglaBase));
    expect(css.indexOf(mediaTransparencia)).toBeGreaterThan(css.indexOf(mediaPequena));
  });
});

describe("013 — área segura", () => {
  it(".safe-bottom reserva env(safe-area-inset-bottom con respaldo de 1rem", () => {
    const regla = css.match(/\.safe-bottom\s*\{([\s\S]*?)\}/)?.[1];
    expect(regla).toBeDefined();
    expect(regla).toContain("padding-bottom");
    expect(regla).toContain("env(safe-area-inset-bottom");
    expect(regla).toContain("1rem");
  });
});

describe("013 — tokens, literales y tarjeta sólida", () => {
  it("los tres literales con token equivalente ya no aparecen", () => {
    expect(css).not.toContain("rgba(224, 221, 216, 0.8)");
    expect(css).not.toContain("rgba(15, 17, 23, 0.04)");
    expect(css).not.toContain("rgba(26, 122, 94, 0.12)");
  });

  it("los tres literales se resuelven con color-mix sobre tokens existentes", () => {
    expect(css).toContain(
      "color-mix(in srgb, var(--color-border-line) 80%, transparent)",
    );
    expect(css).toContain(
      "color-mix(in srgb, var(--color-bg-dark) 4%, transparent)",
    );
    expect(css).toContain(
      "color-mix(in srgb, var(--color-emerald-primary) 12%, transparent)",
    );
  });

  it("--color-bg-dark-mid y --color-bg-dark-end se han retirado", () => {
    expect(css).not.toContain("--color-bg-dark-mid");
    expect(css).not.toContain("--color-bg-dark-end");
  });

  it("--header-height se ha retirado del tema", () => {
    expect(css).not.toContain("--header-height");
  });

  it("--color-cat-savings se conserva con su comentario de reserva", () => {
    expect(css).toMatch(
      /\/\* Reserva documentada de la paleta de categorías: sin consumidor hoy; no retirar\. \*\/\s*--color-cat-savings:/,
    );
  });

  it(".glass-card es sólida: declara #ffffff y no usa backdrop-filter", () => {
    const regla = css.match(/\.glass-card\s*\{([\s\S]*?)\}/)?.[1];
    expect(regla).toBeDefined();
    expect(regla).toContain("background: #ffffff;");
    expect(regla).not.toContain("backdrop-filter");
  });
});
