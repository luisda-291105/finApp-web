# AGENTS.md — FinApp

Guía operativa del repositorio. Los principios del proyecto están en
[`doc/constitution.md`](doc/constitution.md); las reglas detalladas de diseño y
arquitectura están en [`.agents/rules/rules.md`](.agents/rules/rules.md). El formato de
trabajo y respuesta está en [`.agents/response-rules.md`](.agents/response-rules.md).

## Stack y comandos

- React 18, Vite 5, Tailwind CSS v4 y React Router 6.
- Vitest y Testing Library con entorno jsdom.
- `npm run dev` — servidor de desarrollo.
- `npm run build` — build de producción.
- `npm test` — suite completa (`vitest run`).
- `npx vitest run <ruta>` — pruebas de una ruta concreta.
- Para scroll-reveal se usan CSS y `IntersectionObserver`; Framer Motion (instalado)
  se reserva para hover/tap, modales, `layoutId` y contadores.

## Estructura actual

- `src/App.jsx` — rutas y composición de vistas.
- `src/components/` — componentes de interfaz, incluido el dashboard de demostración.
- `src/config/` — `api.config.js` para endpoints y `app.config.js` para configuración.
- `src/hooks/` — hooks reutilizables, como `useReveal`.
- `src/styles/index.css` — tokens Tailwind `@theme` y estilos Fluid Glass.
- `src/**/*.test.*` — pruebas colocadas junto al código relacionado.

## Reglas de trabajo

- Antes de cambiar código, lee esta guía, `doc/constitution.md`, las reglas pertinentes
  de `.agents/rules/rules.md` y `MEMORY.md`. Si existe una spec activa en `specs/`,
  léela también; no presupongas que esa carpeta existe para cada cambio.
- Implementa solo el alcance solicitado. Si falta una decisión que cambie el
  comportamiento esperado, pregunta antes de asumir.
- Mantén nombres de props, estados y eventos en español, siguiendo los patrones del
  proyecto.
- Los componentes, hooks y archivos de configuración nuevos deben seguir
  `.agents/file-header-template.md`. No se requiere ese header en documentos Markdown
  ni en archivos de pruebas.
- Usa `src/config/api.config.js` para endpoints; no hardcodees URLs en componentes.
- La paleta debe usar los tokens de `src/styles/index.css`. No añadas hexadecimales a
  JSX/JS; hay literales heredados que no deben copiarse a código nuevo.
- Conserva los límites Fluid Glass: máximo tres superficies translúcidas y dos blobs
  visibles por viewport.
- `TRIAL_ACTIVO = true` en `src/config/app.config.js`: el dashboard es accesible como
  demostración, no como autenticación real.

## Pruebas y cierre

1. **Plan** — enumera brevemente los pasos antes de implementar.
2. **Terminal** — ejecuta pruebas relevantes, `npm test` y `npm run build`; en cambios
   visuales, valida Fluid Glass en navegador cuando esté disponible. Reporta cada
   validación como pass/fail o como no realizada.
3. **Commit** — solo si las validaciones aplicables pasan; limita el staging a los
   archivos del cambio y usa un mensaje corto, imperativo y en español.

Para rutas, usa `MemoryRouter`. Los tests actuales incluyen archivos `.test.jsx` para
componentes y `.test.js` para hooks; conserva la extensión apropiada al código probado.
