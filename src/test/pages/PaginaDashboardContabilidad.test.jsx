import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { ContabilidadPage as PaginaDashboardContabilidad } from "../../features/contabilidad";
import { listarBolsillos } from "../../features/contabilidad/services/bolsillosService";
import {
  eliminarMovimiento,
  listarMovimientos,
  obtenerResumenesBolsillos,
  obtenerResumenGlobal,
} from "../../features/contabilidad/services/movimientosService";
import { moverCorreoAPapelera } from "../../features/correos/services/papeleraService";
import { mesActual } from "../../features/contabilidad/utils/contabilidadHelpers";

vi.mock("../../context/UsuarioActivoContext", () => ({
  useUsuarioActivo: () => ({
    usuario: { idUsuario: "usuario-prueba", nombre: "Ana Pérez" },
  }),
}));
vi.mock("../../features/contabilidad/services/bolsillosService", () => ({
  listarBolsillos: vi.fn(),
  crearBolsillo: vi.fn(),
  actualizarBolsillo: vi.fn(),
  eliminarBolsillo: vi.fn(),
}));
vi.mock("../../features/contabilidad/services/movimientosService", () => ({
  listarMovimientos: vi.fn(),
  crearMovimiento: vi.fn(),
  actualizarMovimiento: vi.fn(),
  eliminarMovimiento: vi.fn(),
  obtenerResumenesBolsillos: vi.fn(),
  obtenerResumenGlobal: vi.fn(),
}));
vi.mock("../../features/tarjetas/services/tarjetasService", () => ({
  obtenerTarjetasPorUsuario: vi.fn().mockResolvedValue([]),
}));
vi.mock("../../features/suscripciones/services/suscripcionesServicio", () => ({
  sincronizarOrigenesMovimientosGmail: vi.fn().mockResolvedValue({
    total: 0,
    actualizados: 0,
    errores: 0,
    detalles: [],
  }),
}));
vi.mock("../../features/correos/services/papeleraService", () => ({
  moverCorreoAPapelera: vi.fn(),
}));

const BOLSILLOS = [
  {
    idBolsillo: "fijo-ingreso",
    nombre: "Ingresos",
    tipo: "INGRESO",
    estado: true,
    montoObjetivo: 0,
  },
  {
    idBolsillo: "fijo-gasto",
    nombre: "Gastos",
    tipo: "GASTO",
    estado: true,
    montoObjetivo: 0,
  },
  {
    idBolsillo: "gasto-1",
    nombre: "Gastos diarios",
    tipo: "GASTO",
    estado: true,
    montoObjetivo: 0,
  },
  {
    idBolsillo: "ingreso-1",
    nombre: "Nómina",
    tipo: "INGRESO",
    estado: true,
    montoObjetivo: 0,
  },
];
const MOVIMIENTOS = [
  {
    idMovimiento: "mov-1",
    idBolsillo: "fijo-gasto",
    bolsillo: BOLSILLOS[1],
    categoria: "Gasolina",
    tipo: "GASTO",
    monto: 11000,
    fecha: "2026-11-05",
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  moverCorreoAPapelera.mockResolvedValue({});
  eliminarMovimiento.mockResolvedValue({});
  listarBolsillos.mockResolvedValue(BOLSILLOS);
  listarMovimientos.mockResolvedValue(MOVIMIENTOS);
  obtenerResumenesBolsillos.mockResolvedValue([]);
  obtenerResumenGlobal.mockResolvedValue({
    ingresos: 12000,
    gastos: 5000,
    ahorros: 0,
    transferencias: 0,
    saldoAhorros: 0,
    porRevisar: 0,
  });
});
afterEach(cleanup);

function renderPagina() {
  return render(
    <MemoryRouter>
      <PaginaDashboardContabilidad />
    </MemoryRouter>,
  );
}

