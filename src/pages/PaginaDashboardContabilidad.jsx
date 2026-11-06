/**
 * @uso        Contabilidad con bolsillos persistidos y movimientos
 * @funciones  PaginaDashboardContabilidad()
 * @datos      Consulta bolsillos y movimientos del usuario mediante los servicios de dominio
 * @eventos    CRUD de bolsillos, registro de movimientos y filtros por tipo
 * @estados    bolsillos, resúmenes, movimientos, filtros y modales
 * @usadoPor   App.jsx (ruta /dashboard/contabilidad)
 */
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowDownRight, ArrowUpRight, Pencil, Plus, Trash2, Wallet } from "lucide-react";
import { Card } from "../components/ui/Card";
import RespuestaModal from "../components/ui/RespuestaModal";
import ModalCrearMovimientoContable from "../components/domain/modales/ModalCrearMovimientoContable";
import ModalBolsillo from "../components/domain/modales/ModalBolsillo";
import { useUsuarioActivo } from "../context/UsuarioActivoContext";
import { actualizarBolsillo, crearBolsillo, eliminarBolsillo, listarBolsillos } from "../services/bolsilloServicio";
import { crearMovimiento, listarMovimientos, obtenerResumenesBolsillos } from "../services/movimientoContableServicio";

const formatoMoneda = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
const formatoFecha = new Intl.DateTimeFormat("es-CO", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });

const TIPOS_BASE = ["INGRESO", "GASTO", "AHORRO"];
const etiquetaTipo = (tipo) => ({ INGRESO: "Ingresos", GASTO: "Gastos", AHORRO: "Ahorros" })[tipo] || tipo;

