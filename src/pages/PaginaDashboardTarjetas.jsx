/**
 * @uso        Página de tarjetas del dashboard
 * @funciones  PaginaDashboardTarjetas()
 * @datos      Tarjetas registradas consultadas por el usuario activo
 * @eventos    click en Nueva tarjeta
 * @estados    reducirMovimiento (useReducedMotion) - desactiva hover/tap animados si el usuario lo solicita
 * @usadoPor   App.jsx (ruta /dashboard/tarjetas)
 */

import { Plus } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Card } from "../components/ui/Card";
import ModalRegistroEntidad from "../components/domain/modales/ModalRegistroEntidad";
import { useUsuarioActivo } from "../context/UsuarioActivoContext";
import { obtenerTarjetasPorUsuario } from "../services/tarjetaServicio";
import ModalTarjeta from "../components/domain/modales/ModalTarjeta";

function mostrarVencimiento(vencimiento) {
  const fecha = /^(\d{4})-(\d{2})(?:-\d{2})?$/.exec(vencimiento || "");
  return fecha ? `${fecha[2]}/${fecha[1].slice(-2)}` : vencimiento || "";
}

export default function PaginaDashboardTarjetas() {
  const reducirMovimiento = useReducedMotion();
  const { usuario } = useUsuarioActivo();
  const [tarjetas, setTarjetas] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [tarjetaSeleccionada, setTarjetaSeleccionada] = useState(null);
  const disparadorDetalleRef = useRef(null);
  const disparadorRef = useRef(null);

  const enmascararNumero = (numero) => {
    const digitos = String(numero || "").replace(/\s/g, "");
    return "•••• " + (digitos.slice(-4) || "••••");
  };

  const cargarTarjetas = useCallback(async () => {
    if (!usuario?.idUsuario) {
      setTarjetas([]);
      setCargando(false);
      return;
    }
    try {
      setCargando(true);
      setError("");
      const respuesta = await obtenerTarjetasPorUsuario(usuario.idUsuario);
      const datos = Array.isArray(respuesta) ? respuesta : respuesta?.data || respuesta?.content || [];
      const registros = Array.isArray(datos) ? datos : [];
      setTarjetas(registros.map((tarjeta) => ({
        ...tarjeta,
        expiracion: mostrarVencimiento(tarjeta.expiracion),
      })));
    } catch (fallo) {
      setTarjetas([]);
      setError(fallo?.message || "No se pudieron cargar tus tarjetas.");
    } finally {
      setCargando(false);
    }
  }, [usuario?.idUsuario]);

  useEffect(() => { cargarTarjetas(); }, [cargarTarjetas]);

  return (
    <section aria-labelledby="dashboard-title" className="space-y-6 pt-6">
      {/* header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-primary">FinApp / Panel</p>
          <h1 id="dashboard-title" className="mt-1 font-display text-3xl font-medium text-bg-dark">
            Tus tarjetas
          </h1>
          <p className="mt-1 text-sm text-slate-text">
            Administra tus tarjetas y revisa sus saldos.
          </p>
        </div>

        <button
          ref={disparadorRef}
          type="button"
          onClick={() => setModalAbierto(true)}
          aria-label="Agregar nueva tarjeta"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-primary hover:bg-emerald-hover text-bg-cream text-sm font-medium shadow-md transition-all cursor-pointer hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-accent"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>Nueva tarjeta</span>
        </button>
      </div>

      {/* tarjetas registradas / cargando */}
      <Card className="space-y-4 p-6">
        <h2 className="font-display text-lg font-semibold text-bg-dark">Tarjetas registradas</h2>
        {cargando && <p role="status" className="text-sm text-slate-text">Cargando tarjetas...</p>}
        {!cargando && error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        {!cargando && !error && !usuario?.idUsuario && <p className="text-sm text-slate-text">Inicia sesión para ver tus tarjetas.</p>}
        {!cargando && !error && usuario?.idUsuario && tarjetas.length === 0 && <p className="text-sm text-slate-text">Todavía no tienes tarjetas registradas.</p>}
        {!cargando && !error && tarjetas.length > 0 && (
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Tarjetas registradas">
            {tarjetas.map((tarjeta, index) => (
              <li key={tarjeta.idTarjeta || index}>
                <motion.button
                  type="button"
                  onClick={(evento) => {
                    disparadorDetalleRef.current = evento.currentTarget;
                    setTarjetaSeleccionada(tarjeta);
                  }}
                  aria-label={`Ver tarjeta de ${tarjeta.titular || "Titular"}`}
                  className="flex min-h-44 w-full flex-col justify-between rounded-2xl border border-border-line bg-transparent p-5 text-left text-bg-dark shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-accent"
                  whileHover={reducirMovimiento ? undefined : { y: -4 }}
                  whileTap={reducirMovimiento ? undefined : { scale: 0.99 }}
                  transition={
                    reducirMovimiento
                      ? { duration: 0 }
                      : { duration: 0.25, ease: [0.22, 1, 0.36, 1] }
                  }
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium uppercase tracking-wider text-bg-dark/70">{tarjeta.entidad || "Tarjeta"}</p>
                      <h3 className="mt-1 truncate font-display text-lg font-semibold">{tarjeta.titular || "Titular"}</h3>
                    </div>
                    <span aria-hidden="true" className="rounded-md border border-border-line px-2 py-1 text-[10px] font-semibold uppercase">FinApp</span>
                  </div>
                  <div>
                    <p className="font-mono text-lg tracking-widest" aria-label="Número de tarjeta enmascarado">{enmascararNumero(tarjeta.numero)}</p>
                    <p className="mt-2 text-xs text-bg-dark/80">Vence {tarjeta.expiracion || "Sin fecha"}</p>
                  </div>
                </motion.button>
              </li>
            ))}
          </ul>
        )}
      </Card>
      <ModalTarjeta tarjeta={tarjetaSeleccionada} triggerRef={disparadorDetalleRef} onCerrar={() => setTarjetaSeleccionada(null)} />
      <ModalRegistroEntidad tipo="tarjeta" abierto={modalAbierto} alCerrar={() => setModalAbierto(false)} triggerRef={disparadorRef} alGuardar={cargarTarjetas} />
    </section>
  );
}
