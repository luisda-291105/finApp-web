/**
 * @uso        Modal específico para registrar una tarjeta
 * @funciones  CrearTarjetaModal({ abierto, alCerrar, triggerRef, alGuardar })
 * @datos      Valida campos y crea la tarjeta asociada al usuario activo
 * @eventos    Submit, Escape y controles de cierre
 * @estados    valores, error y cargando
 * @usadoPor   TarjetasPage
 */
import { useEffect, useRef, useState } from "react";
import FocusTrap from "focus-trap-react";
import { BotonCerrar } from "../../../../components/ui";
import { useCierreConEsc } from "../../../../hooks/useCierreConEsc";
import { useRetornoDeFoco } from "../../../../hooks/useRetornoDeFoco";
import { useUsuarioActivo } from "../../../../context/UsuarioActivoContext";
import { crearTarjeta } from "../../services/tarjetasService";

function opcionesTrampa(refPanel) {
  return { allowOutsideClick: true, escapeDeactivates: false, initialFocus: () => refPanel.current, returnFocusOnDeactivate: false };
}
function formatearVencimiento(valor) {
  const digitos = valor.replace(/\D/g, "").slice(0, 4);
  if (digitos.length < 2) return digitos;
  return digitos.length === 2 ? `${digitos}/` : `${digitos.slice(0, 2)}/${digitos.slice(2)}`;
}
function completarVencimientoAlSalir(valor) {
  const digitos = valor.replace(/\D/g, "").slice(0, 4);
  if (digitos.length === 1) return `0${digitos}/`;
  if (digitos.length === 2) return `${digitos}/`;
  return digitos.length > 2 ? `${digitos.slice(0, 2)}/${digitos.slice(2)}` : digitos;
}
function convertirVencimientoAFecha(mesAnio) {
  const [, mes, anio] = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(mesAnio);
  return `20${anio}-${mes}-01`;
}
function validarTarjeta(valores) {
  if (!valores.titular.trim()) return { campo: "titular", mensaje: "El titular es obligatorio." };
  if (!/^\d{14,19}$/.test(valores.numero)) return { campo: "numero", mensaje: "El número debe contener solo dígitos (14 a 19)." };
  const vencimiento = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(valores.expiracion);
  if (!vencimiento) return { campo: "expiracion", mensaje: "Usa el formato MM/AA, por ejemplo 08/29." };
  const mes = Number(vencimiento[1]);
  const anio = 2000 + Number(vencimiento[2]);
  const hoy = new Date();
  if (anio < hoy.getFullYear() || (anio === hoy.getFullYear() && mes < hoy.getMonth() + 1)) return { campo: "expiracion", mensaje: "La fecha de vencimiento debe ser el mes actual o uno futuro." };
  if (!valores.entidad.trim()) return { campo: "entidad", mensaje: "La entidad financiera es obligatoria." };
  return null;
}

