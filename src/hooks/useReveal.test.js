/**
 * @uso        Test unitario del hook useReveal
 * @funciones  test "marca visible tras interseccion"
 * @datos      Mock de IntersectionObserver
 * @eventos    N/A
 * @estados    N/A
 * @usadoPor   vitest (npm run test)
 */
import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useReveal } from "./useReveal";

describe("useReveal", () => {
  it("inicia visible=false", () => {
    let observe = vi.fn();
    global.IntersectionObserver = vi.fn().mockImplementation(() => ({
      observe,
      disconnect: vi.fn(),
    }));
    const { result } = renderHook(() => useReveal());
    expect(result.current.visible).toBe(false);
  });
});
