# Tasks 003 — Mi Tarjeta Virtual (componente interactivo con flip 3D)

## 1. Crear `src/components/MiTarjetaVirtual.jsx` (RF1–RF3, RF5–RF7, RF9)
- Componente con header JSDoc según `.agents/file-header-template.md`.
- Props: `titular`, `numero`, `expiracion`, `cvv`, `entidad`, `colorTema` ('azul'|'menta'|'morado'), `className`, `onFlip`.
- Estado interno `volteada` (boolean).
- Framer Motion: `motion.div` con `role="button"`, `tabIndex={0}`, `aria-label` dinámico, `aria-pressed={volteada}`, `onClick`, `onKeyDown` (Enter/Espacio), `whileHover` (elevación + sombra esmeralda, solo hover nativo), `whileTap` (scale 0.99), `animate={{ rotateY: volteada ? 180 : 0 }}`, `transition` (duration 0.6, ease `[0.22, 1, 0.36, 1]`), `useReducedMotion()`.
- Cara frente: contenedor `backface-hidden` con gradiente según `colorTema` (clases Tailwind `from-blue-600 via-blue-700 to-blue-800` / `from-emerald-primary via-emerald-hover to-teal-700` / `from-purple-600 via-purple-700 to-violet-800`), chip SVG, número `font-mono tabular-nums`, titular (label + `font-display`), expiración (label + `font-mono`), entidad `font-display`, acento mint SVG en esquina.
- Cara reverso: `backface-hidden` + `rotateY(180deg)`, franja magnética (`bg-slate-800/90`), área CVV (`bg-white rounded-lg p-3`), label "CVV" + valor `font-mono tabular-nums`, texto "CÓDIGO DE SEGURIDAD", texto legal, logotipos (chip + check SVG).
- Contenedor padre: `perspective-1000`, `transform-style: preserve-3d`.
- Indicador visual "Toca para ver CVV" (opacity 0 → 100 en hover/focus, animado con Framer Motion).
- **Hecho cuando**: componente renderiza frente por defecto, flip funciona por click y teclado, props de datos se reflejan en UI, `colorTema` aplica gradiente correcto, `onFlip` callback disparado tras 600ms, sin hex en JSX, `prefers-reduced-motion` respetado.

## 2. Añadir pruebas unitarias `src/components/MiTarjetaVirtual.test.jsx` (RF8)
- `describe("MiTarjetaVirtual")` con tests:
  - Renderiza frente con todos los campos (titular, número, expiración, chip, entidad, acento mint).
  - Click invierte estado y muestra reverso (CVV, franja, texto legal).
  - Teclado Enter/Espacio dispara flip.
  - Callback `onFlip` recibe `true` tras flip a reverso y `false` al volver a frente.
  - Prop `colorTema="menta"` / `"morado"` aplica gradiente correspondiente (verificar clase en contenedor).
  - `prefers-reduced-motion` (mock `matchMedia`) desactiva animaciones (verificar `transition: none` o instantáneo).
  - Accesibilidad: `role="button"`, `tabIndex={0}`, `aria-label` dinámico ("Ver reverso..." / "Ver frente..."), `aria-pressed` coincide con estado, foco visible (`.glass-card:focus-visible` anillo).
- **Hecho cuando**: `npx vitest run src/components/MiTarjetaVirtual.test.jsx` pasa.

## 3. Integrar `MiTarjetaVirtual` en `PanelTarjetas` (RF1)
- En `src/components/PanelTarjetas.jsx`: importar `MiTarjetaVirtual`.
- Renderizar como primera sección destacada:
  ```jsx
  <section aria-labelledby="mi-tarjeta-virtual-titulo" className="reveal">
    <h2 id="mi-tarjeta-virtual-titulo" className="sr-only">Mi Tarjeta Virtual</h2>
    <MiTarjetaVirtual
      titular="MARÍA GARCÍA"
      numero="4242 4242 4242 4242"
      expiracion="12/28"
      cvv="847"
      entidad="FinApp"
      colorTema="azul"
    />
  </section>
  ```
- Mantener grid de 3 tarjetas demo (spec 002) como sección "Tus otras tarjetas" con `reveal-stagger` y `--i` index.
- Conservar nota "Datos de demostración" al final.
- **Hecho cuando**: `/dashboard/tarjetas` muestra tarjeta virtual principal + grid 3 tarjetas + nota; sin regresiones visuales.

## 4. Ampliar pruebas de ruta en `src/App.test.jsx` (RF8)
- Añadir casos en `describe("rutas de la aplicación")` usando helper `renderRuta` existente:
  - `/dashboard/tarjetas`: verifica presencia de `MiTarjetaVirtual` (textos "MARÍA GARCÍA", "4242 4242 4242 4242", "12/28", "FinApp"), grid 3 tarjetas demo (nombres, últimos 4, saldos), nota "Datos de demostración", y **ausencia** del placeholder "Administra tus tarjetas y revisa sus saldos.".
  - `/dashboard` (inicio): conserva sus 3 cifras (Balance disponible, Ingresos del mes, Gastos del mes).
  - `/dashboard/transacciones`: muestra "Consulta y organiza tus movimientos recientes.".
  - `/dashboard/configuracion`: muestra "Ajusta tus preferencias de cuenta y seguridad.".
- **Hecho cuando**: `npx vitest run src/App.test.jsx` pasa.

## 5. Suite completa y build (RF8)
- Ejecutar `npm test` (todas las pruebas existentes sin regresiones).
- Ejecutar `npm run build`.
- **Hecho cuando**: ambos comandos pasan en verde y se reportan como ejecutados.

## 6. Revisión visual Fluid Glass (RF7)
- En navegador, escritorio (1440px) y móvil (375px):
  - Tarjeta principal: frente visible, flip 3D suave (600ms), reverso con CVV legible.
  - Hover escritorio: elevación -4px + sombra esmeralda; móvil: sin hover.
  - Grid secundario: 1 columna móvil, 3 columnas escritorio.
  - Contraste: blanco sobre gradientes (frente), texto oscuro sobre blanco (reverso), acento mint visible.
  - Límites Fluid Glass: máx 3 superficies translúcidas / 2 blobs — verificar que no se añaden (tarjeta usa `glass-card` blanca + gradiente interno).
- Si no hay navegador disponible: registrar explícitamente como "no realizada".
- **Hecho cuando**: revisión registrada como pass/fail/no realizada.

## 7. Commit y actualización `MEMORY.md` (RF1–RF9)
- Commit limitado a:
  - `src/components/MiTarjetaVirtual.jsx`
  - `src/components/MiTarjetaVirtual.test.jsx`
  - `src/components/PanelTarjetas.jsx`
  - `src/App.test.jsx`
- Mensaje: "añade MiTarjetaVirtual con flip 3D al panel de tarjetas"
- `MEMORY.md`: estado del componente (RFs cubiertos), decisión de Framer Motion para interacciones, gradientes via tokens, integración en PanelTarjetas, validaciones ejecutadas y pendientes; sin datos sensibles.
- **Hecho cuando**: commit contiene solo archivos del cambio y `MEMORY.md` refleja estado y decisiones de la spec 003.