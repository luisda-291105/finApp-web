import CampoDetalle from "./CampoDetalle";

function normalizarDestino(destino) {
  let candidato = String(destino || "");
  for (let intento = 0; intento < 4; intento += 1) {
    try {
      const url = new URL(candidato);
      if (["http:", "https:", "mailto:"].includes(url.protocol)) return url;
    } catch { /* Prueba a decodificar enlaces que Gmail haya codificado más de una vez. */ }
    try {
      const decodificado = decodeURIComponent(candidato);
      if (decodificado === candidato) break;
      candidato = decodificado;
    } catch { break; }
  }
  return null;
}

function renderEnlaces(texto) {
  const patron = /\[\[\[MAIL_LINK:([^|]+)\|([^\]]+)\]\]\]|https?(?::\/\/|%3a%2f%2f|%253a%252f%252f)[^\s<>"']+/gi;
  const tokenCodificado = /[A-Za-z0-9_-]{8,}(?:%[0-9a-f]{2}[A-Za-z0-9_-]*){3,}/gi;
  const elementos = [];
  const agregarTexto = (fragmento) => {
    const textoLegible = fragmento.replace(tokenCodificado, "Enlace externo");
    if (textoLegible) elementos.push(textoLegible);
  };
  let cursor = 0;
  let coincidencia;
  while ((coincidencia = patron.exec(texto))) {
    if (coincidencia.index > cursor) agregarTexto(texto.slice(cursor, coincidencia.index));
    const esMarcador = coincidencia[0].startsWith("[[[MAIL_LINK:");
    let destino = coincidencia[0];
    let sufijo = "";
    try {
      if (esMarcador) {
        destino = decodeURIComponent(coincidencia[2]);
      } else {
        const limpio = coincidencia[0].replace(/[),.;]+$/, "");
        sufijo = coincidencia[0].slice(limpio.length);
        destino = limpio;
      }
      const url = normalizarDestino(destino);
      if (!url) throw new Error("No se pudo interpretar el destino");
      const etiquetaVisible = url.protocol === "mailto:" ? url.pathname : url.hostname;
      elementos.push(<a key={`enlace-${coincidencia.index}`} href={url.href} target={url.protocol === "mailto:" ? undefined : "_blank"} rel="noreferrer" className="break-all font-medium text-emerald-primary underline underline-offset-2">{etiquetaVisible}</a>);
      if (sufijo) elementos.push(sufijo);
    } catch { agregarTexto(coincidencia[0]); }
    cursor = patron.lastIndex;
  }
  if (cursor < texto.length) agregarTexto(texto.slice(cursor));
  return elementos;
}

export default function ContenidoCorreo({ contenido, fragmento, cargando, error }) {
  const texto = contenido || fragmento || "Este mensaje no contiene texto legible.";
  return <CampoDetalle titulo="Contenido">
    {cargando && <p role="status" className="text-slate-text">Cargando contenido completo…</p>}
    {error && <p role="alert" className="mb-2 text-sm text-red-700">{error}</p>}
    {!cargando && <div className="max-h-[38vh] overflow-y-auto whitespace-pre-wrap">{renderEnlaces(texto)}</div>}
  </CampoDetalle>;
}
