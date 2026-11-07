import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { CorreosPage } from "../../features/correos";
import { obtenerFuentesPorUsuario } from "../../services/fuenteServicio";
import { consultarCorreosDeFuente, consultarCorreosDeFuentes } from "../../features/correos/services/correosService";

const gmailMock = vi.hoisted(() => ({
  tokenGmail: "token-prueba",
  cuentaGmail: "cuenta@ejemplo.test",
  cuentasGmail: [{ id: 12, email: "cuenta@ejemplo.test" }],
  cuentaSeleccionadaId: 12,
  conexionCargando: false,
  seleccionarCuentaGmail: vi.fn(),
  desconectarGmail: vi.fn(),
}));

vi.mock("../../context/UsuarioActivoContext", () => ({
  useUsuarioActivo: () => ({ usuario: { idUsuario: "usuario-prueba" } }),
}));

vi.mock("../../context/GmailContext", () => ({
  useGmail: () => gmailMock,
}));

vi.mock("../../services/fuenteServicio", () => ({
  actualizarFuente: vi.fn(),
  obtenerFuentesPorUsuario: vi.fn(),
  crearFuente: vi.fn(),
}));

vi.mock("../../features/correos/services/correosService", () => ({ consultarCorreosDeFuente: vi.fn(), consultarCorreosDeFuentes: vi.fn() }));

const FUENTE = {
  idFuente: "fuente-1", tipo: "CORREO", contenido: "finanzas@ejemplo.test", estado: true,
};
const CORREO = {
  id: "mensaje-1", asunto: "Factura de servicio", remitente: "Proveedor <proveedor@ejemplo.test>",
  fecha: "2026-10-29T10:00:00Z", destinatario: "Finanzas <finanzas@ejemplo.test>",
  fragmento: "Tu factura está disponible.", esImportante: true, esContable: true, esEntretenimiento: false,
};

beforeEach(() => {
  vi.clearAllMocks();
  gmailMock.tokenGmail = "token-prueba";
  gmailMock.cuentaGmail = "cuenta@ejemplo.test";
  gmailMock.cuentasGmail = [{ id: 12, email: "cuenta@ejemplo.test" }, { id: 15, email: "personal@ejemplo.test" }];
  gmailMock.cuentaSeleccionadaId = 12;
  gmailMock.conexionCargando = false;
  obtenerFuentesPorUsuario.mockResolvedValue([FUENTE]);
  consultarCorreosDeFuente.mockResolvedValue([CORREO]);
  consultarCorreosDeFuentes.mockImplementation(async (_token, fuentes) => fuentes.map((fuente) => [fuente.idFuente, [CORREO]]));
});

afterEach(() => {
  cleanup();
  window.history.replaceState({}, "", "/dashboard/correos");
});

function renderPagina() {
  return render(<MemoryRouter initialEntries={["/dashboard/correos"]}><CorreosPage /></MemoryRouter>);
}

describe("PaginaDashboardCorreos", () => {
  it("muestra fuentes en tarjetas, oculta el selector y abre las consultas en su modal", async () => {
    const user = userEvent.setup();
    renderPagina();

    expect(await screen.findByText(FUENTE.contenido)).toBeInTheDocument();
    expect(obtenerFuentesPorUsuario).toHaveBeenCalledWith("usuario-prueba");
    expect(screen.queryByLabelText("Cuenta Gmail para consultar")).not.toBeInTheDocument();
    expect(screen.getByText(/Consulta automática desde cuenta@ejemplo.test/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: `Ver correos de ${FUENTE.contenido}` }));
    expect(await screen.findByText("Factura de servicio")).toBeInTheDocument();
    expect(screen.getByText("Tu factura está disponible.")).toBeInTheDocument();
    expect(consultarCorreosDeFuente).toHaveBeenCalledWith("token-prueba", expect.objectContaining(FUENTE));
    const dialog = screen.getByRole("dialog", { name: `Correos de ${FUENTE.contenido}` });
    await user.click(within(dialog).getByRole("button", { name: /Contables/ }));
    expect(within(dialog).getByText("Factura de servicio")).toBeInTheDocument();
  });

  it("muestra las cuentas conectadas como tarjetas consultables, sin barra de selección", async () => {
    renderPagina();
    expect(await screen.findByRole("button", { name: "Ver correos de cuenta@ejemplo.test" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ver correos de personal@ejemplo.test" })).toBeInTheDocument();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  it("consulta cada fuente seleccionada por separado y descarta mensajes de otras direcciones", async () => {
    const otraFuente = { idFuente: "fuente-2", tipo: "CORREO", contenido: "personal@ejemplo.test", estado: true };
    const correoPersonal = { ...CORREO, id: "mensaje-personal", asunto: "Plan de entretenimiento", destinatario: "personal@ejemplo.test", esContable: false, esEntretenimiento: true };
    obtenerFuentesPorUsuario.mockResolvedValue([FUENTE, otraFuente]);
    gmailMock.cuentasGmail = [{ id: 12, email: "cuenta@ejemplo.test" }];
    consultarCorreosDeFuente.mockResolvedValue([correoPersonal]);
    consultarCorreosDeFuentes.mockImplementation(async (_token, fuentes) => fuentes.map((fuente) => [fuente.idFuente, fuente.idFuente === otraFuente.idFuente ? [correoPersonal] : [CORREO]]));
    renderPagina();
    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: `Ver correos de ${otraFuente.contenido}` }));

    expect(consultarCorreosDeFuente).toHaveBeenCalledWith("token-prueba", expect.objectContaining(otraFuente));
    const dialog = screen.getByRole("dialog", { name: `Correos de ${otraFuente.contenido}` });
    expect(await within(dialog).findByText("Plan de entretenimiento")).toBeInTheDocument();
    expect(within(dialog).queryByText("Factura de servicio")).not.toBeInTheDocument();
  });

  it("muestra el estado vacío cuando el usuario no registró fuentes", async () => {
    obtenerFuentesPorUsuario.mockResolvedValue([]);
    gmailMock.cuentasGmail = [];
    renderPagina();
    expect(await screen.findByText(/registra una fuente de correo para consultar mensajes/i)).toBeInTheDocument();
    expect(screen.queryByLabelText("Cuenta Gmail para consultar")).not.toBeInTheDocument();
  });

  it("muestra errores de carga de fuentes", async () => {
    obtenerFuentesPorUsuario.mockRejectedValue(new Error("Error de fuentes"));
    renderPagina();
    expect(await screen.findByRole("alert")).toHaveTextContent("Error de fuentes");
  });

  it("mantiene inactiva una fuente hasta que se active desde Configuración", async () => {
    obtenerFuentesPorUsuario.mockResolvedValue([{ ...FUENTE, estado: false }]);
    gmailMock.cuentasGmail = [];
    renderPagina();
    const card = await screen.findByRole("button", { name: `Ver correos de ${FUENTE.contenido}` });
    expect(card).toBeEnabled();
    expect(screen.getByText("Inactiva · deshabilitada")).toBeInTheDocument();
    await userEvent.click(card);
    expect(await screen.findByText(/Esta dirección está registrada, pero inactiva/)).toBeInTheDocument();
    expect(consultarCorreosDeFuente).not.toHaveBeenCalled();
  });
});
