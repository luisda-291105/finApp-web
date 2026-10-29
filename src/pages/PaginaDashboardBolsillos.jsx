/**
 * @uso        Pagina de Bolsillos Grupales conectada al backend (grupos)
 * @funciones  PaginaDashboardBolsillos()
 * @datos      Obtiene grupos desde grupoServicio.obtenerGrupos()
 * @eventos    click en Compartir entrada, click en Nuevo bolsillo
 * @estados    grupos (array), cargando (boolean), error (string), feedbackCopia (string), mensajeCrear (boolean)
 * @usadoPor   App.jsx (ruta /dashboard/bolsillos)
 */


import { useCallback, useEffect, useRef, useState } from "react";
import { Users, Share2, Plus, Wallet, TrendingUp, Check, ShieldCheck } from "lucide-react";
import { Card } from "../components/ui/Card";
import clsx from "clsx";
import ModalRegistroEntidad from "../components/domain/modales/ModalRegistroEntidad";
import { useUsuarioActivo } from "../context/UsuarioActivoContext";
import { obtenerGruposPorUsuario } from "../services/grupoServicio";

function normalizarGrupo(grupo, index) {
  return {
    id: grupo.idGrupo || grupo.id || `grupo-${index}`,
    nombre: grupo.nombre || "Grupo sin nombre",
    descripcion: grupo.descripcion || grupo.detalle || "Sin descripción",
    balance: Number(grupo.balance || grupo.saldo || grupo.total || 0),
    meta: Number(grupo.meta || grupo.objetivo || 0),
    fuenteCompartida: grupo.fuenteCompartida || grupo.fuente || "-",
    miembros: Array.isArray(grupo.miembros)
      ? grupo.miembros.map((miembro, mIndex) => ({
          id: miembro.idUsuario || miembro.id || `m-${index}-${mIndex}`,
          iniciales:
            miembro.iniciales ||
            (miembro.nombre ? String(miembro.nombre).slice(0, 2).toUpperCase() : "U"),
          nombre: miembro.nombre || "Miembro",
          rol: miembro.rol || "Miembro",
        }))
      : [],
  };
}

const BOLSILLOS_MOCK = [
  {
    id: "bolsillo-1",
    nombre: "Gastos de Oficina",
    descripcion: "Suministros, licencias comunes y servicios de coworking del equipo.",
    balance: 4250.0,
    meta: 5000.0,
    fuenteCompartida: "Cuenta Operativa BBVA",
    miembros: [
      { id: "m1", iniciales: "JD", nombre: "Juan Daniel", rol: "Admin" },
      { id: "m2", iniciales: "ML", nombre: "María López", rol: "Editor" },
      { id: "m3", iniciales: "AR", nombre: "Ana Rivas", rol: "Miembro" },
      { id: "m4", iniciales: "CP", nombre: "Carlos Peña", rol: "Miembro" },
    ],
  },
  {
    id: "bolsillo-2",
    nombre: "Viaje y Retiro de Equipo",
    descripcion: "Aportes conjuntos para el retiro anual y actividades de integración.",
    balance: 8100.0,
    meta: 10000.0,
    fuenteCompartida: "Fondo Santander Ahorro",
    miembros: [
      { id: "m1", iniciales: "JD", nombre: "Juan Daniel", rol: "Admin" },
      { id: "m5", iniciales: "SR", nombre: "Sofía Ruiz", rol: "Editor" },
      { id: "m6", iniciales: "VT", nombre: "Valeria Torres", rol: "Miembro" },
      { id: "m7", iniciales: "NM", nombre: "Nicolás Mora", rol: "Miembro" },
      { id: "m8", iniciales: "EL", nombre: "Elena Lara", rol: "Miembro" },
    ],
  },
  {
    id: "bolsillo-3",
    nombre: "Fondo Común de Innovación",
    descripcion: "Presupuesto compartido para prototipado, cursos y herramientas de I+D.",
    balance: 2500.0,
    meta: 3000.0,
    fuenteCompartida: "Billetera Digital Stripe",
    miembros: [
      { id: "m1", iniciales: "JD", nombre: "Juan Daniel", rol: "Admin" },
      { id: "m3", iniciales: "AR", nombre: "Ana Rivas", rol: "Editor" },
      { id: "m9", iniciales: "KL", nombre: "Kevin Lozano", rol: "Miembro" },
    ],
  },
];

