# Plan 019 — Centralización de las pruebas

**Spec:** [`spec.md`](spec.md) — aprobada explícitamente por el usuario para pasar a
planificación.
**Estado del plan:** listo para aprobación antes de implementar.
**Alcance:** mover las 39 suites Vitest `*.test.js` y `*.test.jsx` a `src/test/`, conservar
aserciones y objetivos, actualizar imports/referencias necesarias y alinear las guías. No se
modifica código productivo.

## 1. Estrategia

1. Medir la línea base real y cerrar el inventario de las 39 suites antes de cualquier cambio
   (T1).
2. Actualizar `AGENTS.md` y `.agents/rules/rules.md` con la ubicación centralizada y la regla de
   espejo, y confirmar el patrón de descubrimiento de Vitest (T2).
3. Migrar en lotes por ámbito de origen, usando destinos únicos bajo `src/test/`. Después de cada
   lote, ejecutar sus pruebas focalizadas y comprobar que no haya copias antiguas/nuevas del mismo
   archivo (T3–T8).
4. Migrar la suite de estilos y cerrar con una auditoría del inventario, regresión completa y build
   (T9).

La secuencia reduce el radio de cada cambio y detecta pronto errores de imports relativos. Cada
lote conserva los mismos nombres, extensiones, aserciones y objetivos; las únicas modificaciones
de contenido permitidas en las suites son las referencias necesarias por el cambio de ubicación.
No se plantea una métrica porcentual de cobertura nueva.

## 2. Decisiones de organización y compatibilidad

### PD-01 — El directorio de pruebas refleja el origen probado

Una suite que prueba un módulo concreto queda bajo `src/test/` con la misma ruta relativa del
módulo de producción. Por ejemplo, `src/pages/Foo.jsx` se prueba desde
`src/test/pages/Foo.test.jsx`. Se conserva el nombre de suite y su extensión, aunque la ubicación
actual del test no coincida con la del módulo probado.

En particular, dos suites de la raíz de `src/components/` importan módulos de subdirectorios y deben
ubicarse según esos módulos, no según su localización histórica:

- `components/Hero.test.jsx` → `test/components/domain/landing/Hero.test.jsx`.
- `components/ModalTarjeta.test.jsx` → `test/components/domain/modales/ModalTarjeta.test.jsx`.

Las suites de `App`, `App016` y `main` siguen la raíz de `src/` bajo `src/test/`. La suite de
`entornoDeMedicion` valida infraestructura sin una capa de producción homóloga y va en la raíz de
`src/test/`.

### PD-02 — Las suites transversales sin capa clara van a la raíz

`components/layout/cierreDeModales.test.jsx` cubre distintas superficies y capas sin una capa
principal inequívoca; se moverá a `src/test/cierreDeModales.test.jsx`. No se duplica para acompañar
a cada componente.

### PD-03 — Mantener Vitest y el setup actuales

El patrón vigente `src/**/*.test.{js,jsx}` ya comprende suites ubicadas en `src/test/`, y por tanto
debería descubrir las nuevas rutas sin modificar la configuración. La primera tarea de migración
confirmará esto mediante ejecución focalizada. No se editarán `vitest.setup.js`, opciones de
`jsdom`, globals, dependencias ni declaraciones existentes de `setupFiles`.

Si la verificación demuestra que el patrón de inclusión no descubre una ruta centralizada, se
ajustará únicamente el patrón de descubrimiento para incluir `src/test/**/*.test.{js,jsx}`; se
mantendrán el setup global, el entorno y el comportamiento de ejecución. No se añadirán patrones
superpuestos que dupliquen suites.

### PD-04 — Reescribir referencias por destino, no alterar lo probado

Los imports de módulos productivos, `vi.mock`, imports dinámicos y rutas construidas con
`import.meta.url`/`fileURLToPath` se revisarán en cada lote, ya que cambiará su profundidad.
`styles/index.css.test.js`, por ejemplo, tendrá que seguir leyendo `src/styles/index.css` y
`index.html` desde su nuevo emplazamiento en `src/test/styles/`. Los mocks conservarán el mismo
identificador de módulo y el mismo alcance lógico.

