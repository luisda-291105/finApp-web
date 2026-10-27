/**
 * @uso        Modal para crear un usuario (registro) para relacionarlo con grupos/contactos/fuentes/tarjetas
 * @funciones  ModalCrearUsuario({ abierto, alCerrar, triggerRef, alCreado })
 * @datos      Campos locales: idUsuario (cédula), nombre, contrasena. Envía POST /usuario vía usuarioServicio.crearUsuario
 * @eventos    submit, cierre con X/Escape/clic fuera
 * @estados    idUsuario, nombre, contrasena, cargando, error
 * @usadoPor   PaginaDashboardConfiguracion
 */
import { useEffect, useRef, useState } from "react";
import FocusTrap from "focus-trap-react";
import { BotonCerrar } from "../../ui/BotonCerrar";
import { useCierreConEsc } from "../../../hooks/useCierreConEsc";
import { useRetornoDeFoco } from "../../../hooks/useRetornoDeFoco";
import { crearUsuario } from "../../../services/usuarioServicio";
import { useUsuarioActivo } from "../../../context/UsuarioActivoContext";

function crearOpcionesTrampa(refPanel) {
  return {
    allowOutsideClick: true,
    escapeDeactivates: false,
    initialFocus: () => refPanel.current,
    returnFocusOnDeactivate: false,
  };
}

export default function ModalCrearUsuario({ abierto, alCerrar, triggerRef, alCreado }) {
  const panelRef = useRef(null);
  const { guardarUsuario } = useUsuarioActivo();
  const [idUsuario, setIdUsuario] = useState("");
  const [nombre, setNombre] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const cerrar = () => {
    if (cargando) return;
    setIdUsuario("");
    setNombre("");
    setContrasena("");
    setError("");
    alCerrar();
  };

  useCierreConEsc({ activo: abierto, zIndex: 60, alCerrar: cerrar });
  useRetornoDeFoco({ activo: abierto, triggerRef });

  useEffect(() => {
    if (!abierto) {
      setIdUsuario("");
      setNombre("");
      setContrasena("");
      setError("");
      setCargando(false);
    }
  }, [abierto]);

  const manejarSubmit = async (evento) => {
    evento.preventDefault();
    if (cargando) return;

    const idUsuarioLimpio = idUsuario.trim();
    const nombreLimpio = nombre.trim();

    if (!idUsuarioLimpio) {
      setError("La cédula/identificación es obligatoria");
      return;
    }

    if (!nombreLimpio) {
      setError("El nombre es obligatorio");
      return;
    }

    if (contrasena.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    setCargando(true);
    setError("");

    try {
      const fechaCreacion = new Date().toISOString().split("T")[0];

      const payload = {
        idUsuario: idUsuarioLimpio,
        nombre: nombreLimpio,
        contrasena,
        fechaCreacion,
      };

      const respuesta = await crearUsuario(payload);

      if (respuesta?.idUsuario) {
        guardarUsuario(respuesta);
      }

      alCreado?.(respuesta);
      setCargando(false);
      cerrar();
    } catch (err) {
      console.error("Error al crear usuario:", err);
      setError(err?.message || "Error al crear el usuario");
      setCargando(false);
    }
  };

  if (!abierto) return null;

  const manejarClicExterior = (evento) => {
    if (evento.target === evento.currentTarget && !cargando) {
      cerrar();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-dark/70"
      onClick={manejarClicExterior}
    >
      <FocusTrap focusTrapOptions={crearOpcionesTrampa(panelRef)}>
        <section
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="crear-usuario-titulo"
          aria-describedby="crear-usuario-descripcion"
          tabIndex={-1}
          className="relative z-60 w-[90vw] max-w-md max-h-[85vh] overflow-y-auto outline-none bg-bg-cream/95 glass-surface border border-border-line/30 rounded-3xl shadow-xl inset-shadow-[0_1px_1px_0_rgba(255,255,255,0.25)]"
        >
          <header className="flex items-start justify-between gap-4 px-5 py-4 border-b border-border-line/30">
            <div className="flex flex-col gap-2">
              <h2
                id="crear-usuario-titulo"
                className="font-display text-lg font-semibold text-bg-dark"
              >
                Crear usuario
              </h2>
              <span className="self-start rounded-full bg-emerald-primary px-2.5 py-1 text-xs font-medium text-bg-cream">
                Registro
              </span>
              <p id="crear-usuario-descripcion" className="text-sm text-slate-text">
                Registra un usuario para poder relacionarlo con grupos, contactos, fuentes o tarjetas.
              </p>
            </div>
            <BotonCerrar
              ariaLabel="Cerrar crear usuario"
              alCerrar={cerrar}
              className="shrink-0 text-slate-text hover:text-bg-dark hover:bg-emerald-primary/10 focus-visible:ring-emerald-primary"
            />
          </header>

          <form onSubmit={manejarSubmit} className="flex flex-col gap-4 px-5 py-5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="usuario-id" className="text-sm font-medium text-bg-dark">
                Cédula / Identificación
              </label>
              <input
                id="usuario-id"
                type="text"
                value={idUsuario}
                onChange={(evento) => setIdUsuario(evento.target.value)}
                required
                className="w-full rounded-xl border border-border-line bg-bg-cream px-3 py-2 text-bg-dark outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="usuario-nombre" className="text-sm font-medium text-bg-dark">
                Nombre
              </label>
              <input
                id="usuario-nombre"
                type="text"
                value={nombre}
                onChange={(evento) => setNombre(evento.target.value)}
                autoComplete="username"
                required
                className="w-full rounded-xl border border-border-line bg-bg-cream px-3 py-2 text-bg-dark outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="usuario-contrasena" className="text-sm font-medium text-bg-dark">
                Contraseña
              </label>
              <input
                id="usuario-contrasena"
                type="password"
                value={contrasena}
                onChange={(evento) => setContrasena(evento.target.value)}
                autoComplete="new-password"
                required
                minLength={8}
                className="w-full rounded-xl border border-border-line bg-bg-cream px-3 py-2 text-bg-dark outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary"
              />
              <p className="text-xs text-slate-text">Mínimo 8 caracteres</p>
            </div>

            {error && (
              <p role="alert" className="text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={cargando || !idUsuario.trim() || !nombre.trim() || contrasena.length < 8}
              className="self-start rounded-xl bg-emerald-primary px-4 py-2 font-medium text-bg-cream outline-none transition-colors hover:bg-emerald-hover focus-visible:ring-2 focus-visible:ring-emerald-primary focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {cargando ? "Creando..." : "Crear usuario"}
            </button>
          </form>
        </section>
      </FocusTrap>
    </div>
  );
}
