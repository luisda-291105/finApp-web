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

  it("no activa Actualizaciones sin aceptar antes la advertencia", async () => {
    const alGuardarConfiguracion = vi.fn();
    renderModal({
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
    renderModal({
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
    renderModal({
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
    renderModal({
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
    renderModal({
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
    renderModal({
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
    renderModal({
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
    renderModal({
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
    renderModal({
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
    renderModal({
      secciones: [
        seccion({ cuentaId: "cuenta-a", email: "a@ejemplo.test" }),
        seccion({ cuentaId: "cuenta-b", email: "b@ejemplo.test" }),
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
