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
const actualizarAjustesSuscripcion = vi.hoisted(() => vi.fn());
const cambiarEstadoSuscripcionManual = vi.hoisted(() => vi.fn());
const eliminarSuscripcionManual = vi.hoisted(() => vi.fn());

vi.mock("../../services/gmailServicio", () => ({ listarSuscripcionesGmail, obtenerMensajesSuscripcionGmail }));
vi.mock("../../features/suscripciones/services/suscripcionesServicio", () => ({
  listarSuscripcionesManuales,
  crearSuscripcionManual,
  actualizarSuscripcionManual,
  actualizarAjustesSuscripcion,
  cambiarEstadoSuscripcionManual,
  eliminarSuscripcionManual,
  normalizarNivelUi: (valor, porDefecto = "Media") => {
    const normalizado = String(valor ?? "").trim().toUpperCase();
    if (normalizado === "ALTA" || normalizado === "ALTO" || normalizado === "IMPORTANTE") return "Alta";
    if (normalizado === "MEDIA" || normalizado === "MEDIO") return "Media";
    if (normalizado === "BAJA" || normalizado === "BAJO") return "Baja";
    return porDefecto;
  },
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
  actualizarAjustesSuscripcion.mockReset();
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
    expect(within(screen.getByRole("list", { name: "Todas las suscripciones" })).getAllByRole("listitem")).toHaveLength(1);
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
    expect(screen.queryByRole("list", { name: "Todas las suscripciones" })).not.toBeInTheDocument();
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
      prioridad: "Media",
      apodo: "",
    }));
    expect(listarSuscripcionesManuales).toHaveBeenCalledTimes(2);
    expect(await screen.findByText("Vercel Pro")).toBeInTheDocument();
  });

  it("minimiza un bloque de prioridad y conserva la preferencia entre montajes", async () => {
    const usuario = userEvent.setup();
    const almacen = new Map();
    window.localStorage.getItem.mockImplementation((clave) => (almacen.has(clave) ? almacen.get(clave) : null));
    window.localStorage.setItem.mockImplementation((clave, valor) => { almacen.set(clave, String(valor)); });
    window.localStorage.clear.mockImplementation(() => almacen.clear());
    almacen.clear();
    listarSuscripcionesManuales.mockResolvedValue([{
      id: "manual-baja",
      origen: "MANUAL",
      nombre: "Gimnasio",
      categoria: "Salud",
      monto: 50000,
      fechaCobro: "2026-12-20",
      importancia: "Media",
      prioridad: "Baja",
      apodo: "",
      activa: true,
    }]);

    const { unmount } = renderPagina();
    expect(await screen.findByText("Gimnasio")).toBeInTheDocument();

    await usuario.click(screen.getByRole("button", { name: "Minimizar bloque Prioridad Baja" }));
    expect(screen.queryByText("Gimnasio")).not.toBeInTheDocument();
    expect(almacen.get("finapp:suscripciones:bloques-colapsados")).toBe("[\"Baja\"]");

    unmount();
    renderPagina();
    const expandir = await screen.findByRole("button", { name: "Expandir bloque Prioridad Baja" });
    expect(screen.queryByText("Gimnasio")).not.toBeInTheDocument();

    await usuario.click(expandir);
    expect(await screen.findByText("Gimnasio")).toBeInTheDocument();
    expect(almacen.get("finapp:suscripciones:bloques-colapsados")).toBe("[]");
    window.localStorage.getItem.mockReset();
    window.localStorage.setItem.mockReset();
    window.localStorage.clear.mockReset();
  });

  it("agrupa en «Sin prioridad» los registros sin nivel y usa «No definido» en el detalle", async () => {
    const usuario = userEvent.setup();
    listarSuscripcionesManuales.mockResolvedValue([{
      id: "manual-null",
      origen: "MANUAL",
      nombre: "Seguro hogar",
      categoria: "Servicios",
      monto: 89000,
      fechaCobro: "2026-12-15",
      importancia: "",
      prioridad: "",
      apodo: "",
      activa: true,
    }]);

    renderPagina();

    // La suscripción sin niveles se ubica en el bloque «Sin prioridad».
    expect(await screen.findByRole("button", { name: "Minimizar bloque Sin prioridad" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ver detalle de la suscripción Seguro hogar" })).toBeInTheDocument();

    await usuario.click(screen.getByRole("button", { name: "Ver detalle de la suscripción Seguro hogar" }));
    const detalle = screen.getByRole("dialog", { name: "Suscripción: Seguro hogar" });
    expect(within(detalle).getByLabelText("Importancia de la suscripción")).toHaveValue("");
    expect(within(detalle).getByLabelText("Prioridad de la suscripción")).toHaveValue("");
    expect(within(detalle).getAllByRole("option", { name: "No definido" })).toHaveLength(2);
  });

  it("abre el detalle desde la tarjeta completa y guarda la prioridad en el backend", async () => {
    const usuario = userEvent.setup();
    const manualDescargada = {
      id: "manual-1",
      origen: "MANUAL",
      nombre: "Internet hogar",
      categoria: "Servicios",
      monto: 120000,
      fechaCobro: "2026-12-10",
      importancia: "Alta",
      prioridad: "Media",
      apodo: "",
      activa: true,
    };
    listarSuscripcionesManuales.mockResolvedValue([manualDescargada]);
    actualizarAjustesSuscripcion.mockResolvedValue({ prioridad: "ALTA" });

    renderPagina();
    const abrir = await screen.findByRole("button", { name: "Ver detalle de la suscripción Internet hogar" });
    // La tarjeta manual no debe renderizar botones internos.
    expect(within(abrir).queryByRole("button")).not.toBeInTheDocument();
    await usuario.click(abrir);

    const detalle = screen.getByRole("dialog", { name: "Suscripción: Internet hogar" });
    await usuario.selectOptions(within(detalle).getByLabelText("Prioridad de la suscripción"), "Alta");
    await usuario.click(within(detalle).getByRole("button", { name: "Guardar ajustes" }));

    await waitFor(() => expect(actualizarAjustesSuscripcion).toHaveBeenCalledWith("manual-1", { apodo: "", importancia: "Alta", prioridad: "Alta" }));
  });
});
