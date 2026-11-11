/**
 * @uso        Página de configuración
 * @funciones  ConfiguracionPage()
 * @datos      Usuario activo de UsuarioActivoContext y fuentes registradas desde fuenteServicio.obtenerFuentes()
 * @eventos    Apertura del modal de perfil y del modal Fuentes, click en Registrar fuentes
 * @estados    modalFuentesAbierto, usuarioAbierto, disparadorFuentesRef, triggerUsuarioRef, fuentes, cargandoFuentes, errorFuentes
 * @usadoPor   App.jsx (ruta /dashboard/configuracion)
 */

import { useEffect, useRef, useState } from "react";
import { Card } from "../../../components/ui";
import FuentesRegistradas from "../components/cards/FuentesRegistradas";
import AparienciaCard from "../components/cards/AparienciaCard";
import PerfilCard from "../components/cards/PerfilCard";
import TelegramCard from "../components/cards/TelegramCard";
import { CrearFuenteModal, PerfilUsuarioModal } from "../components/modals";
import { useUsuarioActivo } from "../../../context/UsuarioActivoContext";
import { useTema } from "../../../context/TemaContext";
import { useGmail } from "../../../context/GmailContext";
import { actualizarFuente, obtenerFuentesPorUsuario } from "../../../services/fuenteServicio";
import { useFuentesConfiguracion } from "../hooks/useFuentesConfiguracion";
import { GMAIL_CONFIGURADO } from "../../../services/gmailServicio";

export default function ConfiguracionPage() {
  const [modalFuentesAbierto, setModalFuentesAbierto] = useState(false);
  const [usuarioAbierto, setUsuarioAbierto] = useState(false);
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
    </section>
  );
}