export default function PaginaDashboardBolsillos() {
  const { usuario } = useUsuarioActivo();
  const [grupos, setGrupos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [feedbackCopia, setFeedbackCopia] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const disparadorRef = useRef(null);

  const cargarGrupos = useCallback(async () => {
    if (!usuario?.idUsuario) {
      setGrupos([]);
      setCargando(false);
      return;
    }
    try {
      setCargando(true);
      setError("");
      const respuesta = await obtenerGruposPorUsuario(usuario.idUsuario);
      const lista = Array.isArray(respuesta) ? respuesta : respuesta?.data || respuesta?.content || [];
      setGrupos(lista.map((grupo, index) => normalizarGrupo(grupo, index)));
    } catch (fallo) {
      setError(fallo?.message || "No se pudieron cargar tus grupos.");
      setGrupos([]);
    } finally {
      setCargando(false);
    }
  }, [usuario?.idUsuario]);

  useEffect(() => { cargarGrupos(); }, [cargarGrupos]);

  const listaGrupos = grupos.length > 0 ? grupos : [];
  const balanceTotal = listaGrupos.reduce((acc, b) => acc + (Number(b.balance) || 0), 0);
  const metaTotal = listaGrupos.reduce((acc, b) => acc + (Number(b.meta) || 0), 0);

  const alCompartirEntrada = async (bolsillo) => {
    const urlCompartida = `${window.location.origin}/dashboard/bolsillos?invitacion=${bolsillo.id}`;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(urlCompartida);
      }
    } catch {
      // Entorno de test o sin permisos de portapapeles
    }
    setFeedbackCopia(bolsillo.id);
    setTimeout(() => {
      setFeedbackCopia(null);
    }, 3000);
  };

  return (
    <section aria-labelledby="bolsillos-titulo" className="space-y-6 pt-6 pb-12">
      {/* Cabecera de la página */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-primary">FinApp / Panel</p>
          <h1 id="bolsillos-titulo" className="mt-1 font-display text-3xl font-medium text-bg-dark">
            Bolsillos Grupales
          </h1>
          <p className="mt-1 text-sm text-slate-text">
            Gestiona fondos colaborativos, fuentes compartidas y aportes de tu equipo.
          </p>
        </div>

        <button
          type="button"
          ref={disparadorRef}
          onClick={() => setModalAbierto(true)}
          aria-label="Crear nuevo bolsillo grupal"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-primary hover:bg-emerald-hover text-bg-cream text-sm font-medium shadow-md transition-all cursor-pointer hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-accent"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>Nuevo Grupo</span>
        </button>
      </div>

      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      {!usuario?.idUsuario && <p className="text-sm text-slate-text">Inicia sesión para consultar y crear grupos.</p>}

      {/* Resumen métrico grupal */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-primary/10 flex items-center justify-center text-emerald-primary flex-shrink-0">
            <Wallet className="w-6 h-6" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-text uppercase tracking-wider">Balance Colectivo</p>
            <p className="text-2xl font-bold text-bg-dark truncate mt-0.5">
              ${balanceTotal.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-mint-accent/20 flex items-center justify-center text-emerald-hover flex-shrink-0">
            <TrendingUp className="w-6 h-6" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-text uppercase tracking-wider">Meta Total</p>
            <p className="text-2xl font-bold text-bg-dark truncate mt-0.5">
              ${metaTotal.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 flex-shrink-0">
            <Users className="w-6 h-6" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-text uppercase tracking-wider">Bolsillos Activos</p>
            <p className="text-2xl font-bold text-bg-dark truncate mt-0.5">{grupos.length}</p>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 flex-shrink-0">
            <ShieldCheck className="w-6 h-6" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-text uppercase tracking-wider">Fuentes Vinculadas</p>
            <p className="text-2xl font-bold text-bg-dark truncate mt-0.5">3 cuentas</p>
          </div>
        </Card>
      </div>

      {/* Listado de tarjetas de grupos de equipo */}
      <div>
        <h2 className="text-lg font-semibold text-bg-dark mb-4">Grupos del Equipo</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {grupos.map((bolsillo) => {
            const porcentaje = Math.min(100, Math.round((bolsillo.balance / bolsillo.meta) * 100));
            const esCopiado = feedbackCopia === bolsillo.id;

            return (
              <Card
                key={bolsillo.id}
                className="p-6 flex flex-col justify-between space-y-5 border border-border-line/40 hover:shadow-lg transition-shadow"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display text-lg font-semibold text-bg-dark">
                      {bolsillo.nombre}
                    </h3>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-primary/10 text-emerald-primary font-medium shrink-0">
                      {porcentaje}%
                    </span>
                  </div>

                  <p className="text-xs text-slate-text line-clamp-2">
                    {bolsillo.descripcion}
                  </p>

                  <div className="pt-2">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-xs text-slate-text">Balance disponible</span>
                      <span className="text-sm font-bold text-bg-dark">
                        ${bolsillo.balance.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    {/* Barra de progreso */}
                    <div
                      className="w-full h-2 rounded-full bg-border-line/30 overflow-hidden"
                      role="progressbar"
                      aria-valuenow={porcentaje}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`Progreso de ${bolsillo.nombre}`}
                    >
                      <div
                        className="h-full bg-emerald-primary rounded-full transition-all duration-500"
                        style={{ width: `${porcentaje}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center text-[11px] text-slate-text mt-1.5">
                      <span>Meta: ${bolsillo.meta.toLocaleString("es-MX")}</span>
                      <span className="truncate max-w-[140px] text-right font-medium text-emerald-primary">
                        {bolsillo.fuenteCompartida}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Pie de tarjeta: miembros y acción de compartir */}
                <div className="pt-4 border-t border-border-line/20 flex items-center justify-between gap-3">
                  {/* Grupo de avatares */}
                  <div className="flex items-center -space-x-2">
                    {bolsillo.miembros.slice(0, 4).map((miembro) => (
                      <div
                        key={miembro.id}
                        title={`${miembro.nombre} (${miembro.rol})`}
                        className="w-7 h-7 rounded-full bg-emerald-primary text-bg-cream text-[10px] font-semibold flex items-center justify-center ring-2 ring-white"
                      >
                        {miembro.iniciales}
                      </div>
                    ))}
                    {bolsillo.miembros.length > 4 && (
                      <div
                        className="w-7 h-7 rounded-full bg-slate-text/20 text-bg-dark text-[10px] font-bold flex items-center justify-center ring-2 ring-white"
                        title={`+${bolsillo.miembros.length - 4} miembros más`}
                      >
                        +{bolsillo.miembros.length - 4}
                      </div>
                    )}
                  </div>

                  {/* Botón compartir entrada */}
                  <button
                    type="button"
                    onClick={() => alCompartirEntrada(bolsillo)}
                    aria-label={`Compartir entrada de ${bolsillo.nombre}`}
                    className={clsx(
                      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer",
                      esCopiado
                        ? "bg-mint-accent text-bg-dark font-semibold"
                        : "bg-emerald-primary/10 hover:bg-emerald-primary/20 text-emerald-primary"
                    )}
                  >
                    {esCopiado ? (
                      <>
                        <Check className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>¡Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Compartir</span>
                      </>
                    )}
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
      <ModalRegistroEntidad tipo="grupo" abierto={modalAbierto} alCerrar={() => setModalAbierto(false)} triggerRef={disparadorRef} alGuardar={cargarGrupos} />
    </section>
  );
}
