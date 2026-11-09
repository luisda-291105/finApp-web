import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { SuscripcionesPage } from "../../features/suscripciones";

const listarSuscripcionesGmail = vi.hoisted(() => vi.fn());

vi.mock("../../services/gmailServicio", () => ({ listarSuscripcionesGmail }));
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
    expect(screen.getByRole("status")).toHaveTextContent("1 suscripciones detectadas en 1 cuenta.");
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
});
