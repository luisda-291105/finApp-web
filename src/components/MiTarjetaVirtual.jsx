/**
 * @uso        Tarjeta virtual interactiva con animación flip 3D para la sección "tarjetas" del dashboard
 * @funciones  MiTarjetaVirtual()
 * @datos      Recibe datos de la tarjeta: titular, número, expiración, CVV, entidad, colorTema
 * @eventos    onFlip (opcional) - se dispara al completar la animación de giro
 * @estados    volteada (boolean) - indica si se muestra el reverso
 * @usadoPor   PanelTarjetas
 */
import { useState, useCallback, useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * MiTarjetaVirtual
 * Componente de tarjeta bancaria virtual con:
 * - Frente: chip EMV, número de tarjeta (16 dígitos), nombre del titular, expiración (MM/AA), logotipo de la entidad, acento visual en verde menta
 * - Reverso: franja magnética, código de seguridad CVV (3 dígitos), texto legal, logotipos de red
 * - Hover (solo escritorio): elevación sutil con sombra teñida de esmeralda
 * - Click/tap/teclado: animación flip 3D suave (600ms, easing marca)
 * - Variaciones de color via tokens: azul (default), menta, morado
 * - Accesibilidad completa: role=button, tabindex, aria-label dinámico, aria-pressed, foco visible, prefers-reduced-motion
 */
export default function MiTarjetaVirtual({
  titular = "MARÍA GARCÍA",
  numero = "4242 4242 4242 4242",
  expiracion = "12/28",
  cvv = "847",
  entidad = "FinApp",
  colorTema = "azul", // 'azul' | 'menta' | 'morado'
  className = "",
  onFlip,
}) {
  const [volteada, setVolteada] = useState(false);
  const reducirMovimiento = useReducedMotion();

  const manejarClick = useCallback(() => {
    setVolteada((prev) => !prev);
  }, []);

  // Disparar onFlip tras la animación (600ms) solo cuando `volteada` cambia de
  // verdad (prev !== actual). La guardia por valor evita que el doble setup de
  // StrictMode en el montaje dispare un onFlip espurio.
  const anteriorVolteada = useRef(volteada);
  useEffect(() => {
    if (anteriorVolteada.current === volteada) return undefined;
    anteriorVolteada.current = volteada;
    if (!onFlip) return undefined;
    const temporizador = setTimeout(() => onFlip(volteada), 600);
    return () => clearTimeout(temporizador);
  }, [volteada, onFlip]);

  const manejarTeclado = useCallback(
    (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        manejarClick();
      }
    },
    [manejarClick]
  );

  // Tokens de color por tema (clases Tailwind sobre tokens @theme de index.css;
  // las variantes con opacidad mantienen legible el gradiente de cada token único)
  const temas = {
    azul: {
      gradiente: "from-cat-income via-cat-income/85 to-cat-income/70",
      chip: "bg-slate-300",
      texto: "text-white",
      acento: "text-mint-accent",
    },
    menta: {
      gradiente: "from-emerald-primary via-emerald-hover to-emerald-primary/80",
      chip: "bg-emerald-primary/30",
      texto: "text-white",
      acento: "text-emerald-primary",
    },
    morado: {
      gradiente: "from-cat-other via-cat-other/85 to-cat-other/70",
      chip: "bg-purple-200",
      texto: "text-white",
      acento: "text-cat-other",
    },
  };

  const tema = temas[colorTema] || temas.azul;

  // Configuración de transición respetando prefers-reduced-motion
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

  return (
    <div className={className} style={{ perspective: "1000px" }} role="region" aria-label="Tarjeta virtual interactiva">
      <motion.div
        role="button"
        tabIndex={0}
        aria-label={volteada ? "Ver frente de la tarjeta virtual" : "Ver reverso de la tarjeta virtual (CVV)"}
        aria-pressed={volteada}
        onClick={manejarClick}
        onKeyDown={manejarTeclado}
        className="group relative w-full max-w-xs mx-auto aspect-[8/5] cursor-pointer glass-card"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: volteada ? 180 : 0 }}
        transition={transitionConfig}
        whileHover={hoverConfig}
        whileTap={{ scale: 0.99 }}
        // Framer Motion respeta automáticamente (hover: hover) para whileHover
      >
        {/* FRENTE DE LA TARJETA */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden" style={{ backfaceVisibility: "hidden" }} aria-hidden={volteada} data-testid="tarjeta-frente">
          <div className={`relative h-full min-h-[200px] ${tema.gradiente} ${tema.texto} p-6 flex flex-col justify-between`}>
            {/* Chip y logo entidad */}
            <div className="flex items-start justify-between">
              <div className={`${tema.chip} rounded-lg p-2.5 w-10 h-7 flex items-center justify-center`} aria-hidden="true" data-testid="chip-emv">
                <svg className="w-5 h-5 text-current" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <rect x="2" y="2" width="20" height="20" rx="2" />
                  <path d="M2 8h20M8 2v20" />
                </svg>
              </div>
              <span className="font-display text-xl font-semibold tracking-wide">{entidad}</span>
            </div>

            {/* Número de tarjeta */}
            <div className="mt-8 font-mono text-xl tracking-widest tabular-nums" aria-label={`Número de tarjeta ${numero.replace(/\s/g, "")}`}>
              {numero}
            </div>

            {/* Titular y expiración */}
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

            {/* Acento mint en esquina inferior */}
            <div className="absolute bottom-4 right-4 w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center" aria-hidden="true" data-testid="acento-mint">
              <svg className="w-6 h-6 text-mint-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
          </div>
        </div>

        {/* REVERSO DE LA TARJETA */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }} aria-hidden={!volteada}>
          <div className="relative h-full min-h-[200px] bg-slate-100 flex flex-col">
            {/* Franja magnética */}
            <div className="h-14 bg-slate-800/90 relative" aria-hidden="true">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
            </div>

            {/* Área CVV y datos */}
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

              {/* Texto legal / entidad */}
              <div className="mt-6 pt-4 border-t border-border-line">
                <p className="text-xs text-slate-text leading-relaxed">
                  Tarjeta virtual emitida por {entidad}. Úsela para compras en línea seguras.
                  No comparta el CVV. Contacto: soporte@finapp.com
                </p>
              </div>

              {/* Logo entidad en reverso */}
              <div className="mt-4 flex items-center justify-between">
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

        {/* Indicador visual "Toca para girar" - solo en hover/focus escritorio
            (la clase `group` está en el motion.div para que group-hover funcione) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
          <motion.div
            className="opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 bg-bg-dark/80 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2"
            animate={reducirMovimiento ? {} : { y: [0, -4, 0] }}
            transition={reducirMovimiento ? {} : { duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            initial={false}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M23 4v16M1 20V4M1 4h22M1 20h22" />
            </svg>
            Toca para ver CVV
          </motion.div>
        </div>
      </motion.div>

      {/* Etiqueta de estado para lectores de pantalla */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {volteada ? "Mostrando reverso de la tarjeta con CVV" : "Mostrando frente de la tarjeta virtual"}
      </div>
    </div>
  );
}