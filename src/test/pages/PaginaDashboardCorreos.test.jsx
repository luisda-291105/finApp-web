import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import PaginaDashboardCorreos from "../../pages/PaginaDashboardCorreos";
import { obtenerFuentesPorUsuario } from "../../services/fuenteServicio";
import {
  canjearCodigoGmail,
  iniciarCodigoAutorizacionGmail,
  obtenerCorreosGmail,
  obtenerPerfilGmail,
  prepararGoogleIdentityServices,
} from "../../services/gmailServicio";
import { actualizarFuente } from "../../services/fuenteServicio";

vi.mock("../../context/UsuarioActivoContext", () => ({
  useUsuarioActivo: () => ({ usuario: { idUsuario: "usuario-prueba" } }),
}));

vi.mock("../../services/fuenteServicio", () => ({
  actualizarFuente: vi.fn(),
  obtenerFuentesPorUsuario: vi.fn(),
  crearFuente: vi.fn(),
}));

vi.mock("../../services/gmailServicio", () => ({
  GMAIL_CONFIGURADO: true,
  canjearCodigoGmail: vi.fn(),
  iniciarCodigoAutorizacionGmail: vi.fn(),
  obtenerCorreosGmail: vi.fn(),
  obtenerPerfilGmail: vi.fn(),
  prepararGoogleIdentityServices: vi.fn(),
}));

const FUENTE = {
  idFuente: "fuente-1",
  tipo: "CORREO",
  contenido: "finanzas@ejemplo.test",
  estado: true,
};

const CORREO = {
  id: "mensaje-1",
  asunto: "Factura de servicio",
  remitente: "Proveedor <proveedor@ejemplo.test>",
  fecha: "2026-10-29T10:00:00Z",
  destinatario: "Finanzas <finanzas@ejemplo.test>",
  fragmento: "Tu factura está disponible.",
  esImportante: true,
  esContable: true,
  esEntretenimiento: false,
};

beforeEach(() => {
  vi.clearAllMocks();
  obtenerFuentesPorUsuario.mockResolvedValue([FUENTE]);
  iniciarCodigoAutorizacionGmail.mockResolvedValue("codigo-prueba");
  prepararGoogleIdentityServices.mockResolvedValue(undefined);
  canjearCodigoGmail.mockResolvedValue("token-prueba");
  actualizarFuente.mockResolvedValue({ ...FUENTE, estado: true });
  obtenerPerfilGmail.mockResolvedValue("cuenta@ejemplo.test");
  obtenerCorreosGmail.mockResolvedValue([CORREO]);
});

afterEach(() => {
  cleanup();
  window.history.replaceState({}, "", "/dashboard/correos");
});

async function conectarDesdeLaPagina(usuario) {
  const boton = await screen.findByRole("button", { name: "Conectar Gmail" });
  await waitFor(() => expect(boton).toBeEnabled());
  await usuario.click(boton);
}

