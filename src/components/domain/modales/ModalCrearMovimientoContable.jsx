/**
 * @uso        Modal para registrar un movimiento en un bolsillo
 * @funciones  ModalCrearMovimientoContable({ abierto, bolsillos, triggerRef, alCerrar, alGuardar })
 * @datos      Bolsillo, tipo, fecha, monto, categoría y concepto del movimiento
 * @eventos    Submit del formulario y cierre por Escape, botón, clic exterior o deslizar
 * @estados    valores, respuesta, ocupado
 * @usadoPor   PaginaDashboardContabilidad
 */
import { useEffect, useRef, useState } from "react";
import FocusTrap from "focus-trap-react";
import { BotonCerrar } from "../../ui/BotonCerrar";
import RespuestaModal from "../../ui/RespuestaModal";
import { useCierreConEsc } from "../../../hooks/useCierreConEsc";
import { useDeslizarParaCerrar } from "../../../hooks/useDeslizarParaCerrar";
import { useRetornoDeFoco } from "../../../hooks/useRetornoDeFoco";
import { agruparEntradaPesos, desagruparPesos, formatearPesos, parsearPesos } from "../../../utils/formatoPesos";

function fechaLocal() {
  const hoy = new Date();
  return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`;
}

function valoresIniciales() {
  return { idBolsillo: "", fecha: fechaLocal(), monto: "", categoria: "", concepto: "", origenTipo: "", origenId: "" };
}

const opcionesTrampa = (ref) => ({
  allowOutsideClick: true,
  escapeDeactivates: false,
  initialFocus: () => ref.current,
  returnFocusOnDeactivate: false,
});

/** Permite crear movimientos asociados a un bolsillo y registrar su fuente de dinero. */
export default function ModalCrearMovimientoContable({ abierto, modo = "crear", movimiento = null, bolsillos = [], tarjetas = [], triggerRef, alCerrar, alGuardar }) {
  const panelRef = useRef(null);
  const [valores, setValores] = useState(() => valoresIniciales());
  const [respuesta, setRespuesta] = useState(null);
  const [ocupado, setOcupado] = useState(false);

  useEffect(() => {
    if (abierto) {
      setValores(modo === "editar" && movimiento ? {
        idBolsillo: movimiento.idBolsillo || "",
        fecha: movimiento.fecha || fechaLocal(),
        monto: formatearPesos(movimiento.monto ?? ""),
        categoria: movimiento.categoria || "",
        concepto: movimiento.concepto || "",
        origenTipo: movimiento.origenTipo || (String(movimiento.tipo).toUpperCase() === "INGRESO" ? "" : "EFECTIVO"),
        origenId: movimiento.origenId || "",
      } : valoresIniciales());
      setRespuesta(null);
      setOcupado(false);
    }
  }, [abierto, modo, movimiento?.idMovimiento]);

  useCierreConEsc({ activo: abierto, zIndex: 70, alCerrar: () => !ocupado && alCerrar() });
  useDeslizarParaCerrar({ activo: abierto, refPanel: panelRef, alCerrar: () => !ocupado && alCerrar() });
  useRetornoDeFoco({ activo: abierto, triggerRef });

  if (!abierto) return null;

  const cambiar = (campo, valor) => {
    setValores((actuales) => ({ ...actuales, [campo]: valor }));
    setRespuesta(null);
  };

  const enviar = async (evento) => {
    evento.preventDefault();
    const bolsilloSeleccionado = bolsillos.find((item) => item.idBolsillo === valores.idBolsillo);
    const tipo = bolsilloSeleccionado?.tipo || "";
    const requiereOrigen = Boolean(tipo) && tipo.toUpperCase() !== "INGRESO";
    const requeridos = ["idBolsillo", "fecha", "monto", "categoria", ...(requiereOrigen ? ["origenTipo"] : [])];
    const faltante = requeridos.find((campo) => !String(valores[campo] ?? "").trim());
    const monto = parsearPesos(valores.monto);

    if (faltante || !Number.isFinite(monto) || monto <= 0) {
      setRespuesta({
        tipo: "error",
        campo: faltante || "monto",
        mensaje: faltante ? "Completa todos los campos requeridos." : "El monto debe ser mayor que cero.",
      });
      const campoFoco = faltante === "idBolsillo" ? "bolsillo" : faltante || "monto";
      document.getElementById(`nuevo-movimiento-${campoFoco}`)?.focus();
      return;
    }

    setOcupado(true);
    setRespuesta(null);
    try {
      await alGuardar?.({
        ...valores,
        tipo,
        origenNombre: valores.origenTipo === "BOLSILLO"
          ? bolsillos.find((item) => item.idBolsillo === valores.origenId)?.nombre || ""
          : valores.origenTipo === "CUENTA"
            ? tarjetas.find((item) => item.idTarjeta === valores.origenId)?.entidad || "Cuenta"
            : valores.origenTipo === "EFECTIVO" ? "Efectivo" : "",
        monto,
        categoria: valores.categoria.trim(),
        concepto: valores.concepto.trim(),
      });
      alCerrar();
    } catch (fallo) {
      setRespuesta({ tipo: "error", mensaje: fallo?.message || "No se pudo guardar el movimiento." });
    } finally {
      setOcupado(false);
    }
  };

  const cerrar = () => { if (!ocupado) alCerrar(); };
  const bolsilloSeleccionado = bolsillos.find((item) => item.idBolsillo === valores.idBolsillo);
  const tipoSeleccionado = bolsilloSeleccionado?.tipo || "";
  const requiereOrigen = Boolean(tipoSeleccionado) && tipoSeleccionado.toUpperCase() !== "INGRESO";
  const origenRequiereDetalle = valores.origenTipo === "BOLSILLO" || valores.origenTipo === "CUENTA";
  const bolsillosOrigen = bolsillos.filter((item) => {
    const tipo = String(item.tipo || "").toUpperCase();
    return item.estado !== false && (tipo === "INGRESO" || (tipo === "AHORRO" && (Number(item.saldoDisponible) > 0 || item.idBolsillo === movimiento?.origenId)));
  });

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-bg-dark/70 p-4" onClick={(evento) => evento.target === evento.currentTarget && cerrar()}>
      <FocusTrap focusTrapOptions={opcionesTrampa(panelRef)}>
        <section ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="crear-movimiento-titulo" tabIndex={-1} className="glass-surface relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-border-line/30 bg-bg-cream/95 p-6 text-bg-dark shadow-xl outline-none">
          <header className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-emerald-primary">Registro contable</p>
              <h2 id="crear-movimiento-titulo" className="mt-1 font-display text-2xl font-semibold">{modo === "editar" ? "Editar movimiento" : "Nuevo movimiento"}</h2>
              <p className="mt-1 text-sm text-slate-text">El tipo de movimiento se toma del bolsillo seleccionado.</p>
            </div>
            <BotonCerrar ariaLabel="Cerrar nuevo movimiento" alCerrar={cerrar} className="text-bg-dark hover:bg-emerald-primary/10 focus-visible:ring-emerald-primary" />
          </header>

          <form onSubmit={enviar} className="space-y-4">
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium" htmlFor="nuevo-movimiento-bolsillo">Bolsillo</label>
                <select id="nuevo-movimiento-bolsillo" required value={valores.idBolsillo} onChange={(evento) => { cambiar("idBolsillo", evento.target.value); cambiar("origenTipo", ""); cambiar("origenId", ""); }} className="min-h-11 w-full rounded-xl border border-border-line bg-white px-3">
                  <option value="" disabled>Selecciona un bolsillo</option>
                  {bolsillos.map((bolsillo) => <option key={bolsillo.idBolsillo} value={bolsillo.idBolsillo}>{bolsillo.nombre} · {bolsillo.tipo}{bolsillo.estado === false ? " · Inactivo" : ""}</option>)}
                </select>
                {tipoSeleccionado && <p className="mt-1 text-xs text-slate-text">Tipo de movimiento: {tipoSeleccionado}</p>}
              </div>
              <label className="block text-sm font-medium" htmlFor="nuevo-movimiento-fecha">Fecha<input id="nuevo-movimiento-fecha" required type="date" value={valores.fecha} onChange={(evento) => cambiar("fecha", evento.target.value)} className="mt-1 min-h-11 w-full rounded-xl border border-border-line bg-white px-3" /></label>
              <label className="block text-sm font-medium" htmlFor="nuevo-movimiento-monto">Monto (COP)<input id="nuevo-movimiento-monto" required type="text" inputMode="decimal" placeholder="12.000,00" value={valores.monto} onFocus={() => cambiar("monto", desagruparPesos(valores.monto))} onChange={(evento) => cambiar("monto", agruparEntradaPesos(evento.target.value))} onBlur={() => { const numero = parsearPesos(valores.monto); cambiar("monto", numero === null ? valores.monto : formatearPesos(numero)); }} className="mt-1 min-h-11 w-full rounded-xl border border-border-line bg-white px-3 placeholder:text-slate-text/70" /></label>
              <label className="block text-sm font-medium" htmlFor="nuevo-movimiento-categoria">Categoría<input id="nuevo-movimiento-categoria" required maxLength={80} placeholder="Ej. Alimentación" value={valores.categoria} onChange={(evento) => cambiar("categoria", evento.target.value)} className="mt-1 min-h-11 w-full rounded-xl border border-border-line bg-white px-3 placeholder:text-slate-text/70" /></label>
              <label className="block text-sm font-medium" htmlFor="nuevo-movimiento-concepto">Concepto <span className="font-normal text-slate-text">(opcional)</span><input id="nuevo-movimiento-concepto" maxLength={160} placeholder="Ej. Compra semanal del hogar" value={valores.concepto} onChange={(evento) => cambiar("concepto", evento.target.value)} className="mt-1 min-h-11 w-full rounded-xl border border-border-line bg-white px-3 placeholder:text-slate-text/70" /></label>
              {requiereOrigen && <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm font-medium" htmlFor="nuevo-movimiento-origen-tipo">¿De dónde salió el dinero?
                  <select id="nuevo-movimiento-origen-tipo" required value={valores.origenTipo} onChange={(evento) => { cambiar("origenTipo", evento.target.value); cambiar("origenId", ""); }} className="mt-1 min-h-11 w-full rounded-xl border border-border-line bg-white px-3">
                    <option value="" disabled>Selecciona el origen</option><option value="EFECTIVO">Efectivo</option><option value="BOLSILLO">Bolsillo</option>{tarjetas.length > 0 && <option value="CUENTA">Cuenta o tarjeta</option>}
                  </select>
                </label>
                {origenRequiereDetalle && <label className="block text-sm font-medium" htmlFor="nuevo-movimiento-origen-id">{valores.origenTipo === "BOLSILLO" ? "Bolsillo de origen" : "Cuenta"}
                  <select id="nuevo-movimiento-origen-id" required value={valores.origenId} onChange={(evento) => cambiar("origenId", evento.target.value)} className="mt-1 min-h-11 w-full rounded-xl border border-border-line bg-white px-3"><option value="" disabled>Selecciona {valores.origenTipo === "BOLSILLO" ? "un bolsillo" : "una cuenta"}</option>{(valores.origenTipo === "BOLSILLO" ? bolsillosOrigen : tarjetas).map((item) => <option key={item.idBolsillo || item.idTarjeta} value={item.idBolsillo || item.idTarjeta}>{item.nombre || `${item.entidad} · ${item.titular}`}{item.tipo ? ` · ${item.tipo}` : ""}{item.tipo?.toUpperCase() === "AHORRO" ? ` · ${Number(item.saldoDisponible).toLocaleString("es-CO")} COP` : ""}</option>)}</select>
                </label>}
              </div>}
            </div>
            <RespuestaModal respuesta={respuesta} />
            <div className="flex justify-end gap-2">
              <button type="button" disabled={ocupado} onClick={cerrar} className="min-h-11 rounded-xl border border-border-line px-4 text-sm font-medium hover:bg-white disabled:opacity-50">Cancelar</button>
              <button type="submit" disabled={ocupado || !tipoSeleccionado || (requiereOrigen && (!valores.origenTipo || (origenRequiereDetalle && !valores.origenId))) || !bolsillos.some((bolsillo) => bolsillo.idBolsillo === valores.idBolsillo && (bolsillo.estado !== false || movimiento?.idBolsillo === bolsillo.idBolsillo))} className="min-h-11 rounded-xl bg-emerald-primary px-4 text-sm font-semibold text-bg-cream hover:bg-emerald-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary disabled:opacity-50">{ocupado ? "Guardando…" : modo === "editar" ? "Guardar cambios" : "Guardar movimiento"}</button>
            </div>
          </form>
        </section>
      </FocusTrap>
    </div>
  );
}
