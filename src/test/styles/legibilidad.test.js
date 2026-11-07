import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const rutaCss = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "styles", "index.css");
const css = readFileSync(rutaCss, "utf8");

describe("legibilidad base de texto y formularios", () => {
  it("aumenta el tamaño de los textos compactos sin cambiar la escala base", () => {
    expect(css).toContain("--text-xs: 0.8125rem");
    expect(css).toContain("--text-sm: 0.9375rem");
  });

  it("usa una altura de línea holgada para el texto corrido", () => {
    const bloqueBody = css.match(/(?:^|\n)body\s*\{([\s\S]*?)\}/)?.[1];
    expect(bloqueBody).toContain("line-height: 1.6");
  });

  it("fija los controles en 16px para evitar el zoom automático y mejorar la lectura", () => {
    const bloque = css.match(/input,\s*select,\s*textarea\s*\{([\s\S]*?)\}/)?.[1];
    expect(bloque).toContain("font-size: 1rem");
    expect(bloque).toContain("line-height: 1.5");
  });

  it("hace visibles los placeholders con el token de texto secundario y opacidad completa", () => {
    const bloque = css.match(/input::placeholder,\s*textarea::placeholder\s*\{([\s\S]*?)\}/)?.[1];
    expect(bloque).toContain("color: var(--color-slate-text)");
    expect(bloque).toContain("opacity: 1");
  });
});
