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
import { AlertaGlobal } from "../../../../features/error";

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
    <div className="modal-overlay-dashboard z-[100] flex items-end justify-center bg-bg-dark/70 p-0 sm:items-center sm:p-4" onClick={(evento) => evento.target === evento.currentTarget && !cargando && alCerrar()}>
      <FocusTrap focusTrapOptions={opcionesTrampa(panelRef)}>
        <section ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="crear-grupo-titulo" tabIndex={-1} className="glass-surface modal-sheet-mobile relative mb-[var(--bottom-nav-alto)] max-h-[85dvh] w-full max-w-md overflow-y-auto rounded-t-[1.75rem] border border-border-line/30 bg-bg-cream/95 p-6 text-bg-dark shadow-xl outline-none sm:mb-0 sm:rounded-3xl">
          <header className="mb-5 flex items-start justify-between gap-4">
            <div><h2 id="crear-grupo-titulo" className="font-display text-xl font-semibold">Crear grupo</h2><p className="mt-1 text-sm text-slate-text">El registro quedará vinculado a {usuario?.nombre || "tu usuario activo"}.</p></div>
            <BotonCerrar ariaLabel="Cerrar crear grupo" alCerrar={() => !cargando && alCerrar()} />
          </header>
          <form onSubmit={enviar} className="space-y-4">
            <GrupoForm valores={valores} alCambiar={cambiar} deshabilitado={cargando} />
            <AlertaGlobal tipo="error" mensaje={error} idBase="CrearGrupoModal-error" />
            <button type="submit" disabled={cargando} className="min-h-10 rounded-xl bg-emerald-primary px-4 text-sm font-semibold text-bg-cream transition-colors hover:bg-emerald-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary disabled:cursor-not-allowed disabled:opacity-50">{cargando ? "Guardando…" : "Guardar registro"}</button>
          </form>
        </section>
      </FocusTrap>
    </div>
  );
}
