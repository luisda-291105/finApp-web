/**
 * @uso        Pruebas de GmailContext: desconexión idempotente ante 404 y resincronización
 * @funciones  render, screen, waitFor, userEvent
 * @datos      Servicios de Gmail simulados (cuentas, conexión y eliminación)
 * @eventos    Click en «Desconectar»
 * @estados    cuentasGmail y errorGmail del contexto
 * @usadoPor   Vitest
 */
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../services/gmailServicio", () => ({
  GMAIL_CONFIGURADO: false,
  canjearCodigoGmail: vi.fn(),
  eliminarCuentaGmail: vi.fn(),
  iniciarCodigoAutorizacionGmail: vi.fn(),
  listarCuentasGmail: vi.fn(),
  obtenerConexionCuentaGmail: vi.fn(),
  prepararGoogleIdentityServices: vi.fn(),
}));

vi.mock("../../context/UsuarioActivoContext", () => ({
  useUsuarioActivo: () => ({ usuario: { idUsuario: "u1" } }),
}));

import { GmailProvider, useGmail } from "../../context/GmailContext";
import * as gmailServicio from "../../services/gmailServicio";

function Consumidor({ idCuenta = "vieja" }) {
  const { cuentasGmail, errorGmail, desconectarGmail } = useGmail();
  return (
    <div>
      <span data-testid="cuentas">
        {cuentasGmail.map((cuenta) => cuenta.id).join(",")}
      </span>
      <span data-testid="error">{errorGmail}</span>
      <button type="button" onClick={() => desconectarGmail(true, idCuenta)}>
        Desconectar
      </button>
    </div>
  );
}

function montar(idCuenta) {
  return render(
    <GmailProvider>
      <Consumidor idCuenta={idCuenta} />
    </GmailProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  gmailServicio.obtenerConexionCuentaGmail.mockResolvedValue({
    connected: true,
    email: "a@correo.test",
  });
});

afterEach(() => {
  cleanup();
});

describe("GmailContext — desconectarGmail", () => {
  it("trata un 404 como desconexión ya hecha y resincroniza sin error", async () => {
    const usuario = userEvent.setup();
    gmailServicio.listarCuentasGmail
      .mockResolvedValueOnce([{ id: "vieja", email: "a@correo.test" }])
      .mockResolvedValueOnce([]);
    gmailServicio.eliminarCuentaGmail.mockRejectedValue(
      Object.assign(new Error("No se encontró esa cuenta Gmail."), {
        status: 404,
      }),
    );

    montar();
    await waitFor(() =>
      expect(screen.getByTestId("cuentas")).toHaveTextContent("vieja"),
    );

    await usuario.click(screen.getByRole("button", { name: "Desconectar" }));

    await waitFor(() =>
      expect(screen.getByTestId("cuentas")).toHaveTextContent(""),
    );
    expect(screen.getByTestId("error")).toHaveTextContent("");
    expect(gmailServicio.listarCuentasGmail).toHaveBeenCalledTimes(2);
  });

  it("conserva la cuenta y muestra el error cuando falla con otro estado", async () => {
    const usuario = userEvent.setup();
    gmailServicio.listarCuentasGmail.mockResolvedValue([
      { id: "vieja", email: "a@correo.test" },
    ]);
    gmailServicio.eliminarCuentaGmail.mockRejectedValue(
      Object.assign(new Error("No se pudo eliminar la conexión."), {
        status: 500,
      }),
    );

    montar();
    await waitFor(() =>
      expect(screen.getByTestId("cuentas")).toHaveTextContent("vieja"),
    );

    await usuario.click(screen.getByRole("button", { name: "Desconectar" }));

    await waitFor(() =>
      expect(screen.getByTestId("error")).toHaveTextContent(
        "No se pudo eliminar la conexión.",
      ),
    );
    expect(screen.getByTestId("cuentas")).toHaveTextContent("vieja");
  });
});
