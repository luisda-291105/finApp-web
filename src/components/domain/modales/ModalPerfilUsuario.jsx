/**
 * @uso        Modal de perfil: muestra y permite modificar la información básica del usuario activo (spec 024)
 * @funciones  ModalPerfilUsuario({ abierto, alCerrar, triggerRef })
 * @datos      Usuario activo de UsuarioActivoContext: idUsuario, nombre, contrasena editable; correo y
 *             teléfono fijos «No registrado». Envía PUT /usuario/{idUsuario} vía usuarioServicio.actualizarUsuario
 * @eventos    submit del formulario, botón «Modificar», cierre con X/Escape/clic fuera
 * @estados    idUsuario, nombre, contrasena, modoEdicion, cargando, error
 * @usadoPor   PaginaDashboardConfiguracion
 */
import { useEffect, useRef, useState } from "react";
import ModalDetalleRegistro from "./ModalDetalleRegistro";
import { actualizarUsuario } from "../../../services/usuarioServicio";
import { useUsuarioActivo } from "../../../context/UsuarioActivoContext";

/** Fecha local en formato YYYY-MM-DD sin desfase UTC. */
function fechaLocalISO() {
  const fecha = new Date();
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

/** Clases del campo según esté habilitado o bloqueado en solo lectura. */
function clasesCampo(bloqueado) {
  return `w-full rounded-xl border border-border-line px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary ${
    bloqueado
      ? "bg-border-line/10 text-slate-text cursor-not-allowed"
      : "bg-bg-cream text-bg-dark"
  }`;
}

export default function ModalPerfilUsuario({ abierto, alCerrar, triggerRef }) {
  const { usuario, guardarUsuario } = useUsuarioActivo();
  const [idUsuario, setIdUsuario] = useState("");
  const [nombre, setNombre] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [modoEdicion, setModoEdicion] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const reiniciarCampos = () => {
    setIdUsuario(usuario?.idUsuario || "");
    setNombre(usuario?.nombre || "");
    setContrasena("");
    setModoEdicion(false);
    setError("");
  };

  const cerrar = () => {
    if (cargando) return;
    reiniciarCampos();
    alCerrar();
  };

  useEffect(() => {
    if (!abierto) {
      setIdUsuario("");
      setNombre("");
      setContrasena("");
      setModoEdicion(false);
      setCargando(false);
      setError("");
      return;
    }
    setIdUsuario(usuario?.idUsuario || "");
    setNombre(usuario?.nombre || "");
    setContrasena("");
    setModoEdicion(!usuario?.idUsuario);
    setError("");
    setCargando(false);
  }, [abierto, usuario]);

  const manejarSubmit = async (evento) => {
    evento.preventDefault();
    if (cargando) return;

    const idUsuarioLimpio = idUsuario.trim();
    const nombreLimpio = nombre.trim();
    const idUsuarioOriginal = usuario?.idUsuario || idUsuarioLimpio;
    const fechaCreacion = usuario?.fechaCreacion || fechaLocalISO();

    if (!idUsuarioLimpio) {
      setError("La cédula o identificación es obligatoria.");
      return;
    }

    if (!nombreLimpio) {
      setError("El nombre es obligatorio.");
      return;
    }
    if (!contrasena.trim()) {
      setError("La nueva contraseña es obligatoria.");
      return;
    }

    setCargando(true);
    setError("");

    try {
      const respuesta = await actualizarUsuario(idUsuarioOriginal, {
        idUsuario: idUsuarioLimpio,
        nombre: nombreLimpio,
        contrasena,
      });

      const actualizado = {
        ...usuario,
        ...(respuesta && typeof respuesta === "object" ? respuesta : {}),
        idUsuario: idUsuarioLimpio,
        nombre: nombreLimpio,
        fechaCreacion,
      };
      // La contraseña nunca se persiste en el contexto/localStorage (dato sensible).
      delete actualizado.contrasena;

      guardarUsuario(actualizado);
      setCargando(false);
      setModoEdicion(false);
      setError("");
      alCerrar();
    } catch (err) {
      console.error("Error al guardar el perfil:", err);
      setError(err?.message || "Error al guardar el perfil");
      setCargando(false);
    }
  };

  if (!abierto) return null;

  const bloqueado = !modoEdicion;

  return (
    <ModalDetalleRegistro abierto={abierto} titulo="Perfil" alCerrar={cerrar} triggerRef={triggerRef} ancho="max-w-md">
        <section aria-describedby="perfil-descripcion">
          <p id="perfil-descripcion" className="mb-4 text-sm text-slate-text">Consulta y modifica la información básica de tu usuario.</p>
          {!modoEdicion && <div className="mb-4 rounded-2xl border border-border-line/40 bg-bg-cream/70 p-4"><p className="text-xs uppercase tracking-wide text-slate-text">Cuenta</p><p className="mt-1 font-medium text-bg-dark">{nombre || "Nombre no registrado"}</p><p className="mt-1 text-sm text-slate-text">Identificación: {idUsuario || "No registrada"}</p><p className="mt-1 text-sm text-slate-text">Correo y teléfono: No registrados</p></div>}
          {modoEdicion ? <form onSubmit={manejarSubmit} className="flex flex-col gap-4 px-1 py-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="perfil-id" className="text-sm font-medium text-bg-dark">
                Cédula / Identificación
              </label>
              <input
                id="perfil-id"
                type="text"
                value={idUsuario}
                onChange={(evento) => setIdUsuario(evento.target.value)}
                readOnly={bloqueado}
                className={clasesCampo(bloqueado)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="perfil-nombre" className="text-sm font-medium text-bg-dark">
                Nombre
              </label>
              <input
                id="perfil-nombre"
                type="text"
                value={nombre}
                onChange={(evento) => setNombre(evento.target.value)}
                autoComplete="username"
                readOnly={bloqueado}
                className={clasesCampo(bloqueado)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="perfil-contrasena" className="text-sm font-medium text-bg-dark">
                Contraseña
              </label>
              <input
                id="perfil-contrasena"
                type="password"
                value={contrasena}
                onChange={(evento) => setContrasena(evento.target.value)}
                autoComplete="new-password"
                placeholder={modoEdicion ? "Nueva contraseña" : undefined}
                readOnly={bloqueado}
                className={clasesCampo(bloqueado)}
              />
            </div>

            {!modoEdicion && <div className="flex flex-col gap-1.5">
              <label htmlFor="perfil-correo" className="text-sm font-medium text-bg-dark">
                Correo
              </label>
              <input
                id="perfil-correo"
                type="text"
                value="No registrado"
                readOnly
                tabIndex={-1}
                className={clasesCampo(true)}
              />
            </div>}

            {!modoEdicion && <div className="flex flex-col gap-1.5">
              <label htmlFor="perfil-telefono" className="text-sm font-medium text-bg-dark">
                Teléfono
              </label>
              <input
                id="perfil-telefono"
                type="text"
                value="No registrado"
                readOnly
                tabIndex={-1}
                className={clasesCampo(true)}
              />
            </div>}

            {error && (
              <p role="alert" className="text-sm text-red-600">
                {error}
              </p>
            )}

            <div className="flex justify-end">
              <button type="submit" disabled={cargando} className="rounded-xl bg-emerald-primary px-4 py-2 font-medium text-bg-cream outline-none transition-colors hover:bg-emerald-hover focus-visible:ring-2 focus-visible:ring-emerald-primary focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed">{cargando ? "Guardando..." : "Guardar cambios"}</button>
            </div>
          </form> : <div className="flex justify-end"><button type="button" onClick={() => { setError(""); setModoEdicion(true); }} className="rounded-xl bg-emerald-primary px-4 py-2 font-medium text-bg-cream outline-none transition-colors hover:bg-emerald-hover focus-visible:ring-2 focus-visible:ring-emerald-primary focus-visible:ring-offset-2">Modificar</button></div>}
        </section>
    </ModalDetalleRegistro>
  );
}
