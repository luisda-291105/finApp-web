import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import GrupoConfiguracionCard from "../../../../../features/grupo/components/cards/GrupoConfiguracionCard";

vi.mock("../../../../../context/UsuarioActivoContext", () => ({
  useUsuarioActivo: () => ({
    usuario: { idUsuario: "usuario-prueba", nombre: "Ana" },
  }),
}));

vi.mock("../../../../../features/grupo/services/gruposService", () => ({
  obtenerGruposPorUsuario: vi.fn().mockResolvedValue([]),
  actualizarGrupo: vi.fn(),
  eliminarGrupo: vi.fn(),
  desvincularFuenteDeGrupo: vi.fn(),
  vincularFuenteAGrupo: vi.fn(),
}));

vi.mock("../../../../../services/fuenteServicio", () => ({
  obtenerFuentesPorUsuario: vi.fn().mockResolvedValue([]),
  crearFuente: vi.fn(),
}));

vi.mock("../../../../../services/telegramServicio", () => ({
  obtenerEstadoTelegram: vi.fn().mockResolvedValue({
    conectado: false,
    configurado: true,
    usuarioTelegram: "",
    nombreBot: "FinAppBot",
  }),
  crearEnlaceTelegram: vi.fn(),
  desvincularTelegram: vi.fn(),
}));

const almacen = new Map();
const resetLocalStorageMock = () => {
  almacen.clear();
  window.localStorage.getItem.mockImplementation((clave) =>
    almacen.has(clave) ? almacen.get(clave) : null,
  );
  window.localStorage.setItem.mockImplementation((clave, valor) => {
    almacen.set(clave, String(valor));
  });
  window.localStorage.clear.mockImplementation(() => almacen.clear());
};

afterEach(cleanup);
beforeEach(() => resetLocalStorageMock());

describe("GrupoConfiguracionCard", () => {
  it("minimiza y expande la tarjeta con el botón del título y persiste el estado", async () => {
    render(<GrupoConfiguracionCard />);
    const vacio = await screen.findByText(/Aún no tienes grupos/i);
    expect(vacio).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: /minimizar el grupo/i }),
    );
    expect(screen.queryByText(/Aún no tienes grupos/i)).toBeNull();
    expect(window.localStorage.getItem("finapp.config.grupoMinimizado")).toBe(
      "true",
    );

    await userEvent.click(
      screen.getByRole("button", { name: /expandir el grupo/i }),
    );
    expect(await screen.findByText(/Aún no tienes grupos/i)).toBeInTheDocument();
    expect(window.localStorage.getItem("finapp.config.grupoMinimizado")).toBe(
      "false",
    );
  });
});
