# Constitución del proyecto — FinApp

Principios que deben respetar las solicitudes, especificaciones, planes, cambios y
revisiones del proyecto. Para herramientas y procedimientos concretos, consulta
[`AGENTS.md`](../AGENTS.md) y [las reglas de arquitectura y diseño](../.agents/rules/rules.md).

## 1. Identidad y stack

- FinApp es una aplicación de finanzas personales en desarrollo, con vistas públicas y
  un dashboard de demostración.
- La base técnica es React 18, Vite 5, Tailwind CSS v4 y React Router 6. No la describas
  ni la conviertas en una aplicación HTML/JS sin framework.
- No añadas dependencias, frameworks de animación ni herramientas de build sin que el
  cambio esté justificado y aprobado.
- No presentes datos de demostración, acceso de prueba o respuestas simuladas como
  información financiera persistida o autenticación real.

## 2. Requisitos y alcance

- Implementa únicamente el comportamiento solicitado y aprobado. No inventes
  funcionalidades ni amplíes el alcance durante la implementación.
- En el flujo SDD, la spec aprobada es el contrato del cambio. Si un requisito o una
  decisión necesaria no está definido, detente y pide aclaración antes de implementarlo.
- Los cambios pequeños pueden seguir una solicitud directa sin crear una spec nueva,
  siempre que el alcance y el comportamiento esperado estén claros.
- No crees archivos ni cambies formatos de datos persistidos sin que el alcance lo
  contemple.

## 3. Arquitectura y legibilidad

- Mantén la separación entre interfaz, configuración y lógica reutilizable siguiendo la
  estructura existente en `src/components/`, `src/hooks/`, `src/config/` y `src/styles/`.
- Prefiere componentes pequeños y una solución que el equipo pueda mantener; evita
  abstracciones o dependencias que no resuelvan una necesidad concreta.
- Mantén los nombres de props, estados y eventos en español, de forma consistente con el
  código existente. Los textos de interfaz y la documentación del producto también van
  en español.
- Los componentes, hooks y archivos de configuración nuevos deben seguir la plantilla
  JSDoc de `.agents/file-header-template.md`. Documenta las funciones exportadas con
  JSDoc breve cuando su propósito o contrato no sea evidente.
- Las llamadas al backend usan `src/config/api.config.js`; no hardcodees URLs de API en
  componentes.

## 4. Datos y servicios

- No afirmes que la aplicación guarda o recupera datos financieros si esa persistencia
  no está implementada y verificada. Actualmente no se encontró almacenamiento
  persistente de datos financieros en `src/`.
- Si una spec incorpora persistencia, debe definir el origen, la forma y el ciclo de
  vida de los datos, y contemplar la compatibilidad o migración antes de modificar un
  formato existente.
- Trata los datos financieros y credenciales como sensibles: solicita y transmite solo
  lo necesario, no incluyas secretos en código, memoria del proyecto, logs o ejemplos y
  no guardes contraseñas o tokens en almacenamiento accesible desde el cliente.
- Si el backend no está disponible, comunica con claridad el estado de demostración y
  los límites de la operación. No ocultes errores detrás de respuestas que parezcan
  confirmar una operación real.

## 5. Diseño, accesibilidad y movimiento

- Aplica el sistema Fluid Glass documentado en `.agents/rules/rules.md`; la paleta y los
  tokens visuales tienen una única fuente en `src/styles/index.css`.
- No introduzcas nuevos colores hexadecimales en JSX/JS: reutiliza los tokens existentes
  o define el token necesario en `src/styles/index.css`. Hay literales heredados en
  componentes; trátalos como deuda técnica y no los propagues.
- Las superficies de vidrio deben mantener contraste legible, fallback sin blur, borde
  highlight y radios acordes a la guía. Respeta los límites de capas de vidrio y blobs
  indicados en las reglas de diseño.
- Las vistas nuevas y modificadas deben ser utilizables en móvil y escritorio, con
  semántica, nombres accesibles y navegación por teclado adecuados.
- Las animaciones se implementan con CSS y las APIs nativas ya usadas por el proyecto;
  no agregues librerías de animación.

## 6. Calidad y validación

- Añade o ajusta pruebas para el comportamiento modificado siguiendo Vitest y los
  patrones existentes. Usa `MemoryRouter` para probar rutas.
- Antes de cerrar un cambio de código, ejecuta las pruebas relevantes, `npm test` y
  `npm run build`. No declares completo un cambio si una validación falla.
- En cambios visuales, revisa Fluid Glass en navegador en escritorio y móvil cuando
  haya una herramienta disponible; informa explícitamente si esa revisión no pudo
  realizarse.
- Distingue entre validaciones ejecutadas y pendientes; nunca informes una comprobación
  no realizada como aprobada.
