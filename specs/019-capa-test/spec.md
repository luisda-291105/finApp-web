# Spec 019 — Centralización de las pruebas

**Estado: aprobada (2026-10-20)**

## 1. Propósito

Centralizar las pruebas automatizadas existentes y futuras de FinApp bajo `src/test/`,
manteniendo en esa carpeta la jerarquía relativa que identifica la capa o el origen
probado. Esto establece una ubicación coherente para las suites sin cambiar el
comportamiento de la aplicación ni lo que las pruebas verifican.

## 2. Alcance

### Incluido

- Reubicar al árbol `src/test/` las suites Vitest `*.test.js` y `*.test.jsx`
  actualmente ubicadas bajo `src/`. Al redactar esta spec hay **39 archivos de
  prueba** de esos formatos: 31 `.test.jsx` y 8 `.test.js`.
- Conservar en `src/test/` la jerarquía relativa de las suites que corresponde a la
  ubicación de su código probado. Por ejemplo, una suite de `src/pages/Foo.jsx` queda
  bajo `src/test/pages/`.
- Aplicar esa misma convención a futuras suites Vitest `*.test.js` y `*.test.jsx`:
  las suites de componentes, hooks, páginas, layout y estilos quedan agrupadas bajo la
  rama correspondiente dentro de `src/test/`.
- Mantener los nombres y extensiones actuales de las suites (`.test.jsx` para pruebas
  JSX y `.test.js` para JavaScript), así como sus aserciones y objetivos actuales. No
  se requiere definir ni alcanzar una nueva métrica porcentual de cobertura.
- Preservar la resolución de imports, mocks y referencias a recursos para que cada suite
  siga operando sobre los mismos módulos, APIs y recursos que antes de su reubicación.
- Conservar la ejecución mediante `npm test` y el entorno compartido vigente de Vitest:
  `jsdom`, globals, `vitest.setup.js` y los stubs que las suites consumen.
- Ubicar en la raíz de `src/test/` las suites transversales que no tengan una capa
  principal clara y las suites que prueben el entorno de pruebas.
- Actualizar `AGENTS.md` y `.agents/rules/rules.md` para que describan la ubicación
  centralizada y la convención espejo, resolviendo la indicación actual de colocar las
  pruebas junto al código relacionado. Estas actualizaciones forman parte del alcance
  y se ejecutan al implementar la spec.

### Fuera de alcance

- Cambios en el comportamiento, interfaz, rutas o datos de la aplicación.
- Cambios en lo que las pruebas afirman, en los dobles de prueba o en los objetivos
  actuales de las suites, salvo ajustes estrictamente necesarios para que sus referencias
  sigan funcionando después de reubicarlas.
- Mover código de producción, `vitest.setup.js` u otros archivos de configuración como
  parte de la centralización.
- Añadir dependencias o cambiar el entorno, opciones y semántica de ejecución de Vitest.
- Centralizar archivos de prueba en formatos distintos de `*.test.js` y `*.test.jsx`, o
  pruebas ejecutadas por herramientas distintas de Vitest.

## 3. Convenciones existentes y compatibilidad

El estado observado contiene 39 suites bajo `src/`. `vitest.config.js` incluye
`src/**/*.test.{js,jsx}`, usa `jsdom`, activa `globals` y carga `vitest.setup.js`.
`package.json` también declara `vitest.setup.js` en su configuración de Vitest.
La reubicación debe seguir siendo compatible con `npm test` y no debe desactivar el
setup compartido ni duplicar o alterar los efectos que las suites reciben de él.

La guía actual (`AGENTS.md`) indica que las pruebas se colocan junto al código
relacionado, lo que contradice la ubicación centralizada confirmada por el usuario.
La spec resuelve la contradicción mediante la actualización de `AGENTS.md` y
`.agents/rules/rules.md` durante la implementación, para que indiquen `src/test/` con
jerarquía espejo. El cambio busca limpiar y ordenar la ubicación de las pruebas.

## 4. Casos límite

- **Pruebas de infraestructura sin un módulo de producción homólogo:** la suite que
  verifica el stub global de `matchMedia` y `innerWidth` se conserva en la raíz de
  `src/test/`, sin trasladar `vitest.setup.js`.
