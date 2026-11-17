import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { SuscripcionesPage } from "../../features/suscripciones";

const listarSuscripcionesGmail = vi.hoisted(() => vi.fn());
const obtenerMensajesSuscripcionGmail = vi.hoisted(() => vi.fn().mockResolvedValue([]));
const listarSuscripcionesManuales = vi.hoisted(() => vi.fn());
const crearSuscripcionManual = vi.hoisted(() => vi.fn());
const actualizarSuscripcionManual = vi.hoisted(() => vi.fn());
const cambiarEstadoSuscripcionManual = vi.hoisted(() => vi.fn());
const eliminarSuscripcionManual = vi.hoisted(() => vi.fn());

vi.mock("../../services/gmailServicio", () => ({ listarSuscripcionesGmail, obtenerMensajesSuscripcionGmail }));
vi.mock("../../features/suscripciones/services/suscripcionesServicio", () => ({
  listarSuscripcionesManuales,
  crearSuscripcionManual,
  actualizarSuscripcionManual,
  cambiarEstadoSuscripcionManual,
  eliminarSuscripcionManual,
}));
vi.mock("../../context/GmailContext", () => ({
  useGmail: () => ({ cuentasGmail: [{ id: "cuenta-1", email: "ana@example.test" }] }),
}));

const suscripcion = {
  id: "netflix",
  nombre: "Netflix",
  correoRemitente: "billing@netflix.example",
  cuentaGmailId: "cuenta-1",
  cuentaGmail: "ana@example.test",
  categorias: ["CATEGORY_PROMOTIONS"],
  urlBaja: "https://example.test/unsubscribe",
  mailtoBaja: "",
  bajaConUnClic: true,
  correosRecientes: 4,
};

afterEach(cleanup);

beforeEach(() => {
  listarSuscripcionesGmail.mockReset();
  listarSuscripcionesGmail.mockResolvedValue({
    suscripciones: [suscripcion],
    erroresCuentas: [],
    cuentasConsultadas: 1,
  });
  listarSuscripcionesManuales.mockReset().mockResolvedValue([]);
  crearSuscripcionManual.mockReset();
  actualizarSuscripcionManual.mockReset();
  cambiarEstadoSuscripcionManual.mockReset();
  eliminarSuscripcionManual.mockReset();
});

function renderPagina() {
  return render(
    <MemoryRouter>
      <SuscripcionesPage />
    </MemoryRouter>,
  );
}

