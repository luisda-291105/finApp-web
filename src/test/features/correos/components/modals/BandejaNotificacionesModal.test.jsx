import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import BandejaNotificacionesModal from "../../../../../features/correos/components/modals/BandejaNotificacionesModal";

const NOTIFICACIONES = [
  {
    id: "alerta-1",
    asunto: "Alertas y Notificaciones",
    mensaje: "Movimiento detectado en tu cuenta.",
    fecha: "2026-11-18T19:53:00Z",
    leida: false,
    origen: "movimiento-gmail",
    cuentaGmail: "cuenta@ejemplo.test",
  },
  {
    id: "alerta-2",
    asunto: "Otra alerta",
    fecha: "2026-11-17T10:00:00Z",
    leida: true,
    origen: "sincronizacion",
    cuentaGmail: "",
  },
];

const NOMBRE_ALERTA = "Ver detalle de notificación: Alertas y Notificaciones";

function renderModal(props = {}) {
  return render(
    <BandejaNotificacionesModal
      abierto
      alCerrar={vi.fn()}
      notificaciones={NOTIFICACIONES}
      alMarcarTodasLeidas={vi.fn()}
      alMarcarLeida={vi.fn()}
      alLimpiar={vi.fn()}
      {...props}
    />,
  );
}

function BandejaConMarcado() {
  const [lista, setLista] = useState(NOTIFICACIONES);
  return (
    <BandejaNotificacionesModal
      abierto
      alCerrar={vi.fn()}
      notificaciones={lista}
      alMarcarTodasLeidas={vi.fn()}
      alMarcarLeida={(id) =>
        setLista((actuales) =>
          actuales.map((n) => (n.id === id ? { ...n, leida: true } : n)),
        )
      }
      alLimpiar={vi.fn()}
    />
  );
}

afterEach(() => cleanup());

describe("BandejaNotificacionesModal", () => {
  it("marca como leída la notificación al abrir su detalle", async () => {
    const user = userEvent.setup();
    const alMarcarLeida = vi.fn();
    renderModal({ alMarcarLeida });

    await user.click(screen.getByRole("button", { name: NOMBRE_ALERTA }));

    expect(alMarcarLeida).toHaveBeenCalledWith("alerta-1");
    expect(
      screen.getByRole("dialog", { name: "Detalle de notificación" }),
    ).toBeInTheDocument();
  });

  it("el detalle y la bandeja reflejan el estado leído tras marcar la notificación", async () => {
    const user = userEvent.setup();
    render(<BandejaConMarcado />);

    await user.click(screen.getByRole("button", { name: NOMBRE_ALERTA }));
    const detalle = screen.getByRole("dialog", {
      name: "Detalle de notificación",
    });
    expect(within(detalle).getByText("Leída")).toBeInTheDocument();

    await user.click(
      within(detalle).getByRole("button", {
        name: "Cerrar detalle de notificación",
      }),
    );
    expect(
      screen.getByRole("dialog", { name: "Notificaciones" }),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("No leída")).not.toBeInTheDocument();
  });
});