/** No almacena ni envía el CVV; el formulario registra solo datos de identificación de tarjeta. */
export default function CrearTarjetaModal({ abierto, alCerrar, triggerRef, alGuardar }) {
  const panelRef = useRef(null);
  const { usuario } = useUsuarioActivo();
  const [valores, setValores] = useState({ titular: "", numero: "", expiracion: "", entidad: "" });
  const [error, setError] = useState("");
  const [campoConError, setCampoConError] = useState("");
  const [cargando, setCargando] = useState(false);
  useEffect(() => {
    if (abierto) { setValores({ titular: "", numero: "", expiracion: "", entidad: "" }); setError(""); setCampoConError(""); }
  }, [abierto]);
  useCierreConEsc({ activo: abierto, zIndex: 60, alCerrar: () => !cargando && alCerrar() });
  useRetornoDeFoco({ activo: abierto, triggerRef });
  if (!abierto) return null;
  const cambiar = (campo, valor) => setValores((actuales) => ({ ...actuales, [campo]: valor }));
  const enviar = async (evento) => {
    evento.preventDefault();
    if (!usuario?.idUsuario) { setError("Inicia sesión para registrar datos en tu cuenta."); return; }
    const falloValidacion = validarTarjeta(valores);
    if (falloValidacion) {
      setError(falloValidacion.mensaje); setCampoConError(falloValidacion.campo);
      document.getElementById(`registro-tarjeta-${falloValidacion.campo}`)?.focus();
      return;
    }
    setCargando(true); setError(""); setCampoConError("");
    const payload = { titular: valores.titular.trim(), numero: valores.numero, expiracion: convertirVencimientoAFecha(valores.expiracion), entidad: valores.entidad.trim() };
    try { const guardada = await crearTarjeta(payload); alGuardar?.(guardada || payload); alCerrar(); }
    catch (fallo) { setError(fallo?.message || "No se pudo guardar el registro."); }
    finally { setCargando(false); }
  };
  const campos = [["titular", "Titular", "text", "Ej. Ana Pérez"], ["numero", "Número de tarjeta", "text", "Ej. 4111111111111111"], ["expiracion", "Vencimiento (MM/AA)", "text", "MM/AA"], ["entidad", "Entidad financiera", "text", "Ej. Banco Nacional"]];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-dark/70 p-4" onClick={(evento) => evento.target === evento.currentTarget && !cargando && alCerrar()}>
      <FocusTrap focusTrapOptions={opcionesTrampa(panelRef)}><section ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="registro-tarjeta-titulo" tabIndex={-1} className="glass-surface relative max-h-[85vh] w-full max-w-md overflow-y-auto rounded-3xl border border-border-line/30 bg-bg-cream/95 p-6 text-bg-dark shadow-xl outline-none">
        <header className="mb-5 flex items-start justify-between gap-4"><div><h2 id="registro-tarjeta-titulo" className="font-display text-xl font-semibold">Registrar tarjeta</h2><p className="mt-1 text-sm text-slate-text">El registro quedará vinculado a {usuario?.nombre || "tu usuario activo"}.</p></div><BotonCerrar ariaLabel="Cerrar registrar tarjeta" alCerrar={() => !cargando && alCerrar()} /></header>
        <form onSubmit={enviar} noValidate className="space-y-4">{campos.map(([campo, etiqueta, tipo, placeholder]) => <div key={campo} className="flex min-w-0 flex-col gap-1.5"><label htmlFor={`registro-tarjeta-${campo}`} className="text-sm font-medium">{etiqueta}</label><input id={`registro-tarjeta-${campo}`} required type={tipo} inputMode={["numero", "expiracion"].includes(campo) ? "numeric" : undefined} placeholder={placeholder} pattern={campo === "numero" ? "[0-9]{14,19}" : campo === "expiracion" ? "(0[1-9]|1[0-2])/[0-9]{2}" : undefined} value={valores[campo]} aria-invalid={campoConError === campo} aria-describedby={campoConError === campo ? "registro-tarjeta-error" : undefined} onChange={(evento) => { const valor = campo === "expiracion" ? formatearVencimiento(evento.target.value) : campo === "numero" ? evento.target.value.replace(/\D/g, "").slice(0, 19) : evento.target.value; cambiar(campo, valor); if (campoConError === campo) { setCampoConError(""); setError(""); } }} onBlur={campo === "expiracion" ? (evento) => cambiar(campo, completarVencimientoAlSalir(evento.target.value)) : undefined} maxLength={campo === "numero" ? 19 : campo === "expiracion" ? 5 : 255} disabled={cargando} className="w-full min-w-0 rounded-xl border border-border-line bg-bg-cream px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary disabled:opacity-50" /></div>)}
          {error && <p id="registro-tarjeta-error" role="alert" className="rounded-xl border border-red-200 bg-red-100 p-3 text-sm text-red-700">{error}</p>}
          <button type="submit" disabled={cargando} className="min-h-10 rounded-xl bg-emerald-primary px-4 text-sm font-semibold text-bg-cream transition-colors hover:bg-emerald-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary disabled:cursor-not-allowed disabled:opacity-50">{cargando ? "Guardando..." : "Guardar registro"}</button>
        </form>
      </section></FocusTrap>
    </div>
  );
}