describe("PaginaDashboardSuscripciones", () => {
  it("muestra las suscripciones Gmail obtenidas desde el backend", async () => {
    renderPagina();

    expect(await screen.findByRole("heading", { name: "Suscripciones" })).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "Netflix" })).toBeInTheDocument();
    expect(screen.getAllByRole("status").some((estado) =>
      estado.textContent.includes("1 de 1 suscripciones detectadas en 1 cuenta.")
    )).toBe(true);
    expect(within(screen.getByRole("list", { name: "Suscripciones de Gmail" })).getAllByRole("listitem")).toHaveLength(1);
    expect(listarSuscripcionesGmail).toHaveBeenCalledOnce();
  });

  it("filtra las suscripciones por categoría Gmail", async () => {
    const usuario = userEvent.setup();
    renderPagina();
    await screen.findByRole("heading", { name: "Netflix" });

    await usuario.click(screen.getByRole("button", { name: "Filtrar suscripciones de Gmail" }));
    await usuario.click(screen.getByRole("button", { name: /Actualizaciones/ }));
    await usuario.click(screen.getByRole("button", { name: "Ver resultados" }));

    expect(screen.queryByRole("heading", { name: "Netflix" })).not.toBeInTheDocument();
    expect(screen.queryByRole("list", { name: "Suscripciones de Gmail" })).not.toBeInTheDocument();
  });

  it("busca remitentes en los resultados cargados", async () => {
    const usuario = userEvent.setup();
    renderPagina();
    await screen.findByRole("heading", { name: "Netflix" });

    await usuario.click(screen.getByRole("button", { name: "Buscar suscripciones de Gmail" }));
    const campo = screen.getByRole("searchbox", { name: "Remitente, dirección o cuenta" });
    await usuario.type(campo, "desconocido");

    const dialogoBusqueda = screen.getByRole("dialog", { name: "Buscar suscripciones de correo" });
    expect(within(dialogoBusqueda).getByRole("status")).toHaveTextContent("0 remitentes encontrados");
    expect(within(dialogoBusqueda).getByText("No se encontraron remitentes con ese texto.")).toBeInTheDocument();
  });

  it("abre el detalle con la cuenta y opción de baja detectada", async () => {
    const usuario = userEvent.setup();
    renderPagina();
    await screen.findByRole("heading", { name: "Netflix" });

    await usuario.click(screen.getByRole("button", { name: "Ver detalles de la suscripción de Netflix" }));

    const detalle = screen.getByRole("dialog", { name: "Suscripción: Netflix" });
    expect(within(detalle).getByText("billing@netflix.example")).toBeInTheDocument();
    expect(within(detalle).getByText("ana@example.test")).toBeInTheDocument();
    expect(within(detalle).getByRole("button", { name: "Anular suscripción" })).toBeInTheDocument();
  });

  it("carga las suscripciones manuales guardadas al montar la página", async () => {
    listarSuscripcionesManuales.mockResolvedValue([{
      id: "manual-1",
      origen: "MANUAL",
      nombre: "Internet hogar",
      categoria: "Servicios",
      monto: 120000,
      fechaCobro: "2026-12-10",
      importancia: "Alta",
      activa: true,
    }]);

    renderPagina();

    expect(await screen.findByText("Internet hogar")).toBeInTheDocument();
    expect(listarSuscripcionesManuales).toHaveBeenCalledTimes(1);
  });

  it("guarda una suscripción manual mediante el backend y refresca la lista", async () => {
    const usuario = userEvent.setup();
    const manualGuardada = {
      id: "manual-1",
      origen: "MANUAL",
      nombre: "Vercel Pro",
      categoria: "Servicios",
      monto: 47068.11,
      fechaCobro: "2026-12-10",
      importancia: "Alta",
      activa: true,
    };
    listarSuscripcionesManuales.mockResolvedValueOnce([]).mockResolvedValueOnce([manualGuardada]);
    crearSuscripcionManual.mockResolvedValue(manualGuardada);

    renderPagina();
    await screen.findByRole("heading", { name: "Suscripciones" });
    await usuario.click(screen.getByRole("button", { name: "Registrar suscripción manual" }));
    await usuario.type(screen.getByLabelText("Nombre"), "Vercel Pro");
    await usuario.type(screen.getByLabelText("Monto (COP)"), "47.068,11");
    fireEvent.change(screen.getByLabelText("Fecha de cobro"), { target: { value: "2026-12-10" } });
    await usuario.selectOptions(screen.getByLabelText("Categoría"), "Servicios");
    await usuario.click(screen.getByRole("button", { name: "Guardar suscripción" }));

    await waitFor(() => expect(crearSuscripcionManual).toHaveBeenCalledWith({
      nombre: "Vercel Pro",
      monto: 47068.11,
      fechaCobro: "2026-12-10",
      categoria: "Servicios",
      importancia: "Alta",
    }));
    expect(listarSuscripcionesManuales).toHaveBeenCalledTimes(2);
    expect(await screen.findByText("Vercel Pro")).toBeInTheDocument();
  });

  it("actualiza la importancia mediante el servicio y refleja el cambio", async () => {
    const usuario = userEvent.setup();
    const manualDescargada = {
      id: "manual-1",
      origen: "MANUAL",
      nombre: "Internet hogar",
      categoria: "Servicios",
      monto: 120000,
      fechaCobro: "2026-12-10",
      importancia: "Alta",
      activa: true,
    };
    listarSuscripcionesManuales.mockResolvedValue([manualDescargada]);
    actualizarSuscripcionManual.mockResolvedValue({ ...manualDescargada, importancia: "Baja" });

    renderPagina();
    const bajar = await screen.findByRole("button", { name: "Bajar importancia" });
    await usuario.click(bajar);

    await waitFor(() => expect(actualizarSuscripcionManual).toHaveBeenCalledWith("manual-1", {
      ...manualDescargada,
      importancia: "Baja",
    }));
    expect(await screen.findByRole("button", { name: "Subir importancia" })).toBeInTheDocument();
  });
});
