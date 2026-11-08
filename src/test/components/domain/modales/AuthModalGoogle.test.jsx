import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

const mocks = vi.hoisted(() => ({ iniciarLoginGoogle: vi.fn() }));
vi.mock("../../../../services/authGoogleServicio", () => ({
  GOOGLE_AUTH_CONFIGURADO: true,
  iniciarLoginGoogle: mocks.iniciarLoginGoogle,
}));

import AuthModal from "../../../../features/auth/components/modals/AuthModal";

describe("AuthModal — acceso con Google", () => {
  it("muestra el botón y comienza el flujo redirect al activarlo", async () => {
    const usuario = userEvent.setup();
    render(
      <MemoryRouter>
        <AuthModal abierto modoInicial="login" alCerrar={vi.fn()} />
      </MemoryRouter>
    );

    await usuario.click(screen.getByRole("button", { name: "Iniciar sesión con Google" }));
    expect(mocks.iniciarLoginGoogle).toHaveBeenCalledOnce();
  });
});
