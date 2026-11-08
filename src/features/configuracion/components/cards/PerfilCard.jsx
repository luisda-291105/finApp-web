import { Card } from "../../../../components/ui/Card";

export default function PerfilCard({ usuario, triggerRef, alAbrir }) {
  return (
    <Card className="space-y-3 p-6">
      <div>
        <h2 className="font-display text-lg font-semibold text-bg-dark">Perfil</h2>
        <p className="text-sm text-slate-text">Ver y editar información básica de tu usuario.</p>
        {usuario && <p className="mt-1 text-xs text-emerald-primary">Usuario activo: {usuario.nombre} ({usuario.idUsuario})</p>}
      </div>
      <button ref={triggerRef} type="button" onClick={alAbrir} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-primary hover:bg-emerald-hover text-bg-cream text-sm font-medium shadow-md transition-all cursor-pointer hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-accent">
        Ver perfil
      </button>
    </Card>
  );
}
