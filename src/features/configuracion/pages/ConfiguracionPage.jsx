/**
 * @uso        Página de configuración
 * @funciones  ConfiguracionPage()
 * @datos      Usuario activo de UsuarioActivoContext y fuentes registradas desde fuenteServicio.obtenerFuentes()
 * @eventos    Apertura del modal de perfil y del modal Fuentes, click en Registrar fuentes
 * @estados    modalFuentesAbierto, usuarioAbierto, nextcloudAbierto, credencialVisible, conectando, errorNc, avisoNc, datosNc, disparadorFuentesRef, triggerUsuarioRef, fuentes, cargandoFuentes, errorFuentes
 * @usadoPor   App.jsx (ruta /dashboard/configuracion)
 */

import { useEffect, useRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Card } from "../../../components/ui";
import FuentesRegistradas from "../components/cards/FuentesRegistradas";
import AparienciaCard from "../components/cards/AparienciaCard";
import PerfilCard from "../components/cards/PerfilCard";
import TelegramCard from "../components/cards/TelegramCard";
import CuentasAlmacenamientoCard from "../components/cards/CuentasAlmacenamientoCard";
import { CrearFuenteModal, PerfilUsuarioModal } from "../components/modals";
import { useUsuarioActivo } from "../../../context/UsuarioActivoContext";
import { useTema } from "../../../context/TemaContext";
import { useGmail } from "../../../context/GmailContext";
import { actualizarFuente, obtenerFuentesPorUsuario } from "../../../services/fuenteServicio";
import { conectarNextcloud } from "../../almacenamiento/services/almacenamientoServicio";
import { useFuentesConfiguracion } from "../hooks/useFuentesConfiguracion";
import { useCierreConEsc } from "../../../hooks/useCierreConEsc";
import { GMAIL_CONFIGURADO } from "../../../services/gmailServicio";
import { BotonCerrar } from "../../../components/ui";

