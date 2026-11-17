/**
 * @uso        Barra de herramientas del navegador de archivos (búsqueda, vista, crear y subir)
 * @funciones  AlmacenamientoToolbar({ busqueda, alCambiarBusqueda, modoVista, alCambiarModoVista, subiendo, progreso, alCrearCarpeta, alSubirArchivos, deshabilitado })
 * @datos      Estado local del menú «+ Nuevo» y del aviso de vista móvil; recibe acciones del gestor de archivos
 * @eventos    Cambio de búsqueda, cambio de modo de vista, crear carpeta, subir archivos, cerrar menú
 * @estados    menuNuevoAbierto, avisoVista (en móvil, la vista queda forzada a lista y al intentarlo se muestra un aviso temporal)
 * @usadoPor   AlmacenamientoPage
 */
import { useEffect, useRef, useState } from "react";
import { LayoutGrid, List, Plus, Search, Upload } from "lucide-react";
import { useBreakpoint } from "../../../../hooks/useBreakpoint";
import AlertaVistaMovil from "../alert/AlertaVistaMovil";

export default function AlmacenamientoToolbar({
  busqueda = "",
  alCambiarBusqueda,
  vista,
  alCambiarVista,
  modoVista,
  alCambiarModoVista,
  subiendo = false,
  progreso = 0,
  alCrearCarpeta,
  alSubirArchivos,
  deshabilitado = false,
}) {
  const inputRef = useRef(null);
  const gridRef = useRef(null);
  const listaRef = useRef(null);
  const [menuNuevoAbierto, setMenuNuevoAbierto] = useState(false);
  const [avisoVista, setAvisoVista] = useState("");
  const { isMobile } = useBreakpoint();
  const modo = modoVista || (vista === "lista" || vista === "grid" ? vista : "grid");
  const cambiarModo = alCambiarModoVista || alCambiarVista || (() => {});
  // En móvil el listado queda forzado a «lista»; el interruptor refleja ese estado
  // y el foco pasa al botón de lista (control activo) al cruzar a móvil.
  const modoEfectivo = isMobile ? "lista" : modo;

  useEffect(() => {
    if (!isMobile) return;
    if (document.activeElement === gridRef.current) listaRef.current?.focus();
  }, [isMobile]);

  const manejarSubida = (evento) => {
    const archivos = Array.from(evento.target.files || []);
    alSubirArchivos?.(archivos);
    evento.target.value = "";
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-text" aria-hidden="true" />
          <input
            type="search"
            value={busqueda}
            onChange={(evento) => alCambiarBusqueda?.(evento.target.value)}
            placeholder="Buscar"
            aria-label="Buscar en tu unidad"
            disabled={deshabilitado}
            className="w-full min-h-11 rounded-xl border border-border-line/60 bg-bg-cream/70 pl-10 pr-3 text-sm text-bg-dark placeholder:text-slate-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-accent disabled:opacity-50"
          />
        </div>
        <div className="inline-flex items-center gap-1 rounded-xl border border-border-line/60 bg-bg-cream/70 p-1">
          <button ref={gridRef} type="button" onClick={() => { if (isMobile) { setAvisoVista("En móvil solo está disponible la vista de lista."); return; } cambiarModo("grid"); }} aria-pressed={modoEfectivo === "grid"} aria-label="Vista de cuadrícula" disabled={deshabilitado} className={`inline-flex min-h-9 items-center rounded-lg px-2.5 ${modoEfectivo === "grid" ? "bg-emerald-primary text-white" : "text-slate-text hover:bg-emerald-primary/5"} disabled:opacity-50`}>
            <LayoutGrid className="h-4 w-4" aria-hidden="true" />
          </button>
          <button ref={listaRef} type="button" onClick={() => cambiarModo("lista")} aria-pressed={modoEfectivo === "lista"} aria-label="Vista de lista" disabled={deshabilitado} className={`inline-flex min-h-9 items-center rounded-lg px-2.5 ${modoEfectivo === "lista" ? "bg-emerald-primary text-white" : "text-slate-text hover:bg-emerald-primary/5"} disabled:opacity-50`}>
            <List className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <div className="relative">
          <button type="button" onClick={() => setMenuNuevoAbierto((abierto) => !abierto)} disabled={deshabilitado} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-accent disabled:opacity-50">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Nuevo
          </button>
          {menuNuevoAbierto && (
            <>
              <button type="button" aria-label="Cerrar menú Nuevo" className="fixed inset-0 z-[1110]" onClick={() => setMenuNuevoAbierto(false)} />
              <div role="menu" className="absolute right-0 z-[1111] mt-2 w-56 rounded-2xl border border-border-line/60 bg-bg-cream p-2 shadow-xl">
                <button type="button" role="menuitem" onClick={() => { setMenuNuevoAbierto(false); alCrearCarpeta?.(); }} className="block w-full rounded-xl px-3 py-2 text-left text-sm text-bg-dark hover:bg-emerald-primary/5">Nueva carpeta</button>
                <button type="button" role="menuitem" onClick={() => { setMenuNuevoAbierto(false); inputRef.current?.click(); }} className="block w-full rounded-xl px-3 py-2 text-left text-sm text-bg-dark hover:bg-emerald-primary/5">Subir archivo</button>
              </div>
            </>
          )}
        </div>
        <button type="button" onClick={() => inputRef.current?.click()} disabled={deshabilitado} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border-line/60 bg-bg-cream/70 px-4 py-2.5 text-sm font-medium text-bg-dark transition-colors hover:bg-emerald-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-accent disabled:opacity-50">
          <Upload className="h-4 w-4 text-emerald-primary" aria-hidden="true" />
          Subir
        </button>
        <input ref={inputRef} type="file" multiple className="hidden" onChange={manejarSubida} aria-hidden="true" tabIndex={-1} />
      </div>
      <AlertaVistaMovil mensaje={avisoVista} alCerrar={() => setAvisoVista("")} />
      {subiendo && (
        <div className="rounded-xl border border-border-line/60 bg-bg-cream/70 p-3" role="status" aria-live="polite">
          <div className="flex items-center justify-between gap-3 text-sm text-bg-dark">
            <span>Subiendo archivos…</span>
            <span>{Math.round(progreso)}%</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-emerald-primary/15">
            <div className="h-full rounded-full bg-emerald-primary transition-all" style={{ width: `${progreso}%` }} />
          </div>
        </div>
      )}
    </div>
  );
}