describe("PaginaDashboardContabilidad", () => {
  it("carga bolsillos y consulta los movimientos del usuario en la sección contable", async () => {
    renderPagina();
    expect(
      await screen.findByRole("heading", { name: "Contabilidad" }),
    ).toBeInTheDocument();
    expect(await screen.findByText("Gastos diarios")).toBeInTheDocument();
    expect(listarBolsillos).toHaveBeenCalled();
    const ahora = new Date();
    expect(obtenerResumenGlobal).toHaveBeenCalledWith(
      `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, "0")}`,
    );
    await waitFor(() =>
      expect(listarMovimientos).toHaveBeenCalledWith(null, "TODOS"),
    );
    expect(
      await screen.findByLabelText("Movimientos de todos los bolsillos"),
    ).toBeInTheDocument();
  });

  it("filtra todos los bolsillos por tipo de movimiento", async () => {
    const usuario = userEvent.setup();
    renderPagina();
    await screen.findByText("Gastos diarios");
    await usuario.click(screen.getByRole("button", { name: "Ingresos" }));
    expect(listarMovimientos).toHaveBeenLastCalledWith(null, "INGRESO");
  });

  it("el filtro Gastos incluye las transferencias y no los ingresos", async () => {
    const usuario = userEvent.setup();
    const movimientosGastos = [
      {
        idMovimiento: "mov-gasto",
        idBolsillo: "fijo-gasto",
        tipo: "GASTO",
        estadoRevision: "CONFIRMADO",
        monto: 150000,
        fecha: "2026-11-10",
        concepto: "Gasto filtrado",
        categoria: "Compras",
      },
      {
        idMovimiento: "mov-transferencia",
        idBolsillo: "fijo-gasto",
        tipo: "TRANSFERENCIA",
        estadoRevision: "CONFIRMADO",
        monto: 160000,
        fecha: "2026-11-11",
        concepto: "Transferencia filtrada",
        categoria: "Transferencia",
      },
      {
        idMovimiento: "mov-ingreso",
        idBolsillo: "fijo-ingreso",
        tipo: "INGRESO",
        estadoRevision: "CONFIRMADO",
        monto: 99000,
        fecha: "2026-11-12",
        concepto: "Ingreso filtrado",
        categoria: "Nómina",
      },
    ];
    listarMovimientos.mockResolvedValue(movimientosGastos);
    renderPagina();
    await screen.findByText("Gastos diarios");
    await usuario.click(screen.getByRole("button", { name: "Gastos" }));
    // El «Gastos» del tab trae la lista completa y filtra en cliente GASTO + TRANSFERENCIA.
    expect(listarMovimientos).toHaveBeenLastCalledWith(null, "TODOS");
    expect(await screen.findByText("Gasto filtrado")).toBeInTheDocument();
    expect(screen.getByText("Transferencia filtrada")).toBeInTheDocument();
    expect(screen.queryByText("Ingreso filtrado")).toBeNull();
  });

  it("abre el formulario de movimiento con bolsillos disponibles", async () => {
    const usuario = userEvent.setup();
    renderPagina();
    await screen.findByText("Gastos diarios");
    await usuario.click(
      screen.getByRole("button", { name: /Nuevo movimiento/ }),
    );
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getByLabelText("Bolsillo")).toBeInTheDocument();
    expect(screen.getByLabelText("Fecha")).toBeInTheDocument();
    expect(screen.getByLabelText("Monto (COP)")).toBeInTheDocument();
    expect(screen.getByLabelText("Categoría")).toBeInTheDocument();
    expect(screen.getByLabelText("Concepto (opcional)")).toBeInTheDocument();
  });

  it("muestra una sola card dividida para los fijos y abre sus movimientos en el detalle", async () => {
    const usuario = userEvent.setup();
    renderPagina();
    const rejilla = await screen.findByRole("region", { name: "Bolsillos" });
    const cardFijos = within(rejilla).getByRole("article", {
      name: "Bolsillos fijos",
    });
    expect(within(cardFijos).getByText("Ingresos")).toBeInTheDocument();
    expect(within(cardFijos).getByText("Gastos")).toBeInTheDocument();
    expect(within(cardFijos).getByText(/12\.000/)).toBeInTheDocument();
    expect(within(cardFijos).getByText(/5\.000/)).toBeInTheDocument();
    expect(within(cardFijos).getByText("Balance del mes")).toBeInTheDocument();
    expect(within(cardFijos).getByText(/7\.000/)).toBeInTheDocument();
    expect(within(rejilla).queryAllByText("Fijo")).toHaveLength(0);

    await usuario.click(
      within(cardFijos).getByRole("button", { name: "Ver detalles de Gastos" }),
    );
    const dialogo = await screen.findByRole("dialog", { name: "Gastos" });
    expect(
      within(dialogo).getByRole("heading", { name: "Movimientos" }),
    ).toBeInTheDocument();
    // Los movimientos de Gastos están ya en la card; buscaríamos "Gasolina" en la sección asociada
    const movimientosRegion = within(dialogo).getByText(
      /Total por año y mes/i,
    ).parentElement;
    expect(movimientosRegion).toBeInTheDocument();
    // El detalle muestra el listado de movimientos del bolsillo
    await waitFor(() =>
      expect(within(dialogo).getByText("Gasolina")).toBeInTheDocument(),
    );
  });

  it("muestra el balance del mes como gastos negativos cuando superan a los ingresos", async () => {
    obtenerResumenGlobal.mockResolvedValue({
      ingresos: 4000,
      gastos: 9500,
      ahorros: 0,
      transferencias: 0,
      saldoAhorros: 0,
      porRevisar: 0,
    });
    renderPagina();
    const rejilla = await screen.findByRole("region", { name: "Bolsillos" });
    const cardFijos = within(rejilla).getByRole("article", {
      name: "Bolsillos fijos",
    });
    expect(within(cardFijos).getByText("Balance del mes")).toBeInTheDocument();
    await waitFor(() =>
      expect(within(cardFijos).getByTestId("balance-mes")).toHaveTextContent(
        "-$ 5.500",
      ),
    );
  });

  it("abre el detalle del balance del mes desde la card de ingresos y gastos", async () => {
    const usuario = userEvent.setup();
    renderPagina();
    const rejilla = await screen.findByRole("region", { name: "Bolsillos" });
    const cardFijos = within(rejilla).getByRole("article", {
      name: "Bolsillos fijos",
    });
    await usuario.click(
      within(cardFijos).getByRole("button", {
        name: "Ver detalle del balance del mes",
      }),
    );

    const dialogo = await screen.findByRole("dialog", {
      name: "Detalle del balance",
    });
    expect(within(dialogo).getByText("Ingresos del mes")).toBeInTheDocument();
    expect(within(dialogo).getByText("Gastos del mes")).toBeInTheDocument();
    expect(within(dialogo).getByTestId("detalle-balance-total")).toHaveTextContent(
      "$ 7.000",
    );
  });

  it("muestra en el detalle el total del mes actual y colorea cada movimiento según su tipo", async () => {
    const usuario = userEvent.setup();
    const claveMes = mesActual();
    const [anio, mes] = claveMes.split("-").map(Number);
    const mesAnterior = new Date(Date.UTC(anio, mes - 2, 10))
      .toISOString()
      .slice(0, 10);
    const movimientosDetalle = [
      {
        idMovimiento: "ingreso-actual",
        idBolsillo: "fijo-gasto",
        tipo: "INGRESO",
        estadoRevision: "CONFIRMADO",
        monto: 250000,
        fecha: `${claveMes}-10`,
        concepto: "Ingreso reciente",
        categoria: "Ingresos",
        origenNombre: "Nómina",
      },
      {
        idMovimiento: "gasto-actual",
        idBolsillo: "fijo-gasto",
        tipo: "GASTO",
        estadoRevision: "CONFIRMADO",
        monto: 150000,
        fecha: `${claveMes}-11`,
        concepto: "Gasto reciente",
        categoria: "Compras",
        origenNombre: "Tienda",
      },
      {
        idMovimiento: "ahorro-anterior",
        idBolsillo: "fijo-gasto",
        tipo: "AHORRO",
        estadoRevision: "CONFIRMADO",
        monto: 700000,
        fecha: mesAnterior,
        concepto: "Ahorro antiguo",
        categoria: "Ahorro",
        origenNombre: "NU",
      },
    ];
    listarMovimientos.mockImplementation((idBolsillo, tipo) =>
      Promise.resolve(tipo === "POR_REVISAR" ? [] : movimientosDetalle),
    );
    obtenerResumenesBolsillos.mockResolvedValue([
      { idBolsillo: "fijo-gasto", gastos: 9999999 },
    ]);

    renderPagina();
    const rejilla = await screen.findByRole("region", { name: "Bolsillos" });
    const cardFijos = within(rejilla).getByRole("article", {
      name: "Bolsillos fijos",
    });
    await usuario.click(
      within(cardFijos).getByRole("button", { name: "Ver detalles de Gastos" }),
    );
    const dialogo = await screen.findByRole("dialog", { name: "Gastos" });
    await waitFor(() =>
      expect(within(dialogo).getByText("Gasto reciente")).toBeInTheDocument(),
    );

    const etiquetaMes = within(dialogo).getByText("Total del mes actual");
    expect(etiquetaMes.nextElementSibling?.textContent).toContain("400.000");
    expect(within(dialogo).queryByText(/9\.999\.999/)).toBeNull();

    const filaIngreso = within(dialogo)
      .getByText("Ingreso reciente")
      .closest("li");
    expect(within(filaIngreso).getByText("Ingreso")).toHaveClass(
      "text-emerald-700",
    );
    expect(within(filaIngreso).getByText(/250\.000/)).toHaveClass(
      "text-emerald-700",
    );

    const filaGasto = within(dialogo)
      .getByText("Gasto reciente")
      .closest("li");
    expect(within(filaGasto).getByText("Gasto")).toHaveClass("text-rose-700");
    expect(within(filaGasto).getByText(/150\.000/)).toHaveClass(
      "text-rose-700",
    );

    const filaAhorro = within(dialogo)
      .getByText("Ahorro antiguo")
      .closest("li");
    expect(within(filaAhorro).getByText("Ahorro")).toHaveClass("text-sky-700");
    expect(within(filaAhorro).getByText(/700\.000/)).toHaveClass("text-sky-700");
  });

  it("resume en el modal del bolsillo Gastos también los gastos globales sin bolsillo", async () => {
    const usuario = userEvent.setup();
    const claveMes = mesActual();
    const movimientosDetalle = [
      {
        idMovimiento: "gasto-fijo",
        idBolsillo: "fijo-gasto",
        tipo: "GASTO",
        estadoRevision: "CONFIRMADO",
        monto: 200000,
        fecha: `${claveMes}-10`,
        concepto: "Gasto del bolsillo",
        categoria: "Compras",
        origenNombre: "Tienda",
      },
      {
        idMovimiento: "gasto-global",
        idBolsillo: null,
        tipo: "GASTO",
        estadoRevision: "CONFIRMADO",
        monto: 63125,
        fecha: `${claveMes}-14`,
        concepto: "Gasto global Gmail",
        categoria: "Compras y pagos",
        origenNombre: "Farmacia",
      },
      {
        idMovimiento: "transferencia-global",
        idBolsillo: null,
        tipo: "TRANSFERENCIA",
        estadoRevision: "CONFIRMADO",
        monto: 855000,
        fecha: `${claveMes}-15`,
        concepto: "Transferencia global Gmail",
        categoria: "Transferencias",
        origenNombre: "Banco",
      },
      {
        idMovimiento: "por-revisar-global",
        idBolsillo: null,
        tipo: "GASTO",
        estadoRevision: "POR_REVISAR",
        monto: 999999,
        fecha: `${claveMes}-16`,
        concepto: "Pendiente por revisar",
        categoria: "Compras",
        origenNombre: "Pendiente",
      },
    ];
    listarMovimientos.mockImplementation(() =>
      Promise.resolve(movimientosDetalle),
    );

    renderPagina();
    const rejilla = await screen.findByRole("region", { name: "Bolsillos" });
    const cardFijos = within(rejilla).getByRole("article", {
      name: "Bolsillos fijos",
    });
    await usuario.click(
      within(cardFijos).getByRole("button", { name: "Ver detalles de Gastos" }),
    );
    const dialogo = await screen.findByRole("dialog", { name: "Gastos" });
    expect(await within(dialogo).findByText("Gasto del bolsillo")).toBeInTheDocument();
    expect(await within(dialogo).findByText("Gasto global Gmail")).toBeInTheDocument();

    const etiquetaMes = within(dialogo).getByText("Total del mes actual");
    // 200.000 (bolsillo) + 63.125 (gasto global); la transferencia global y
    // lo pendiente por revisar no cuentan como gasto del mes.
    expect(etiquetaMes.nextElementSibling?.textContent).toContain("263.125");
    expect(within(dialogo).queryByText("Transferencia global Gmail")).toBeNull();
    expect(within(dialogo).queryByText("Pendiente por revisar")).toBeNull();
  });

  it("abre el detalle del movimiento al hacer clic en una fila del bolsillo Gastos", async () => {
    const usuario = userEvent.setup();
    const claveMes = mesActual();
    const movimientosDetalle = [
      {
        idMovimiento: "gasto-detalle",
        idBolsillo: "fijo-gasto",
        tipo: "GASTO",
        estadoRevision: "CONFIRMADO",
        monto: 150000,
        fecha: `${claveMes}-11`,
        concepto: "Gasto reciente",
        categoria: "Compras",
        origenNombre: "Tienda",
      },
    ];
    listarMovimientos.mockImplementation(() =>
      Promise.resolve(movimientosDetalle),
    );

    renderPagina();
    const rejilla = await screen.findByRole("region", { name: "Bolsillos" });
    const cardFijos = within(rejilla).getByRole("article", {
      name: "Bolsillos fijos",
    });
    await usuario.click(
      within(cardFijos).getByRole("button", { name: "Ver detalles de Gastos" }),
    );
    const dialogoBolso = await screen.findByRole("dialog", { name: "Gastos" });
    const fila = await within(dialogoBolso).findByRole("button", {
      name: "Ver detalle del movimiento Gasto reciente",
    });
    await usuario.click(fila);

    const dialogo = await screen.findByRole("dialog", {
      name: "Detalle del movimiento",
    });
    expect(
      within(dialogo).getByRole("heading", { name: "Tienda" }),
    ).toBeInTheDocument();
    expect(
      within(dialogo).getByRole("button", { name: "Editar movimiento Tienda" }),
    ).toBeInTheDocument();
    expect(
      within(dialogo).getByRole("button", { name: "Eliminar movimiento Tienda" }),
    ).toBeInTheDocument();
  });

  it("ofrece los bolsillos fijos primero en el formulario de movimiento", async () => {
    const usuario = userEvent.setup();
    renderPagina();
    await screen.findByText("Gastos diarios");
    await usuario.click(
      screen.getByRole("button", { name: /Nuevo movimiento/ }),
    );
    const dialogo = await screen.findByRole("dialog", {
      name: /Nuevo movimiento/,
    });
    const opciones = within(dialogo)
      .getByLabelText("Bolsillo")
      .querySelectorAll("option:not([disabled])");
    expect(Array.from(opciones).map((opcion) => opcion.textContent)).toEqual([
      "Ingresos · INGRESO · Fijo",
      "Gastos · GASTO · Fijo",
      "Gastos diarios · GASTO",
      "Nómina · INGRESO",
    ]);
  });

  describe("eliminación de pendientes de Gmail", () => {
    const PENDIENTE = {
      idMovimiento: "mov-pendiente",
      idBolsillo: "por-revisar",
      tipo: "GASTO",
      fecha: "2026-11-07",
      monto: 125000,
      categoria: "Suscripciones",
      concepto: "Beam’s free period on Ollama ends this weekend",
      origenTipo: "GMAIL",
      origenId: "cuenta-1:mensaje-1",
      origenNombre: "Ollama",
      estadoRevision: "POR_REVISAR",
    };

    const preparar = () => {
      listarMovimientos.mockImplementation((idBolsillo, tipo, estadoRevision) => {
        if (estadoRevision === "POR_REVISAR" || tipo === "POR_REVISAR")
          return Promise.resolve([PENDIENTE]);
        return Promise.resolve(MOVIMIENTOS);
      });
    };

    const abrirConfirmacion = async () => {
      const usuario = userEvent.setup();
      renderPagina();
      await usuario.click(
        await screen.findByRole("button", { name: /Por revisar/ }),
      );
      const bandeja = await screen.findByRole("dialog", {
        name: "Movimientos por revisar",
      });
      await usuario.click(
        within(bandeja).getByRole("button", { name: "Eliminar" }),
      );
      const confirmacion = await screen.findByRole("dialog", {
        name: "Eliminar movimiento",
      });
      expect(
        within(confirmacion).getByText(/se moverá a la papelera de Gmail/i),
      ).toBeInTheDocument();
      await usuario.click(
        within(confirmacion).getByRole("button", {
          name: "Eliminar movimiento",
        }),
      );
      return confirmacion;
    };

    it("mueve el correo a la papelera antes de eliminar el movimiento pendiente", async () => {
      preparar();
      await abrirConfirmacion();

      expect(moverCorreoAPapelera).toHaveBeenCalledWith(
        "cuenta-1",
        "mensaje-1",
      );
      expect(eliminarMovimiento).toHaveBeenCalledWith("mov-pendiente");
      expect(
        await screen.findByText(
          "Correo movido a la papelera y movimiento eliminado.",
        ),
      ).toBeInTheDocument();
    });

    it("conserva el movimiento si Gmail no permite mover el correo a la papelera", async () => {
      preparar();
      moverCorreoAPapelera.mockRejectedValue(
        new Error("FinApp necesita permiso para modificar tus correos."),
      );
      const confirmacion = await abrirConfirmacion();

      expect(
        within(confirmacion).getByText(
          "FinApp necesita permiso para modificar tus correos.",
        ),
      ).toBeInTheDocument();
      expect(eliminarMovimiento).not.toHaveBeenCalled();
    });

    it("retira la fila de la bandeja al mover el correo a la papelera", async () => {
      preparar();
      const usuario = userEvent.setup();
      renderPagina();
      await usuario.click(
        await screen.findByRole("button", { name: /Por revisar/ }),
      );
      const bandeja = await screen.findByRole("dialog", {
        name: "Movimientos por revisar",
      });
      expect(
        within(bandeja).getByRole("button", {
          name: "Ver detalle del movimiento Ollama",
        }),
      ).toBeInTheDocument();

      await usuario.click(
        within(bandeja).getByRole("button", { name: "Eliminar" }),
      );
      const confirmacion = await screen.findByRole("dialog", {
        name: "Eliminar movimiento",
      });
      await usuario.click(
        within(confirmacion).getByRole("button", {
          name: "Eliminar movimiento",
        }),
      );

      // La bandeja sigue abierta y el pendiente ya no figura en su lista.
      expect(
        await screen.findByRole("dialog", { name: "Movimientos por revisar" }),
      ).toBeInTheDocument();
      await waitFor(() =>
        expect(
          within(bandeja).queryByRole("button", {
            name: "Ver detalle del movimiento Ollama",
          }),
        ).not.toBeInTheDocument(),
      );
      expect(moverCorreoAPapelera).toHaveBeenCalledWith("cuenta-1", "mensaje-1");
    });
  });
});
