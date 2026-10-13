# Spec 003 — Mi Tarjeta Virtual (componente interactivo con flip 3D)

`Estado: implementada`

> Nota: spec simplificada el 2026-10-12 tras su implementación y corrección de
> hallazgos. El material retirado (detalles resueltos, redundancias y notas de
> contexto) se conserva en `todo.md` de esta misma carpeta.

## Propósito

Componente **"Mi Tarjeta Virtual"** en el panel derecho del dashboard (sección
"tarjetas"), con diseño realista de tarjeta bancaria (frente y dorso con CVV),
hover sutil solo en escritorio y flip 3D al hacer clic/tap, sobre fondo blanco
puro y con la paleta de tokens del proyecto.

## Alcance

En alcance:

1. Nuevo componente `MiTarjetaVirtual` en `src/components/`:
   - **Frente**: chip EMV, número en 4 grupos de 4, titular, expiración (MM/AA),
     logotipo FinApp, acento `mint-accent`.
   - **Reverso**: franja magnética, CVV (3 dígitos) destacado con texto
     "CÓDIGO DE SEGURIDAD", texto legal y logotipos de red.
   - **Prop `colorTema`** (azul/menta/morado) mapeada a tokens del tema.
   - **Hover solo escritorio**: elevación `translateY(-4px)` con sombra
     esmeralda; desactivado en táctil (`@media (hover: hover)`).
   - **Flip 3D accesible**: rotación Y 180°, 600ms,
     `cubic-bezier(0.22, 1, 0.36, 1)`, con Framer Motion; toggle por
     click/tap/Enter/Espacio.
   - **Props**: `titular`, `numero`, `expiracion`, `cvv`, `entidad`,
     `colorTema`, `className`, `onFlip` (callback opcional tras la animación).
   - **Accesibilidad**: `role="button"`, `tabIndex={0}`, `aria-label` dinámico,
     `aria-pressed`, foco visible, `prefers-reduced-motion` respetado.
2. Integración en `PanelTarjetas` como tarjeta principal destacada (primera, más
   grande, `max-w-xs` centrada) antes del grid de 3 tarjetas demo (spec 002).
3. Estilos solo con tokens existentes de `src/styles/index.css`; sin
   hexadecimales nuevos ni CSS nuevo.
4. Pruebas con Vitest + Testing Library y validación con `npm test` y
   `npm run build`.

Fuera de alcance: backend/persistencia, CRUD de tarjetas, autenticación real,
tokens o reglas nuevas en `index.css`, migración de hexadecimales heredados,
scroll-reveal.

## Decisiones del usuario

1. Ubicación: sección "tarjetas" del dashboard (`/dashboard/tarjetas`).
2. Estética: tarjeta bancaria realista sobre fondo blanco puro.
3. Paleta mapeada a tokens: `mint-accent`, `cat-expense`, `cat-other`,
   `cat-income`.
4. Hover solo escritorio; flip 3D accesible por teclado.
5. Flujo SDD completo (spec → plan → tasks → implementación → validación).

## Casos límite

- Acceso directo a `/dashboard/tarjetas` con `TRIAL_ACTIVO = true`: visible sin
  interacción.
- Móvil (< 640px): sin hover; flip por tap; tarjeta a ancho completo.
- `prefers-reduced-motion: reduce`: flip sin transición animada.
- Datos ficticios (demo); no corresponden a tarjetas reales.

## Requisitos funcionales (EARS)

- **RF1**. Cuando el usuario acceda a `/dashboard/tarjetas` durante el trial, el
  sistema deberá mostrar `MiTarjetaVirtual` como elemento principal destacado con
  los datos de demostración (colorTema "azul" por defecto).
- **RF2**. El sistema deberá renderizar el frente con chip, número
  (`font-mono`, `tabular-nums`), titular, expiración, logotipo y acento menta.
- **RF3**. El sistema deberá renderizar el reverso con franja magnética, CVV
  destacado, texto "CÓDIGO DE SEGURIDAD", legal y logotipos de red.
- **RF4**. En dispositivos con hover, al pasar el cursor el sistema deberá
  elevar la tarjeta (`translateY(-4px)`) con sombra esmeralda ampliada, y no en
  dispositivos táctiles.
- **RF5**. Al hacer click/tap o Enter/Espacio, el sistema deberá girar la
  tarjeta 180° en el eje Y (600ms, easing marca) alternando frente/reverso.
- **RF6**. El sistema deberá exponer `onFlip(volteada: boolean)` opcional,
  disparado una sola vez tras completar cada animación (sin duplicación en
  StrictMode).
- **RF7**. El sistema deberá usar únicamente tokens de `src/styles/index.css`
  para color y tipografía, con gradientes por `colorTema` mapeados a
  `cat-income` (azul), `emerald-primary/hover` (menta) y `cat-other` (morado);
  sin hexadecimales nuevos.
- **RF8**. El sistema deberá incluir pruebas de renderizado frente/reverso,
  flip por click y teclado, `onFlip`, props reflejadas en UI e integración en la
  ruta `/dashboard/tarjetas`.
- **RF9**. Con `prefers-reduced-motion`, el sistema deberá desactivar las
  animaciones de flip y hover.

## Criterios de aceptación

1. `/dashboard/tarjetas` muestra la tarjeta destacada con el frente visible y
   datos demo correctos (RF1–RF3); `npm test` y `npm run build` en verde (RF8).
2. Hover eleva la tarjeta solo en escritorio; flip 3D con click/tap/Enter/Espacio
   alterna frente y reverso (RF4–RF5); `onFlip` notifica el estado una vez por
   giro (RF6).
3. Sin hexadecimales nuevos; todo vía tokens (RF7); `prefers-reduced-motion`
   desactiva animaciones (RF9); foco visible, `aria-label` dinámico y
   `aria-pressed`.

## Nota sobre la tarjeta destacada

La spec 002 define el grid de 3 `glass-card` simples en `PanelTarjetas`; esta
spec lo enriquece añadiendo `MiTarjetaVirtual` antes, sin contradicción. La nota
"Datos de demostración" se mantiene bajo el grid. El componente no añade
superficies translúcidas `.glass-hero`: cumple los límites Fluid Glass.
