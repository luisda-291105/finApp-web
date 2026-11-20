/**
 * @uso        Configuración de la limpieza automática por categorías de una cuenta
 * @funciones  ConfiguracionPapelera({ configuracion, guardando, previsualizando, vistaPreviaInformativa, alGuardar, alPrevisualizar })
 * @datos      Categorías activas, antigüedad mínima, límite por ejecución y advertencia de Actualizaciones
 * @eventos    Activar/desactivar categorías, aceptar la advertencia, guardar y pedir la vista previa informativa
 * @estados    categoriasActivas, antiguedadMinimaDias, limitePorEjecucion, advertenciaAceptada y avisoAdvertencia locales
 * @usadoPor   PapeleraCorreosModal
 */
import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { CATEGORIAS_PAPELERA } from "../../../services/papeleraService";

/** Presenta la configuración de categorías, antigüedad y límite por ejecución de una cuenta. */
export default function ConfiguracionPapelera({
  configuracion = null,
  guardando = false,
  previsualizando = false,
  vistaPreviaInformativa = null,
  alGuardar,
  alPrevisualizar,
}) {
  const [categoriasActivas, setCategoriasActivas] = useState([]);
  const [antiguedadMinimaDias, setAntiguedadMinimaDias] = useState("7");
  const [limitePorEjecucion, setLimitePorEjecucion] = useState("200");
  const [advertenciaAceptada, setAdvertenciaAceptada] = useState(false);
  const [avisoAdvertencia, setAvisoAdvertencia] = useState(false);

  useEffect(() => {
    if (!configuracion) return;
    const categorias = configuracion.categorias || [];
    setCategoriasActivas(
      categorias.filter((categoria) => categoria.activa).map((c) => c.categoria),
    );
    setAntiguedadMinimaDias(String(configuracion.antiguedadMinimaDias ?? 7));
    setLimitePorEjecucion(String(configuracion.limitePorEjecucion ?? 200));
    setAdvertenciaAceptada(
      categorias.some((categoria) => categoria.advertenciaAceptada),
    );
  }, [configuracion]);

  const alternarCategoria = (categoria) => {
    if (categoriasActivas.includes(categoria)) {
      setCategoriasActivas((actuales) =>
        actuales.filter((actual) => actual !== categoria),
      );
      return;
    }
    if (categoria === "CATEGORY_UPDATES" && !advertenciaAceptada) {
      // RF-33: no se activa Actualizaciones sin aceptar antes la advertencia.
      setAvisoAdvertencia(true);
      return;
    }
    setCategoriasActivas((actuales) => [...actuales, categoria]);
  };

  const parametrosVistaPrevia = () => ({
    categorias: categoriasActivas,
    antiguedadMinimaDias: Number(antiguedadMinimaDias) || 0,
  });

  const guardar = () =>
    alGuardar?.({
      categoriasActivas,
      antiguedadMinimaDias: Number(antiguedadMinimaDias) || 0,
      limitePorEjecucion: Number(limitePorEjecucion) || 1,
      advertenciaAceptada,
    });

  return (
    <div className="space-y-3 rounded-2xl border border-border-line/50 bg-bg-cream/70 p-4">
      <h4 className="font-display text-sm font-semibold text-bg-dark">
        Movimiento automático por categorías
      </h4>
      <p className="text-xs text-slate-text">
        Todas las categorías están desactivadas por defecto. Activar una
        categoría solo afecta a los correos que lleguen desde ese momento.
      </p>

      <ul className="space-y-2">
        {CATEGORIAS_PAPELERA.map((categoria) => {
          const requiereAdvertencia = categoria.id === "CATEGORY_UPDATES";
          return (
            <li key={categoria.id} className="space-y-1">
              <label className="flex items-center gap-2 text-sm text-bg-dark">
                <input
                  type="checkbox"
                  checked={categoriasActivas.includes(categoria.id)}
                  onChange={() => alternarCategoria(categoria.id)}
                />
                {categoria.etiqueta}
              </label>
              {requiereAdvertencia && (
                <div className="ml-6 space-y-1">
                  <p className="text-xs text-amber-800">
                    Puede contener recibos y alertas bancarias. FinApp excluye
                    remitentes bancarios, recibos y alertas financieras, pero
                    revísalo antes de activarla.
                  </p>
                  <label className="flex items-center gap-2 text-xs text-amber-900">
                    <input
                      type="checkbox"
                      checked={advertenciaAceptada}
                      onChange={(evento) => {
                        setAdvertenciaAceptada(evento.target.checked);
                        if (evento.target.checked) setAvisoAdvertencia(false);
                      }}
                    />
                    Acepto la advertencia de Actualizaciones
                  </label>
                  {avisoAdvertencia && (
                    <p
                      role="alert"
                      className="text-xs font-medium text-red-700"
                    >
                      Acepta la advertencia de Actualizaciones antes de
                      activarla.
                    </p>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <div className="flex flex-wrap gap-4">
        <label className="text-xs text-slate-text">
          Antigüedad mínima (días)
          <input
            type="number"
            min="0"
            value={antiguedadMinimaDias}
            onChange={(evento) => setAntiguedadMinimaDias(evento.target.value)}
            className="ml-2 w-20 rounded-lg border border-border-line bg-bg-cream px-2 py-1 text-sm text-bg-dark"
          />
        </label>
        <label className="text-xs text-slate-text">
          Límite por ejecución
          <input
            type="number"
            min="1"
            value={limitePorEjecucion}
            onChange={(evento) => setLimitePorEjecucion(evento.target.value)}
            className="ml-2 w-24 rounded-lg border border-border-line bg-bg-cream px-2 py-1 text-sm text-bg-dark"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={guardar}
          disabled={guardando}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-emerald-primary px-4 py-2 text-sm font-medium text-bg-cream transition-colors hover:bg-emerald-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save className="h-4 w-4" aria-hidden="true" />
          {guardando ? "Guardando..." : "Guardar configuración"}
        </button>
        <button
          type="button"
          onClick={() => alPrevisualizar?.(parametrosVistaPrevia())}
          disabled={previsualizando || categoriasActivas.length === 0}
          className="inline-flex min-h-10 items-center justify-center rounded-lg border border-border-line bg-bg-cream px-4 py-2 text-sm font-medium text-bg-dark transition-colors hover:border-emerald-primary/50 hover:text-emerald-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {previsualizando ? "Calculando..." : "Ver cuántos se moverían"}
        </button>
      </div>

      {vistaPreviaInformativa && (
        <p role="status" className="text-xs text-sky-900">
          Se moverían {vistaPreviaInformativa.totalEstimado} correo(s) ya
          recibidos en una limpieza posterior. Es informativo: activar una
          categoría no los mueve.
        </p>
      )}
    </div>
  );
}
