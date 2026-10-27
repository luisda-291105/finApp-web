/**
 * @uso        Pruebas del modal de perfil (spec 024): datos del usuario activo, correo/teléfono fijos,
 *             modo de modificación limitado y guardado contra el servicio
 * @funciones  render, screen, waitFor, within
 * @datos      Usuario activo de prueba en localStorage; respuesta simulada de actualizarUsuario
 * @eventos    Apertura del modal, clic en «Modificar» y submit de «Guardar cambios»
 * @estados    Arnés controla la apertura y el triggerRef; el provider real aporta el usuario activo
 * @usadoPor   Vitest
 */
import { useRef, useState } from "react";
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ModalPerfilUsuario from "../../../../components/domain/modales/ModalPerfilUsuario";
import {
  UsuarioActivoProvider,
  useUsuarioActivo,
} from "../../../../context/UsuarioActivoContext";
import { actualizarUsuario } from "../../../../services/usuarioServicio";

vi.mock("../../../../services/usuarioServicio", () => ({
  actualizarUsuario: vi.fn(),
}));

const USUARIO = {
  idUsuario: "123456",
  nombre: "Ana Pérez",
  fechaCreacion: "2026-01-15",
};

function IndicadorUsuario() {
  const { usuario } = useUsuarioActivo();
  return <p data-testid="usuario-activo">{usuario?.nombre || ""}</p>;
}

function ArnesModalPerfil() {
  const [abierto, setAbierto] = useState(false);
  const triggerRef = useRef(null);

  return (
    <>
      <button ref={triggerRef} type="button" onClick={() => setAbierto(true)}>
        Abrir perfil
      </button>
      <IndicadorUsuario />
      <ModalPerfilUsuario
        abierto={abierto}
        alCerrar={() => setAbierto(false)}
        triggerRef={triggerRef}
      />
    </>
  );
}

const renderPerfil = () =>
  render(
    <UsuarioActivoProvider>
      <ArnesModalPerfil />
    </UsuarioActivoProvider>
  );

const abrirPerfil = async () => {
  renderPerfil();
  const usuario = userEvent.setup();
  await usuario.click(screen.getByRole("button", { name: "Abrir perfil" }));
  const dialogo = screen.getByRole("dialog", { name: "Perfil" });
  await waitFor(() => {
    expect(within(dialogo).getByLabelText("Nombre")).toHaveValue(USUARIO.nombre);
  });
  return { usuario, dialogo };
};

beforeEach(() => {
  window.localStorage.getItem.mockReturnValue(JSON.stringify(USUARIO));
  actualizarUsuario.mockResolvedValue({
    idUsuario: USUARIO.idUsuario,
    nombre: "Ana Actualizada",
    fechaCreacion: USUARIO.fechaCreacion,
  });
});

afterEach(() => {
  cleanup();
  actualizarUsuario.mockReset();
  window.localStorage.getItem.mockReset();
  window.localStorage.setItem.mockClear();
});

