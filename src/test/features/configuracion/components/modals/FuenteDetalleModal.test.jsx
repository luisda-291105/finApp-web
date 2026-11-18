/**
 * @uso        Pruebas de la sección «Permisos» del detalle de fuente Gmail: estado real de conexión
 *             y botón único para conectar con todos los permisos de Gmail
 * @funciones  render, screen, waitFor, userEvent
 * @datos      Fuente CORREO y cuenta Gmail vinculada simuladas
 * @eventos    Click en «Conectar Gmail y Contactos»
 * @estados    gmailConectado controla si la cuenta aparece conectada o pendiente
 * @usadoPor   Vitest
 */
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import FuenteDetalleModal from "../../../../../features/configuracion/components/modals/FuenteDetalleModal";
import { verificarPermisoContactosGoogle } from "../../../../../services/gmailServicio";

vi.mock("../../../../../services/gmailServicio", () => ({
  verificarPermisoContactosGoogle: vi.fn(() => Promise.resolve(true)),
}));

const FUENTE = {
  idFuente: "f1",
  tipo: "CORREO",
  contenido: "ana@correo.com",
  estado: true,
  fechaCreacion: "2026-01-01",
};

const CUENTA = { id: "c1", email: "ana@correo.com" };

function renderModal(props = {}) {
  const triggerRef = { current: document.createElement("button") };
  const acciones = {
    alReconectarGmail: vi.fn(),
    alAutorizarContactos: vi.fn().mockResolvedValue(undefined),
    seleccionarCuentaGmail: vi.fn(),
    desconectarGmail: vi.fn(),
    alCerrar: vi.fn(),
    alGuardarEdicion: vi.fn(),
    alEliminar: vi.fn(),
  };
  render(
    <FuenteDetalleModal
      abierto
      fuente={FUENTE}
      triggerRef={triggerRef}
      cuenta={CUENTA}
      gmailConectado
      gmailConfigurado
      gisListo
      conexionCargando={false}
      errorGmail=""
      cuentaSeleccionadaId="c1"
      operacionFuente={false}
      errorOperacionFuente=""
      {...acciones}
      {...props}
    />,
  );
  return acciones;
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("FuenteDetalleModal — sección Permisos", () => {
  it("sin conexión: no muestra «Conectado» y ofrece un único botón con todos los permisos", async () => {
    const usuario = userEvent.setup();
    const acciones = renderModal({ gmailConectado: false });

    expect(screen.queryByText("Conectado")).not.toBeInTheDocument();
    expect(screen.queryByText("Incluido")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Autorizar contactos" }),
    ).not.toBeInTheDocument();

    const boton = screen.getByRole("button", {
      name: "Conectar Gmail y Contactos",
    });
    await usuario.click(boton);

    expect(acciones.alAutorizarContactos).toHaveBeenCalledWith("c1");
  });

  it("con conexión: muestra los servicios vinculados y no el botón de conectar", async () => {
    renderModal({ gmailConectado: true });

    await waitFor(() =>
      expect(screen.getByText("Conectado")).toBeInTheDocument(),
    );
    expect(screen.getByText("Incluido")).toBeInTheDocument();
    expect(verificarPermisoContactosGoogle).toHaveBeenCalledWith("c1");
    expect(
      screen.queryByRole("button", { name: "Conectar Gmail y Contactos" }),
    ).not.toBeInTheDocument();
  });
});
