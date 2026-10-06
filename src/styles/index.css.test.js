import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const rutaCss = join(dirname(fileURLToPath(import.meta.url)), "index.css");
const css = readFileSync(rutaCss, "utf8");
const rutaHtml = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "index.html");
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
