/**
 * @uso        Contabilidad con bolsillos persistidos y movimientos
 * @funciones  PaginaDashboardContabilidad({ movimientos })
 * @datos      Datos de demostración en memoria; no consulta servicios ni persiste cambios
 * @eventos    Apertura/cierre de modales y creación de resúmenes y movimientos de demostración
 * @estados    movimientos, detalle activo, modales de creación y respuesta
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

const formatoMoneda = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
const formatoFecha = new Intl.DateTimeFormat("es-CO", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });

function fechaDeMes(desfase, dia) {
  const hoy = new Date();
  const fecha = new Date(Date.UTC(hoy.getFullYear(), hoy.getMonth() + desfase, dia));
  return fecha.toISOString().slice(0, 10);
}

const MOVIMIENTOS_DEMO = [
  { id: "actual-ingreso", fecha: fechaDeMes(0, 13), concepto: "Pago de nómina", categoria: "Salario", monto: 3800000, tipo: "Ingreso" },
  { id: "actual-mercado", fecha: fechaDeMes(0, 12), concepto: "Mercado semanal", categoria: "Alimentación", monto: -185000, tipo: "Gasto" },
  { id: "actual-servicios", fecha: fechaDeMes(0, 10), concepto: "Servicios del hogar", categoria: "Hogar", monto: -92000, tipo: "Gasto" },
  { id: "actual-ahorro", fecha: fechaDeMes(0, 5), concepto: "Aporte a ahorros", categoria: "Ahorro", monto: -450000, tipo: "Ahorro" },
  { id: "anterior-ingreso", fecha: fechaDeMes(-1, 15), concepto: "Pago de nómina", categoria: "Salario", monto: 3600000, tipo: "Ingreso" },
  { id: "anterior-mercado", fecha: fechaDeMes(-1, 12), concepto: "Compras del hogar", categoria: "Alimentación", monto: -210000, tipo: "Gasto" },
  { id: "anterior-ahorro", fecha: fechaDeMes(-1, 8), concepto: "Ahorro programado", categoria: "Ahorro", monto: -400000, tipo: "Ahorro" },
];

/** Página de bolsillos persistidos y movimientos contables. */
export default function PaginaDashboardContabilidad({ movimientos: movimientosIniciales = MOVIMIENTOS_DEMO }) {
  const navigate = useNavigate();
  const { usuario } = useUsuarioActivo();
  const [movimientos, setMovimientos] = useState(movimientosIniciales);
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
    setBolsillos((actuales) => actuales.filter((item) => item.idBolsillo !== idBolsillo));
  };

  const agregarMovimiento = (movimiento) => {
    if (!usuario?.idUsuario) { navigate("/", { replace: true }); return; }
    setMovimientos((actuales) => [movimiento, ...actuales]);
    setRespuesta({ tipo: "exito", mensaje: "Movimiento agregado a esta demostración." });
  };

  return (
    <section aria-labelledby="contabilidad-titulo" className="space-y-6 pt-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-primary">FinApp / Panel</p>
          <h1 id="contabilidad-titulo" className="mt-1 font-display text-3xl font-medium text-bg-dark">Contabilidad</h1>
          <p className="mt-1 text-sm text-slate-text">Revisa tus gastos, ahorros y balance disponible.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button ref={disparadorMovimientoRef} type="button" onClick={() => { if (!usuario?.idUsuario) { navigate("/", { replace: true }); return; } setRespuesta(null); setCrearMovimientoAbierto(true); }} aria-describedby="movimientos-demo-aviso" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-primary px-4 py-2.5 text-sm font-semibold text-bg-cream shadow-sm transition-colors hover:bg-emerald-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary">
            <Plus className="h-4 w-4" aria-hidden="true" />Nuevo movimiento
          </button>
          <button ref={disparadorBolsilloRef} type="button" onClick={(evento) => { if (!usuario?.idUsuario) { navigate("/", { replace: true }); return; } abrirModalBolsillo("crear", null, evento); }} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-emerald-primary px-4 py-2.5 text-sm font-semibold text-emerald-primary transition-colors hover:bg-emerald-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary">
            <Plus className="h-4 w-4" aria-hidden="true" />Nuevo bolsillo
          </button>
        </div>
      </header>
      <p id="movimientos-demo-aviso" className="sr-only">Los movimientos nuevos se guardan solo en esta demostración.</p>

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
            <div className="flex items-start gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-primary/10 text-emerald-primary"><Wallet className="h-5 w-5" aria-hidden="true" /></span><div className="min-w-0"><h3 className="break-words font-display text-lg font-semibold text-bg-dark">{bolsillo.nombre}</h3><span className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${bolsillo.estado === false ? "bg-slate-200 text-slate-600" : "bg-emerald-100 text-emerald-800"}`}><span className={`h-1.5 w-1.5 rounded-full ${bolsillo.estado === false ? "bg-slate-500" : "bg-emerald-600"}`} aria-hidden="true" />{bolsillo.estado === false ? "Inactivo" : "Activo"}</span></div></div>
            <div className="flex justify-end gap-2 border-t border-border-line/30 pt-3"><button type="button" onClick={(evento) => abrirModalBolsillo("editar", bolsillo, evento)} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-emerald-primary hover:bg-emerald-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary"><Pencil className="h-4 w-4" aria-hidden="true" />Editar</button><button type="button" onClick={(evento) => abrirModalBolsillo("eliminar", bolsillo, evento)} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-red-700 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700"><Trash2 className="h-4 w-4" aria-hidden="true" />Eliminar</button></div>
          </Card>)}
        </div>}
        <RespuestaModal respuesta={respuesta} />
      </section>

      <Card como="section" aria-labelledby="movimientos-titulo" className="overflow-hidden">
        <div className="flex flex-col gap-1 border-b border-border-line/60 px-5 py-4 sm:flex-row sm:items-end sm:justify-between">
          <div><h2 id="movimientos-titulo" className="font-display text-xl font-semibold text-bg-dark">Movimientos recientes</h2><p className="mt-1 text-sm text-slate-text">Actividad de ejemplo para la vista previa contable.</p></div>
          <span className="text-xs font-medium uppercase tracking-wide text-slate-text">Demostración</span>
        </div>
        {movimientos.length ? <ul aria-label="Movimientos de demostración" className="divide-y divide-border-line/50 px-5">
          {movimientos.map((movimiento) => {
            const ingreso = movimiento.monto > 0;
            const IconoMovimiento = ingreso ? ArrowUpRight : ArrowDownRight;
            const tono = ingreso ? "text-cat-income" : movimiento.tipo === "Ahorro" ? "text-emerald-primary" : "text-cat-expense";
            return <li key={movimiento.id} className="grid gap-3 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
              <div className="flex min-w-0 items-center gap-3"><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-bg-cream ${tono}`}><IconoMovimiento className="h-5 w-5" aria-hidden="true" /></span><div className="min-w-0"><p className="truncate font-medium text-bg-dark">{movimiento.concepto}</p><time className="text-sm text-slate-text" dateTime={movimiento.fecha}>{formatoFecha.format(new Date(`${movimiento.fecha}T00:00:00Z`))}</time></div></div>
              <div className="flex items-center justify-between gap-4 pl-[52px] sm:justify-end sm:pl-0"><span className="rounded-full bg-bg-cream px-2.5 py-1 text-xs font-medium text-slate-text">{movimiento.tipo}</span><span className={`min-w-28 text-right font-medium tabular-nums ${tono}`}>{ingreso ? "+" : "−"}{formatoMoneda.format(Math.abs(movimiento.monto))}</span></div>
            </li>;
          })}
        </ul> : <p className="px-5 py-10 text-center text-slate-text">Sin movimientos registrados</p>}
      </Card>

      <ModalBolsillo abierto={modalBolsillo.abierto} modo={modalBolsillo.modo} bolsillo={modalBolsillo.bolsillo} triggerRef={disparadorBolsilloRef} alCerrar={() => setModalBolsillo({ abierto: false, modo: "crear", bolsillo: null })} alGuardar={guardarBolsillo} alEliminar={borrarBolsillo} />
      <ModalCrearMovimientoContable abierto={crearMovimientoAbierto} triggerRef={disparadorMovimientoRef} alCerrar={() => setCrearMovimientoAbierto(false)} alGuardar={agregarMovimiento} />
    </section>
  );
}
