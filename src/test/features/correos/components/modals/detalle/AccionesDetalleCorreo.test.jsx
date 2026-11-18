import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import AccionesDetalleCorreo from "../../../../../../features/correos/components/modals/detalle/AccionesDetalleCorreo";

const renderAcciones = (props = {}) =>
  render(
    <AccionesDetalleCorreo
      idCorreo="m-1"
      cuentaId="cuenta-a"
      alCerrar={vi.fn()}
      alMover={vi.fn().mockResolvedValue({})}
      alAutorizarPermiso={vi.fn().mockResolvedValue({})}
      {...props}
    />,
  );

afterEach(() => cleanup());

describe("AccionesDetalleCorreo", () => {
  it("ofrece mover a la papelera junto a las demás acciones del detalle", () => {
    renderAcciones();

    expect(
      screen.getByRole("button", { name: /mover a la papelera/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /volver a los correos/i }),
    ).toBeInTheDocument();
  });

  it("mueve el correo con la cuenta del detalle y cierra al terminar", async () => {
    const alMover = vi.fn().mockResolvedValue({});
    const alCerrar = vi.fn();
    renderAcciones({ alMover, alCerrar });

    await userEvent.click(
      screen.getByRole("button", { name: /mover a la papelera/i }),
    );

    expect(alMover).toHaveBeenCalledWith({ id: "m-1", cuentaId: "cuenta-a" });
    expect(alCerrar).toHaveBeenCalled();
  });

  it("impide disparar de nuevo mientras la operación está en curso", async () => {
    let resolver;
    const alMover = vi.fn(
      () =>
        new Promise((resolverPromesa) => {
          resolver = resolverPromesa;
        }),
    );
    renderAcciones({ alMover });

    await userEvent.click(
      screen.getByRole("button", { name: /mover a la papelera/i }),
    );

    expect(
      screen.getByRole("button", { name: /moviendo/i }),
    ).toBeDisabled();

    resolver({});
    await waitFor(() =>
      expect(alMover).toHaveBeenCalledTimes(1),
    );
  });

  it("muestra un error comprensible y no cierra si falla", async () => {
    const alMover = vi
      .fn()
      .mockRejectedValue(new Error("No se pudo mover el correo."));
    const alCerrar = vi.fn();
    renderAcciones({ alMover, alCerrar });

    await userEvent.click(
      screen.getByRole("button", { name: /mover a la papelera/i }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /no se pudo mover el correo/i,
    );
    expect(alCerrar).not.toHaveBeenCalled();
  });

  it("ofrece autorizar el permiso ampliado cuando falta", async () => {
    const alMover = vi.fn().mockRejectedValue(
      Object.assign(new Error("Falta el permiso ampliado."), {
        status: 409,
        requires_scope_authorization: true,
      }),
    );
    const alAutorizarPermiso = vi.fn().mockResolvedValue({});
    renderAcciones({ alMover, alAutorizarPermiso });

    await userEvent.click(
      screen.getByRole("button", { name: /mover a la papelera/i }),
    );

    const botonAutorizar = await screen.findByRole("button", {
      name: /autorizar permiso/i,
    });
    await userEvent.click(botonAutorizar);
    expect(alAutorizarPermiso).toHaveBeenCalledWith("cuenta-a");
  });
});
