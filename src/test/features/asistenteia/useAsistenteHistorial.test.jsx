import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useAsistenteHistorial } from "../../../features/asistenteia/hooks/useAsistenteHistorial";

const clave = (idUsuario) => `finapp_asistente_sesiones_${idUsuario}`;

describe("useAsistenteHistorial", () => {
  beforeEach(() => {
    const datos = new Map();
    localStorage.clear.mockClear();
    localStorage.getItem.mockImplementation((key) => datos.get(key) ?? null);
    localStorage.setItem.mockImplementation((key, valor) => datos.set(key, String(valor)));
    localStorage.removeItem.mockImplementation((key) => datos.delete(key));
  });

  it("persiste mensajes por sesión y no guarda tokens temporales de confirmación", async () => {
    const { result } = renderHook(() => useAsistenteHistorial("usuario-1"));

    act(() => result.current.setMensajes([
      { rol: "user", contenido: "Contacto llamado Aron" },
      {
        rol: "assistant",
        contenido: "Encontré el contacto.",
        accionPendiente: { token: "secreto-temporal", descripcion: "Crear contacto" },
      },
    ]));

    await waitFor(() => expect(JSON.parse(localStorage.getItem(clave("usuario-1")) || "[]")).toHaveLength(1));
    const [sesion] = JSON.parse(localStorage.getItem(clave("usuario-1")));
    expect(sesion.titulo).toBe("Contacto llamado Aron");
    expect(sesion.mensajes).toHaveLength(2);
    expect(sesion.mensajes[1]).not.toHaveProperty("accionPendiente");
    expect(JSON.stringify(sesion)).not.toContain("secreto-temporal");
  });

  it("recupera sesiones guardadas después de desmontar y permite abrirlas", async () => {
    const primeraMontada = renderHook(() => useAsistenteHistorial("usuario-1"));
    act(() => primeraMontada.result.current.setMensajes([
      { rol: "user", contenido: "¿Qué contactos tengo?" },
      { rol: "assistant", contenido: "Tienes dos contactos." },
    ]));
    await waitFor(() => expect(JSON.parse(localStorage.getItem(clave("usuario-1")) || "[]")).toHaveLength(1));
    const idSesion = JSON.parse(localStorage.getItem(clave("usuario-1")))[0].id;
    primeraMontada.unmount();

    const segundaMontada = renderHook(() => useAsistenteHistorial("usuario-1"));
    expect(segundaMontada.result.current.sesiones).toHaveLength(1);
    act(() => segundaMontada.result.current.abrirSesion(idSesion));
    expect(segundaMontada.result.current.mensajes.map(({ contenido }) => contenido)).toEqual([
      "¿Qué contactos tengo?",
      "Tienes dos contactos.",
    ]);
  });

  it("mantiene separadas las conversaciones de cada usuario", async () => {
    const { result, rerender } = renderHook(({ idUsuario }) => useAsistenteHistorial(idUsuario), {
      initialProps: { idUsuario: "usuario-1" },
    });
    act(() => result.current.setMensajes([{ rol: "user", contenido: "Sesión uno" }]));
    await waitFor(() => expect(JSON.parse(localStorage.getItem(clave("usuario-1")) || "[]")).toHaveLength(1));

    rerender({ idUsuario: "usuario-2" });
    await waitFor(() => expect(result.current.sesiones).toEqual([]));
    act(() => result.current.setMensajes([{ rol: "user", contenido: "Sesión dos" }]));
    await waitFor(() => expect(JSON.parse(localStorage.getItem(clave("usuario-2")) || "[]")).toHaveLength(1));

    expect(JSON.parse(localStorage.getItem(clave("usuario-1")))[0].titulo).toBe("Sesión uno");
    expect(JSON.parse(localStorage.getItem(clave("usuario-2")))[0].titulo).toBe("Sesión dos");
  });
});