describe("ModalPerfilUsuario (perfil)", () => {
  it("abre con los datos del usuario activo y la contraseña vacía", async () => {
    const { dialogo } = await abrirPerfil();

    expect(within(dialogo).getByLabelText("Cédula / Identificación")).toHaveValue(
      USUARIO.idUsuario,
    );
    expect(within(dialogo).getByLabelText("Nombre")).toHaveValue(USUARIO.nombre);
    expect(within(dialogo).getByLabelText("Contraseña")).toHaveValue("");
    expect(dialogo).toHaveAttribute("aria-modal", "true");
  });

  it("muestra Correo y Teléfono como «No registrado» y no son editables", async () => {
    const { dialogo } = await abrirPerfil();

    const correo = within(dialogo).getByLabelText("Correo");
    const telefono = within(dialogo).getByLabelText("Teléfono");

    expect(correo).toHaveValue("No registrado");
    expect(telefono).toHaveValue("No registrado");
    expect(correo).toHaveAttribute("readonly");
    expect(telefono).toHaveAttribute("readonly");
    expect(correo).toHaveAttribute("tabindex", "-1");
    expect(telefono).toHaveAttribute("tabindex", "-1");
  });

  it("«Modificar» habilita solo Cédula/Identificación, Nombre y Contraseña", async () => {
    const { usuario, dialogo } = await abrirPerfil();

    const idUsuario = within(dialogo).getByLabelText("Cédula / Identificación");
    const nombre = within(dialogo).getByLabelText("Nombre");
    const contrasena = within(dialogo).getByLabelText("Contraseña");
    const correo = within(dialogo).getByLabelText("Correo");
    const telefono = within(dialogo).getByLabelText("Teléfono");

    // Antes de modificar, los tres campos son de solo lectura
    expect(idUsuario).toHaveAttribute("readonly");
    expect(nombre).toHaveAttribute("readonly");
    expect(contrasena).toHaveAttribute("readonly");

    await usuario.click(within(dialogo).getByRole("button", { name: "Modificar" }));

    expect(idUsuario).not.toHaveAttribute("readonly");
    expect(nombre).not.toHaveAttribute("readonly");
    expect(contrasena).not.toHaveAttribute("readonly");
    expect(correo).toHaveAttribute("readonly");
    expect(telefono).toHaveAttribute("readonly");
    expect(contrasena).toHaveAttribute("placeholder", "Nueva contraseña");
    expect(within(dialogo).getByRole("button", { name: "Guardar cambios" })).toBeInTheDocument();
    expect(within(dialogo).queryByRole("button", { name: "Modificar" })).toBeNull();
  });

  it("guardar llama a actualizarUsuario con el id original y sincroniza el contexto", async () => {
    const { usuario, dialogo } = await abrirPerfil();

    await usuario.click(within(dialogo).getByRole("button", { name: "Modificar" }));

    const nombre = within(dialogo).getByLabelText("Nombre");
    await usuario.clear(nombre);
    await usuario.type(nombre, "Ana Actualizada");

    await usuario.click(within(dialogo).getByRole("button", { name: "Guardar cambios" }));

    await waitFor(() => {
      expect(actualizarUsuario).toHaveBeenCalledWith(
        USUARIO.idUsuario,
        expect.objectContaining({
          idUsuario: USUARIO.idUsuario,
          nombre: "Ana Actualizada",
          contrasena: "",
          fechaCreacion: USUARIO.fechaCreacion,
        }),
      );
    });

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    expect(screen.getByTestId("usuario-activo")).toHaveTextContent("Ana Actualizada");
    expect(window.localStorage.setItem).toHaveBeenCalled();
  });

  it("no guarda la contraseña en localStorage al sincronizar el contexto", async () => {
    const espiaSetItem = vi.spyOn(window.localStorage, "setItem");
    const { usuario, dialogo } = await abrirPerfil();

    await usuario.click(within(dialogo).getByRole("button", { name: "Modificar" }));
    await usuario.type(within(dialogo).getByLabelText("Contraseña"), "secreto123");
    await usuario.click(within(dialogo).getByRole("button", { name: "Guardar cambios" }));

    await waitFor(() => expect(espiaSetItem).toHaveBeenCalled());

    const valores = espiaSetItem.mock.calls.map(([, valor]) => String(valor));
    valores.forEach((valor) => {
      expect(valor).not.toContain("contrasena");
      expect(valor).not.toContain("secreto123");
    });

    const guardado = JSON.parse(valores.at(-1));
    expect(guardado).not.toHaveProperty("contrasena");
    expect(guardado.idUsuario).toBe(USUARIO.idUsuario);

    espiaSetItem.mockRestore();
  });

  it("si la actualización falla, registra el error, muestra role=alert y mantiene el modal abierto", async () => {
    actualizarUsuario.mockRejectedValueOnce(new Error("Error HTTP 409"));
    const espiaError = vi.spyOn(console, "error").mockImplementation(() => {});

    const { usuario, dialogo } = await abrirPerfil();

    await usuario.click(within(dialogo).getByRole("button", { name: "Modificar" }));
    await usuario.click(within(dialogo).getByRole("button", { name: "Guardar cambios" }));

    const alerta = await within(dialogo).findByRole("alert");
    expect(alerta).toHaveTextContent("Error HTTP 409");
    expect(screen.getByRole("dialog", { name: "Perfil" })).toBeInTheDocument();
    expect(espiaError).toHaveBeenCalled();

    espiaError.mockRestore();
  });
});
