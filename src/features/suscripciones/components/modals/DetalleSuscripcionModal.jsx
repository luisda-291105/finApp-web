/**
 * @uso        Gestionar una suscripción detectada en una cuenta Gmail
 * @funciones  DetalleSuscripcionModal({ suscripcion, triggerRef, alCerrar })
 * @datos      Muestra el remitente, cuenta de origen y opciones de baja
 * @eventos    Solicita la baja solo después de confirmación explícita
 * @estados    Confirmación y resultado de la solicitud de baja
 * @usadoPor   SuscripcionesPage
 */
import { useEffect, useState } from "react";
import { CheckCircle2, ExternalLink, LoaderCircle, Mail, Tag } from "lucide-react";
import ModalDetalleRegistro from "../../../../components/domain/modales/ModalDetalleRegistro";

function textoActividad(cantidad) {
  if (cantidad == null) return "Actividad reciente no disponible";
  if (cantidad > 20) return "Recientemente, más de 20 correos electrónicos";
  if (cantidad >= 10) return "Recientemente, entre 10 y 20 correos electrónicos";
  return "Recientemente, 10 correos electrónicos o menos";
}

/** Detalle centrado en el remitente, como la lista de Suscripciones de Gmail. */
export default function DetalleSuscripcionModal({ suscripcion, triggerRef, alCerrar }) {
  const [confirmando, setConfirmando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [resultadoBaja, setResultadoBaja] = useState("");
  const [errorBaja, setErrorBaja] = useState("");

  useEffect(() => {
    setConfirmando(false);
    setEnviando(false);
    setResultadoBaja("");
    setErrorBaja("");
  }, [suscripcion?.id, suscripcion?.cuentaGmailId]);

  if (!suscripcion) return null;
  const correo = encodeURIComponent(suscripcion.cuentaGmail || "");
  const urlAdministrar = `https://mail.google.com/mail/u/?authuser=${correo}#sub`;
  const etiquetas = (suscripcion.categorias || []).map((categoria) => categoria === "CATEGORY_PROMOTIONS" ? "Promociones" : "Actualizaciones");
  const tieneOpcionBaja = Boolean(suscripcion.urlBaja || suscripcion.mailtoBaja);

  const solicitarBaja = async () => {
    if (!suscripcion.urlBaja || !suscripcion.bajaConUnClic) return;
    setEnviando(true);
    setErrorBaja("");
    try {
      // Gmail exige una petición POST One-Click para este tipo de baja.
      // no-cors impide leer la respuesta: solo confirmamos que el navegador la envió.
      await fetch(suscripcion.urlBaja, {
        method: "POST",
        mode: "no-cors",
        credentials: "omit",
        referrerPolicy: "no-referrer",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "List-Unsubscribe=One-Click",
      });
      setResultadoBaja("Solicitud enviada. El remitente puede tardar unos días en dejar de enviar mensajes; no es posible confirmar desde FinApp si ya la procesó.");
      setConfirmando(false);
    } catch {
      setErrorBaja("No se pudo enviar la solicitud. Puedes administrar esta baja directamente desde Gmail.");
    } finally {
      setEnviando(false);
    }
  };

  return <ModalDetalleRegistro abierto={Boolean(suscripcion)} titulo={`Suscripción: ${suscripcion.nombre || "Remitente"}`} alCerrar={alCerrar} triggerRef={triggerRef} ancho="max-w-lg">
    <div className="space-y-4">
      <div className="rounded-2xl border border-border-line/50 bg-bg-cream/60 p-4">
        <dl className="space-y-4">
          <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-text">Remitente</dt><dd className="mt-1 break-all text-sm font-medium text-bg-dark">{suscripcion.nombre || "Remitente desconocido"}</dd><dd className="mt-1 break-all text-sm text-slate-text">{suscripcion.correoRemitente || "Dirección no disponible"}</dd></div>
          <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-text">Cuenta Gmail</dt><dd className="mt-1 break-all text-sm text-bg-dark">{suscripcion.cuentaGmail}</dd></div>
          <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-text">Actividad reciente</dt><dd className="mt-1 text-sm text-bg-dark">{textoActividad(suscripcion.correosRecientes)}</dd></div>
          <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-text">Categorías detectadas</dt><dd className="mt-2 flex flex-wrap gap-2">{etiquetas.length ? etiquetas.map((etiqueta) => <span key={etiqueta} className="inline-flex items-center gap-1.5 rounded-full bg-emerald-primary/10 px-2.5 py-1 text-xs font-medium text-emerald-primary"><Tag className="h-3 w-3" aria-hidden="true" />{etiqueta}</span>) : <span className="text-sm text-slate-text">Sin categoría disponible</span>}</dd></div>
        </dl>
      </div>

      <section aria-labelledby="opciones-baja-titulo" className="space-y-3 rounded-2xl border border-border-line/50 p-4">
        <h3 id="opciones-baja-titulo" className="font-semibold text-bg-dark">Anular suscripción</h3>
        {!tieneOpcionBaja && <p className="text-sm text-slate-text">Este remitente no incluyó un enlace de baja detectable. Puedes gestionarlo en Gmail.</p>}
        {suscripcion.bajaConUnClic && suscripcion.urlBaja && !resultadoBaja && <>
          <p className="text-sm text-slate-text">El remitente admite la baja con un clic. FinApp enviará la solicitud solo cuando la confirmes.</p>
          {confirmando ? <div className="space-y-3 rounded-xl bg-red-50 p-3 text-sm text-red-800"><p>¿Quieres enviar la solicitud para anular esta suscripción?</p><div className="flex flex-wrap justify-end gap-2"><button type="button" onClick={() => setConfirmando(false)} disabled={enviando} className="min-h-10 rounded-lg border border-border-line px-3 font-medium text-bg-dark">Cancelar</button><button type="button" onClick={solicitarBaja} disabled={enviando} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-red-700 px-3 font-semibold text-white disabled:opacity-60">{enviando && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}{enviando ? "Enviando…" : "Confirmar anulación"}</button></div></div> : <button type="button" onClick={() => setConfirmando(true)} className="min-h-10 rounded-lg bg-red-700 px-4 text-sm font-semibold text-white hover:bg-red-800">Anular suscripción</button>}
        </>}
        {!suscripcion.bajaConUnClic && suscripcion.urlBaja && <a href={suscripcion.urlBaja} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border-line px-3 text-sm font-medium text-bg-dark hover:border-emerald-primary"><ExternalLink className="h-4 w-4" aria-hidden="true" />Abrir página para anular</a>}
        {suscripcion.mailtoBaja && <a href={suscripcion.mailtoBaja} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border-line px-3 text-sm font-medium text-bg-dark hover:border-emerald-primary"><Mail className="h-4 w-4" aria-hidden="true" />Preparar correo de baja</a>}
        {resultadoBaja && <p role="status" className="flex gap-2 rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-900"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />{resultadoBaja}</p>}
        {errorBaja && <p role="alert" className="rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-800">{errorBaja}</p>}
      </section>

      <p className="rounded-xl border border-border-line/50 bg-bg-cream/50 p-3 text-xs leading-relaxed text-slate-text">FinApp agrupa remitentes detectados en mensajes recientes de Promociones y Actualizaciones; no recibe la lista completa que Gmail presenta en su administrador.</p>
      <div className="flex justify-end border-t border-border-line/40 pt-4"><a href={urlAdministrar} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-emerald-primary px-4 text-sm font-semibold text-white"><ExternalLink className="h-4 w-4" aria-hidden="true" />Administrar en Gmail</a></div>
    </div>
  </ModalDetalleRegistro>;
}
