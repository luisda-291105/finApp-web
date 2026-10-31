/**
 * @uso        Modal de registro para tarjetas, contactos y grupos del usuario activo
 * @funciones  ModalRegistroEntidad({ tipo, abierto, alCerrar, alGuardar })
 * @datos      Envía la entidad elegida al endpoint correspondiente y la vincula al usuario activo
 * @eventos    Submit del formulario y cierre por Escape, botón o clic exterior
 * @estados    valores, error, cargando
 * @usadoPor   Páginas de tarjetas, contactos y bolsillos
 */
import { useEffect, useRef, useState } from "react";
import FocusTrap from "focus-trap-react";
import { BotonCerrar } from "../../ui/BotonCerrar";
import { useCierreConEsc } from "../../../hooks/useCierreConEsc";
import { useRetornoDeFoco } from "../../../hooks/useRetornoDeFoco";
import { useUsuarioActivo } from "../../../context/UsuarioActivoContext";
import { crearTarjeta } from "../../../services/tarjetaServicio";
import { crearContacto } from "../../../services/contactoServicio";
import { crearGrupo } from "../../../services/grupoServicio";

const CONFIGURACION = {
  tarjeta: {
    titulo: "Registrar tarjeta",
    inicial: { titular: "", numero: "", expiracion: "", cvv: "", entidad: "" },
    campos: [
      ["titular", "Titular", "text"], ["numero", "Número de tarjeta", "text"],
      ["expiracion", "Vencimiento (MM/AA)", "text"], ["cvv", "CVV", "password"],
      ["entidad", "Entidad financiera", "text"],
    ],
    crear: crearTarjeta,
  },
  contacto: {
    titulo: "Registrar contacto",
    inicial: { nombre: "", telefono: "", notas: "" },
    campos: [["nombre", "Nombre", "text"], ["telefono", "Teléfono", "tel"], ["notas", "Notas", "text"]],
    crear: crearContacto,
  },
  grupo: {
    titulo: "Crear grupo",
    inicial: { nombre: "", descripcion: "", estado: true },
    campos: [["nombre", "Nombre del grupo", "text"], ["descripcion", "Descripción", "text"]],
    crear: crearGrupo,
  },
};

function generarId() {
  return globalThis.crypto?.randomUUID?.() || `finapp-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function validarTarjeta(valores) {
  if (typeof valores.titular !== "string" || !valores.titular.trim()) {
    return { campo: "titular", mensaje: "El titular es obligatorio y debe ser texto." };
  }
  if (!/^\d{14,19}$/.test(valores.numero || "")) {
    return { campo: "numero", mensaje: "El número debe contener solo dígitos (14 a 19)." };
  }
  const vencimiento = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(valores.expiracion || "");
  if (!vencimiento) {
    return { campo: "expiracion", mensaje: "Usa el formato MM/AA, por ejemplo 08/29." };
  }
  const mes = Number(vencimiento[1]);
  const anio = 2000 + Number(vencimiento[2]);
  const diasDelMes = new Date(anio, mes, 0).getDate();
  if (diasDelMes < 28 || diasDelMes > 31) {
    return { campo: "expiracion", mensaje: "El mes de vencimiento debe tener entre 28 y 31 días." };
  }
  const hoy = new Date();
  if (anio < hoy.getFullYear() || (anio === hoy.getFullYear() && mes < hoy.getMonth() + 1)) {
    return { campo: "expiracion", mensaje: "La fecha de vencimiento debe ser el mes actual o uno futuro." };
  }
  if (!/^\d{3}$/.test(valores.cvv || "")) {
    return { campo: "cvv", mensaje: "El CVV debe tener exactamente 3 dígitos." };
  }
  if (typeof valores.entidad !== "string" || !valores.entidad.trim()) {
    return { campo: "entidad", mensaje: "La entidad financiera es obligatoria." };
  }
  return null;
}

function convertirVencimientoAFecha(mesAnio) {
  const [, mes, anio] = /^(\d{2})\/(\d{2})$/.exec(mesAnio);
  return `20${anio}-${mes}-01`;
}

function formatearVencimiento(valor) {
  const digitos = valor.replace(/\D/g, "").slice(0, 4);
  if (digitos.length < 2) return digitos;
  const mes = digitos.slice(0, 2);
  return digitos.length === 2 ? `${mes}/` : `${mes}/${digitos.slice(2)}`;
}

function completarVencimientoAlSalir(valor) {
  const digitos = valor.replace(/\D/g, "").slice(0, 4);
  if (digitos.length === 1) return `0${digitos}/`;
  if (digitos.length === 2) return `${digitos}/`;
  return digitos.length > 2 ? `${digitos.slice(0, 2)}/${digitos.slice(2)}` : digitos;
}

function fechaLocal() {
  const hoy = new Date();
  return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`;
}

function opcionesTrampa(refPanel) {
  return { allowOutsideClick: true, escapeDeactivates: false, initialFocus: () => refPanel.current, returnFocusOnDeactivate: false };
}

