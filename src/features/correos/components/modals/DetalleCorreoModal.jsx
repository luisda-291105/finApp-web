/** Coordina la carga y presenta los componentes del detalle de un correo. */
import { useEffect, useState } from "react";
import ModalDetalleRegistro from "../../../../components/domain/modales/ModalDetalleRegistro";
import { obtenerContenidoCorreoGmail } from "../../../../services/gmailServicio";
import AccionesDetalleCorreo from "./detalle/AccionesDetalleCorreo";
import ContenidoCorreo from "./detalle/ContenidoCorreo";
import DestinatariosCorreo from "./detalle/DestinatariosCorreo";
import EtiquetasCorreo from "./detalle/EtiquetasCorreo";
import RemitenteCorreo from "./detalle/RemitenteCorreo";
import TituloCorreo from "./detalle/TituloCorreo";

/** Muestra los datos del mensaje y carga su contenido completo al abrir el diálogo. */
export default function DetalleCorreoModal({ abierto, correo, fuente, cuentaId, triggerRef, alCerrar }) {
  const [contenido, setContenido] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!abierto || !correo?.id || !cuentaId) {
      setContenido("");
      setError("");
      return undefined;
    }
    let vigente = true;
    setContenido("");
    setError("");
    setCargando(true);
    obtenerContenidoCorreoGmail(cuentaId, correo.id)
      .then((texto) => { if (vigente) setContenido(texto); })
      .catch((fallo) => { if (vigente) setError(fallo?.message || "No se pudo cargar el contenido completo del mensaje."); })
      .finally(() => { if (vigente) setCargando(false); });
    return () => { vigente = false; };
  }, [abierto, correo?.id, cuentaId]);

  if (!correo) return null;
  const etiquetas = correo.nombresEtiquetas?.length ? correo.nombresEtiquetas : correo.etiquetas || [];

  return <ModalDetalleRegistro abierto={abierto} titulo="Detalle del correo" alCerrar={alCerrar} triggerRef={triggerRef} ancho="max-w-2xl">
    <div className="space-y-3 sm:space-y-4">
      <RemitenteCorreo remitente={correo.remitente} fecha={correo.fecha} />
      <DestinatariosCorreo destinatarios={correo.destinatario} direccionFuente={fuente?.contenido} />
      <TituloCorreo titulo={correo.asunto} />
      <EtiquetasCorreo etiquetas={etiquetas} />
      <ContenidoCorreo contenido={contenido} fragmento={correo.fragmento} cargando={cargando} error={error} />
      <AccionesDetalleCorreo idCorreo={correo.id} alCerrar={alCerrar} />
    </div>
  </ModalDetalleRegistro>;
}
