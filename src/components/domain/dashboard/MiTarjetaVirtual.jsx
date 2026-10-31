/**
 * @uso        Muestra una tarjeta registrada con flip 3D en su detalle
 * @funciones  MiTarjetaVirtual({ titular, numero, expiracion, cvv, entidad })
 * @datos      Recibe datos de tarjeta; el detalle registrado no proporciona CVV
 * @eventos    Click, Enter o Espacio alternan entre frente y reverso
 * @estados    volteada (boolean); reducirMovimiento (preferencia del sistema)
 * @usadoPor   ModalTarjeta
 */
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export default function MiTarjetaVirtual({ titular, numero, expiracion, cvv = "", entidad, className = "" }) {
  const [volteada, setVolteada] = useState(false);
  const reducirMovimiento = useReducedMotion();

  const transitionConfig = reducirMovimiento
    ? { duration: 0 }
    : { duration: 0.6, ease: [0.22, 1, 0.36, 1] };

  const hoverConfig = reducirMovimiento
    ? {}
    : {
        translateY: -4,
        boxShadow: "0 20px 40px -10px rgba(26, 122, 94, 0.15), 0 8px 16px -4px rgba(15, 17, 23, 0.08)",
        transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
      };

  const alternarGiro = () => setVolteada((actual) => !actual);
  const manejarTeclado = (evento) => {
    if (evento.key === "Enter" || evento.key === " ") {
      evento.preventDefault();
      alternarGiro();
    }
  };

  return (
    <div className={className} style={{ perspective: "1000px" }} role="region" aria-label="Tarjeta virtual interactiva">
      <motion.div
        role="button"
        tabIndex={0}
        aria-pressed={volteada}
        aria-label={volteada ? "Ver frente de la tarjeta virtual" : "Ver reverso de la tarjeta virtual"}
        onClick={alternarGiro}
        onKeyDown={manejarTeclado}
        className="group relative mx-auto aspect-[8/5] w-full max-w-xs cursor-pointer glass-card"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: volteada ? 180 : 0 }}
        transition={transitionConfig}
        whileHover={hoverConfig}
        whileTap={reducirMovimiento ? undefined : { scale: 0.99 }}
      >
        {/* tarjeta virtual frente */}
        <div className="absolute inset-0 rounded-[inherit] overflow-hidden" style={{ backfaceVisibility: "hidden" }} aria-hidden={volteada} data-testid="tarjeta-frente">
          <div className="relative h-full min-h-[200px] from-cat-income via-cat-income/85 to-cat-income/70 text-black p-6 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="flex h-7 w-10 items-center justify-center rounded-lg bg-slate-300 p-2.5" aria-hidden="true" data-testid="chip-emv">
                <svg className="w-5 h-5 text-current" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <rect x="2" y="2" width="20" height="20" rx="2" />
                  <path d="M2 8h20M8 2v20" />
                </svg>
              </div>
              <span className="font-display text-xl font-semibold tracking-wide">{entidad}</span>
            </div>

            <div className="mt-8 font-mono text-xl tracking-widest tabular-nums" aria-label={`Número de tarjeta ${numero.replace(/\s/g, "")}`}>
              {numero}
            </div>

            <div className="flex items-end justify-between pt-4">
              <div>
                <p className="text-xs uppercase tracking-wider opacity-70">TITULAR</p>
                <p className="font-display text-lg font-medium">{titular}</p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-wider opacity-70">EXPIRA</p>
                <p className="font-mono text-base font-medium">{expiracion}</p>
              </div>
            </div>

            <div className="absolute bottom-4 right-4 w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center" aria-hidden="true" data-testid="acento-mint">
              <svg className="w-6 h-6 text-mint-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
          </div>
        </div>
        {/* tarjeta virtual reverso */}
        <div className="absolute inset-0 rounded-[inherit] overflow-hidden" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }} aria-hidden={!volteada}>
          <div className="relative h-full min-h-[200px] bg-slate-100 flex flex-col">
            <div className="h-14 bg-slate-800/90 relative" aria-hidden="true">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
            </div>

            <div className="flex-1 p-6 flex flex-col justify-end">
              <div className="flex items-end justify-between w-full">
                <div className="bg-white rounded-lg p-3 min-w-[80px] border border-border-line">
                  <p className="text-xs text-slate-text uppercase tracking-wider">CVV</p>
                  <p className="font-mono text-lg font-semibold text-bg-dark tabular-nums" aria-label={`Código de seguridad ${cvv}`}>{cvv}</p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-xs text-slate-text uppercase tracking-wider">CÓDIGO DE SEGURIDAD</p>
                  <p className="text-xs text-slate-text">Los 3 dígitos al reverso</p>
                </div>
              </div>

              <div className="mt-6 pt-2 border-t border-border-line">
                <p className="text-xs text-slate-text leading-relaxed">
                  Tarjeta virtual emitida por {entidad}. Úsela para compras en línea seguras.
                  No comparta el CVV. Contacto: soporte@finapp.com
                </p>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span className="font-display text-sm font-medium text-slate-text">{entidad}</span>
                <div className="flex items-center gap-2" aria-label="Redes de pago">
                  <svg className="w-5 h-5 text-slate-text" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <rect x="2" y="2" width="20" height="20" rx="2" />
                    <path d="M2 8h20M8 2v20" />
                  </svg>
                  <svg className="w-5 h-5 text-slate-text" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M8 12l2 2 4-4" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true">
          <motion.div
            className="opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 bg-bg-dark/80 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2"
            animate={reducirMovimiento ? {} : { y: [0, -4, 0] }}
            transition={reducirMovimiento ? {} : { duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            initial={false}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M23 4v16M1 20V4M1 4h22M1 20h22" />
            </svg>
            Toca para ver reverso
          </motion.div>
        </div>
      </motion.div>

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {volteada ? "Mostrando reverso de la tarjeta" : "Mostrando frente de la tarjeta virtual"}
      </div>
    </div>
  );
}
