/**
 * @uso        Modal para compartir un archivo/carpeta y gestionar permisos
 * @funciones  ModalCompartir({ abierto, item, cuentaId, alCerrar, alExito, alError })
 * @datos      Lista y modifica permisos remotos vía almacenamientoServicio
 * @eventos    Cargar permisos, añadir por correo, cambiar rol, revocar, copiar enlace, cierre
 * @estados    permisos, cargando, guardando, correo, rol, errorLocal
 * @usadoPor   AlmacenamientoPage
 */
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import FocusTrap from "focus-trap-react";
import { Copy, Link2, Trash2, UserPlus } from "lucide-react";
import { BotonCerrar } from "../../../../components/ui";
import { useCierreConEsc } from "../../../../hooks/useCierreConEsc";
import { useRetornoDeFoco } from "../../../../hooks/useRetornoDeFoco";
import { compartir, listarPermisos, revocarPermiso } from "../../services/almacenamientoServicio";

export default function ModalCompartir({ abierto, item, cuentaId, alCerrar, alExito, alError }) {
  const [permisos, setPermisos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [correo, setCorreo] = useState("");
  const [rol, setRol] = useState("lector");

  useCierreConEsc({ activo: abierto, zIndex: 140, alCerrar });
  useRetornoDeFoco({ activo: abierto, triggerRef: null });

  useEffect(() => {
    if (!abierto || !item?.id || !cuentaId) return;
    let activo = true;
    setCargando(true);
    listarPermisos(cuentaId, item.id)
      .then((lista) => { if (activo) setPermisos(Array.isArray(lista) ? lista : lista?.permisos || []); })
      .catch((e) => alError?.(e))
      .finally(() => { if (activo) setCargando(false); });
    return () => { activo = false; };
  }, [abierto, item?.id, cuentaId, alError]);

  if (!abierto || !item) return null;

  const recargar = async () => {
    const lista = await listarPermisos(cuentaId, item.id);
    setPermisos(Array.isArray(lista) ? lista : lista?.permisos || []);
  };

  const agregar = async (evento) => {
    evento.preventDefault();
    if (!correo.trim()) return;
    setGuardando(true);
    try {
      await compartir(cuentaId, item.id, { correo: correo.trim(), rol });
      setCorreo("");
      await recargar();
      alExito?.("Permiso agregado correctamente.");
    } catch (e) { alError?.(e); } finally { setGuardando(false); }
  };

  const cambiarRol = async (permiso, nuevoRol) => {
    if (!permiso?.correo && !permiso?.email) return;
    setGuardando(true);
    try {
      await compartir(cuentaId, item.id, { correo: permiso.correo || permiso.email, rol: nuevoRol, permisoId: permiso.id });
      await recargar();
      alExito?.("Rol actualizado.");
    } catch (e) { alError?.(e); } finally { setGuardando(false); }
  };

  const revocar = async (permiso) => {
    if (!permiso?.id) return;
    setGuardando(true);
    try {
      await revocarPermiso(cuentaId, item.id, permiso.id);
      await recargar();
      alExito?.("Permiso revocado.");
    } catch (e) { alError?.(e); } finally { setGuardando(false); }
  };

  const copiarEnlace = async () => {
    const enlace = item.enlaceExterno || item.webViewLink || item.enlace || "";
    if (!enlace) { alError?.(new Error("No hay un enlace disponible para este elemento.")); return; }
    try {
      await navigator.clipboard.writeText(enlace);
      alExito?.("Enlace copiado al portapapeles.");
    } catch { alError?.(new Error("No se pudo copiar el enlace.")); }
  };

  return createPortal(
    <div className="fixed inset-0 z-[1200] flex items-end justify-center bg-bg-dark/70 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={(e) => { if (e.target === e.currentTarget) alCerrar(); }}>
      <FocusTrap focusTrapOptions={{ allowOutsideClick: true, escapeDeactivates: false, returnFocusOnDeactivate: false }}>
        <section role="dialog" aria-modal="true" aria-labelledby="modal-compartir-titulo" className="glass-surface w-full max-w-lg rounded-t-3xl border border-border-line/30 bg-bg-cream/95 p-5 text-bg-dark shadow-2xl outline-none sm:rounded-3xl">
          <header className="mb-4 flex items-start justify-between gap-4 border-b border-border-line/30 pb-4">
            <div className="min-w-0">
              <h2 id="modal-compartir-titulo" className="truncate font-display text-lg font-semibold">Compartir</h2>
              <p className="truncate text-xs text-slate-text">{item.nombre}</p>
            </div>
            <BotonCerrar ariaLabel="Cerrar compartir" alCerrar={alCerrar} />
          </header>

          <form onSubmit={agregar} className="flex flex-col gap-2 sm:flex-row">
            <label className="sr-only" htmlFor="compartir-correo">Correo</label>
            <input id="compartir-correo" type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} placeholder="correo@ejemplo.com" className="min-h-11 flex-1 rounded-xl border border-border-line/60 bg-white/70 px-3 text-sm text-bg-dark" />
            <label className="sr-only" htmlFor="compartir-rol">Rol</label>
            <select id="compartir-rol" value={rol} onChange={(e) => setRol(e.target.value)} className="min-h-11 rounded-xl border border-border-line/60 bg-white/70 px-3 text-sm text-bg-dark">
              <option value="lector">Lector</option>
              <option value="comentador">Comentador</option>
              <option value="editor">Editor</option>
            </select>
            <button type="submit" disabled={guardando || !correo.trim()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-primary px-4 text-sm font-semibold text-white disabled:opacity-50">
              <UserPlus className="h-4 w-4" aria-hidden="true" />Añadir
            </button>
          </form>

          <div className="mt-4 space-y-2">
            {cargando && <p role="status" className="text-sm text-slate-text">Cargando permisos…</p>}
            {!cargando && permisos.length === 0 && <p className="text-sm text-slate-text">Aún no hay personas con acceso.</p>}
            {!cargando && permisos.map((permiso) => (
              <div key={permiso.id || permiso.correo || permiso.email} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border-line/40 bg-white/60 p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-bg-dark">{permiso.correo || permiso.email || permiso.displayName || "Usuario"}</p>
                  <p className="text-xs text-slate-text">{permiso.tipo || permiso.role || "Acceso"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <select aria-label={`Rol de ${permiso.correo || permiso.email || "usuario"}`} value={permiso.rol || permiso.role || "lector"} onChange={(e) => cambiarRol(permiso, e.target.value)} disabled={guardando} className="min-h-9 rounded-lg border border-border-line/60 bg-white/70 px-2 text-sm">
                    <option value="lector">Lector</option>
                    <option value="comentador">Comentador</option>
                    <option value="editor">Editor</option>
                  </select>
                  <button type="button" onClick={() => revocar(permiso)} disabled={guardando} aria-label="Revocar permiso" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-300/40 text-red-700 hover:bg-red-500/10 disabled:opacity-50">
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <footer className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-border-line/30 pt-4">
            <button type="button" onClick={copiarEnlace} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border-line/60 px-4 text-sm font-medium text-bg-dark hover:bg-emerald-primary/5">
              <Link2 className="h-4 w-4 text-emerald-primary" aria-hidden="true" />Copiar enlace
            </button>
            <button type="button" onClick={alCerrar} className="inline-flex min-h-11 items-center rounded-xl border border-border-line/60 px-4 text-sm font-medium text-slate-text hover:bg-slate-100">Cerrar</button>
          </footer>
        </section>
      </FocusTrap>
    </div>,
    document.body
  );
}
