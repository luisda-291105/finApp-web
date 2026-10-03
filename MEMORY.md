# MEMORY.md — FinApp

## Proyecto
- App de finanzas personales (landing + dashboard)
- Stack: React 18 + Vite 5 + Tailwind CSS v4 + React Router 6
- Tests: Vitest + Testing Library (jsdom)
- Estilo: Fluid Glass (glassmorphism tipo visionOS)

## Comandos
- `npm run dev` — desarrollo
- `npm run build` — producción
- `npm test` — todos los tests
- `npx vitest run <archivo>` — un solo test

## Estructura
- `src/components/` — componentes React
- `src/config/` — `api.config.js` (endpoints), `app.config.js` (feature flags)
- `src/hooks/` — `useReveal` (IntersectionObserver)
- `src/styles/index.css` — tokens `@theme` + utilidades Fluid Glass

## Convenciones
- Todo en español (nombres, props, eventos, commits)
- Header JSDoc obligatorio por archivo (ver `.agents/file-header-template.md`)
- Paleta/tokens solo en `src/styles/index.css` — prohibido hardcodear hex
- Endpoints solo en `src/config/api.config.js` — prohibido hardcodear en componentes
- Commits: mensaje corto, imperativo, en español

## Restricciones Fluid Glass
- Máximo 3 capas de vidrio por vista
- Máximo 2 blobs de color por viewport
- border-radius 20–28px, sin bordes cuadrados
- Contraste AA obligatorio sobre fondos translúcidos
- Animaciones solo CSS + IntersectionObserver (sin libs externas)

## Testing
- Tests junto al código probado (`*.test.jsx` para componentes JSX, `*.test.js` para hooks JS)
- Usar `MemoryRouter` para rutas
- `TRIAL_ACTIVO = true` — dashboard accesible sin login

## Reglas completas
- `.agents/rules/rules.md` — reglas de diseño y arquitectura
- `.agents/response-rules.md` — proceso plan → terminal → commit
