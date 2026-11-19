import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import LimpiezaAutomaticaPapelera from "../../../../../../features/correos/components/modals/papelera/LimpiezaAutomaticaPapelera";

const configBase = (extra = {}) => ({
  categorias: [
    {
      categoria: "CATEGORY_PROMOTIONS",
      activa: false,
      requiereAdvertencia: false,
      advertenciaAceptada: false,
    },
    {
      categoria: "CATEGORY_UPDATES",
      activa: false,
      requiereAdvertencia: true,
      advertenciaAceptada: false,
    },
  ],
  antiguedadMinimaDias: 7,
  limitePorEjecucion: 200,
  scopeAutorizado: true,
  ...extra,
});

const configConPromociones = (extra = {}) =>
  configBase({
    categorias: [
      {
        categoria: "CATEGORY_PROMOTIONS",
        activa: true,
        requiereAdvertencia: false,
        advertenciaAceptada: false,
      },
    ],
    ...extra,
  });

const gestionBase = (extra = {}) => ({
  cuentaId: "cuenta-a",
  configuracion: configBase(),
  cargandoConfiguracion: false,
  guardandoConfiguracion: false,
  requierePermiso: false,
  vistaPreviaInformativa: null,
  vistaPreviaLimpieza: null,
  generandoVistaPrevia: false,
  vistaPreviaDesactualizada: false,
  lote: null,
  limpiando: false,
  listaBlanca: [],
  cargandoListaBlanca: false,
  agregandoRemitente: false,
  eliminandoRemitenteId: null,
  ...extra,
});

const cuentasBase = [{ cuentaId: "cuenta-a", email: "a@ejemplo.test" }];

const renderLimpieza = (props = {}) =>
  render(
    <LimpiezaAutomaticaPapelera
      cuentas={cuentasBase}
      gestion={gestionBase()}
      accionesGestion={{}}
      autorizando={null}
      alAutorizar={vi.fn()}
      alCerrarAviso={vi.fn()}
      {...props}
    />,
  );

const almacen = new Map();
const resetLocalStorageMock = () => {
  almacen.clear();
  window.localStorage.getItem.mockImplementation((clave) =>
    almacen.has(clave) ? almacen.get(clave) : null,
  );
  window.localStorage.setItem.mockImplementation((clave, valor) => {
    almacen.set(clave, String(valor));
  });
  window.localStorage.clear.mockImplementation(() => almacen.clear());
};

afterEach(() => cleanup());
beforeEach(() => resetLocalStorageMock());