export default function ModalRegistroEntidad({ tipo, abierto, alCerrar, triggerRef, alGuardar }) {
  const configuracion = CONFIGURACION[tipo];
  const panelRef = useRef(null);
  const { usuario } = useUsuarioActivo();
  const [valores, setValores] = useState(configuracion?.inicial || {});
  const [error, setError] = useState("");
  const [campoConError, setCampoConError] = useState("");
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (abierto && configuracion) setValores(configuracion.inicial);
    if (!abierto) setError("");
  }, [abierto, tipo]);

  useCierreConEsc({ activo: abierto, zIndex: 60, alCerrar: () => !cargando && alCerrar() });
  useRetornoDeFoco({ activo: abierto, triggerRef });

  if (!abierto || !configuracion) return null;

  const cambiar = (campo, valor) => setValores((actuales) => ({ ...actuales, [campo]: valor }));
  const enviar = async (evento) => {
    evento.preventDefault();
    if (!usuario?.idUsuario) {
      setError("Inicia sesión para registrar datos en tu cuenta.");
      return;
    }
    if (tipo === "tarjeta") {
      const errorTarjeta = validarTarjeta(valores);
      if (errorTarjeta) {
        setError(errorTarjeta.mensaje);
        setCampoConError(errorTarjeta.campo);
        document.getElementById(`registro-tarjeta-${errorTarjeta.campo}`)?.focus();
        return;
      }
      setCampoConError("");
    }
    setCargando(true);
    setError("");
    try {
      const payload = {
        ...valores,
        ...(tipo === "tarjeta" && {
          titular: valores.titular.trim(),
          expiracion: convertirVencimientoAFecha(valores.expiracion),
          idTarjeta: generarId(),
        }),
        ...(tipo === "contacto" && { idContacto: generarId() }),
        ...(tipo === "grupo" && { idGrupo: generarId(), estado: true }),
        fechaCreacion: fechaLocal(),
        usuario: { idUsuario: usuario.idUsuario },
      };
      const guardado = await configuracion.crear(payload);
      alGuardar?.(guardado || payload);
      alCerrar();
    } catch (fallo) {
      setError(fallo?.message || "No se pudo guardar el registro.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-dark/70 p-4" onClick={(e) => e.target === e.currentTarget && !cargando && alCerrar()}>
      <FocusTrap focusTrapOptions={opcionesTrampa(panelRef)}>
        <section ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="registro-entidad-titulo" tabIndex={-1} className="glass-surface relative max-h-[85vh] w-full max-w-md overflow-y-auto rounded-3xl border border-border-line/30 bg-bg-cream/95 p-6 text-bg-dark shadow-xl outline-none">
          <header className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 id="registro-entidad-titulo" className="font-display text-xl font-semibold">{configuracion.titulo}</h2>
              <p className="mt-1 text-sm text-slate-text">El registro quedará vinculado a {usuario?.nombre || "tu usuario activo"}.</p>
            </div>
            <BotonCerrar ariaLabel={`Cerrar ${configuracion.titulo.toLowerCase()}`} alCerrar={alCerrar} />
          </header>
          <form onSubmit={enviar} noValidate={tipo === "tarjeta"} className="space-y-4">
            {configuracion.campos.map(([campo, etiqueta, tipoCampo]) => (
              <div key={campo} className="flex flex-col gap-1.5">
                <label htmlFor={`registro-${tipo}-${campo}`} className="text-sm font-medium">{etiqueta}</label>
              <input
                id={`registro-${tipo}-${campo}`}
                required
                type={tipoCampo}
                inputMode={tipo === "tarjeta" && ["numero", "expiracion", "cvv"].includes(campo) ? "numeric" : undefined}
                placeholder={campo === "expiracion" && tipo === "tarjeta" ? "MM/AA" : undefined}
                pattern={campo === "numero" && tipo === "tarjeta" ? "[0-9]{14,19}" : campo === "expiracion" && tipo === "tarjeta" ? "(0[1-9]|1[0-2])/[0-9]{2}" : campo === "cvv" && tipo === "tarjeta" ? "[0-9]{3}" : undefined}
                value={valores[campo]}
                aria-invalid={campoConError === campo}
                aria-describedby={campoConError === campo ? "registro-tarjeta-error" : undefined}
                onChange={(e) => {
                  const valor = tipo === "tarjeta" && campo === "expiracion"
                    ? formatearVencimiento(e.target.value)
                    : tipo === "tarjeta" && ["numero", "cvv"].includes(campo)
                      ? e.target.value.replace(/\D/g, "").slice(0, campo === "cvv" ? 3 : 19)
                      : e.target.value;
                  cambiar(campo, valor);
                  if (campoConError === campo) { setCampoConError(""); setError(""); }
                }}
                onBlur={tipo === "tarjeta" && campo === "expiracion"
                  ? (e) => cambiar(campo, completarVencimientoAlSalir(e.target.value))
                  : undefined}
                maxLength={campo === "numero" ? 19 : campo === "expiracion" && tipo === "tarjeta" ? 5 : campo === "cvv" && tipo === "tarjeta" ? 3 : 255}
                disabled={cargando}
                className="w-full rounded-xl border border-border-line bg-bg-cream px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary disabled:opacity-50"
              />
              </div>
            ))}
            {error && <p id={tipo === "tarjeta" ? "registro-tarjeta-error" : undefined} role="alert" className="rounded-xl border border-red-200 bg-red-100 p-3 text-sm text-red-700">{error}</p>}
            <button type="submit" disabled={cargando} className="rounded-xl bg-emerald-primary px-4 py-2.5 font-medium text-bg-cream transition-colors hover:bg-emerald-hover disabled:opacity-50">
              {cargando ? "Guardando..." : "Guardar registro"}
            </button>
          </form>
        </section>
      </FocusTrap>
    </div>
  );
}