Se descartan alias nuevos, cambios de módulos productivos o reescrituras de aserciones como método
de resolver imports: no son necesarios para centralizar los archivos y ampliarían el alcance.

### PD-05 — Alinear la documentación en la preparación

La implementación actualizará los apartados pertinentes de `AGENTS.md` y
`.agents/rules/rules.md` **antes de mover las suites**, de modo que las instrucciones vigentes
durante la migración coincidan. Ambas guías indicarán `src/test/`, la jerarquía espejo, la raíz
para suites transversales sin capa principal e infraestructura y las extensiones cubiertas.
`vitest.setup.js` y los archivos de configuración no se trasladan.

### Alternativas descartadas

- **Conservar los tests junto al código productivo:** contradice el objetivo aprobado de limpiar y
  ordenar suites en una ubicación centralizada; la jerarquía espejo ya mantiene reconocible su
  relación con cada capa.
- **Aplanar todas las suites directamente en `src/test/`:** pierde la asociación por capa y hace
  menos evidente el origen probado.
- **Duplicar suites transversales en cada carpeta implicada:** puede ejecutar las mismas
  aserciones más de una vez y divergir con el tiempo; se usa una única ubicación raíz cuando no hay
  capa principal clara.
- **Trasladar o recrear setup/configuración, cambiar dependencias o alterar el entorno:** no es
  necesario para la organización solicitada y arriesga los stubs compartidos que actualmente
  consumen todas las suites.

## 3. Inventario y lotes

El inventario comprobado en `src/` contiene **39 suites: 31 `.test.jsx` y 8 `.test.js`**. Los
destinos se agrupan así:

| Lote | Suites actuales | Destino bajo `src/test/` |
|---|---|---|
| Base y entrada | `App.test.jsx`, `App016.test.jsx`, `main.test.jsx`, `entornoDeMedicion.test.js` | Raíz de `src/test/`; la suite de entorno queda allí como infraestructura |
| Hooks | `hooks/useBreakpoint.test.js`, `useCierreConEsc.test.js`, `useDeslizarParaCerrar.test.js`, `useFocoEnVistaDestino.test.js`, `useRetornoDeFoco.test.js`, `useReveal.test.js` | `src/test/hooks/` |
| Dashboard y UI | `components/domain/dashboard/{AcordeonTarjetas,GridTarjetas,LogMovimientos,MiTarjetaVirtual}.test.jsx`, `components/ui/{BotonCerrar,Card}.test.jsx`, `components/Hero.test.jsx`, `components/ModalTarjeta.test.jsx` | Rutas espejo de los módulos probados; Hero y ModalTarjeta bajo `components/domain/landing/` y `components/domain/modales/` respectivamente |
| Landing y modales | `components/domain/landing/{Features,StatsBar}.test.jsx`, `components/domain/modales/{AsistenteAyuda,AuthModal,ModalFuentes}.test.jsx` | `src/test/components/domain/landing/` y `src/test/components/domain/modales/` |
| Navegación/layout de componentes | `components/layout/{BottomNav,DashboardDrawer,DashboardUserModal,Header,SidebarNavContenido,SidebarResponsive}.test.jsx` y `components/layout/cierreDeModales.test.jsx` | Seis suites en `src/test/components/layout/`; la suite transversal `cierreDeModales.test.jsx` en la raíz |
| Layout y páginas | `layout/{AsistenteDashboard,DashboardLayout,LandingLayout}.test.jsx`, `pages/{PaginaDashboardConfiguracion,PaginaDashboardContactos,PaginaDashboardCorreos,PaginaInicio,PanelTarjetas}.test.jsx` | `src/test/layout/` y `src/test/pages/` |
| Estilos | `styles/index.css.test.js` | `src/test/styles/index.css.test.js` |

