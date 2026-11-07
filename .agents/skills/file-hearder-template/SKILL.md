---
name: file-header-template
description: Cabecera JSDoc obligatoria para archivos nuevos de finApp-web (componentes, páginas, cards, formularios, modales, hooks, servicios, configuración e index.js de features). Define los campos @uso, @funciones, @datos, @eventos, @estados y @usadoPor, con ejemplos por capa y reglas para mantenerla como resumen.
---

# SKILL: file-header-template (finApp-web)

Cabecera común de los archivos nuevos. Sirve para saber qué hace un archivo sin abrirlo
completo y para mantener el `@usadoPor` actualizado después de mover o dividir piezas.

## Cuándo aplicarla

- Componentes, páginas y layouts nuevos (`.jsx`).
- Cards, formularios y modales nuevos.
- Hooks, servicios, helpers puros y archivos de configuración (`.js` / `.jsx`).
- `index.js` de un feature.

No se aplica a pruebas (`*.test.js`, `*.test.jsx`) ni a documentación Markdown
(`README.md`, `docs/`, `AGENTS.md`, skills).

## Plantilla mínima

```js
/**
 * @uso        Qué problema resuelve este archivo (1 línea)
 * @funciones  Funciones/exports principales con su firma corta
 * @datos      Cómo entra y sale la data (props, hook, fetch, transformaciones)
 * @eventos    Eventos que dispara o escucha (onClick, onSubmit, Escape, etc.)
 * @estados    useState/useReducer relevantes; «Ninguno» si no tiene
 * @usadoPor   Páginas/componentes que lo consumen
 */
```

- Una línea por campo cuando sea posible.
- Los nombres de props, estados, callbacks y eventos van en español.
- Si un campo no aplica, escribe `Ninguno`; no lo dejes vacío.
- Documenta con JSDoc breve las funciones exportadas cuyo contrato no sea obvio.
- La cabecera es un resumen: si un campo necesita más de 6–7 líneas reales, el archivo
  probablemente debe dividirse.

## Significado de cada campo

| Campo | Qué escribir | Qué evitar |
|---|---|---|
| `@uso` | El problema o la responsabilidad única del archivo | Listar toda la app |
| `@funciones` | Exports y firmas: `useTarjetas()`, `TarjetaCard({ tarjeta, alAbrir })` | Código o detalles internos |
| `@datos` | Origen y forma de los datos; si delega en un hook/servicio | Repetir el algoritmo |
| `@eventos` | Interacciones que maneja o emite | “Ninguno” si sí escucha eventos |
| `@estados` | Estado local relevante y su tipo | Estados de otros componentes |
| `@usadoPor` | Consumidores reales en ese momento | “Cualquiera” o rutas inventadas |

## Ejemplos por capa

### Página de un feature

```js
/**
 * @uso        Listado de tarjetas del usuario activo
 * @funciones  TarjetasPage()
 * @datos      Coordina useTarjetas, las tarjetas del listado y los modales
 * @eventos    Crear tarjeta, abrir detalle, guardar y eliminar
 * @estados    modalAbierto, tarjetaSeleccionada, refs de foco
 * @usadoPor   App.jsx mediante la API pública de features/tarjetas
 */
```

### Card

```js
/**
 * @uso        Tarjeta visual seleccionable del listado
 * @funciones  TarjetaCard({ tarjeta, alAbrir })
 * @datos      Presenta datos visibles y enmascara siempre el número
 * @eventos    Click para abrir el detalle
 * @estados    Ninguno
 * @usadoPor   TarjetasPage
 */
```

### Formulario controlado

```js
/**
 * @uso        Campos del formulario de creación de grupo
 * @funciones  GrupoForm({ valores, alCambiar, deshabilitado })
 * @datos      Edita nombre y descripción; el estado vive en el modal padre
 * @eventos    Cambio de los campos
 * @estados    Ninguno (controlado por props)
 * @usadoPor   CrearGrupoModal
 */
```

