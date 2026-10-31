# Tasks 002 — Bloque de tarjetas en la sección "tarjetas"

1. **Crear `src/components/PanelTarjetas.jsx` con el grid demo** (RF2, RF3,
   RF5)
   - Componente puro con header JSDoc; constante `tarjetasDemo` con 3 tarjetas
     (Tarjeta Oro •••• 4242 — $2,340.00; Tarjeta Platino •••• 5300 — $980.25;
     Débito Nómina •••• 7841 — $5,120.75); grid `grid gap-4 sm:grid-cols-3`;
     cada tarjeta `article.glass-card.p-5` con nombre y "•••• XXXX" en
     `text-sm text-slate-text` y saldo en `mt-3 text-2xl font-semibold
     text-bg-dark`.
   - Hecho cuando: el componente renderiza exactamente 3 `glass-card` con
     nombre, "••••" + 4 dígitos y saldo en formato `$X,XXX.XX`; sin
     hexadecimales en JSX/JS ni CSS nuevo.

2. **Añadir la nota de demostración** (RF4)
   - `<p className="text-sm text-slate-text">Datos de demostración</p>`
     inmediatamente bajo el grid, con el texto exacto fijado por la spec.
   - Hecho cuando: la nota "Datos de demostración" es visible junto al bloque.

3. **Pruebas unitarias del componente** (RF6a, RF6b)
   - Crear `src/components/PanelTarjetas.test.jsx` con
     `describe("PanelTarjetas")`: exactamente 3 tarjetas, cada una con
     nombre, "•••• XXXX" y saldo, y nota visible.
   - Hecho cuando: `npx vitest run src/components/PanelTarjetas.test.jsx`
     pasa.

4. **Integrar el bloque en `DashboardSection`** (RF1)
   - En `src/App.jsx`: importar `PanelTarjetas` y renderizarlo en la rama
     `seccion === "tarjetas"`; inicio, transacciones y configuración quedan
     intactos.
   - Hecho cuando: `/dashboard/tarjetas` muestra el bloque y ya no muestra el
     texto de marcador "Administra tus tarjetas y revisa sus saldos."
     (la verificación completa llega en la tarea 5).

5. **Pruebas de ruta e integración** (RF6a, RF6c, RF6d)
   - Ampliar `src/App.test.jsx` reutilizando `renderRuta` (MemoryRouter):
     `/dashboard/tarjetas` muestra 3 tarjetas demo + nota y NO muestra el
     placeholder (RF6d); `/dashboard` conserva sus 3 cifras (Balance
     disponible, Ingresos del mes, Gastos del mes); `/dashboard/transacciones`
     y `/dashboard/configuracion` conservan sus placeholders (RF6c).
   - Hecho cuando: `npx vitest run src/App.test.jsx` pasa, incluida la
     aserción de ausencia del placeholder.

6. **Suite completa y build** (RF6)
   - Ejecutar `npm test` (todas las pruebas existentes sin regresiones) y
     `npm run build`.
   - Hecho cuando: ambos comandos pasan en verde y se reportan como
     ejecutados.

7. **Revisión visual Fluid Glass** (RF5)
   - En navegador, escritorio y móvil (< 640px): una columna en móvil, hasta
     tres en escritorio, contraste legible de tarjetas y nota, sin nuevas
     superficies translúcidas superpuestas ni blobs.
   - Hecho cuando: la revisión queda registrada como realizada o, si no hay
     navegador disponible, explícitamente como no realizada (pass/fail/no
     realizada).

8. **Commit y actualización de `MEMORY.md`** (RF1–RF6)
   - Commit limitado a `src/components/PanelTarjetas.jsx`,
     `src/components/PanelTarjetas.test.jsx`, `src/App.jsx` y
     `src/App.test.jsx`, con mensaje corto, imperativo y en español (p. ej.
     "añade bloque de tarjetas demo al dashboard").
   - `MEMORY.md`: estado del bloque (RFs cubiertos), decisión de componente
     nuevo con datos demo y nota exacta, validaciones ejecutadas y pendientes;
     sin datos sensibles.
   - Hecho cuando: el commit contiene solo los archivos del cambio y
     `MEMORY.md` refleja el estado y las decisiones de la spec 002.