Las rutas de la tabla son relativas a `src/` para la columna de origen y a `src/` para las rutas
destino (por ejemplo, el destino `test/hooks/...` corresponde a `src/test/hooks/...`). T1 volverá
a comprobar que cada archivo siga existiendo y que el recuento no haya cambiado antes de aplicar
los lotes. Si el usuario modifica o añade suites antes de implementar, se actualiza el inventario
antes de continuar; no se ignoran ni se sobreescriben cambios ajenos.

## 4. Archivos previstos

### Documentación de trabajo

- `AGENTS.md` — sustituir la pauta de tests colocados junto al código por la centralización y sus
  excepciones aprobadas.
- `.agents/rules/rules.md` — reflejar la misma ubicación, espejo y límites de formatos/herramienta.

### Configuración de pruebas

- `vitest.config.js` — sin cambio esperado; solo se ajustaría el patrón `include` si la prueba de
  descubrimiento demuestra que el vigente no incluye `src/test/`.
- `vitest.setup.js` y `package.json` — sin cambios previstos; se conserva el setup global actual.

### Suites

- Reubicar las **39** suites de la tabla a `src/test/`, preservando nombres y extensiones.
- Editar únicamente las referencias relativas afectadas por la nueva profundidad; no cambiar
  producción ni reescribir objetivos/aserciones.

## 5. Relación entre requisitos y cambios

- **RF-01:** lotes T3–T9 y auditoría final de que no queden suites cubiertas fuera de `src/test/`.
- **RF-02:** decisión PD-01 y todos los destinos espejo; comprobación archivo por archivo en T1 y
  T9.
- **RF-03:** decisiones PD-01/PD-02; `entornoDeMedicion.test.js` y
  `cierreDeModales.test.jsx` se ubican en la raíz, sin duplicación.
- **RF-04:** PD-04; revisión de imports, mocks, imports dinámicos y rutas a recursos en cada lote.
- **RF-05:** PD-03; ejecuciones focalizadas por lote y `npm test` final con las 39 suites.
- **RF-06:** PD-03; setup, jsdom, globals y stubs permanecen, verificados por la suite de entorno y
  la regresión completa.
- **RF-07:** migración sin cambios productivos; comparación de aserciones/objetivos y regresión
  completa (T3–T9).
- **RF-08:** PD-01/PD-03; las guías definen la convención futura y Vitest descubre la ruta central
  (T2 y T9).
- **RF-09:** PD-05 y actualización explícita de ambas guías en T2.

## 6. Validación y cierre

- **Antes de mover archivos:** guardar el inventario, ejecutar `npm test` y `npm run build` para
  registrar la línea base real. Los recuentos históricos en `MEMORY.md` no sustituyen esta medición.
- **Después de cada lote:** ejecutar `npx vitest run` con las rutas nuevas de ese lote; corregir
  únicamente imports/referencias desplazados y repetir el foco. Comprobar que cada suite del lote
  exista una sola vez.
- **Al terminar:** verificar que el inventario de `src/test/` contiene las 39 suites esperadas
  (ajustado si la línea base cambia) y que no hay `*.test.js` ni `*.test.jsx` fuera de `src/test/`.
  Ejecutar `npm test`, revisar que Vitest descubra todas las suites sin duplicados ni omisiones, y
  ejecutar `npm run build`.
- **No regresión de configuración:** confirmar que la suite de entorno sigue comprobando los stubs
  de `matchMedia`/`innerWidth`, que las suites siguen recibiendo el setup global y que no se mueve
  ni se duplica el setup.
- El build se ejecuta como cierre requerido por `AGENTS.md`, aunque la tarea no altere código de
  producción. No hay revisión visual: no se cambia la interfaz.
- Si una suite falla antes de la migración, comparar con la línea base y separar defectos
  preexistentes de los introducidos por la reubicación; no cambiar sus expectativas para ocultar
  una regresión.
