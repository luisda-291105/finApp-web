/**
 * @uso        Modal de previsualización de archivos con soporte inline, texto y enlaces externos
 * @funciones  ModalPrevisualizacion({ abierto, item, cuentaId, obtenerUrlContenido, obtenerUrlPrevisualizacion, alDescargar, cargarContenido, alCerrar })
 * @datos      Usa URL de previsualización/contenido del backend y, para texto, carga autenticada del contenido
 * @eventos    Cierre con Escape, botón «X», clic exterior; descarga y apertura externa
 * @estados    contenidoTexto, cargandoContenido, errorContenido
 * @usadoPor   AlmacenamientoPage
 */
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import FocusTrap from "focus-trap-react";
import { Download, ExternalLink } from "lucide-react";
import { BotonCerrar } from "../../../../components/ui";
import { useCierreConEsc } from "../../../../hooks/useCierreConEsc";
import { useRetornoDeFoco } from "../../../../hooks/useRetornoDeFoco";
import AlmacenamientoArchivoIcono from "./AlmacenamientoArchivoIcono";

function esGoogleDoc(item) {
  const mime = String(item?.mime || "");
  const enlace = String(item?.enlaceExterno || item?.webViewLink || "");
  return /google-apps\.(document|spreadsheet|presentation)/.test(mime) || /docs\.google\.com|sheets\.google\.com|slides\.google\.com/.test(enlace);
}

function esImagen(item) {
  return String(item?.mime || "").startsWith("image/");
}

function esPdf(item) {
  return String(item?.mime || "") === "application/pdf" || /\.pdf$/i.test(item?.nombre || "");
}

function esTexto(item) {
  const mime = String(item?.mime || "").toLowerCase();
  const nombre = String(item?.nombre || "").toLowerCase();
  if (mime.startsWith("text/")) return true;
  if (/json|xml|javascript|typescript|csv|yaml|yml|sql|html|css|markdown/.test(mime)) return true;
  return /\.(txt|md|markdown|json|xml|csv|log|yml|yaml|js|jsx|ts|tsx|css|scss|html|htm|sql|ini|conf|env|sh|bat|ps1|py|java|c|cpp|h|cs|go|rs|php|rb)$/i.test(nombre);
}

