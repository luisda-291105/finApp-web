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
    inicial: { titular: "", numero: "", expiracion: "", cvv: "", entidad: "", colorTema: "azul" },
    campos: [
      ["titular", "Titular", "text"], ["numero", "Número de tarjeta", "text"],
      ["expiracion", "Fecha de expiración", "date"], ["cvv", "CVV", "password"],
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
  const numero = String(valores.numero || '').replace(/[\s-]/g, '');
  if (!valores.titular.trim()) return { campo: 'titular', mensaje: 'El titular es obligatorio.' };
  if (!/^\d{13,19}$/.test(numero)) return { campo: 'numero', mensaje: 'El número debe tener entre 13 y 19 dígitos.' };
  let suma = 0; let duplicar = false;
  for (let indice = numero.length - 1; indice >= 0; indice -= 1) {
    let digito = Number(numero[indice]);
    if (duplicar) { digito *= 2; if (digito > 9) digito -= 9; }
    suma += digito; duplicar = !duplicar;
  }
  if (suma % 10 !== 0) return { campo: 'numero', mensaje: 'El número de tarjeta no es válido.' };
  const vencimiento = new Date(`${valores.expiracion}T00:00:00`);
  if (!valores.expiracion || Number.isNaN(vencimiento.getTime()) || vencimiento <= new Date()) return { campo: 'expiracion', mensaje: 'La fecha de vencimiento debe ser futura.' };
  if (!/^\d{3,4}$/.test(valores.cvv || '')) return { campo: 'cvv', mensaje: 'El CVV debe tener 3 o 4 dígitos.' };
  return null;
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
        ...(tipo === "tarjeta" && { numero: valores.numero.replace(/[\s-]/g, ''), idTarjeta: generarId() }),
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
          <form onSubmit={enviar} className="space-y-4">
            {configuracion.campos.map(([campo, etiqueta, tipoCampo]) => (
              <div key={campo} className="flex flex-col gap-1.5">
                <label htmlFor={`registro-${tipo}-${campo}`} className="text-sm font-medium">{etiqueta}</label>
                <input id={`registro-${tipo}-${campo}`} required type={tipoCampo} value={valores[campo]} aria-invalid={campoConError === campo} aria-describedby={campoConError === campo ? "registro-tarjeta-error" : undefined} onChange={(e) => { cambiar(campo, e.target.value); if (campoConError === campo) { setCampoConError(""); setError(""); } }} maxLength={campo === "numero" ? 100 : 255} disabled={cargando} className="w-full rounded-xl border border-border-line bg-bg-cream px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary disabled:opacity-50" />
              </div>
            ))}
            {tipo === "tarjeta" && (
              <div className="flex flex-col gap-1.5">
                <label htmlFor="registro-tarjeta-color" className="text-sm font-medium">Tema visual</label>
                <select id="registro-tarjeta-color" value={valores.colorTema} onChange={(e) => cambiar("colorTema", e.target.value)} className="w-full rounded-xl border border-border-line bg-bg-cream px-3 py-2">
                  <option value="azul">Azul</option><option value="menta">Menta</option><option value="morado">Morado</option>
                </select>
              </div>
            )}
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
