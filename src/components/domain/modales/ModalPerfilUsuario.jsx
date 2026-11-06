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
import { Fingerprint, Mail, Phone, ShieldCheck, UserRound } from "lucide-react";
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
  return `w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-emerald-primary ${bloqueado
    ? "border-border-line/30 bg-bg-dark/5 text-slate-text cursor-not-allowed"
    : "border-border-line/50 bg-bg-cream text-bg-dark hover:border-emerald-primary/50"
  }`;
}

function inicialesUsuario(nombre) {
  return String(nombre || "U").trim().split(/\s+/).filter(Boolean).slice(0, 2).map((parte) => parte[0]).join("").toUpperCase() || "U";
}

export default function ModalPerfilUsuario({ abierto, alCerrar, triggerRef }) {
  const { usuario, guardarUsuario } = useUsuarioActivo();
  const [idUsuario, setIdUsuario] = useState("");
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [modoEdicion, setModoEdicion] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const reiniciarCampos = () => {
    setIdUsuario(usuario?.idUsuario || "");
    setNombre(usuario?.nombre || "");
    setCorreo(usuario?.correo || "");
    setTelefono(usuario?.telefono || "");
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
      setCorreo("");
      setTelefono("");
      setContrasena("");
      setModoEdicion(false);
      setCargando(false);
      setError("");
      return;
    }
    setIdUsuario(usuario?.idUsuario || "");
    setNombre(usuario?.nombre || "");
    setCorreo(usuario?.correo || "");
    setTelefono(usuario?.telefono || "");
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
    const correoLimpio = correo.trim().toLocaleLowerCase("es");
    const telefonoLimpio = telefono.trim();
    if (correoLimpio && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoLimpio)) {
      setError("Ingresa un correo electrónico válido o deja el campo vacío.");
      return;
    }
    if (telefonoLimpio && (!/^\+?[\d\s().-]{7,20}$/.test(telefonoLimpio) || telefonoLimpio.replace(/\D/g, "").length < 7)) {
      setError("Ingresa un teléfono válido o deja el campo vacío.");
      return;
    }
    if (contrasena.trim() && contrasena.trim().length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres o deja el campo vacío para conservarla.");
      return;
    }

    setCargando(true);
    setError("");

    try {
      const respuesta = await actualizarUsuario(idUsuarioOriginal, {
        idUsuario: idUsuarioLimpio,
        nombre: nombreLimpio,
        correo: correoLimpio,
        telefono: telefonoLimpio,
        contrasena,
      });
      const datosActualizados = respuesta?.datos || respuesta;
      if (datosActualizados?.idUsuario !== idUsuarioLimpio) {
        throw new Error("El servidor no confirmó la identificación actualizada. Vuelve a intentarlo.");
      }

      const actualizado = {
        ...usuario,
        ...datosActualizados,
        correo: correoLimpio || null,
        telefono: telefonoLimpio || null,
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
  const cancelarEdicion = () => {
    setIdUsuario(usuario?.idUsuario || "");
    setNombre(usuario?.nombre || "");
    setCorreo(usuario?.correo || "");
    setTelefono(usuario?.telefono || "");
    setContrasena("");
    setError("");
    setModoEdicion(false);
  };

  const tarjetaDato = (Icono, etiqueta, valor, vacio) => (
    <div className="flex min-w-0 items-start gap-3 rounded-xl border border-border-line/30 bg-bg-cream/50 p-3">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-primary/10 text-emerald-primary"><Icono size={17} aria-hidden="true" /></span>
      <div className="min-w-0"><p className="text-[11px] font-semibold uppercase tracking-wider text-slate-text">{etiqueta}</p><p className="mt-1 break-words text-sm font-medium text-bg-dark">{valor || <span className="font-normal text-slate-text">{vacio}</span>}</p></div>
    </div>
  );

  return (
    <ModalDetalleRegistro abierto={abierto} titulo="Mi perfil" alCerrar={cerrar} triggerRef={triggerRef} ancho="max-w-lg">
      <section aria-describedby="perfil-descripcion" className="space-y-5">
        <header className="flex flex-col items-center rounded-2xl border border-border-line/30 bg-bg-cream/45 px-4 py-5 text-center">
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-primary text-xl font-semibold text-bg-cream shadow-md shadow-emerald-primary/20">{inicialesUsuario(nombre)}</div>
          <h3 className="font-display text-lg font-semibold text-bg-dark">{nombre || "Completa tu perfil"}</h3>
          <p id="perfil-descripcion" className="mt-1 text-sm text-slate-text">Administra tus datos personales y de contacto.</p>
          {!modoEdicion && <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-primary/10 px-3 py-1 text-xs font-medium text-emerald-primary"><ShieldCheck size={14} aria-hidden="true" /> Perfil de usuario</span>}
        </header>
        {!modoEdicion && <div className="space-y-4">
          <div><h4 className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-text">Datos de cuenta</h4><div className="grid gap-2 sm:grid-cols-2">{tarjetaDato(Fingerprint, "Identificación", idUsuario, "No registrada")}{tarjetaDato(UserRound, "Nombre", nombre, "No registrado")}</div></div>
          <div><h4 className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-text">Contacto</h4><div className="grid gap-2 sm:grid-cols-2">{tarjetaDato(Mail, "Correo", correo, "Puedes agregarlo más adelante")}{tarjetaDato(Phone, "Teléfono", telefono, "Puedes agregarlo más adelante")}</div></div>
        </div>}
        {modoEdicion ? <form onSubmit={manejarSubmit} className="space-y-4 rounded-2xl border border-border-line/30 bg-bg-cream/35 p-4">
          <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-text">Datos de cuenta</h4>
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

          {modoEdicion && <>
            <div className="border-t border-border-line/30 pt-4"><h4 className="text-xs font-semibold uppercase tracking-widest text-slate-text">Información de contacto <span className="font-normal normal-case tracking-normal">· opcional</span></h4></div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="perfil-correo" className="text-sm font-medium text-bg-dark">Correo (opcional)</label>
              <input id="perfil-correo" type="email" value={correo} onChange={(evento) => setCorreo(evento.target.value)} autoComplete="email" placeholder="Correo electrónico" className={clasesCampo(false)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="perfil-telefono" className="text-sm font-medium text-bg-dark">Teléfono (opcional)</label>
              <input id="perfil-telefono" type="tel" value={telefono} onChange={(evento) => setTelefono(evento.target.value)} autoComplete="tel" placeholder="Teléfono" className={clasesCampo(false)} />
            </div>
          </>}

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 border-t border-border-line/30 pt-4"><ShieldCheck size={16} className="text-emerald-primary" aria-hidden="true" /><h4 className="text-xs font-semibold uppercase tracking-widest text-slate-text">Seguridad</h4></div>
            <label htmlFor="perfil-contrasena" className="text-sm font-medium text-bg-dark">
              Nueva contraseña <span className="font-normal text-slate-text">(opcional)</span>
            </label>
            <input
              id="perfil-contrasena"
              type="password"
              value={contrasena}
              onChange={(evento) => setContrasena(evento.target.value)}
              autoComplete="new-password"
              minLength={8}
              placeholder={modoEdicion ? "Dejar vacío para conservarla" : undefined}
              readOnly={bloqueado}
              className={clasesCampo(bloqueado)}
            />
          </div>

          {error && (
            <p role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <div className="flex flex-col-reverse gap-2 border-t border-border-line/30 pt-4 sm:flex-row sm:justify-end">
            {usuario?.idUsuario && <button type="button" onClick={cancelarEdicion} disabled={cargando} className="rounded-xl border border-border-line/60 px-4 py-2.5 text-sm font-medium text-bg-dark transition-colors hover:bg-bg-dark/5 disabled:opacity-50">Cancelar</button>}
            <button type="submit" disabled={cargando} className="rounded-xl bg-emerald-primary px-5 py-2.5 text-sm font-semibold text-bg-cream outline-none transition-colors hover:bg-emerald-hover focus-visible:ring-2 focus-visible:ring-emerald-primary focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed">{cargando ? "Guardando..." : "Guardar cambios"}</button>
          </div>
        </form> : <div className="flex justify-end border-t border-border-line/30 pt-4"><button type="button" onClick={() => { setError(""); setModoEdicion(true); }} className="inline-flex items-center gap-2 rounded-xl bg-emerald-primary px-5 py-2.5 text-sm font-semibold text-bg-cream transition-colors hover:bg-emerald-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary focus-visible:ring-offset-2"><UserRound size={16} aria-hidden="true" /> Editar perfil</button></div>}
      </section>
    </ModalDetalleRegistro>
  );
}
