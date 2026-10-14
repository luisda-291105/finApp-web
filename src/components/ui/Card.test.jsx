/**
 * @uso        Pruebas unitarias para el componente Card
 * @funciones  test "renderiza children", test "aplica clase base glass-card", test "respeta como article", test "combina className"
 * @datos      N/A
 * @eventos    N/A
 * @estados    N/A
 * @usadoPor   vitest (npm run test)
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Card } from "./Card";

describe("Card", () => {
  it("renderiza children correctamente", () => {
    render(<Card>Contenido de prueba</Card>);

    expect(screen.getByText("Contenido de prueba")).toBeDefined();
  });

  it("aplica la clase base glass-card", () => {
    render(<Card>Contenido</Card>);

    const card = screen.getByText("Contenido").closest(".glass-card");
    expect(card).toBeDefined();
    expect(card.classList.contains("glass-card")).toBe(true);
  });

  it("respeta prop como='article' y renderiza <article>", () => {
    render(<Card como="article">Contenido</Card>);

    const article = screen.getByText("Contenido").closest("article");
    expect(article).toBeDefined();
    expect(article.tagName).toBe("ARTICLE");
  });

  it("combina className pasada con la clase base", () => {
    render(<Card className="p-5 custom-class">Contenido</Card>);

    const card = screen.getByText("Contenido").closest(".glass-card");
    expect(card).toBeDefined();
    const clases = card.getAttribute("class") || "";
    expect(clases).toContain("glass-card");
    expect(clases).toContain("p-5");
    expect(clases).toContain("custom-class");
  });
});