describe("LimpiezaAutomaticaPapelera", () => {
  it("minimiza y expande la sección con el botón del título", async () => {
    renderLimpieza({
      gestion: gestionBase(),
    });

    expect(
      screen.getByText(/elige qué correos recibidos/i),
    ).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: /minimizar la limpieza/i }),
    );
    expect(screen.queryByText(/elige qué correos recibidos/i)).toBeNull();
    expect(
      screen.getByRole("button", { name: /expandir la limpieza/i }),
    ).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: /expandir la limpieza/i }),
    );
    expect(
      screen.getByText(/elige qué correos recibidos/i),
    ).toBeInTheDocument();
  });

  it("no activa Actualizaciones sin aceptar antes la advertencia", async () => {
    const alGuardarConfiguracion = vi.fn();
    renderLimpieza({
      gestion: gestionBase(),
      accionesGestion: { alGuardarConfiguracion },
    });

    const casillaUpdates = screen.getByRole("checkbox", {
      name: /^actualizaciones$/i,
    });
    await userEvent.click(casillaUpdates);

    expect(screen.getByRole("alert")).toHaveTextContent(
      /acepta la advertencia de actualizaciones/i,
    );
    expect(casillaUpdates).not.toBeChecked();

    await userEvent.click(
      screen.getByRole("button", { name: /guardar configuración/i }),
    );
    expect(alGuardarConfiguracion).toHaveBeenCalledWith(
      expect.objectContaining({ categoriasActivas: [] }),
    );
  });

  it("activa Actualizaciones y guarda tras aceptar la advertencia", async () => {
    const alGuardarConfiguracion = vi.fn();
    renderLimpieza({
      gestion: gestionBase(),
      accionesGestion: { alGuardarConfiguracion },
    });

    await userEvent.click(
      screen.getByRole("checkbox", {
        name: /acepto la advertencia de actualizaciones/i,
      }),
    );
    await userEvent.click(
      screen.getByRole("checkbox", { name: /^actualizaciones$/i }),
    );

    expect(
      screen.getByRole("checkbox", { name: /^actualizaciones$/i }),
    ).toBeChecked();

    await userEvent.click(
      screen.getByRole("button", { name: /guardar configuración/i }),
    );
    expect(alGuardarConfiguracion).toHaveBeenCalledWith(
      expect.objectContaining({
        categoriasActivas: ["CATEGORY_UPDATES"],
        advertenciaAceptada: true,
      }),
    );
  });

  it("guarda la antigüedad y el límite por ejecución editados", async () => {
    const alGuardarConfiguracion = vi.fn();
    renderLimpieza({
      gestion: gestionBase(),
      accionesGestion: { alGuardarConfiguracion },
    });

    const antiguedad = screen.getByLabelText(/antigüedad mínima/i);
    const limite = screen.getByLabelText(/límite por ejecución/i);
    await userEvent.clear(antiguedad);
    await userEvent.type(antiguedad, "21");
    await userEvent.clear(limite);
    await userEvent.type(limite, "10");
    await userEvent.click(
      screen.getByRole("button", { name: /guardar configuración/i }),
    );

    expect(alGuardarConfiguracion).toHaveBeenCalledWith(
      expect.objectContaining({
        antiguedadMinimaDias: 21,
        limitePorEjecucion: 10,
      }),
    );
  });

  it("genera la vista previa con las categorías activas y la antigüedad", async () => {
    const alGenerarVistaPrevia = vi.fn();
    renderLimpieza({
      gestion: gestionBase({ configuracion: configConPromociones() }),
      accionesGestion: { alGenerarVistaPrevia },
    });

    await userEvent.click(
      screen.getByRole("button", { name: /generar vista previa/i }),
    );
    expect(alGenerarVistaPrevia).toHaveBeenCalledWith({
      categorias: ["CATEGORY_PROMOTIONS"],
      antiguedadMinimaDias: 7,
    });
  });

  it("muestra el conteo, los remitentes y los excluidos, y exige confirmar antes de limpiar", async () => {
    const alConfirmarLimpieza = vi.fn();
    renderLimpieza({
      gestion: gestionBase({
        configuracion: configConPromociones(),
        vistaPreviaLimpieza: {
          vistaPreviaId: "vp-1",
          totalEstimado: 34,
          porCategoria: [
            {
              categoria: "CATEGORY_PROMOTIONS",
              cantidad: 28,
              remitentes: [{ remitente: "promo@tienda.com", cantidad: 12 }],
            },
          ],
          excluidosPorMotivo: [{ motivo: "LISTA_BLANCA", cantidad: 2 }],
        },
      }),
      accionesGestion: { alConfirmarLimpieza },
    });

    expect(screen.getByText(/se moverían 34 correo/i)).toBeInTheDocument();
    expect(screen.getByText("promo@tienda.com (12)")).toBeInTheDocument();
    expect(screen.getByText(/en tu lista blanca: 2/i)).toBeInTheDocument();

    const ejecutar = screen.getByRole("button", { name: /ejecutar limpieza/i });
    expect(ejecutar).toBeDisabled();

    await userEvent.click(
      screen.getByRole("checkbox", { name: /confirmo mover 34 correo/i }),
    );
    expect(ejecutar).toBeEnabled();

    await userEvent.click(ejecutar);
    expect(alConfirmarLimpieza).toHaveBeenCalled();
  });

  it("pide una nueva vista previa cuando el conteo cambió", () => {
    renderLimpieza({
      gestion: gestionBase({
        configuracion: configConPromociones(),
        vistaPreviaDesactualizada: true,
      }),
    });

    expect(
      screen.getByText(/el conteo cambió desde la vista previa/i),
    ).toBeInTheDocument();
  });

  it("informa del remanente cuando la limpieza alcanzó el límite por ejecución", () => {
    renderLimpieza({
      gestion: gestionBase({
        configuracion: configConPromociones(),
        lote: {
          loteId: "lote-1",
          estado: "COMPLETADO",
          total: 40,
          movidos: 20,
          omitidos: 20,
          fallidos: 0,
          limiteEjecucionAlcanzado: true,
        },
      }),
    });

    expect(
      screen.getByText(/se alcanzó el límite por ejecución/i),
    ).toBeInTheDocument();
  });

  it("añade y quita remitentes de la lista blanca", async () => {
    const alAgregarRemitente = vi.fn();
    const alEliminarRemitente = vi.fn();
    renderLimpieza({
      gestion: gestionBase({
        listaBlanca: [{ id: "c-1", remitente: "banco@banco.com" }],
      }),
      accionesGestion: { alAgregarRemitente, alEliminarRemitente },
    });

    expect(screen.getByText("banco@banco.com")).toBeInTheDocument();

    await userEvent.type(
      screen.getByLabelText(/añadir remitente/i),
      "otro@ejemplo.test",
    );
    await userEvent.click(screen.getByRole("button", { name: /^añadir$/i }));
    expect(alAgregarRemitente).toHaveBeenCalledWith("otro@ejemplo.test");

    await userEvent.click(
      screen.getByRole("button", { name: /quitar banco@banco.com/i }),
    );
    expect(alEliminarRemitente).toHaveBeenCalledWith("c-1");
  });

  it("ofrece autorizar el permiso cuando la cuenta de gestión no lo tiene", async () => {
    const alAutorizar = vi.fn();
    renderLimpieza({
      gestion: gestionBase({ requierePermiso: true }),
      alAutorizar,
    });

    await userEvent.click(
      screen.getByRole("button", { name: /autorizar permiso/i }),
    );
    expect(alAutorizar).toHaveBeenCalledWith("cuenta-a");
  });

  it("permite elegir la cuenta a configurar cuando hay varias conectadas", async () => {
    const alSeleccionarCuenta = vi.fn();
    renderLimpieza({
      cuentas: [
        { cuentaId: "cuenta-a", email: "a@ejemplo.test" },
        { cuentaId: "cuenta-b", email: "b@ejemplo.test" },
      ],
      gestion: gestionBase(),
      accionesGestion: { alSeleccionarCuenta },
    });

    await userEvent.selectOptions(
      screen.getByLabelText(/cuenta a configurar/i),
      "cuenta-b",
    );
    expect(alSeleccionarCuenta).toHaveBeenCalledWith("cuenta-b");
  });
});