/** Página de bolsillos persistidos y movimientos contables. */
export default function PaginaDashboardContabilidad() {
  const navigate = useNavigate();
  const { usuario } = useUsuarioActivo();
  const [movimientos, setMovimientos] = useState([]);
  const [filtroMovimiento, setFiltroMovimiento] = useState("TODOS");
  const [cargandoMovimientos, setCargandoMovimientos] = useState(false);
  const [errorMovimientos, setErrorMovimientos] = useState("");
  const [revisionMovimientos, setRevisionMovimientos] = useState(0);
  const [resumenesBolsillos, setResumenesBolsillos] = useState({});
  const [cargandoResumenes, setCargandoResumenes] = useState(false);
  const [errorResumenes, setErrorResumenes] = useState("");
  const [crearMovimientoAbierto, setCrearMovimientoAbierto] = useState(false);
  const [respuesta, setRespuesta] = useState(null);
  const [bolsillos, setBolsillos] = useState([]);
  const [cargandoBolsillos, setCargandoBolsillos] = useState(true);
  const [errorBolsillos, setErrorBolsillos] = useState("");
  const [modalBolsillo, setModalBolsillo] = useState({ abierto: false, modo: "crear", bolsillo: null });
  const disparadorBolsilloRef = useRef(null);
  const disparadorMovimientoRef = useRef(null);
  useEffect(() => {
    let vigente = true;
    if (!usuario?.idUsuario) { setBolsillos([]); setCargandoBolsillos(false); return undefined; }
    setCargandoBolsillos(true);
    listarBolsillos().then((respuesta) => {
      if (!vigente) return;
      const lista = Array.isArray(respuesta) ? respuesta : respuesta?.data || respuesta?.content || [];
      setBolsillos(lista);
      setErrorBolsillos("");
    }).catch((fallo) => {
      if (vigente) { setBolsillos([]); setErrorBolsillos(fallo?.message || "No se pudieron cargar los bolsillos."); }
    }).finally(() => { if (vigente) setCargandoBolsillos(false); });
    return () => { vigente = false; };
  }, [usuario?.idUsuario]);

  useEffect(() => {
    let vigente = true;
    if (!usuario?.idUsuario || cargandoBolsillos) {
      setMovimientos([]);
      setCargandoMovimientos(Boolean(usuario?.idUsuario && cargandoBolsillos));
      return undefined;
    }
    setCargandoMovimientos(true);
    listarMovimientos(null, filtroMovimiento).then((respuesta) => {
      if (!vigente) return;
      const lista = Array.isArray(respuesta) ? respuesta : respuesta?.data || respuesta?.content || [];
      setMovimientos(lista);
      setErrorMovimientos("");
    }).catch((fallo) => {
      if (vigente) {
        setMovimientos([]);
        setErrorMovimientos(fallo?.message || "No se pudieron cargar los movimientos.");
      }
    }).finally(() => { if (vigente) setCargandoMovimientos(false); });
    return () => { vigente = false; };
  }, [usuario?.idUsuario, cargandoBolsillos, filtroMovimiento, revisionMovimientos]);

  useEffect(() => {
    let vigente = true;
    if (!usuario?.idUsuario || bolsillos.length === 0) {
      setResumenesBolsillos({});
      setErrorResumenes("");
      setCargandoResumenes(false);
      return undefined;
    }
    setCargandoResumenes(true);
    obtenerResumenesBolsillos().then((respuesta) => {
      if (!vigente) return;
      const lista = Array.isArray(respuesta) ? respuesta : respuesta?.data || respuesta?.content || [];
      setResumenesBolsillos(Object.fromEntries(lista.map((resumen) => [resumen.idBolsillo, resumen])));
      setErrorResumenes("");
    }).catch(() => {
      if (vigente) {
        setResumenesBolsillos({});
        setErrorResumenes("No se pudieron cargar las métricas de este bolsillo.");
      }
    }).finally(() => { if (vigente) setCargandoResumenes(false); });
    return () => { vigente = false; };
  }, [usuario?.idUsuario, bolsillos, revisionMovimientos]);

  const abrirModalBolsillo = (modo, bolsillo, evento) => {
    if (evento?.currentTarget) disparadorBolsilloRef.current = evento.currentTarget;
    setErrorBolsillos("");
    setModalBolsillo({ abierto: true, modo, bolsillo });
  };

  const guardarBolsillo = async (datos) => {
    if (modalBolsillo.modo === "crear") {
      const creado = await crearBolsillo(datos);
      const bolsillo = creado?.data || creado;
      setBolsillos((actuales) => [bolsillo, ...actuales]);
    } else {
      const actualizado = await actualizarBolsillo(modalBolsillo.bolsillo.idBolsillo, datos);
      const bolsillo = actualizado?.data || actualizado || { ...modalBolsillo.bolsillo, ...datos };
      setBolsillos((actuales) => actuales.map((item) => item.idBolsillo === bolsillo.idBolsillo ? { ...item, ...bolsillo } : item));
    }
  };

  const borrarBolsillo = async (idBolsillo) => {
    await eliminarBolsillo(idBolsillo);
    const restantes = bolsillos.filter((item) => item.idBolsillo !== idBolsillo);
    setBolsillos(restantes);
  };

  const guardarMovimiento = async (movimiento) => {
    if (!usuario?.idUsuario) { navigate("/", { replace: true }); return; }
    await crearMovimiento(movimiento);
    setRespuesta({ tipo: "exito", mensaje: "Movimiento guardado en el bolsillo." });
    setRevisionMovimientos((revision) => revision + 1);
  };

  const bolsillosActivos = bolsillos.filter((bolsillo) => bolsillo.estado !== false);
  const filtrosMovimiento = [
    { valor: "TODOS", etiqueta: "Todos" },
    ...Array.from(new Set([...TIPOS_BASE, ...bolsillos.map((bolsillo) => bolsillo.tipo).filter(Boolean)]))
      .map((tipo) => ({ valor: tipo, etiqueta: etiquetaTipo(tipo) })),
  ];

  return (
    <section aria-labelledby="contabilidad-titulo" className="space-y-6 pt-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-primary">FinApp / Panel</p>
          <h1 id="contabilidad-titulo" className="mt-1 font-display text-3xl font-medium text-bg-dark">Contabilidad</h1>
          <p className="mt-1 text-sm text-slate-text">Revisa tus gastos, ahorros y balance disponible.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button ref={disparadorMovimientoRef} type="button" disabled={bolsillosActivos.length === 0} onClick={() => { if (!usuario?.idUsuario) { navigate("/", { replace: true }); return; } setRespuesta(null); setCrearMovimientoAbierto(true); }} title={bolsillosActivos.length === 0 ? "Crea y activa un bolsillo para registrar movimientos" : undefined} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-primary px-4 py-2.5 text-sm font-semibold text-bg-cream shadow-sm transition-colors hover:bg-emerald-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary disabled:cursor-not-allowed disabled:opacity-50">
            <Plus className="h-4 w-4" aria-hidden="true" />Nuevo movimiento
          </button>
          <button ref={disparadorBolsilloRef} type="button" onClick={(evento) => { if (!usuario?.idUsuario) { navigate("/", { replace: true }); return; } abrirModalBolsillo("crear", null, evento); }} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-emerald-primary px-4 py-2.5 text-sm font-semibold text-emerald-primary transition-colors hover:bg-emerald-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary">
            <Plus className="h-4 w-4" aria-hidden="true" />Nuevo bolsillo
          </button>
        </div>
      </header>
      <section aria-labelledby="bolsillos-contables-titulo" className="space-y-4">
        <div>
          <h2 id="bolsillos-contables-titulo" className="font-display text-xl font-semibold text-bg-dark">Bolsillos</h2>
          <p className="mt-1 text-sm text-slate-text">Organiza tu dinero en espacios con nombre y estado propio.</p>
        </div>
        {errorBolsillos && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{errorBolsillos}</p>}
        {cargandoBolsillos && <p role="status" className="text-sm text-slate-text">Cargando bolsillos…</p>}
        {!cargandoBolsillos && !errorBolsillos && bolsillos.length === 0 && <Card className="p-8 text-center"><Wallet className="mx-auto h-8 w-8 text-emerald-primary" aria-hidden="true" /><p className="mt-3 font-medium text-bg-dark">Todavía no tienes bolsillos</p><p className="mt-1 text-sm text-slate-text">Crea uno para empezar a organizar tu contabilidad.</p></Card>}
        {!cargandoBolsillos && bolsillos.length > 0 && <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {bolsillos.map((bolsillo) => <Card key={bolsillo.idBolsillo} className="flex flex-col justify-between gap-5 border border-border-line/40 p-5">
            <div className="flex items-start gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-primary/10 text-emerald-primary"><Wallet className="h-5 w-5" aria-hidden="true" /></span><div className="min-w-0"><h3 className="break-words font-display text-lg font-semibold text-bg-dark">{bolsillo.nombre}</h3><div className="mt-2 flex flex-wrap gap-2"><span className="inline-flex items-center rounded-full bg-bg-cream px-2.5 py-1 text-xs font-semibold text-slate-text">{bolsillo.tipo || "Sin tipo"}</span><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${bolsillo.estado === false ? "bg-slate-200 text-slate-600" : "bg-emerald-100 text-emerald-800"}`}><span className={`h-1.5 w-1.5 rounded-full ${bolsillo.estado === false ? "bg-slate-500" : "bg-emerald-600"}`} aria-hidden="true" />{bolsillo.estado === false ? "Inactivo" : "Activo"}</span></div></div></div>
            {(() => {
              const resumen = resumenesBolsillos[bolsillo.idBolsillo] || {};
              const objetivo = Number(bolsillo.montoObjetivo) || 0;
              const saldo = Number(resumen.saldo) || 0;
              const avance = objetivo > 0 ? Math.min(100, Math.max(0, saldo) / objetivo * 100) : 0;
              return <div className="space-y-3 rounded-xl bg-bg-cream/70 p-3">
                {cargandoResumenes ? <p className="text-xs text-slate-text">Cargando actividad...</p> : errorResumenes ? <p role="status" className="text-xs text-slate-text">{errorResumenes}</p> : <div className="grid grid-cols-2 gap-3">
                  <div><p className="text-xs text-slate-text">Movimientos</p><p className="mt-0.5 font-semibold text-bg-dark">{resumen.cantidad ?? 0}</p></div>
                  <div><p className="text-xs text-slate-text">Saldo</p><p className="mt-0.5 font-semibold text-bg-dark">{formatoMoneda.format(saldo)}</p></div>
                  <div><p className="text-xs text-slate-text">Ingresos</p><p className="mt-0.5 text-sm font-medium text-cat-income">{formatoMoneda.format(Number(resumen.ingresos) || 0)}</p></div>
                  <div><p className="text-xs text-slate-text">Gastos</p><p className="mt-0.5 text-sm font-medium text-cat-expense">{formatoMoneda.format(Number(resumen.gastos) || 0)}</p></div>
                </div>}
                <div className="border-t border-border-line/30 pt-2">
                  <div className="flex justify-between gap-2 text-xs"><span className="text-slate-text">Objetivo</span><span className="font-medium text-bg-dark">{formatoMoneda.format(objetivo)}</span></div>
                  {objetivo > 0 && <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border-line/30" role="progressbar" aria-label={`Avance del objetivo de ${bolsillo.nombre}`} aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.round(avance)}><div className="h-full rounded-full bg-emerald-primary transition-[width]" style={{ width: `${avance}%` }} /></div>}
                </div>
              </div>;
            })()}
            <div className="flex justify-end gap-2 border-t border-border-line/30 pt-3"><button type="button" onClick={(evento) => abrirModalBolsillo("editar", bolsillo, evento)} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-emerald-primary hover:bg-emerald-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary"><Pencil className="h-4 w-4" aria-hidden="true" />Editar</button><button type="button" onClick={(evento) => abrirModalBolsillo("eliminar", bolsillo, evento)} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-red-700 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700"><Trash2 className="h-4 w-4" aria-hidden="true" />Eliminar</button></div>
          </Card>)}
        </div>}
        <RespuestaModal respuesta={respuesta} />
      </section>

      <Card como="section" aria-labelledby="movimientos-titulo" className="overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-border-line/60 px-5 py-4 lg:flex-row lg:items-end lg:justify-between">
          <div><h2 id="movimientos-titulo" className="font-display text-xl font-semibold text-bg-dark">Movimientos de todos los bolsillos</h2><p className="mt-1 text-sm text-slate-text">Filtra por tipo para ver ingresos, gastos o ahorros sin importar el bolsillo.</p></div>
        </div>
        <div className="flex flex-wrap gap-2 border-b border-border-line/30 px-5 py-3" role="group" aria-label="Filtrar movimientos por tipo">
          {filtrosMovimiento.map((filtro) => <button key={filtro.valor} type="button" aria-pressed={filtroMovimiento === filtro.valor} onClick={() => setFiltroMovimiento(filtro.valor)} className={`min-h-9 rounded-full px-3 text-sm font-medium transition-colors ${filtroMovimiento === filtro.valor ? "bg-emerald-primary text-bg-cream" : "text-slate-text hover:bg-emerald-primary/10 hover:text-bg-dark"}`}>{filtro.valor === "TODOS" ? "Todos" : filtro.etiqueta}</button>)}
        </div>
        {errorMovimientos && <p role="alert" className="m-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{errorMovimientos}</p>}
        {cargandoMovimientos && <p role="status" className="px-5 py-8 text-center text-sm text-slate-text">Cargando movimientos...</p>}
        {!cargandoMovimientos && !errorMovimientos && (movimientos.length > 0 ? <ul aria-label="Movimientos de todos los bolsillos" className="divide-y divide-border-line/50 px-5">
          {movimientos.map((movimiento) => {
            const tipo = String(movimiento.tipo || "").toUpperCase();
            const ingreso = tipo === "INGRESO";
            const IconoMovimiento = ingreso ? ArrowUpRight : ArrowDownRight;
            const tono = ingreso ? "text-cat-income" : tipo === "AHORRO" ? "text-emerald-primary" : tipo === "GASTO" ? "text-cat-expense" : "text-slate-text";
            const monto = Number(movimiento.monto) || 0;
            const fecha = movimiento.fecha ? new Date(`${movimiento.fecha}T00:00:00Z`) : null;
            return <li key={movimiento.idMovimiento} className="grid gap-3 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
              <div className="flex min-w-0 items-center gap-3"><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-bg-cream ${tono}`}><IconoMovimiento className="h-5 w-5" aria-hidden="true" /></span><div className="min-w-0"><p className="truncate font-medium text-bg-dark">{movimiento.concepto}</p><p className="truncate text-xs text-emerald-primary">{movimiento.nombreBolsillo}</p><p className="truncate text-xs text-slate-text">{movimiento.categoria}</p><time className="text-sm text-slate-text" dateTime={movimiento.fecha}>{fecha && !Number.isNaN(fecha.getTime()) ? formatoFecha.format(fecha) : movimiento.fecha}</time></div></div>
              <div className="flex items-center justify-between gap-4 pl-[52px] sm:justify-end sm:pl-0"><span className="rounded-full bg-bg-cream px-2.5 py-1 text-xs font-medium text-slate-text">{tipo}</span><span className={`min-w-28 text-right font-medium tabular-nums ${tono}`}>{ingreso ? "+" : tipo === "GASTO" || tipo === "AHORRO" ? "−" : ""}{formatoMoneda.format(monto)}</span></div>
            </li>;
          })}
        </ul> : <p className="px-5 py-10 text-center text-slate-text">Sin movimientos registrados en este filtro.</p>)}
      </Card>

      <ModalBolsillo abierto={modalBolsillo.abierto} modo={modalBolsillo.modo} bolsillo={modalBolsillo.bolsillo} bolsillos={bolsillos} triggerRef={disparadorBolsilloRef} alCerrar={() => setModalBolsillo({ abierto: false, modo: "crear", bolsillo: null })} alGuardar={guardarBolsillo} alEliminar={borrarBolsillo} />
      <ModalCrearMovimientoContable abierto={crearMovimientoAbierto} bolsillos={bolsillosActivos} triggerRef={disparadorMovimientoRef} alCerrar={() => setCrearMovimientoAbierto(false)} alGuardar={guardarMovimiento} />
    </section>
  );
}
