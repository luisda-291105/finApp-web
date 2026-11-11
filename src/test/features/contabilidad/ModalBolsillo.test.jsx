import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ModalBolsillo from "../../../features/contabilidad/components/modals/ModalBolsillo";

afterEach(cleanup);

describe("ModalBolsillo", () => {
  it("crea bolsillos como AHORRO y no ofrece selector de tipo", async () => {
    const usuario = userEvent.setup();
    const alGuardar = vi.fn().mockResolvedValue(undefined);
    render(<ModalBolsillo abierto modo="crear" alGuardar={alGuardar} alCerrar={vi.fn()} />);

    expect(screen.queryByLabelText("Tipo de movimiento")).not.toBeInTheDocument();
    expect(screen.getByText(/Tipo del bolsillo:/)).toHaveTextContent("AHORRO");
    await usuario.type(screen.getByLabelText("Nombre del bolsillo"), "Viajes");
    await usuario.click(screen.getByRole("button", { name: "Crear bolsillo" }));

    expect(alGuardar).toHaveBeenCalledWith({ nombre: "Viajes", tipo: "AHORRO", montoObjetivo: 0 });
  });

  it("exige confirmar la conversión de un bolsillo legado a AHORRO", async () => {
    const usuario = userEvent.setup();
    const alGuardar = vi.fn().mockResolvedValue(undefined);
    render(<ModalBolsillo abierto modo="editar" bolsillo={{ idBolsillo: "legado", nombre: "Compras", tipo: "GASTO" }}
      alGuardar={alGuardar} alCerrar={vi.fn()} />);

    expect(screen.getByRole("status")).toHaveTextContent("Debe convertirse a AHORRO");
    await usuario.click(screen.getByRole("button", { name: "Guardar cambios" }));
    expect(alGuardar).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent("Confirma la conversión");

    await usuario.click(screen.getByLabelText("Confirmo convertir este bolsillo a AHORRO."));
    await usuario.click(screen.getByRole("button", { name: "Guardar cambios" }));

    expect(alGuardar).toHaveBeenCalledWith({ nombre: "Compras", tipo: "AHORRO", montoObjetivo: 0, estado: true });
  });
});