describe("PaginaDashboardCorreos", () => {
  it("carga fuentes del usuario y muestra mensajes de Gmail en filas filtrables", async () => {
    const usuario = userEvent.setup();
    render(<PaginaDashboardCorreos />);

    expect(await screen.findByText(FUENTE.contenido)).toBeInTheDocument();
    expect(obtenerFuentesPorUsuario).toHaveBeenCalledWith("usuario-prueba");
    await conectarDesdeLaPagina(usuario);
    expect(await screen.findByText("Conectado a Gmail como cuenta@ejemplo.test")).toBeInTheDocument();
    expect(canjearCodigoGmail).toHaveBeenCalledWith("codigo-prueba");
    await usuario.click(screen.getByRole("button", { name: `Ver correos de ${FUENTE.contenido}` }));

    expect(await screen.findByText("Factura de servicio")).toBeInTheDocument();
    expect(screen.getByText("Tu factura está disponible.")).toBeInTheDocument();
    expect(obtenerCorreosGmail).toHaveBeenCalledWith("token-prueba", [FUENTE]);
    expect(screen.getByRole("dialog", { name: `Correos de ${FUENTE.contenido}` })).toContainElement(screen.getByText("Factura de servicio"));

    await usuario.click(screen.getByRole("button", { name: /Contables/ }));
    expect(screen.getByText("Factura de servicio")).toBeInTheDocument();
    expect(screen.getByText("Contable")).toBeInTheDocument();
  });

  it("consulta solo la dirección elegida y separa sus mensajes de las otras fuentes", async () => {
    const otraFuente = { idFuente: "fuente-2", tipo: "CORREO", contenido: "personal@ejemplo.test", estado: true };
    const correoPersonal = { ...CORREO, id: "mensaje-personal", asunto: "Plan de entretenimiento", destinatario: "personal@ejemplo.test", esContable: false, esEntretenimiento: true };
    obtenerFuentesPorUsuario.mockResolvedValue([FUENTE, otraFuente]);
    obtenerCorreosGmail.mockResolvedValue([CORREO, correoPersonal]);
    const usuario = userEvent.setup();
    render(<PaginaDashboardCorreos />);
    await conectarDesdeLaPagina(usuario);
    await screen.findByText("Conectado a Gmail como cuenta@ejemplo.test");
    await usuario.click(await screen.findByRole("button", { name: `Ver correos de ${otraFuente.contenido}` }));
    expect(obtenerCorreosGmail).toHaveBeenLastCalledWith("token-prueba", [otraFuente]);
    const dialogo = screen.getByRole("dialog", { name: `Correos de ${otraFuente.contenido}` });
    expect(await screen.findByText("Plan de entretenimiento")).toBeInTheDocument();
    expect(dialogo).not.toHaveTextContent("Factura de servicio");
    await usuario.click(within(dialogo).getByRole("button", { name: /Entretenimiento/ }));
    expect(dialogo).toHaveTextContent("Plan de entretenimiento");
  });

  it("muestra el estado vacío cuando el usuario aún no registró fuentes", async () => {
    obtenerFuentesPorUsuario.mockResolvedValue([]);

    render(<PaginaDashboardCorreos />);

    expect(await screen.findByText(/Agrega una fuente de tipo correo/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Conectar Gmail" })).toBeDisabled();
  });

  it("muestra el error al fallar la consulta de fuentes", async () => {
    obtenerFuentesPorUsuario.mockRejectedValue(new Error("Error de fuentes"));

    render(<PaginaDashboardCorreos />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Error de fuentes");
  });

  it("inicia la autorización y canjea el código devuelto por el popup", async () => {
    const usuario = userEvent.setup();
    render(<PaginaDashboardCorreos />);
    await conectarDesdeLaPagina(usuario);
    await waitFor(() => expect(iniciarCodigoAutorizacionGmail).toHaveBeenCalledTimes(1));
    expect(await screen.findByText("Conectado a Gmail como cuenta@ejemplo.test")).toBeInTheDocument();
    expect(canjearCodigoGmail).toHaveBeenCalledWith("codigo-prueba");
  });

  it("mantiene inactiva una fuente de correo hasta conectar Gmail", async () => {
    obtenerFuentesPorUsuario.mockResolvedValue([{ ...FUENTE, estado: false }]);
    render(<PaginaDashboardCorreos />);
    expect(await screen.findByRole("button", { name: `Ver correos de ${FUENTE.contenido}` })).toBeDisabled();
    expect(screen.getByText("Inactiva · conecta Gmail")).toBeInTheDocument();
  });

  it("activa las fuentes pendientes después de conectar Gmail", async () => {
    obtenerFuentesPorUsuario.mockResolvedValue([{ ...FUENTE, estado: false }]);
    const usuario = userEvent.setup();
    render(<PaginaDashboardCorreos />);
    await conectarDesdeLaPagina(usuario);
    expect(await screen.findByText("Activa · selecciona para consultar")).toBeInTheDocument();
    expect(actualizarFuente).toHaveBeenCalledWith(
      FUENTE.idFuente,
      { tipo: FUENTE.tipo, contenido: FUENTE.contenido, estado: true },
      "usuario-prueba",
    );
  });

  it("muestra el error devuelto por el canje del código", async () => {
    canjearCodigoGmail.mockRejectedValue(new Error("Backend Gmail no disponible"));
    const usuario = userEvent.setup();
    render(<PaginaDashboardCorreos />);
    await conectarDesdeLaPagina(usuario);
    expect(await screen.findByRole("alert")).toHaveTextContent("Backend Gmail no disponible");
  });
});
