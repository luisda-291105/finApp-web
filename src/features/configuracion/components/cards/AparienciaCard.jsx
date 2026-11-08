import { Card } from "../../../../components/ui/Card";
import { Moon, Sun } from "lucide-react";

export default function AparienciaCard({ tema, alternarTema }) {
  const oscuro = tema === "oscuro";
  return (
    <Card className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="font-display text-lg font-semibold text-bg-dark">Apariencia</h2>
        <p className="text-sm text-slate-text">Elige el tema claro u oscuro para FinApp.</p>
      </div>
      <button type="button" role="switch" aria-checked={oscuro} aria-label="Modo oscuro" onClick={alternarTema} className="inline-flex min-h-11 items-center gap-3 self-start rounded-full border border-border-line px-4 py-2 text-sm font-medium text-bg-dark transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary sm:self-auto">
        {oscuro ? <Moon className="h-4 w-4" aria-hidden="true" /> : <Sun className="h-4 w-4" aria-hidden="true" />}
        <span>{oscuro ? "Modo oscuro" : "Modo claro"}</span>
        <span aria-hidden="true" className={`relative h-6 w-11 rounded-full transition-colors ${oscuro ? "bg-emerald-primary" : "bg-slate-text/30"}`}>
          <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${oscuro ? "translate-x-6" : "translate-x-1"}`} />
        </span>
      </button>
    </Card>
  );
}