- **Suites transversales sin capa principal clara:** una suite que cubre varias
  superficies —por ejemplo, `cierreDeModales.test.jsx`— queda en la raíz de
  `src/test/` si no se identifica una capa principal clara; no se duplica por cada
  componente.
- **Referencias relativas:** al cambiar la profundidad de una suite, sus imports y
  mocks deben seguir apuntando a los mismos módulos; las rutas construidas desde la
  ubicación del test deben continuar leyendo el recurso previsto.
- **Suites de estilos:** una prueba de `src/styles/index.css` mantiene su asociación
  con `styles/` dentro del árbol de pruebas y sigue leyendo el CSS y HTML que valida.
- **Archivos auxiliares de Vitest:** el setup compartido y la configuración no son
  suites sujetas a la reubicación; la centralización cubre suites Vitest `*.test.js` y
  `*.test.jsx`, no otros formatos ni pruebas ejecutadas por otras herramientas.
- **Pruebas futuras:** las suites Vitest nuevas en los formatos `*.test.js` y
  `*.test.jsx` respetan el espejo de la ruta bajo `src/test/`; las transversales sin capa
  principal clara o las de infraestructura siguen la regla de la raíz de pruebas.

## 5. Requisitos funcionales

- **RF-01 — Ubicación centralizada:** cuando se complete la centralización, todas las
  suites Vitest `*.test.js` y `*.test.jsx` que actualmente existen bajo `src/` estarán
  dentro de `src/test/`, y no quedarán archivos de esos formatos fuera de esa carpeta.
  Este requisito no incluye otros formatos ni pruebas ejecutadas por herramientas
  distintas de Vitest.
- **RF-02 — Jerarquía espejo:** cuando una suite pruebe un módulo de producción ubicado
  bajo `src/`, su ubicación bajo `src/test/` conservará la ruta relativa de la capa o
  directorio del módulo, manteniendo el nombre de suite y su extensión. Por ejemplo,
  `src/pages/Foo.jsx` tendrá su suite en `src/test/pages/Foo.test.jsx`.
- **RF-03 — Pruebas transversales y de infraestructura:** cuando una suite cubra más
  de una capa y no tenga una capa principal clara, o pruebe el entorno de pruebas, se
  ubicará en la raíz de `src/test/` sin crear copias de una misma suite.
- **RF-04 — Imports y mocks:** cuando una suite se reubique, sus imports, mocks y
  referencias relativas a recursos seguirán resolviendo los mismos módulos y recursos
  que resolvían antes, y mantendrán el mismo alcance y efecto observable.
- **RF-05 — Descubrimiento y ejecución:** cuando se ejecute `npm test`, Vitest
  descubrirá y ejecutará todas las suites centralizadas cubiertas por RF-01 y RF-08;
  al migrar, estas corresponderán a los 39 archivos existentes al redactar esta spec,
  salvo que el estado de las suites cambie antes de implementar.
- **RF-06 — Configuración compartida:** cuando se ejecuten las suites centralizadas,
  se conservarán el entorno `jsdom`, los globals y la carga del setup compartido
  actualmente declarados para Vitest; las suites seguirán recibiendo sus stubs globales.
- **RF-07 — Sin cambio productivo:** al centralizar las pruebas, la aplicación
  conservará el mismo comportamiento y las suites conservarán sus aserciones,
  cobertura y objetivos; los cambios de contenido se limitarán a lo necesario para
  mantener sus referencias funcionales.
- **RF-08 — Pruebas futuras:** cuando se añada una suite Vitest `*.test.js` o
  `*.test.jsx`, se ubicará bajo `src/test/` con la convención de jerarquía y será
  ejecutable mediante `npm test`. Este requisito no abarca otros formatos ni suites
  ejecutadas por herramientas distintas de Vitest.
- **RF-09 — Guías de trabajo:** cuando se implemente esta spec, `AGENTS.md` y
  `.agents/rules/rules.md` describirán `src/test/` como ubicación de las suites Vitest
  cubiertas por la spec, documentarán la jerarquía espejo y dejarán de indicar que las
  pruebas deben ubicarse junto al código relacionado.
