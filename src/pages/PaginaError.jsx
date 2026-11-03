/**
 * @uso        Página de error para rutas no encontradas o fallos de navegación
 * @funciones  PaginaError({ codigo = 404, titulo, descripcion, accion })
 * @datos      Texto configurable para mostrar el estado de error
 * @eventos    Botón de volver a la vista anterior o a la landing
 * @estados    N/A
 * @usadoPor   App.jsx (ruta catch-all)
 */
import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { Card } from "../components/ui/Card";

export default function PaginaError({
  codigo = 404,
  titulo = "No encontramos esta página",
  descripcion = "La dirección solicitada no existe o ya no está disponible.",
  accion = { texto: "Volver al inicio", destino: "/" },
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-bg-dark px-5 py-10 text-white">
      <Card className="w-full max-w-xl rounded-3xl border border-white/10 bg-[#111827]/80 p-8 shadow-2xl">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-300">
            <AlertTriangle className="h-7 w-7" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-300/80">
              Error {codigo}
            </p>
            <h1 className="mt-2 font-display text-3xl text-white">{titulo}</h1>
          </div>
        </div>

        <p className="text-base leading-7 text-slate-300">{descripcion}</p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to={accion.destino}
            className="inline-flex items-center justify-center rounded-full bg-emerald-primary px-5 py-3 text-sm font-semibold text-bg-dark transition hover:bg-emerald-400"
          >
            {accion.texto}
          </Link>

          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Volver atrás
          </button>
        </div>
      </Card>
    </main>
  );
}
