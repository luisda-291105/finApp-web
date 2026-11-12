import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import ModalCrearMovimientoContable from "../../../../features/contabilidad/components/modals/ModalCrearMovimientoContable";

afterEach(cleanup);

const bolsillos = [
  { idBolsillo: "destino-gasto", nombre: "Gastos diarios", tipo: "GASTO", estado: true, saldoDisponible: 0 },
  { idBolsillo: "origen-ingreso", nombre: "Nómina", tipo: "INGRESO", estado: true, saldoDisponible: 500000 },
  { idBolsillo: "origen-ahorro", nombre: "Ahorro disponible", tipo: "AHORRO", estado: true, saldoDisponible: 30000 },
  { idBolsillo: "ahorro-vacio", nombre: "Ahorro vacío", tipo: "AHORRO", estado: true, saldoDisponible: 0 },
  { idBolsillo: "origen-gasto", nombre: "Otro gasto", tipo: "GASTO", estado: true, saldoDisponible: 100000 },
];

function renderModal(props = {}) {
  return render(
    <ModalCrearMovimientoContable
      abierto
      bolsillos={bolsillos}
      tarjetas={[]}
      alCerrar={vi.fn()}
      alGuardar={vi.fn().mockResolvedValue(undefined)}
      {...props}
    />
  );
}

describe("ModalCrearMovimientoContable: origen del dinero", () => {
  it("pide origen al registrar un gasto y ofrece solo ingresos y ahorros con saldo", async () => {
    const usuario = userEvent.setup();
    renderModal();

    const dialogo = screen.getByRole("dialog", { name: "Nuevo movimiento" });
    await usuario.selectOptions(within(dialogo).getByLabelText("Bolsillo"), "destino-gasto");
    await usuario.selectOptions(within(dialogo).getByLabelText("¿De dónde salió el dinero?"), "BOLSILLO");

    const origen = within(dialogo).getByLabelText("Bolsillo de origen");
    expect(within(origen).getByRole("option", { name: /Nómina/ })).toBeInTheDocument();
    expect(within(origen).getByRole("option", { name: /Ahorro disponible/ })).toBeInTheDocument();
    expect(within(origen).queryByRole("option", { name: /Ahorro vacío/ })).not.toBeInTheDocument();
    expect(within(origen).queryByRole("option", { name: /Otro gasto/ })).not.toBeInTheDocument();
  });

  it("pide el origen de llegada al registrar un ingreso", async () => {
    const usuario = userEvent.setup();
    renderModal();

    const dialogo = screen.getByRole("dialog", { name: "Nuevo movimiento" });
    await usuario.selectOptions(within(dialogo).getByLabelText("Bolsillo"), "origen-ingreso");

    const llegada = within(dialogo).getByLabelText("¿De dónde llegó el dinero?");
    expect(within(llegada).getByRole("option", { name: "Efectivo" })).toBeInTheDocument();
    expect(within(llegada).getByRole("option", { name: "Bolsillo" })).toBeInTheDocument();
  });

  it("ofrece cuentas bancarias como origen del dinero", async () => {
    const usuario = userEvent.setup();
    renderModal({ tarjetas: [{ idTarjeta: "tarjeta-1", entidad: "Bancolombia", titular: "Luis" }] });

    const dialogo = screen.getByRole("dialog", { name: "Nuevo movimiento" });
    await usuario.selectOptions(within(dialogo).getByLabelText("Bolsillo"), "destino-gasto");
    await usuario.selectOptions(within(dialogo).getByLabelText("¿De dónde salió el dinero?"), "CUENTA");

    const cuenta = within(dialogo).getByLabelText("Cuenta");
    expect(within(cuenta).getByRole("option", { name: /Bancolombia/ })).toBeInTheDocument();
  });
});
