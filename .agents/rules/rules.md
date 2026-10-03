# Reglas de arquitectura y diseño — FinApp

Estas reglas desarrollan los principios de [`doc/constitution.md`](../../doc/constitution.md).
Si una regla parece contradecir el código existente, conserva el alcance aprobado y evita
extender el patrón problemático; no hagas migraciones generales como parte de un cambio
ajeno.

## Stack y arquitectura

- Stack vigente: React 18, Vite 5, Tailwind CSS v4 y React Router 6; consulta
  `package.json` antes de proponer comandos o dependencias.
- Mantén los componentes en `src/components/`, los hooks reutilizables en `src/hooks/`,
  la configuración en `src/config/` y los estilos compartidos en `src/styles/`.
- No agregues frameworks de animación. Usa CSS y APIs nativas, incluido
  `IntersectionObserver` mediante los patrones existentes.
- Usa `src/config/api.config.js` para resolver endpoints; no introduzcas URLs de backend
  directamente en componentes.
- Nombra props, estados y eventos en español, de forma coherente con los componentes
  existentes.
- Componentes, hooks y archivos de configuración nuevos deben incluir el header de
  `.agents/file-header-template.md`. Las funciones exportadas deben tener JSDoc breve
  sobre su contrato cuando no sea obvio.

## Diseño Fluid Glass

- Usa los tokens definidos en `src/styles/index.css` como fuente de paleta y escala
  visual. No añadas literales de color hexadecimal en JSX/JS.
- Hay componentes existentes con colores hexadecimales escritos directamente en JSX;
  son deuda técnica, no ejemplos a replicar. Migra esos valores solo dentro del alcance
  de una tarea que autorice el cambio visual.
- Para superficies translúcidas, usa `backdrop-filter` con blur de 20–30px y saturación
  de 160–200%, junto con un fondo semisólido de fallback cuando el blur no esté
  disponible.
- Las superficies de vidrio llevan highlight de borde superior, radios de 20–28px y
  sombras suaves. No apliques esos radios obligatoriamente a botones o controles que no
  sean superficies de vidrio.
- Mantén como máximo tres superficies translúcidas superpuestas por vista y dos blobs
  CSS visibles en el viewport.
- Mantén contraste mínimo WCAG AA y legibilidad con o sin blur. Las vistas deben
  funcionar en escritorio y móvil.
- Las animaciones deben ser CSS; respeta `prefers-reduced-motion` cuando corresponda.

## Servicios y datos

- No supongas que existe un backend operativo ni persistencia financiera: verifica la
  configuración y el estado real antes de describir una operación como completada.
- Los modos demo deben identificarse como tales y no presentarse como autenticación o
  transacciones reales.
- Si un cambio añade persistencia o modifica datos existentes, la spec debe contemplar
  formato, privacidad, compatibilidad/migración y comportamiento ante errores.
- No guardes credenciales, tokens ni datos financieros sensibles en el repositorio o en
  almacenamiento cliente sin un requisito explícito y un diseño de seguridad aprobado.

## Pruebas y revisión visual

- Usa Vitest y Testing Library. Ejecuta `npm test`; para una selección concreta usa
  `npx vitest run <ruta>`.
- Coloca las pruebas junto al código probado y sigue las extensiones existentes
  (`*.test.jsx` para componentes JSX, `*.test.js` para hooks JS).
- Usa `MemoryRouter` al probar rutas.
- `npm run build` debe pasar para cambios de código antes de cerrar la tarea.
- Los límites de capas y blobs no cuentan actualmente con pruebas automáticas dedicadas:
  no afirmes que están automatizados. En cambios visuales, revísalos en navegador junto
  con contraste, fallback, highlight y radio; registra lo no verificado si no hay
  navegador disponible.
