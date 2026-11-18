/**
 * @uso        Pruebas de la bandeja de movimientos por revisar
 * @funciones  Verifica el listado con apodos, el modal de detalle y las acciones
 * @datos      Movimientos Gmail pendientes con servicio simulado
 * @eventos    Apertura del detalle, edición, eliminación y confirmación
 * @estados    cargando, movimientoDetalle, ocupado
 * @usadoPor   Vitest
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ModalMovimientosPorRevisar from "../../../features/contabilidad/components/modals/ModalMovimientosPorRevisar";
import {
  actualizarMovimiento,
  confirmarMovimientoGmailGlobal,
  listarMovimientos,
} from "../../../features/contabilidad/services/movimientosService";

vi.mock(
  "../../../features/contabilidad/services/movimientosService",
  () => ({
    listarMovimientos: vi.fn(),
    actualizarMovimiento: vi.fn(),
    confirmarMovimientoGmailGlobal: vi.fn(),
  }),
);

const PENDIENTE_GMAIL = {
  idMovimiento: "mov-gmail-1",
  tipo: "GASTO",
  monto: 4500,
  fecha: "2026-09-07",
  categoria: "Alertas y Notificaciones",
  concepto: "Alerta de consumo",
  origenTipo: "GMAIL",
  origenId: "gmail-1",
  origenNombre: "bamcolombia",
  remitente: "alertasynotificaciones@an.notificacionesbancolombia.com",
  estadoRevision: "POR_REVISAR",
};

const BOLSILLOS = [
  { idBolsillo: "gasto-1", nombre: "Gastos diarios", tipo: "GASTO" },
];

beforeEach(() => {
  vi.clearAllMocks();
  listarMovimientos.mockImplementation((idBolsillo, tipo, estadoRevision) => {
    if (estadoRevision === "POR_REVISAR") return Promise.resolve([PENDIENTE_GMAIL]);
    if (tipo === "POR_REVISAR") return Promise.resolve([]);
    return Promise.resolve([]);
  });
  confirmarMovimientoGmailGlobal.mockResolvedValue({});
  actualizarMovimiento.mockResolvedValue({});
});
afterEach(cleanup);

function renderBandeja(props = {}) {
  return render(
    <ModalMovimientosPorRevisar
      abierto
      bolsillos={BOLSILLOS}
      alCerrar={vi.fn()}
      alEditar={vi.fn()}
      alConfirmar={vi.fn()}
      alEliminar={vi.fn()}
      {...props}
    />,
  );
}

describe("ModalMovimientosPorRevisar", () => {
  it("lista los pendientes mostrando el apodo como título", async () => {
    renderBandeja();
    const bandeja = await screen.findByRole("dialog", {
      name: "Movimientos por revisar",
    });
    expect(
      within(bandeja).getByRole("button", {
        name: "Ver detalle del movimiento bamcolombia",
      }),
    ).toBeInTheDocument();
    expect(within(bandeja).getByText("bamcolombia")).toBeInTheDocument();
    expect(within(bandeja).getByText(/^GASTO · /)).toBeInTheDocument();
    expect(within(bandeja).getByText("$ 4.500")).toBeInTheDocument();
    expect(listarMovimientos).toHaveBeenCalledWith(null, "TODOS", "POR_REVISAR");
  });

  it("abre el modal de detalle del movimiento con su información completa", async () => {
    const usuario = userEvent.setup();
    renderBandeja();
    const bandeja = await screen.findByRole("dialog", {
      name: "Movimientos por revisar",
    });
    await usuario.click(
      within(bandeja).getByRole("button", {
        name: "Ver detalle del movimiento bamcolombia",
      }),
    );

    const detalle = await screen.findByRole("dialog", {
      name: "Detalle del movimiento",
    });
    expect(
      within(detalle).getByRole("heading", { name: "bamcolombia" }),
    ).toBeInTheDocument();
    expect(within(detalle).getByText("Alerta de consumo")).toBeInTheDocument();
    expect(
      within(detalle).getByText("Alertas y Notificaciones"),
    ).toBeInTheDocument();
    expect(within(detalle).getByText("POR_REVISAR")).toBeInTheDocument();
    expect(within(detalle).getByText("GMAIL")).toBeInTheDocument();
    expect(within(detalle).getByText("$ 4.500")).toBeInTheDocument();
  });

  it("cierra el detalle con Escape y mantiene abierta la bandeja", async () => {
    const usuario = userEvent.setup();
    renderBandeja();
    const bandeja = await screen.findByRole("dialog", {
      name: "Movimientos por revisar",
    });
    await usuario.click(
      within(bandeja).getByRole("button", {
        name: "Ver detalle del movimiento bamcolombia",
      }),
    );
    expect(
      await screen.findByRole("dialog", { name: "Detalle del movimiento" }),
    ).toBeInTheDocument();

    await usuario.keyboard("{Escape}");

    await waitFor(() =>
      expect(
        screen.queryByRole("dialog", { name: "Detalle del movimiento" }),
      ).not.toBeInTheDocument(),
    );
    expect(
      screen.getByRole("dialog", { name: "Movimientos por revisar" }),
    ).toBeInTheDocument();
  });

  it("edita el movimiento desde el modal de detalle", async () => {
    const usuario = userEvent.setup();
    const alEditar = vi.fn();
    renderBandeja({ alEditar });
    const bandeja = await screen.findByRole("dialog", {
      name: "Movimientos por revisar",
    });
    await usuario.click(
      within(bandeja).getByRole("button", {
        name: "Ver detalle del movimiento bamcolombia",
      }),
    );
    const detalle = await screen.findByRole("dialog", {
      name: "Detalle del movimiento",
    });
    await usuario.click(
      within(detalle).getByRole("button", {
        name: "Editar movimiento bamcolombia",
      }),
    );

    expect(alEditar).toHaveBeenCalledWith(PENDIENTE_GMAIL);
  });

  it("elimina el movimiento desde el modal de detalle", async () => {
    const usuario = userEvent.setup();
    const alEliminar = vi.fn();
    renderBandeja({ alEliminar });
    const bandeja = await screen.findByRole("dialog", {
      name: "Movimientos por revisar",
    });
    await usuario.click(
      within(bandeja).getByRole("button", {
        name: "Ver detalle del movimiento bamcolombia",
      }),
    );
    const detalle = await screen.findByRole("dialog", {
      name: "Detalle del movimiento",
    });
    await usuario.click(
      within(detalle).getByRole("button", {
        name: "Eliminar movimiento bamcolombia",
      }),
    );

    expect(alEliminar).toHaveBeenCalledWith(PENDIENTE_GMAIL);
  });

  it("confirma un movimiento Gmail y lo retira de la bandeja", async () => {
    const usuario = userEvent.setup();
    const alConfirmar = vi.fn();
    renderBandeja({ alConfirmar });
    const bandeja = await screen.findByRole("dialog", {
      name: "Movimientos por revisar",
    });
    await usuario.click(
      within(bandeja).getByRole("button", { name: "Confirmar" }),
    );

    await waitFor(() =>
      expect(confirmarMovimientoGmailGlobal).toHaveBeenCalledWith("mov-gmail-1"),
    );
    await waitFor(() =>
      expect(
        within(bandeja).queryByRole("button", { name: "Confirmar" }),
      ).not.toBeInTheDocument(),
    );
    expect(alConfirmar).toHaveBeenCalledWith(PENDIENTE_GMAIL);
  });

  it("enruta a edición un movimiento sin clasificar en lugar de confirmarlo", async () => {
    const usuario = userEvent.setup();
    const alEditar = vi.fn();
    const sinClasificar = {
      ...PENDIENTE_GMAIL,
      idMovimiento: "mov-sin-clasificar",
      tipo: "POR_REVISAR",
      origenNombre: "banColombia",
    };
    listarMovimientos.mockImplementation((idBolsillo, tipo, estadoRevision) => {
      if (estadoRevision === "POR_REVISAR")
        return Promise.resolve([sinClasificar]);
      return Promise.resolve([]);
    });
    renderBandeja({ alEditar });
    const bandeja = await screen.findByRole("dialog", {
      name: "Movimientos por revisar",
    });
    await usuario.click(
      within(bandeja).getByRole("button", { name: "Confirmar" }),
    );

    await waitFor(() => expect(alEditar).toHaveBeenCalledWith(sinClasificar));
    expect(actualizarMovimiento).not.toHaveBeenCalled();
    expect(confirmarMovimientoGmailGlobal).not.toHaveBeenCalled();
  });

  it("muestra el estado vacío cuando no hay pendientes", async () => {
    listarMovimientos.mockResolvedValue([]);
    renderBandeja();
    const bandeja = await screen.findByRole("dialog", {
      name: "Movimientos por revisar",
    });
    expect(
      within(bandeja).getByText("No hay movimientos pendientes de revisión."),
    ).toBeInTheDocument();
  });
});