export default function ModalPrevisualizacion({ abierto, item, cuentaId, obtenerUrlContenido, obtenerUrlPrevisualizacion, alDescargar, cargarContenido, alCerrar }) {
  const panelRef = useRef(null);
  const [contenidoTexto, setContenidoTexto] = useState("");
  const [cargandoContenido, setCargandoContenido] = useState(false);
  const [errorContenido, setErrorContenido] = useState("");

  useCierreConEsc({ activo: abierto, zIndex: 130, alCerrar });
  useRetornoDeFoco({ activo: abierto, triggerRef: null });

  useEffect(() => { if (abierto) panelRef.current?.focus(); }, [abierto]);

  const urlPrev = obtenerUrlPrevisualizacion?.(item?.id) || "";
  const urlContenido = obtenerUrlContenido?.(item?.id) || "";
  const enlaceExterno = item?.enlaceExterno || item?.webViewLink || "";
  const esImagenArchivo = esImagen(item);
  const esPdfArchivo = esPdf(item);
  const esTextoArchivo = esTexto(item);
  const puedeCargarBlob = Boolean(cuentaId && item?.id && cargarContenido && (esImagenArchivo || esPdfArchivo || esTextoArchivo));
  const [contenidoBlobUrl, setContenidoBlobUrl] = useState("");
  const mostrarInlineImagen = Boolean(esImagenArchivo && (contenidoBlobUrl || urlContenido));
  const mostrarInlinePdf = Boolean(esPdfArchivo && (contenidoBlobUrl || urlPrev || urlContenido));
  const mostrarTexto = Boolean(abierto && item && esTextoArchivo && !esImagenArchivo && !esPdfArchivo);
  const esExterno = esGoogleDoc(item) || Boolean(enlaceExterno);

  useEffect(() => {
    let activo = true;
    let urlObjeto = "";
    if (!abierto || !puedeCargarBlob) {
      setContenidoTexto("");
      setErrorContenido("");
      setCargandoContenido(false);
      setContenidoBlobUrl("");
      return () => { activo = false; };
    }
    setCargandoContenido(true);
    setErrorContenido("");
    setContenidoTexto("");
    setContenidoBlobUrl("");
    (async () => {
      try {
        const blob = await cargarContenido(item.id);
        if (!activo) return;
        if (esTextoArchivo) {
          const texto = blob ? await blob.text() : "";
          setContenidoTexto(texto);
        } else {
          urlObjeto = URL.createObjectURL(blob);
          setContenidoBlobUrl(urlObjeto);
        }
      } catch (error) {
        if (activo) setErrorContenido(error?.message || "No se pudo cargar el contenido del archivo.");
      } finally {
        if (activo) setCargandoContenido(false);
      }
    })();
    return () => {
      activo = false;
      if (urlObjeto) URL.revokeObjectURL(urlObjeto);
    };
  }, [abierto, cargarContenido, esPdfArchivo, esTextoArchivo, item?.id, puedeCargarBlob]);

  if (!abierto || !item) return null;

  return createPortal(
    <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-bg-dark/70 p-3 backdrop-blur-sm" onClick={(evento) => { if (evento.target === evento.currentTarget) alCerrar(); }}>
      <FocusTrap focusTrapOptions={{ allowOutsideClick: true, escapeDeactivates: false, initialFocus: () => panelRef.current, returnFocusOnDeactivate: false }}>
        <section ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="modal-previsualizacion-titulo" aria-describedby="modal-previsualizacion-descripcion" tabIndex={-1} className="glass-surface relative w-full max-w-3xl rounded-3xl border border-border-line/30 bg-bg-cream/95 p-5 text-bg-dark shadow-2xl outline-none sm:p-6">
          <header className="mb-4 flex items-start justify-between gap-4 border-b border-border-line/30 pb-4">
            <div className="min-w-0">
              <h2 id="modal-previsualizacion-titulo" className="truncate font-display text-lg font-semibold">{item.nombre}</h2>
              <p id="modal-previsualizacion-descripcion" className="text-xs text-slate-text">{item.mime || "Archivo"}{item.tamanio ? ` · ${Math.round(item.tamanio / 1024)} KB` : ""}</p>
            </div>
            <BotonCerrar ariaLabel="Cerrar previsualización" alCerrar={alCerrar} className="text-slate-text hover:text-bg-dark" />
          </header>

          <div className="max-h-[70vh] overflow-auto">
            {mostrarInlineImagen && !cargandoContenido && !errorContenido && <img src={contenidoBlobUrl || urlContenido} alt={`Vista previa de ${item.nombre}`} className="mx-auto max-h-[60vh] rounded-xl object-contain" />}
            {mostrarInlinePdf && !mostrarInlineImagen && !cargandoContenido && !errorContenido && <iframe title={`Vista previa de ${item.nombre}`} src={contenidoBlobUrl || urlPrev || urlContenido} className="h-[60vh] w-full rounded-xl border border-border-line/30 bg-white" />}
            {(mostrarTexto || ((mostrarInlineImagen || mostrarInlinePdf) && (cargandoContenido || errorContenido))) && (
              <div className="rounded-xl border border-border-line/30 bg-bg-cream p-3">
                {cargandoContenido && <p role="status" className="text-sm text-slate-text">Cargando contenido…</p>}
                {errorContenido && <p role="alert" className="text-sm text-red-700 dark:text-red-200">{errorContenido}</p>}
                {mostrarTexto && !cargandoContenido && !errorContenido && <pre className="max-h-[60vh] overflow-auto whitespace-pre-wrap break-words text-xs leading-relaxed text-bg-dark">{contenidoTexto || "(Archivo vacío)"}</pre>}
              </div>
            )}
            {!mostrarInlineImagen && !mostrarInlinePdf && !mostrarTexto && !(cargandoContenido || errorContenido) && (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <AlmacenamientoArchivoIcono item={item} className="h-16 w-16" />
                <p className="text-sm text-slate-text">{esExterno ? "Este tipo de archivo se abre en su editor externo." : "La vista previa no está disponible para este archivo. Puedes descargarlo para revisarlo."}</p>
              </div>
            )}
          </div>

          <footer className="mt-4 flex flex-wrap justify-end gap-2 border-t border-border-line/30 pt-4">
            {esExterno && (enlaceExterno || urlContenido) && (
              <a href={enlaceExterno || urlContenido} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border-line/60 px-4 text-sm font-medium text-bg-dark hover:bg-emerald-primary/5">
                <ExternalLink className="h-4 w-4 text-emerald-primary" aria-hidden="true" />Abrir externo
              </a>
            )}
            <button type="button" onClick={() => alDescargar?.(item.id)} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-primary px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-emerald-hover">
              <Download className="h-4 w-4" aria-hidden="true" />Descargar
            </button>
          </footer>
        </section>
      </FocusTrap>
    </div>,
    document.body
  );
}
