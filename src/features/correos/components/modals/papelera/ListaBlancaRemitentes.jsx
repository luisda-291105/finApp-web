/**
 * @uso        Lista blanca de remitentes que nunca se mueven por la regla automática
 * @funciones  ListaBlancaRemitentes({ remitentes, cargando, agregando, eliminandoId, alAgregar, alEliminar })
 * @datos      Remitentes exentos con su identificador
 * @eventos    Añadir un remitente y quitar uno existente
 * @estados    remitente (texto del formulario) local
 * @usadoPor   PapeleraCorreosModal
 */
import { useState } from "react";
import { Plus, X } from "lucide-react";

/** Presenta y permite gestionar la lista blanca de remitentes de una cuenta. */
export default function ListaBlancaRemitentes({
  remitentes = [],
  cargando = false,
  agregando = false,
  eliminandoId = null,
  alAgregar,
  alEliminar,
}) {
  const [remitente, setRemitente] = useState("");

  const enviar = (evento) => {
    evento.preventDefault();
    const valor = remitente.trim();
    if (!valor) return;
    alAgregar?.(valor);
    setRemitente("");
  };

  return (
    <div className="space-y-3 rounded-2xl border border-border-line/50 bg-bg-cream/70 p-4">
      <h4 className="font-display text-sm font-semibold text-bg-dark">
        Lista blanca de remitentes
      </h4>
      <p className="text-xs text-slate-text">
        Estos remitentes nunca se mueven por la regla automática ni por la
        limpieza.
      </p>

      <form onSubmit={enviar} className="flex flex-wrap items-end gap-2">
        <label className="text-xs text-slate-text">
          Añadir remitente
          <input
            type="email"
            value={remitente}
            onChange={(evento) => setRemitente(evento.target.value)}
            placeholder="correo@ejemplo.com"
            className="ml-2 w-56 rounded-lg border border-border-line bg-bg-cream px-2 py-1 text-sm text-bg-dark"
          />
        </label>
        <button
          type="submit"
          disabled={agregando || !remitente.trim()}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-border-line bg-bg-cream px-4 py-2 text-sm font-medium text-bg-dark transition-colors hover:border-emerald-primary/50 hover:text-emerald-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          {agregando ? "Añadiendo..." : "Añadir"}
        </button>
      </form>

      {cargando ? (
        <p role="status" className="text-xs text-slate-text">
          Cargando la lista blanca...
        </p>
      ) : remitentes.length === 0 ? (
        <p className="text-xs text-slate-text">
          No hay remitentes en la lista blanca.
        </p>
      ) : (
        <ul className="space-y-1">
          {remitentes.map((entrada) => (
            <li
              key={entrada.id}
              className="flex items-center justify-between gap-2 text-sm text-bg-dark"
            >
              <span>{entrada.remitente}</span>
              <button
                type="button"
                aria-label={`Quitar ${entrada.remitente}`}
                disabled={String(eliminandoId) === String(entrada.id)}
                onClick={() => alEliminar?.(entrada.id)}
                className="inline-flex min-h-9 items-center justify-center gap-1 rounded-lg border border-border-line bg-bg-cream px-3 py-1.5 text-xs font-medium text-bg-dark transition-colors hover:border-red-300 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
                {String(eliminandoId) === String(entrada.id)
                  ? "Quitando..."
                  : "Quitar"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
