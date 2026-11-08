/**
 * @uso        Presenta detalle y acciones CRUD de una tarjeta registrada
 * @funciones  ModalTarjeta({ tarjeta, onCerrar, triggerRef, onGuardar, onEliminar })
 * @datos      Recibe una tarjeta enmascarada; nunca muestra CVV ni PAN completo
 * @eventos    Cierre, edición, reemplazo opcional de número y confirmación de eliminación
 * @estados    modo, valores, error y guardando
 * @usadoPor   PaginaDashboardTarjetas
 */
import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import MiTarjetaVirtual from "../../../../components/domain/dashboard/MiTarjetaVirtual";
import ModalDetalleRegistro from "../../../../components/domain/modales/ModalDetalleRegistro";

function mostrarVencimiento(valor) {
  const fecha = /^(\d{4})-(\d{2})(?:-\d{2})?$/.exec(valor || "");
  return fecha ? `${fecha[2]}/${fecha[1].slice(-2)}` : valor || "";
}

function convertirVencimiento(valor) {
  const coincidencia = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(valor || "");
  if (!coincidencia) return null;
  const mes = Number(coincidencia[1]);
  const anio = 2000 + Number(coincidencia[2]);
  const hoy = new Date();
  if (anio < hoy.getFullYear() || (anio === hoy.getFullYear() && mes < hoy.getMonth() + 1)) return null;
  return `${anio}-${coincidencia[1]}-01`;
}

function formatearVencimiento(valor) {
  const digitos = valor.replace(/\D/g, "").slice(0, 4);
  if (digitos.length < 2) return digitos;
  return digitos.length === 2 ? `${digitos}/` : `${digitos.slice(0, 2)}/${digitos.slice(2)}`;
}

