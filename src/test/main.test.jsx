/**
 * @uso        Verifica que main.jsx monta la app con las future flags v7 de React Router
 * @funciones  test "monta BrowserRouter con v7_startTransition y v7_relativeSplatPath"
 * @datos      Mock de react-dom/client para capturar el árbol renderizado
 * @eventos    N/A
 * @estados    N/A
 * @usadoPor   vitest (npm run test)
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";

const { renderSpy, createRootSpy } = vi.hoisted(() => {
  const renderSpy = vi.fn();
  return {
    renderSpy,
    createRootSpy: vi.fn(() => ({ render: renderSpy })),
  };
});

vi.mock("react-dom/client", () => ({ createRoot: createRootSpy }));

describe("main.jsx", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="root"></div>';
    renderSpy.mockClear();
    createRootSpy.mockClear();
  });

  it("monta BrowserRouter con las future flags v7 activadas", async () => {
    await import("./main.jsx");

    expect(createRootSpy).toHaveBeenCalledWith(document.getElementById("root"));
    expect(renderSpy).toHaveBeenCalledTimes(1);

    const arbol = renderSpy.mock.calls[0][0]; // <StrictMode>
    const router = arbol.props.children; // <BrowserRouter>
    expect(router.type).toBe(BrowserRouter);
    expect(router.props.future).toEqual({
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    });
  });
});
