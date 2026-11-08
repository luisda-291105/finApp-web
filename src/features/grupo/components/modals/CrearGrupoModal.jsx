/**
 * @uso        Modal para crear un grupo vinculado al usuario activo
 * @funciones  CrearGrupoModal({ abierto, alCerrar, triggerRef, alGuardar })
 * @datos      Crea el grupo mediante gruposService y notifica el registro guardado
 * @eventos    Submit, Escape, botón de cierre y clic exterior
 * @estados    valores, error, cargando
 * @usadoPor   GruposPage
 */
import { useEffect, useRef, useState } from "react";
import FocusTrap from "focus-trap-react";
import { BotonCerrar } from "../../../../components/ui";
import { useCierreConEsc } from "../../../../hooks/useCierreConEsc";
import { useRetornoDeFoco } from "../../../../hooks/useRetornoDeFoco";
import { useUsuarioActivo } from "../../../../context/UsuarioActivoContext";
import { crearGrupo } from "../../services/gruposService";
import GrupoForm from "../forms/GrupoForm";

function opcionesTrampa(refPanel) {
  return { allowOutsideClick: true, escapeDeactivates: false, initialFocus: () => refPanel.current, returnFocusOnDeactivate: false };
}

/** Formulario modal de creación; espera la persistencia antes de cerrarse. */
export default function CrearGrupoModal({ abierto, alCerrar, triggerRef, alGuardar }) {
  const panelRef = useRef(null);
  const { usuario } = useUsuarioActivo();
  const [valores, setValores] = useState({ nombre: "", descripcion: "" });
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (abierto) {
      setValores({ nombre: "", descripcion: "" });
      setError("");
    }
  }, [abierto]);

  useCierreConEsc({ activo: abierto, zIndex: 60, alCerrar: () => !cargando && alCerrar() });
  useRetornoDeFoco({ activo: abierto, triggerRef });

  if (!abierto) return null;

  const cambiar = (campo, valor) => setValores((actuales) => ({ ...actuales, [campo]: valor }));
  const enviar = async (evento) => {
    evento.preventDefault();
    if (!usuario?.idUsuario) {
      setError("Inicia sesión para registrar datos en tu cuenta.");
      return;
    }
    const nombre = valores.nombre.trim();
    const descripcion = valores.descripcion.trim();
    if (!nombre || !descripcion) {
      setError("El nombre y la descripción son obligatorios.");
      return;
    }

    setCargando(true);
    setError("");
    const fecha = new Date();
    const payload = {
      ...valores,
      nombre,
      descripcion,
      idGrupo: globalThis.crypto?.randomUUID?.() || `grupo-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      estado: true,
      fechaCreacion: `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(fecha.getDate()).padStart(2, "0")}`,
      usuario: { idUsuario: usuario.idUsuario },
    };
    try {
      const guardado = await crearGrupo(payload);
      alGuardar?.(guardado || payload);
      alCerrar();
    } catch (fallo) {
      setError(fallo?.message || "No se pudo guardar el registro.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-dark/70 p-4" onClick={(evento) => evento.target === evento.currentTarget && !cargando && alCerrar()}>
      <FocusTrap focusTrapOptions={opcionesTrampa(panelRef)}>
        <section ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="crear-grupo-titulo" tabIndex={-1} className="glass-surface relative max-h-[85vh] w-full max-w-md overflow-y-auto rounded-3xl border border-border-line/30 bg-bg-cream/95 p-6 text-bg-dark shadow-xl outline-none">
          <header className="mb-5 flex items-start justify-between gap-4">
            <div><h2 id="crear-grupo-titulo" className="font-display text-xl font-semibold">Crear grupo</h2><p className="mt-1 text-sm text-slate-text">El registro quedará vinculado a {usuario?.nombre || "tu usuario activo"}.</p></div>
            <BotonCerrar ariaLabel="Cerrar crear grupo" alCerrar={() => !cargando && alCerrar()} />
          </header>
          <form onSubmit={enviar} className="space-y-4">
            <GrupoForm valores={valores} alCambiar={cambiar} deshabilitado={cargando} />
            {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-100 p-3 text-sm text-red-700">{error}</p>}
            <button type="submit" disabled={cargando} className="min-h-10 rounded-xl bg-emerald-primary px-4 text-sm font-semibold text-bg-cream transition-colors hover:bg-emerald-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary disabled:cursor-not-allowed disabled:opacity-50">{cargando ? "Guardando…" : "Guardar registro"}</button>
          </form>
        </section>
      </FocusTrap>
    </div>
  );
}