export default function ConfiguracionPage() {
  const [modalFuentesAbierto, setModalFuentesAbierto] = useState(false);
  const [usuarioAbierto, setUsuarioAbierto] = useState(false);
  const [nextcloudAbierto, setNextcloudAbierto] = useState(false);
  const [credencialVisible, setCredencialVisible] = useState(false);
  const [conectando, setConectando] = useState(false);
  const [errorNc, setErrorNc] = useState("");
  const [avisoNc, setAvisoNc] = useState("");
  const [datosNc, setDatosNc] = useState({ urlServidor: "", usuario: "", credencial: "" });
  const [avisoGmail, setAvisoGmail] = useState("");

  const disparadorFuentesRef = useRef(null);
  const triggerUsuarioRef = useRef(null);
  const avisoGmailTimerRef = useRef(null);
  const { usuario } = useUsuarioActivo();
  const { tema, alternarTema } = useTema();
  const { gmailConectado, cuentaGmail, cuentasGmail, cuentaSeleccionadaId, gisListo, conexionCargando, errorGmail, conectarGmail, desconectarGmail, seleccionarCuentaGmail } = useGmail();

  const { fuentes, setFuentes, cargandoFuentes, errorFuentes, setErrorFuentes, operacionFuente, confirmarFuenteGuardada: alGuardarFuente, guardarEdicionFuente, confirmarEliminacionFuente } = useFuentesConfiguracion(usuario?.idUsuario);

  useEffect(() => () => window.clearTimeout(avisoGmailTimerRef.current), []);

  const mostrarAvisoGmail = (mensaje) => {
    window.clearTimeout(avisoGmailTimerRef.current);
    setAvisoGmail(mensaje);
    avisoGmailTimerRef.current = window.setTimeout(() => {
      setAvisoGmail("");
      avisoGmailTimerRef.current = null;
    }, 5000);
  };

  const conectarFuentesGmail = async () => {
    try {
      const conexion = await conectarGmail();
      const pendientes = fuentes.filter((fuente) => fuente.tipo?.toUpperCase() === "CORREO" && fuente.estado === false);
      const resultados = await Promise.allSettled(pendientes.map((fuente) => actualizarFuente(
        fuente.idFuente,
        { tipo: fuente.tipo, contenido: fuente.contenido, estado: true },
        usuario?.idUsuario,
      )));
      const activadas = new Set();
      resultados.forEach((resultado, indice) => { if (resultado.status === "fulfilled") activadas.add(pendientes[indice].idFuente); });
      const respuesta = await obtenerFuentesPorUsuario(usuario.idUsuario);
      const lista = Array.isArray(respuesta) ? respuesta : respuesta?.data || respuesta?.content || [];
      setFuentes(Array.isArray(lista) ? lista : []);
      if (activadas.size < pendientes.length) setErrorFuentes("Gmail quedó conectado, pero algunas fuentes no se pudieron activar.");
      else setErrorFuentes("");
      mostrarAvisoGmail(`Gmail conectado como ${conexion.email}.`);
    } catch { /* El mensaje detallado se muestra desde GmailContext. */ }
  };

  const autorizarContactosGmail = async (idCuenta) => {
    try {
      const conexion = await conectarGmail({ incluirContactos: true, cuentaEsperadaId: idCuenta });
      mostrarAvisoGmail(`Contactos de Google autorizados para ${conexion.email}.`);
    } catch { /* El error temporal se muestra junto a las fuentes registradas. */ }
  };

  const alAbrirNextcloud = () => {
    setErrorNc("");
    setAvisoNc("");
    setNextcloudAbierto(true);
  };

  const alCerrarNextcloud = () => setNextcloudAbierto(false);

  const manejarClicExterior = (evento) => {
    if (evento.target === evento.currentTarget) alCerrarNextcloud();
  };

  const alConectarNextcloud = async (evento) => {
    evento.preventDefault();
    setConectando(true);
    setErrorNc("");
    setAvisoNc("");
    try {
      const conexion = await conectarNextcloud(datosNc);
      setAvisoNc(`Nextcloud conectado${conexion?.etiquetaCuenta ? ` como ${conexion.etiquetaCuenta}` : ""}.`);
      setDatosNc({ urlServidor: "", usuario: "", credencial: "" });
      setNextcloudAbierto(false);
    } catch (errorConexion) {
      setErrorNc(errorConexion?.message || "No se pudo conectar la cuenta Nextcloud.");
    } finally { setConectando(false); }
  };

  // Superficie modal del modal de Nextcloud: registra su capa (zIndex superior al de los
  // modales de página) para que Escape cierre exactamente esta superficie y bloquee/restore el scroll.
  useCierreConEsc({ activo: nextcloudAbierto, zIndex: 90, alCerrar: alCerrarNextcloud });

  return (
    <section aria-labelledby="dashboard-title" className="space-y-6 pt-6">
      <div>
        <p className="text-sm font-medium text-emerald-primary">FinApp / Panel</p>
        <h1 id="dashboard-title" className="mt-2 font-display text-3xl text-bg-dark">
          Configuración
        </h1>
      </div>
      <Card className="p-6">
        <p className="text-slate-text">
          Ajusta tus preferencias de cuenta y seguridad.
        </p>
      </Card>

      <AparienciaCard tema={tema} alternarTema={alternarTema} />
      <PerfilCard usuario={usuario} triggerRef={triggerUsuarioRef} alAbrir={() => setUsuarioAbierto(true)} />
      <TelegramCard />
      <CuentasAlmacenamientoCard
        nextcloudAbierto={nextcloudAbierto}
        alAbrirNextcloud={alAbrirNextcloud}
        alCerrarNextcloud={alCerrarNextcloud}
      />

      <FuentesRegistradas
        disparadorFuentesRef={disparadorFuentesRef}
        abrirModalFuentes={() => setModalFuentesAbierto(true)}
        alReconectarGmail={conectarFuentesGmail}
        alAutorizarContactosGmail={autorizarContactosGmail}
        gmailConfigurado={GMAIL_CONFIGURADO}
        gisListo={gisListo}
        conexionCargando={conexionCargando}
        errorGmail={errorGmail}
        avisoGmail={avisoGmail}
        gmailConectado={gmailConectado}
        cuentaGmail={cuentaGmail}
        cuentasGmail={cuentasGmail}
        cuentaSeleccionadaId={cuentaSeleccionadaId}
        seleccionarCuentaGmail={seleccionarCuentaGmail}
        desconectarGmail={desconectarGmail}
        cargandoFuentes={cargandoFuentes}
        errorFuentes={errorFuentes}
        fuentes={fuentes}
        operacionFuente={operacionFuente}
        guardarEdicionFuente={guardarEdicionFuente}
        confirmarEliminacionFuente={confirmarEliminacionFuente}
        errorOperacionFuente={errorFuentes}
      />

      <PerfilUsuarioModal
        abierto={usuarioAbierto}
        alCerrar={() => setUsuarioAbierto(false)}
        triggerRef={triggerUsuarioRef}
      />

      <CrearFuenteModal
        abierto={modalFuentesAbierto}
        alCerrar={() => setModalFuentesAbierto(false)}
        triggerRef={disparadorFuentesRef}
        alGuardar={alGuardarFuente}
        fuentesExistentes={fuentes}
        estadoInicial={gmailConectado}
        alConectarGmail={conectarFuentesGmail}
        gmailConfigurado={GMAIL_CONFIGURADO}
        gmailListo={gisListo}
        conexionGmailCargando={conexionCargando}
        gmailConectado={Boolean(gmailConectado && !errorGmail)}
      />

      {nextcloudAbierto && (
        <div
          className="absolute inset-0 z-[110] flex items-center justify-center bg-bg-dark/70 p-4"
          onClick={manejarClicExterior}
        >
          <form
            role="dialog"
            aria-modal="true"
            aria-labelledby="nc-titulo"
            onSubmit={(e) => { e.stopPropagation(); alConectarNextcloud(e); }}
            className="relative z-[111] w-full max-w-md space-y-3 rounded-3xl border border-border-line/30 bg-bg-cream/95 glass-surface p-4 shadow-xl"
          >
            <header className="flex items-start justify-between gap-4">
              <h2 id="nc-titulo" className="font-display text-lg font-semibold text-bg-dark">Conectar Nextcloud</h2>
              <BotonCerrar ariaLabel="Cerrar conexión con Nextcloud" alCerrar={alCerrarNextcloud} className="shrink-0 text-slate-text hover:text-bg-dark hover:bg-emerald-primary/10 focus-visible:ring-emerald-primary" />
            </header>
            <div>
              <label htmlFor="nc-url" className="block text-sm font-medium text-bg-dark">URL del servidor</label>
              <input id="nc-url" type="text" required autoComplete="off" placeholder="https://nube.ejemplo.com" value={datosNc.urlServidor}
                onChange={(evento) => setDatosNc({ ...datosNc, urlServidor: evento.target.value })}
                className="mt-1 w-full rounded-lg border border-border-line/70 bg-bg-cream px-3 py-2 text-sm text-bg-dark" />
            </div>
            <div>
              <label htmlFor="nc-usuario" className="block text-sm font-medium text-bg-dark">Usuario</label>
              <input id="nc-usuario" type="text" required autoComplete="off" value={datosNc.usuario}
                onChange={(evento) => setDatosNc({ ...datosNc, usuario: evento.target.value })}
                className="mt-1 w-full rounded-lg border border-border-line/70 bg-bg-cream px-3 py-2 text-sm text-bg-dark" />
            </div>
            <div>
              <label htmlFor="nc-credencial" className="block text-sm font-medium text-bg-dark">Contraseña de aplicación</label>
              <div className="relative mt-1">
                <input id="nc-credencial" type={credencialVisible ? "text" : "password"} required autoComplete="new-password" value={datosNc.credencial}
                  onChange={(evento) => setDatosNc({ ...datosNc, credencial: evento.target.value })}
                  className="w-full rounded-lg border border-border-line/70 bg-bg-cream px-3 py-2 pr-10 text-sm text-bg-dark" />
                <button type="button" onClick={() => setCredencialVisible(!credencialVisible)} aria-label={credencialVisible ? "Ocultar contraseña" : "Mostrar contraseña"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-text hover:text-bg-dark">
                  {credencialVisible ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                </button>
              </div>
              <p className="mt-1 text-xs text-slate-text">Se envía al backend por HTTPS y se guarda cifrada; FinApp nunca la vuelve a mostrar.</p>
            </div>
            <button type="submit" disabled={conectando}
              className="inline-flex min-h-10 items-center rounded-lg bg-emerald-primary px-4 text-sm font-medium text-bg-cream hover:bg-emerald-hover disabled:opacity-50">
              {conectando ? "Conectando…" : "Conectar cuenta"}
            </button>
          </form>
        </div>
      )}

      {avisoNc && <p role="status" className="fixed right-4 top-20 z-[120] w-[min(calc(100vw-2rem),24rem)] rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 shadow-xl">{avisoNc}</p>}
      {errorNc && <p role="alert" className="fixed right-4 top-20 z-[120] w-[min(calc(100vw-2rem),24rem)] rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 shadow-xl">{errorNc}</p>}
    </section>
  );
}
