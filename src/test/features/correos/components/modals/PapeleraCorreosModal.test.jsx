import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import PapeleraCorreosModal from "../../../../../features/correos/components/modals/PapeleraCorreosModal";

const correo = (mensajeId, extra = {}) => ({
  id: mensajeId,
  mensajeId,
  cuentaId: "cuenta-a",
  remitente: `${mensajeId}@ejemplo.test`,
  asunto: `Correo ${mensajeId}`,
  fecha: "2026-11-10T14:03:00Z",
  eliminacionEstimadaEn: "2026-12-10T14:03:00Z",
  movidoAutomaticamente: false,
  motivoAutomatico: null,
  categoria: null,
  ...extra,
});

const seccion = (extra = {}) => ({
  cuentaId: "cuenta-a",
  email: "a@ejemplo.test",
  correos: [],
  total: 0,
  siguientePageToken: null,
  error: "",
  requierePermiso: false,
  requiereReconexion: false,
  ...extra,
});

const renderModal = (props = {}) =>
  render(
    <MemoryRouter>
      <PapeleraCorreosModal
        abierto
        alCerrar={vi.fn()}
        gmailConectado
        secciones={[]}
        cargando={false}
        restaurando={{}}
        autorizando={null}
        aviso={null}
        alRestaurar={vi.fn()}
        alAutorizar={vi.fn()}
        alReintentar={vi.fn()}
        alCerrarAviso={vi.fn()}
        {...props}
      />
    </MemoryRouter>,
  );

afterEach(() => cleanup());

describe("PapeleraCorreosModal", () => {
  it("muestra un estado vacío distinto del aviso de error", () => {
    renderModal({ secciones: [seccion()] });

    expect(screen.getByText(/papelera está vacía/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /reintentar/i })).toBeNull();
  });

  it("muestra el error de una cuenta y permite reintentar", async () => {
    const alReintentar = vi.fn();
    renderModal({
      secciones: [seccion({ error: "Gmail no responde." })],
      alReintentar,
    });

    expect(screen.getByText("Gmail no responde.")).toBeInTheDocument();
    expect(screen.queryByText(/papelera está vacía/i)).toBeNull();

    await userEvent.click(screen.getByRole("button", { name: /reintentar/i }));
    expect(alReintentar).toHaveBeenCalledWith("cuenta-a");
  });

  it("avisa de la retención de ~30 días y restaura por fila", async () => {
    const alRestaurar = vi.fn();
    renderModal({
      secciones: [seccion({ correos: [correo("m-1")], total: 1 })],
      alRestaurar,
    });

    expect(screen.getByText(/unos 30 días/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /mover a la papelera/i })).toBeNull();

    await userEvent.click(screen.getByRole("button", { name: /^restaurar$/i }));
    expect(alRestaurar).toHaveBeenCalledWith(
      expect.objectContaining({ mensajeId: "m-1", cuentaId: "cuenta-a" }),
    );
  });

  it("impide restaurar dos veces el mismo correo mientras está en curso", () => {
    renderModal({
      secciones: [seccion({ correos: [correo("m-1"), correo("m-2")], total: 2 })],
      restaurando: { "cuenta-a:m-1": true },
    });

    const filaUno = screen.getByText("Correo m-1").closest("li");
    const filaDos = screen.getByText("Correo m-2").closest("li");

    expect(
      within(filaUno).getByRole("button", { name: /restaurando/i }),
    ).toBeDisabled();
    expect(
      within(filaDos).getByRole("button", { name: /^restaurar$/i }),
    ).toBeEnabled();
  });

  it("muestra el aviso de permiso ampliado con la acción de autorizar", async () => {
    const alAutorizar = vi.fn();
    renderModal({
      secciones: [seccion({ requierePermiso: true })],
      alAutorizar,
    });

    expect(screen.getByText(/modificar tus correos/i)).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("button", { name: /autorizar permiso/i }),
    );
    expect(alAutorizar).toHaveBeenCalledWith("cuenta-a");
  });

  it("pide reconectar cuando la conexión fue revocada", () => {
    renderModal({
      secciones: [seccion({ requiereReconexion: true })],
    });

    expect(screen.getByText(/reconectar|revocada|expiró/i)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /autorizar permiso/i }),
    ).toBeNull();
  });

  it("presenta el aviso global según su tipo", () => {
    renderModal({
      secciones: [seccion()],
      aviso: { tipo: "info", mensaje: "El correo ya no está disponible." },
    });

    expect(screen.getByText("El correo ya no está disponible.")).toBeInTheDocument();
  });

  it("minimiza y expande la cuenta con el botón del encabezado", async () => {
    renderModal({
      secciones: [seccion({ correos: [correo("m-1")], total: 1 })],
    });

    expect(screen.getByText("Correo m-1")).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: /minimizar la papelera/i }),
    );
    expect(screen.queryByText("Correo m-1")).toBeNull();
    expect(
      screen.getByRole("button", { name: /expandir la papelera/i }),
    ).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: /expandir la papelera/i }),
    );
    expect(screen.getByText("Correo m-1")).toBeInTheDocument();
  });

  it("no renderiza la configuración de la limpieza automática (vive en Configuración)", () => {
    renderModal({ secciones: [seccion()] });

    expect(
      screen.queryByRole("heading", { name: /limpieza automática de la papelera/i }),
    ).toBeNull();
  });
});
