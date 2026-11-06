import { useEffect, useRef, useState } from "react";
import ModalDetalleRegistro from "./ModalDetalleRegistro";
import { desagruparPesos, formatearPesos, limpiarEntradaPesos, parsearPesos } from "../../../utils/formatoPesos";

export default function ModalBolsillo({ abierto, modo = "crear", bolsillo = null, triggerRef, alCerrar, alGuardar, alEliminar }) {
  const [nombre, setNombre] = useState("");
  const [montoObjetivo, setMontoObjetivo] = useState("0");
  const [estado, setEstado] = useState(true);
  const [tipo, setTipo] = useState("GASTO");
  const [editandoObjetivo, setEditandoObjetivo] = useState(false);
  const [error, setError] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const tipoElegidoManualmente = useRef(false);

  useEffect(() => {
    if (!abierto) return;
    setNombre(bolsillo?.nombre || "");
    setMontoObjetivo(formatearPesos(bolsillo?.montoObjetivo ?? 0));
    setTipo(bolsillo?.tipo || "GASTO");
    tipoElegidoManualmente.current = false;
    setEditandoObjetivo(false);
    setEstado(bolsillo?.estado !== false);
    setError("");
  }, [abierto, bolsillo, modo]);

  const guardar = async (evento) => {
    evento.preventDefault();
    if (!nombre.trim()) { setError("Escribe el nombre del bolsillo."); return; }
    const objetivo = parsearPesos(montoObjetivo);
    if (objetivo === null || objetivo < 0) { setError("El monto objetivo debe ser cero o mayor."); return; }
    setOcupado(true);
    setError("");
    try {
      await alGuardar({ nombre: nombre.trim(), tipo, montoObjetivo: objetivo, ...(modo === "editar" ? { estado } : {}) });
      alCerrar();
    } catch (fallo) { setError(fallo?.message || "No se pudo guardar el bolsillo."); }
    finally { setOcupado(false); }
  };

  const cambiarNombre = (nuevoNombre) => {
    setNombre(nuevoNombre);
    if (modo !== "crear" || tipoElegidoManualmente.current) return;
    const texto = nuevoNombre.toLocaleLowerCase("es-CO");
    if (texto.includes("ingres")) setTipo("INGRESO");
    else if (texto.includes("ahorr")) setTipo("AHORRO");
    else setTipo("GASTO");
  };

  const eliminar = async () => {
    setOcupado(true);
    setError("");
    try { await alEliminar(bolsillo.idBolsillo); alCerrar(); }
    catch (fallo) { setError(fallo?.message || "No se pudo eliminar el bolsillo."); }
    finally { setOcupado(false); }
  };

  const titulo = modo === "crear" ? "Nuevo bolsillo" : modo === "editar" ? "Editar bolsillo" : "Eliminar bolsillo";
  return (
    <ModalDetalleRegistro abierto={abierto} titulo={titulo} alCerrar={() => !ocupado && alCerrar()} triggerRef={triggerRef} ancho="max-w-md">
      {modo === "eliminar" ? <div>
        <p className="mb-4 text-sm text-slate-text">¿Eliminar definitivamente el bolsillo <strong className="text-bg-dark">{bolsillo?.nombre}</strong>? Esta acción no se puede deshacer.</p>
        {error && <p role="alert" className="mb-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <div className="flex justify-end gap-2"><button type="button" disabled={ocupado} onClick={alCerrar} className="min-h-10 rounded-xl border border-border-line px-4 text-sm font-medium text-bg-dark hover:bg-bg-cream">Cancelar</button><button type="button" disabled={ocupado} onClick={eliminar} className="min-h-10 rounded-xl bg-red-700 px-4 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-50">{ocupado ? "Eliminando…" : "Eliminar bolsillo"}</button></div>
      </div> : <form onSubmit={guardar} className="space-y-4">
        <label className="block text-sm font-medium text-bg-dark">Nombre del bolsillo<input autoFocus required maxLength={100} value={nombre} onChange={(evento) => cambiarNombre(evento.target.value)} placeholder="Ej. Ahorro para viajes" disabled={ocupado} className="mt-1.5 min-h-11 w-full rounded-xl border border-border-line bg-bg-cream px-3.5 text-sm text-bg-dark outline-none placeholder:text-slate-text focus:border-emerald-primary focus:ring-2 focus:ring-emerald-primary/20 disabled:opacity-50" /></label>
        <label className="block text-sm font-medium text-bg-dark">Tipo<select value={tipo} onChange={(evento) => { tipoElegidoManualmente.current = true; setTipo(evento.target.value); }} disabled={ocupado} className="mt-1.5 min-h-11 w-full rounded-xl border border-border-line bg-bg-cream px-3.5 text-sm text-bg-dark outline-none focus:border-emerald-primary focus:ring-2 focus:ring-emerald-primary/20 disabled:opacity-50"><option value="INGRESO">Ingreso</option><option value="GASTO">Gasto</option><option value="AHORRO">Ahorro</option></select></label>
        <label className="block text-sm font-medium text-bg-dark">Monto objetivo (COP)<input type="text" inputMode="decimal" value={montoObjetivo} onFocus={() => { if (!editandoObjetivo) { setMontoObjetivo(desagruparPesos(montoObjetivo)); setEditandoObjetivo(true); } }} onChange={(evento) => setMontoObjetivo(limpiarEntradaPesos(evento.target.value))} onBlur={() => { const numero = parsearPesos(montoObjetivo); setMontoObjetivo(numero === null ? "" : formatearPesos(numero)); setEditandoObjetivo(false); }} placeholder="12.000,00" disabled={ocupado} className="mt-1.5 min-h-11 w-full rounded-xl border border-border-line bg-bg-cream px-3.5 text-sm text-bg-dark outline-none placeholder:text-slate-text focus:border-emerald-primary focus:ring-2 focus:ring-emerald-primary/20 disabled:opacity-50" /></label>
        {modo === "editar" && <label className="flex items-center gap-3 rounded-xl border border-border-line/50 p-3 text-sm"><input type="checkbox" checked={estado} onChange={(evento) => setEstado(evento.target.checked)} disabled={ocupado} className="h-4 w-4 accent-emerald-700" /><span><span className="block font-medium text-bg-dark">Bolsillo activo</span><span className="text-xs text-slate-text">Los bolsillos inactivos se conservan y puedes activarlos nuevamente.</span></span></label>}
        {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <div className="flex justify-end gap-2 border-t border-border-line/30 pt-4"><button type="button" disabled={ocupado} onClick={alCerrar} className="min-h-10 rounded-xl border border-border-line px-4 text-sm font-medium text-bg-dark hover:bg-bg-cream">Cancelar</button><button type="submit" disabled={ocupado} className="min-h-10 rounded-xl bg-emerald-primary px-4 text-sm font-semibold text-bg-cream hover:bg-emerald-hover disabled:opacity-50">{ocupado ? "Guardando…" : modo === "crear" ? "Crear bolsillo" : "Guardar cambios"}</button></div>
      </form>}
    </ModalDetalleRegistro>
  );
}
