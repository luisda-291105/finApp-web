/**
 * @uso        Pruebas unitarias para la página de Bolsillos Grupales del dashboard (spec 021)
 * @funciones  test renderiza cabecera y métricas, test tarjetas de equipo, test acción compartir
 * @datos      N/A
 * @eventos    click en botones de compartir y nuevo bolsillo
 * @estados    feedback de copia, aviso informativo
 * @usadoPor   Vitest (npm test)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import PaginaDashboardBolsillos from "../../pages/PaginaDashboardBolsillos";

vi.mock("../../context/UsuarioActivoContext", () => ({
  useUsuarioActivo: () => ({ usuario: { idUsuario: "usuario-prueba" } }),
}));

const renderConDatos = async (ui) => {
  await act(async () => {
    render(ui);
  });
};

vi.mock("../../services/grupoServicio", () => ({
  obtenerGruposPorUsuario: vi.fn(() => Promise.resolve([
    {
      id: "bolsillo-1",
      nombre: "Gastos de Oficina",
      descripcion: "Suministros, licencias comunes y servicios de coworking del equipo.",
      balance: 4250.0,
      meta: 5000.0,
      fuenteCompartida: "Cuenta Operativa BBVA",
      fuentes: [{ idFuente: "fuente-demo-1", tipo: "CORREO", contenido: "operaciones@ejemplo.test" }],
      miembros: [
        { id: "m1", iniciales: "JD", nombre: "Juan Daniel", rol: "Admin" },
        { id: "m2", iniciales: "ML", nombre: "María López", rol: "Editor" },
        { id: "m3", iniciales: "AR", nombre: "Ana Rivas", rol: "Miembro" },
        { id: "m4", iniciales: "CP", nombre: "Carlos Peña", rol: "Miembro" },
      ],
    },
    {
      id: "bolsillo-2",
      nombre: "Viaje y Retiro de Equipo",
      descripcion: "Aportes conjuntos para el retiro anual y actividades de integración.",
      balance: 8100.0,
      meta: 10000.0,
      fuenteCompartida: "Fondo Santander Ahorro",
      fuentes: [{ idFuente: "fuente-demo-2", tipo: "OTRO", contenido: "Fondo Santander Ahorro" }],
      miembros: [
        { id: "m1", iniciales: "JD", nombre: "Juan Daniel", rol: "Admin" },
        { id: "m5", iniciales: "SR", nombre: "Sofía Ruiz", rol: "Editor" },
        { id: "m6", iniciales: "VT", nombre: "Valeria Torres", rol: "Miembro" },
        { id: "m7", iniciales: "NM", nombre: "Nicolás Mora", rol: "Miembro" },
        { id: "m8", iniciales: "EL", nombre: "Elena Lara", rol: "Miembro" },
      ],
    },
    {
      id: "bolsillo-3",
      nombre: "Fondo Común de Innovación",
      descripcion: "Presupuesto compartido para prototipado, cursos y herramientas de I+D.",
      balance: 2500.0,
      meta: 3000.0,
      fuenteCompartida: "Billetera Digital Stripe",
      fuentes: [{ idFuente: "fuente-demo-3", tipo: "OTRO", contenido: "Billetera Digital Stripe" }],
      miembros: [
        { id: "m1", iniciales: "JD", nombre: "Juan Daniel", rol: "Admin" },
        { id: "m3", iniciales: "AR", nombre: "Ana Rivas", rol: "Editor" },
        { id: "m9", iniciales: "KL", nombre: "Kevin Lozano", rol: "Miembro" },
      ],
    },
  ])),
  crearGrupo: vi.fn(),
  vincularFuenteAGrupo: vi.fn(async (idGrupo, idFuente) => ({
    idGrupo,
    nombre: "Gastos de Oficina",
    descripcion: "Suministros, licencias comunes y servicios de coworking del equipo.",
    fuentes: [{ idFuente, tipo: "CORREO", contenido: "nueva@ejemplo.test" }],
  })),
  desvincularFuenteDeGrupo: vi.fn(),
  actualizarGrupo: vi.fn(),
  eliminarGrupo: vi.fn(),
}));

vi.mock("../../services/fuenteServicio", () => ({
  obtenerFuentesPorUsuario: vi.fn(async () => [
    { idFuente: "fuente-registrada", tipo: "CORREO", contenido: "registrada@ejemplo.test" },
  ]),
  crearFuente: vi.fn(async (fuente) => fuente),
}));

import { obtenerFuentesPorUsuario, crearFuente } from "../../services/fuenteServicio";
import { vincularFuenteAGrupo, desvincularFuenteDeGrupo, actualizarGrupo, eliminarGrupo } from "../../services/grupoServicio";

describe("PaginaDashboardBolsillos", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  window.innerWidth = 1024;
  window.matchMedia = vi.fn((query) => {
    const minimo = Number((/(\d+)px/.exec(query) || [])[1] ?? 0);
    return {
      matches: window.innerWidth >= minimo,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    };
  });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renderiza la cabecera y el título accesible de la página", async () => {
    await renderConDatos(<PaginaDashboardBolsillos />);

    const titulo = screen.getByRole("heading", { level: 1, name: "Bolsillos Grupales" });
    expect(titulo).toBeInTheDocument();
    expect(screen.getByText("FinApp / Panel")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Crear nuevo bolsillo grupal" })).toBeInTheDocument();
  });

  it("muestra las cuatro métricas de resumen colectivo", async () => {
    await renderConDatos(<PaginaDashboardBolsillos />);

    expect(screen.getByText("Balance Colectivo")).toBeInTheDocument();
    expect(screen.getByText("Meta Total")).toBeInTheDocument();
    expect(screen.getByText("Bolsillos Activos")).toBeInTheDocument();
    expect(screen.getByText("Fuentes Vinculadas")).toBeInTheDocument();

    // Comprobar valor de bolsillos activos (3)
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("3 cuentas")).toBeInTheDocument();
  });

  it("renderiza las tarjetas de bolsillos de equipo con sus fuentes y progreso", async () => {
    await renderConDatos(<PaginaDashboardBolsillos />);

    expect(screen.getByText("Gastos de Oficina")).toBeInTheDocument();
    expect(screen.getByText("Viaje y Retiro de Equipo")).toBeInTheDocument();
    expect(screen.getByText("Fondo Común de Innovación")).toBeInTheDocument();

    expect(screen.getByText("Cuenta Operativa BBVA")).toBeInTheDocument();
    expect(screen.getByText("Fondo Santander Ahorro")).toBeInTheDocument();
    expect(screen.getByText("Billetera Digital Stripe")).toBeInTheDocument();

    const barras = screen.getAllByRole("progressbar");
    expect(barras).toHaveLength(3);
    barras.forEach((barra) => {
      expect(barra).toHaveAttribute("aria-valuenow");
      expect(barra).toHaveAttribute("aria-valuemin", "0");
      expect(barra).toHaveAttribute("aria-valuemax", "100");
    });
  });

  it("permite simular la copia del enlace de entrada con feedback visual accesible", async () => {
    await renderConDatos(<PaginaDashboardBolsillos />);

    const botonCompartir = screen.getByRole("button", {
      name: "Compartir entrada de Gastos de Oficina",
    });
    expect(botonCompartir).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(botonCompartir);
    });

    // Se muestra estado de confirmación
    expect(screen.getByText("¡Copiado!")).toBeInTheDocument();
  });

  it("abre el formulario de registro al hacer click en 'Nuevo Grupo'", async () => {
    await renderConDatos(<PaginaDashboardBolsillos />);

    const botonNuevo = screen.getByRole("button", { name: "Crear nuevo bolsillo grupal" });
    fireEvent.click(botonNuevo);

    const dialogo = screen.getByRole("dialog", { name: "Crear grupo" });
    expect(screen.getByLabelText("Nombre del grupo")).toBeInTheDocument();
    expect(screen.getByLabelText("Descripción")).toBeInTheDocument();
    expect(dialogo).toBeInTheDocument();
  });

  it("abre el detalle accesible, lista fuentes existentes y permite vincular una", async () => {
    await renderConDatos(<PaginaDashboardBolsillos />);
    fireEvent.click(screen.getByRole("button", { name: "Abrir grupo Gastos de Oficina" }));

    const dialogo = screen.getByRole("dialog", { name: "Gastos de Oficina" });
    expect(dialogo).toHaveAttribute("aria-modal", "true");
    expect(await screen.findByText("Fuentes vinculadas")).toBeInTheDocument();
    expect(obtenerFuentesPorUsuario).toHaveBeenCalledWith("usuario-prueba");

    fireEvent.change(screen.getByRole("combobox", { name: "Fuente registrada" }), { target: { value: "fuente-registrada" } });
    fireEvent.click(screen.getByRole("button", { name: "Vincular fuente" }));

    expect(await screen.findByRole("status")).toHaveTextContent("quedó vinculada al grupo");
    expect(vincularFuenteAGrupo).toHaveBeenCalledWith("bolsillo-1", "fuente-registrada", "usuario-prueba");
  });

  it("registra una fuente nueva desde el detalle y la vincula al grupo", async () => {
    await renderConDatos(<PaginaDashboardBolsillos />);
    fireEvent.click(screen.getByRole("button", { name: "Abrir grupo Gastos de Oficina" }));
    fireEvent.click(screen.getByText("Registrar una fuente nueva para este grupo"));
    fireEvent.change(screen.getByLabelText("Contenido"), { target: { value: "nueva@ejemplo.test" } });
    fireEvent.click(screen.getByRole("button", { name: "Registrar y vincular" }));

    expect(await screen.findByRole("status")).toHaveTextContent("se registró y quedó vinculada");
    expect(crearFuente).toHaveBeenCalledWith(expect.objectContaining({
      tipo: "CORREO",
      contenido: "nueva@ejemplo.test",
      usuario: { idUsuario: "usuario-prueba" },
    }));
    expect(vincularFuenteAGrupo).toHaveBeenCalledWith("bolsillo-1", expect.any(String), "usuario-prueba");
  });

  it("muestra el chat local, prepara invitaciones sin enviarlas y lista la pestaña de solicitudes", async () => {
    await renderConDatos(<PaginaDashboardBolsillos />);
    fireEvent.click(screen.getByRole("button", { name: "Abrir grupo Gastos de Oficina" }));
    fireEvent.click(screen.getByRole("tab", { name: "Chat grupal" }));
    fireEvent.change(screen.getByLabelText("Mensaje"), { target: { value: "Nos vemos en la reunión" } });
    fireEvent.click(screen.getByRole("button", { name: "Enviar" }));
    expect(screen.getByText("Nos vemos en la reunión")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Correo de la persona"), { target: { value: "persona@ejemplo.test" } });
    fireEvent.click(screen.getByRole("button", { name: "Preparar invitación" }));
    expect(screen.getByRole("status")).toHaveTextContent("El envío estará disponible");

    fireEvent.click(screen.getByRole("button", { name: "Cerrar grupo Gastos de Oficina" }));
    fireEvent.click(screen.getByRole("tab", { name: "Solicitudes" }));
    expect(screen.getByText("Ejemplos de solicitudes; esta vista aún no recibe ni persiste solicitudes reales.")).toBeInTheDocument();
    expect(screen.getByText("María López solicita unirse")).toBeInTheDocument();
  });

  it("permite desvincular una fuente sin eliminarla del registro del usuario", async () => {
    const fuentesDelGrupo = [{ idFuente: "fuente-vinculada", tipo: "CORREO", contenido: "grupo@ejemplo.test" }];
    const { obtenerGruposPorUsuario } = await import("../../services/grupoServicio");
    obtenerGruposPorUsuario.mockResolvedValueOnce([{ idGrupo: "grupo-1", nombre: "Grupo de prueba", descripcion: "Descripción", fuentes: fuentesDelGrupo }]);
    desvincularFuenteDeGrupo.mockResolvedValueOnce({ idGrupo: "grupo-1", nombre: "Grupo de prueba", descripcion: "Descripción", fuentes: [] });
    await renderConDatos(<PaginaDashboardBolsillos />);
    fireEvent.click(await screen.findByRole("button", { name: "Abrir grupo Grupo de prueba" }));
    fireEvent.click(screen.getByRole("button", { name: "Desvincular" }));

    expect(await screen.findByRole("status")).toHaveTextContent("sigue registrada en tu cuenta");
    expect(desvincularFuenteDeGrupo).toHaveBeenCalledWith("grupo-1", "fuente-vinculada", "usuario-prueba");
  });

  it("permite editar el nombre y la descripción del grupo desde el detalle", async () => {
    actualizarGrupo.mockResolvedValue({ idGrupo: "bolsillo-1", nombre: "Gastos del equipo", descripcion: "Aportes compartidos" });
    await renderConDatos(<PaginaDashboardBolsillos />);
    fireEvent.click(screen.getByRole("button", { name: "Abrir grupo Gastos de Oficina" }));
    fireEvent.click(screen.getByRole("button", { name: "Editar grupo" }));
    fireEvent.change(screen.getByLabelText("Nombre"), { target: { value: "Gastos del equipo" } });
    fireEvent.change(screen.getByLabelText("Descripción"), { target: { value: "Aportes compartidos" } });
    fireEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));
    await waitFor(() => expect(actualizarGrupo).toHaveBeenCalledWith("bolsillo-1", { nombre: "Gastos del equipo", descripcion: "Aportes compartidos" }, "usuario-prueba"));
    expect(await screen.findByText("Grupo actualizado.")).toBeInTheDocument();
  });

  it("pide confirmación y elimina solo el grupo seleccionado", async () => {
    eliminarGrupo.mockResolvedValue(true);
    await renderConDatos(<PaginaDashboardBolsillos />);
    fireEvent.click(screen.getByRole("button", { name: "Abrir grupo Gastos de Oficina" }));
    fireEvent.click(screen.getByRole("button", { name: "Eliminar grupo" }));
    expect(eliminarGrupo).not.toHaveBeenCalled();
    expect(screen.getByRole("alertdialog", { name: "Confirmar eliminación de grupo" })).toHaveTextContent("Las fuentes vinculadas seguirán registradas");
    fireEvent.click(screen.getByRole("button", { name: "Confirmar eliminación" }));
    await waitFor(() => expect(eliminarGrupo).toHaveBeenCalledWith("bolsillo-1", "usuario-prueba"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryByText("Gastos de Oficina")).not.toBeInTheDocument();
  });

});
