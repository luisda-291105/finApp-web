/**
 * @uso        Pruebas del modal de perfil (spec 024): presentación, edición de los datos de contacto
 *             opcionales y guardado contra el servicio
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
import ModalPerfilUsuario from "../../../../features/configuracion/components/modals/PerfilUsuarioModal";
import {
  UsuarioActivoProvider,
  useUsuarioActivo,
} from "../../../../context/UsuarioActivoContext";
import { actualizarUsuario, crearUsuario, obtenerUsuarioActivo } from "../../../../features/auth/services";

vi.mock("../../../../features/auth/services", async (importOriginal) => ({
  ...(await importOriginal()),
  actualizarUsuario: vi.fn(),
  crearUsuario: vi.fn(),
  obtenerUsuarioActivo: vi.fn(),
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
  const dialogo = screen.getByRole("dialog", { name: "Mi perfil" });
  await waitFor(() => {
    expect(within(dialogo).getAllByText(USUARIO.nombre).length).toBeGreaterThan(0);
  });
  return { usuario, dialogo };
};

beforeEach(() => {
  window.localStorage.getItem.mockReturnValue(JSON.stringify(USUARIO));
  // Mock sessionStorage para que UsuarioActivoProvider crea que hay sesión activa
  window.sessionStorage.getItem.mockImplementation((key) =>
    key === "finapp_sesion_pestana" ? "activa" : null
  );
  // Mock obtenerUsuarioActivo para que devuelva el usuario (el provider lo llama al montarse)
  obtenerUsuarioActivo.mockResolvedValue({ datos: USUARIO });
  actualizarUsuario.mockResolvedValue({
    idUsuario: USUARIO.idUsuario,
    nombre: "Ana Actualizada",
    fechaCreacion: USUARIO.fechaCreacion,
  });
});

afterEach(() => {
  cleanup();
  actualizarUsuario.mockReset();
  crearUsuario.mockReset();
  obtenerUsuarioActivo.mockReset();
  window.localStorage.getItem.mockReset();
  window.localStorage.setItem.mockClear();
  window.sessionStorage.getItem.mockReset();
});

describe("ModalPerfilUsuario (perfil)", () => {
  it("abre con los datos del usuario activo y la contraseña vacía", async () => {
    const { dialogo } = await abrirPerfil();

    expect(within(dialogo).getByText(USUARIO.idUsuario)).toBeInTheDocument();
    expect(within(dialogo).getByText("Contacto")).toBeInTheDocument();
    expect(within(dialogo).queryByLabelText(/contraseña/i)).toBeNull();
    expect(dialogo).toHaveAttribute("aria-modal", "true");
  });

  it("muestra estados vacíos para correo y teléfono y permite añadirlos al editar", async () => {
    const { dialogo } = await abrirPerfil();

    expect(within(dialogo).getAllByText("Puedes agregarlo más adelante")).toHaveLength(2);
    await userEvent.click(within(dialogo).getByRole("button", { name: "Editar perfil" }));
    expect(within(dialogo).getByLabelText("Correo (opcional)")).toBeInTheDocument();
    expect(within(dialogo).getByLabelText("Teléfono (opcional)")).toBeInTheDocument();
  });

  it("Editar perfil habilita los campos y deja opcional el cambio de contraseña", async () => {
    const { usuario, dialogo } = await abrirPerfil();

    await usuario.click(within(dialogo).getByRole("button", { name: "Editar perfil" }));
    const idUsuario = within(dialogo).getByLabelText("Cédula / Identificación");
    const nombre = within(dialogo).getByLabelText("Nombre");
    const contrasena = within(dialogo).getByLabelText(/Nueva contraseña/);
    expect(idUsuario).not.toHaveAttribute("readonly");
    expect(nombre).not.toHaveAttribute("readonly");
    expect(contrasena).not.toHaveAttribute("readonly");
    expect(contrasena).toHaveAttribute("placeholder", "Dejar vacío para conservarla");
    expect(within(dialogo).getByRole("button", { name: "Guardar cambios" })).toBeInTheDocument();
    expect(within(dialogo).getByRole("button", { name: "Cancelar" })).toBeInTheDocument();
  });

  it("guardar llama a actualizarUsuario con el id original y sincroniza el contexto", async () => {
    const { usuario, dialogo } = await abrirPerfil();

    await usuario.click(within(dialogo).getByRole("button", { name: "Editar perfil" }));

    const nombre = within(dialogo).getByLabelText("Nombre");
    await usuario.clear(nombre);
    await usuario.type(nombre, "Ana Actualizada");

    await usuario.type(within(dialogo).getByLabelText(/Nueva contraseña/), "clave-segura");
    await usuario.click(within(dialogo).getByRole("button", { name: "Guardar cambios" }));

    await waitFor(() => {
      expect(actualizarUsuario).toHaveBeenCalledWith(USUARIO.idUsuario, {
        idUsuario: USUARIO.idUsuario, nombre: "Ana Actualizada", correo: "", telefono: "", contrasena: "clave-segura",
      });
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

    await usuario.click(within(dialogo).getByRole("button", { name: "Editar perfil" }));
    await usuario.type(within(dialogo).getByLabelText(/Nueva contraseña/), "secreto123");
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
    crearUsuario.mockRejectedValueOnce(new Error("Error HTTP 409"));
    const espiaError = vi.spyOn(console, "error").mockImplementation(() => {});

    const { usuario, dialogo } = await abrirPerfil();

    await usuario.click(within(dialogo).getByRole("button", { name: "Editar perfil" }));
    await usuario.type(within(dialogo).getByLabelText(/Nueva contraseña/), "secreto123");
    await usuario.click(within(dialogo).getByRole("button", { name: "Guardar cambios" }));

    const alerta = await within(dialogo).findByRole("alert");
    expect(alerta).toHaveTextContent("Error HTTP 409");
    expect(screen.getByRole("dialog", { name: "Mi perfil" })).toBeInTheDocument();
    expect(espiaError).toHaveBeenCalled();

    espiaError.mockRestore();
  });
});