### Modal

```js
/**
 * @uso        Modal para registrar una tarjeta del usuario activo
 * @funciones  CrearTarjetaModal({ abierto, alCerrar, triggerRef, alGuardar })
 * @datos      Valida campos y crea la tarjeta mediante tarjetasService
 * @eventos    Submit, Escape, botón de cierre y clic exterior
 * @estados    valores, error, campoConError, cargando
 * @usadoPor   TarjetasPage
 */
```

### Hook de feature

```js
/**
 * @uso        Estado y acciones del listado de grupos del usuario
 * @funciones  useGrupos()
 * @datos      Consulta grupos y sincroniza la lista tras guardar/editar/eliminar
 * @eventos    Carga al cambiar el usuario; refresco tras operaciones
 * @estados    grupos, cargando, error
 * @usadoPor   GruposPage
 */
```

### Servicio de feature

```js
/**
 * @uso        Operaciones HTTP propias de tarjetas
 * @funciones  crearTarjeta, obtenerTarjetasPorUsuario, actualizarTarjeta, eliminarTarjeta
 * @datos      Delega transporte y rutas en httpServicio y api.config
 * @eventos    Ninguno
 * @estados    Ninguno
 * @usadoPor   useTarjetas y CrearTarjetaModal
 */
```

### `index.js` de un feature

```js
/**
 * @uso        API pública del feature de tarjetas
 * @funciones  Expone la página y los componentes permitidos entre features
 * @datos      Ninguno
 * @eventos    Ninguno
 * @estados    Ninguno
 * @usadoPor   App.jsx y otros features integrados
 */
export { default as TarjetasPage } from "./pages/TarjetasPage";
```

### Configuración de endpoints

```js
/**
 * @uso        Punto único de acceso a los endpoints del backend
 * @funciones  getEndpoint(nombre), API_BASE_URL
 * @datos      Lee variables de entorno (import.meta.env)
 * @eventos    Ninguno
 * @estados    Ninguno
 * @usadoPor   Servicios HTTP y componentes que hagan fetch
 */
```

### Página o layout que crece

Cuando la página coordina varias superficies, explica solo lo necesario:

```js
/**
 * @uso        Listado de grupos con fuentes vinculadas y detalle
 * @funciones  GruposPage()
 * @datos      Orquesta useGrupos, GrupoCard, CrearGrupoModal y GrupoDetalleModal
 * @eventos    Crear grupo, abrir detalle, actualizar y eliminar
 * @estados    modalAbierto, grupoSeleccionado, disparadorRef, disparadorDetalleRef
 * @usadoPor   App.jsx (ruta /dashboard/grupos)
 */
```

Si la cabecera empieza a narrar el flujo completo, mueve esa explicación al
`README.md` del feature o a un comentario junto al bloque correspondiente.

## Reglas de convivencia

- El `@usadoPor` debe nombrar consumidores reales; actualízalo al mover un archivo.
- En features, el consumidor externo es `App.jsx` o `features/<dominio>`, nunca una ruta
  interna.
- No copies la misma cabecera en varios archivos: cada una describe su capa.
- El header no sustituye la documentación del feature (`README.md`) ni las pruebas.
- Las pruebas no llevan header; describen su módulo en el nombre de la suite.
- Para la estructura de carpetas y la API pública de un feature, consulta la skill
  `feature-architecture`.

## Checklist

- [ ] El archivo nuevo tiene el bloque JSDoc al inicio.
- [ ] Los seis campos están presentes y en español.
- [ ] `@funciones` coincide con los exports reales.
- [ ] `@usadoPor` apunta a consumidores existentes.
- [ ] `@datos` distingue props, hook y servicio.
- [ ] `@eventos` y `@estados` dicen «Ninguno» cuando corresponde.
- [ ] La cabecera sigue siendo un resumen y no duplica la implementación.
