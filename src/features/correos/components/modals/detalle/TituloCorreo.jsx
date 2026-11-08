import CampoDetalle from "./CampoDetalle";

export default function TituloCorreo({ titulo }) {
  return <CampoDetalle titulo="Título"><span className="font-semibold">{titulo || "(Sin asunto)"}</span></CampoDetalle>;
}
