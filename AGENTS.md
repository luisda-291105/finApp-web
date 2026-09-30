# AGENTS.md

## Stack
- React 18 + Vite 5 + Tailwind CSS v4 + React Router 6
- Vitest + Testing Library (jsdom, globals: true)
- Sin frameworks de animación externos (solo CSS + IntersectionObserver)

## Comandos
- `npm run dev` — servidor de desarrollo
- `npm run build` — build de producción
- `npm test` — ejecuta todos los tests (vitest run)
- `npx vitest run <ruta>` — ejecutar un solo archivo de test

## Reglas del proyecto
- Reglas completas: `.agents/rules/rules.md`
- Reglas de respuesta: `.agents/response-rules.md`
- Header obligatorio por archivo: `.agents/file-header-template.md`

## Arquitectura
- `src/components/` — Componentes React (Hero, Features, Dashboard, etc.)
- `src/config/` — Configuración centralizada (`api.config.js`, `app.config.js`)
- `src/hooks/` — Hooks personalizados (useReveal)
- `src/styles/index.css` — Tokens `@theme` y utilidades Fluid Glass (única fuente de paleta)

## Restricciones clave
- Nombres de eventos, estados y props en español
- Prohibido hardcodear hex fuera de `src/styles/index.css`
- Prohibido hardcodear endpoints en componentes — usar `src/config/api.config.js`
- Máximo 3 capas de vidrio superpuestas por vista
- Máximo 2 blobs de color visibles por viewport
- `border-radius` 20–28px, sin bordes cuadrados ni sombras duras
- Todo archivo nuevo debe incluir el header JSDoc de `.agents/file-header-template.md`

## Proceso obligatorio por prompt
1. **Plan** — lista breve de tareas antes de escribir código
2. **Terminal** — ejecutar tests y validar Fluid Glass; reportar solo pass/fail
3. **Commit** — solo si terminal = pass; mensaje corto, imperativo, en español

## Tests
- Ubicación: junto al componente (`*.test.jsx`)
- Usar `MemoryRouter` para testear rutas
- `TRIAL_ACTIVO = true` en `app.config.js` — el dashboard es accesible sin login