export default function ModalTarjeta({ tarjeta, onCerrar, triggerRef, onGuardar, onEliminar }) {
  const [modo, setModo] = useState("detalle");
  const [valores, setValores] = useState({ titular: "", entidad: "", numero: "", expiracion: "" });
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    setModo("detalle");
    setError("");
    if (tarjeta) {
      setValores({ titular: tarjeta.titular || "", entidad: tarjeta.entidad || "", numero: "", expiracion: mostrarVencimiento(tarjeta.expiracion) });
    }
  }, [tarjeta]);

  const numeroEnmascarado = tarjeta
    ? `•••• ${String(tarjeta.numero || "").replace(/\D/g, "").slice(-4)}`
    : "";

  const cambiar = (campo, valor) => setValores((actual) => ({ ...actual, [campo]: valor }));

  const guardar = async (evento) => {
    evento.preventDefault();
    if (!tarjeta?.idTarjeta) return;
    if (!valores.titular.trim() || !valores.entidad.trim()) {
      setError("El titular y la entidad son obligatorios.");
      return;
    }
    const expiracion = convertirVencimiento(valores.expiracion);
    if (!expiracion) {
      setError("Ingresa un vencimiento válido en formato MM/AA, actual o futuro.");
      return;
    }
    const numero = valores.numero.replace(/\D/g, "");
    if (numero && !/^\d{14,19}$/.test(numero)) {
      setError("El número debe contener entre 14 y 19 dígitos.");
      return;
    }
    setGuardando(true);
    setError("");
    try {
      await onGuardar?.(tarjeta.idTarjeta, {
        titular: valores.titular.trim(),
        entidad: valores.entidad.trim(),
        expiracion,
        numero: numero || null,
      });
      setModo("detalle");
    } catch (fallo) {
      setError(fallo?.message || "No se pudo actualizar la tarjeta.");
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async () => {
    if (!tarjeta?.idTarjeta) return;
    setGuardando(true);
    setError("");
    try {
      await onEliminar?.(tarjeta.idTarjeta);
    } catch (fallo) {
      setError(fallo?.message || "No se pudo eliminar la tarjeta.");
    } finally {
      setGuardando(false);
    }
  };

  const titulo = modo === "editar" ? "Editar tarjeta"
    : modo === "eliminar" ? "Eliminar tarjeta"
      : `Tarjeta de ${tarjeta?.titular || "Titular"}`;

  return (
    <ModalDetalleRegistro
      abierto={Boolean(tarjeta)}
      titulo={titulo}
      alCerrar={onCerrar}
      triggerRef={triggerRef}
      ancho="max-w-md"
    >
      {tarjeta && modo === "detalle" && (
        <>
          <MiTarjetaVirtual
            titular={tarjeta.titular}
            numero={numeroEnmascarado}
            expiracion={mostrarVencimiento(tarjeta.expiracion)}
            cvv=""
            entidad={tarjeta.entidad}
          />
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div><dt className="text-xs uppercase tracking-wider text-slate-text">Titular</dt><dd>{tarjeta.titular}</dd></div>
            <div><dt className="text-xs uppercase tracking-wider text-slate-text">Número</dt><dd className="font-mono">{numeroEnmascarado}</dd></div>
            <div><dt className="text-xs uppercase tracking-wider text-slate-text">Expira</dt><dd>{mostrarVencimiento(tarjeta.expiracion)}</dd></div>
            <div><dt className="text-xs uppercase tracking-wider text-slate-text">Entidad</dt><dd>{tarjeta.entidad || "Sin entidad"}</dd></div>
          </dl>
          <h3 className="mt-6 mb-2 font-display text-base font-semibold">Movimientos</h3>
          <p className="rounded-xl border border-border-line/40 p-4 text-sm text-slate-text">Esta tarjeta todavía no tiene movimientos registrados.</p>
          <div className="mt-5 flex flex-wrap gap-2 border-t border-border-line/30 pt-4">
            <button type="button" onClick={() => { setError(""); setModo("editar"); }} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-emerald-primary px-4 text-sm font-semibold text-bg-cream transition-colors hover:bg-emerald-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary focus-visible:ring-offset-2"><Pencil className="h-4 w-4" aria-hidden="true" />Editar</button>
            <button type="button" onClick={() => { setError(""); setModo("eliminar"); }} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-border-line/60 bg-white/5 px-4 text-sm font-medium text-bg-cream transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary focus-visible:ring-offset-2"><Trash2 className="h-4 w-4" aria-hidden="true" />Eliminar</button>
          </div>
        </>
      )}

      {tarjeta && modo === "editar" && (
        <form onSubmit={guardar}>
          <div className="mb-4"><label htmlFor="tarjeta-titular" className="mb-1.5 block text-sm font-medium text-bg-dark">Titular</label><input id="tarjeta-titular" required maxLength={100} placeholder="Nombre del titular" value={valores.titular} onChange={(evento) => cambiar("titular", evento.target.value)} disabled={guardando} className="w-full rounded-xl border border-border-line/60 bg-bg-dark/[0.04] px-3.5 py-3 text-sm text-bg-dark outline-none transition placeholder:text-slate-text focus:border-emerald-primary/70 focus:ring-2 focus:ring-emerald-primary/20 disabled:cursor-not-allowed disabled:opacity-50" /></div>
          <div className="mb-4"><label htmlFor="tarjeta-entidad" className="mb-1.5 block text-sm font-medium text-bg-dark">Entidad financiera</label><input id="tarjeta-entidad" required maxLength={100} placeholder="Banco o entidad financiera" value={valores.entidad} onChange={(evento) => cambiar("entidad", evento.target.value)} disabled={guardando} className="w-full rounded-xl border border-border-line/60 bg-bg-dark/[0.04] px-3.5 py-3 text-sm text-bg-dark outline-none transition placeholder:text-slate-text focus:border-emerald-primary/70 focus:ring-2 focus:ring-emerald-primary/20 disabled:cursor-not-allowed disabled:opacity-50" /></div>
          <div className="mb-4"><label htmlFor="tarjeta-expiracion" className="mb-1.5 block text-sm font-medium text-bg-dark">Vencimiento</label><input id="tarjeta-expiracion" required inputMode="numeric" placeholder="MM/AA" maxLength={5} value={valores.expiracion} onChange={(evento) => cambiar("expiracion", formatearVencimiento(evento.target.value))} disabled={guardando} className="w-full rounded-xl border border-border-line/60 bg-bg-dark/[0.04] px-3.5 py-3 text-sm text-bg-dark outline-none transition placeholder:text-slate-text focus:border-emerald-primary/70 focus:ring-2 focus:ring-emerald-primary/20 disabled:cursor-not-allowed disabled:opacity-50" /></div>
          <div className="mb-4"><label htmlFor="tarjeta-numero" className="mb-1.5 block text-sm font-medium text-bg-dark">Nuevo número de tarjeta <span className="font-normal text-slate-text">(opcional)</span></label><input id="tarjeta-numero" inputMode="numeric" autoComplete="off" placeholder={`Dejar vacío para conservar ${numeroEnmascarado}`} maxLength={19} value={valores.numero} onChange={(evento) => cambiar("numero", evento.target.value.replace(/\D/g, "").slice(0, 19))} disabled={guardando} className="w-full rounded-xl border border-border-line/60 bg-bg-dark/[0.04] px-3.5 py-3 font-mono text-sm text-bg-dark outline-none transition placeholder:font-sans placeholder:text-slate-text focus:border-emerald-primary/70 focus:ring-2 focus:ring-emerald-primary/20 disabled:cursor-not-allowed disabled:opacity-50" /><p className="mt-1.5 text-xs text-slate-text">El nuevo número se guardará enmascarado.</p></div>
          {error && <p role="alert" className="alert alert-danger py-2">{error}</p>}
          <div className="mt-5 flex justify-end gap-2 border-t border-border-line/30 pt-4"><button type="button" disabled={guardando} onClick={() => { setError(""); setModo("detalle"); }} className="min-h-10 rounded-xl border border-border-line/60 bg-white/5 px-4 text-sm font-medium text-bg-cream transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary disabled:cursor-not-allowed disabled:opacity-50">Cancelar</button><button type="submit" disabled={guardando} className="min-h-10 rounded-xl bg-emerald-primary px-4 text-sm font-semibold text-bg-cream transition-colors hover:bg-emerald-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary disabled:cursor-not-allowed disabled:opacity-50">{guardando ? "Guardando…" : "Guardar cambios"}</button></div>
        </form>
      )}

      {tarjeta && modo === "eliminar" && (
        <div>
          <p className="mb-4">¿Eliminar definitivamente la tarjeta de <strong>{tarjeta.titular}</strong> terminada en {numeroEnmascarado.slice(-4)}? Esta acción no se puede deshacer.</p>
          {error && <p role="alert" className="alert alert-danger py-2">{error}</p>}
          <div className="mt-4 flex justify-end gap-2"><button type="button" disabled={guardando} onClick={() => { setError(""); setModo("detalle"); }} className="min-h-10 rounded-xl border border-border-line px-4 text-sm font-medium text-bg-dark transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary disabled:cursor-not-allowed disabled:opacity-50">Cancelar</button><button type="button" disabled={guardando} onClick={eliminar} className="min-h-10 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 disabled:cursor-not-allowed disabled:opacity-50">{guardando ? "Eliminando…" : "Eliminar definitivamente"}</button></div>
        </div>
      )}
    </ModalDetalleRegistro>
  );
}

