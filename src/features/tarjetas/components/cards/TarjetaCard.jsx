/**
 * @uso        Tarjeta visual seleccionable del listado
 * @funciones  TarjetaCard({ tarjeta, alAbrir })
 * @datos      Presenta datos visibles y enmascara siempre el número
 * @eventos    Click para abrir detalle
 * @estados    Ninguno
 * @usadoPor   TarjetasPage
 */
import { motion, useReducedMotion } from "framer-motion";

function enmascararNumero(numero) {
  const digitos = String(numero || "").replace(/\s/g, "");
  return `•••• ${digitos.slice(-4) || "••••"}`;
}

/** Muestra únicamente información permitida de la tarjeta. */
export default function TarjetaCard({ tarjeta, alAbrir }) {
  const reducirMovimiento = useReducedMotion();
  return (
    <motion.button type="button" onClick={alAbrir} aria-label={`Ver tarjeta de ${tarjeta.titular || "Titular"}`} className="flex min-h-44 w-full flex-col justify-between rounded-2xl border border-border-line bg-transparent p-5 text-left text-bg-dark shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-accent" whileHover={reducirMovimiento ? undefined : { y: -4 }} whileTap={reducirMovimiento ? undefined : { scale: 0.99 }} transition={reducirMovimiento ? { duration: 0 } : { duration: 0.25, ease: [0.22, 1, 0.36, 1] }}>
      <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-xs font-medium uppercase tracking-wider text-bg-dark/70">{tarjeta.entidad || "Tarjeta"}</p><h3 className="mt-1 truncate font-display text-lg font-semibold">{tarjeta.titular || "Titular"}</h3></div><span aria-hidden="true" className="rounded-md border border-border-line px-2 py-1 text-[10px] font-semibold uppercase">FinApp</span></div>
      <div><p className="font-mono text-lg tracking-widest" aria-label="Número de tarjeta enmascarado">{enmascararNumero(tarjeta.numero)}</p><p className="mt-2 text-xs text-bg-dark/80">Vence {tarjeta.expiracion || "Sin fecha"}</p></div>
    </motion.button>
  );
}
