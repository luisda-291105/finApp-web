---
name: feature-architecture
description: Estructura por funcionalidades (features) de finApp-web. Úsala al crear un feature nuevo, mover páginas/componentes genéricos a src/features/<dominio>, separar lógica en hooks y servicios, definir la API pública con index.js, documentar el feature o revisar límites entre features. Incluye el patrón real de grupo y tarjetas, reglas de nombres, pruebas y migración incremental.
---

# SKILL: feature-architecture (finApp-web)

Organización del frontend por funcionalidad. El contrato vive en
`docs/arquitectura-frontend.md`; esta skill lo traduce a decisiones concretas y al
patrón que ya siguen `src/features/grupo/` y `src/features/tarjetas/`.

## Cuándo usarla

- Crear un feature nuevo dentro de `src/features/<dominio>/`.
- Migrar una página o modal genérico de `src/pages/` o `src/components/` a un feature.
- Añadir cards, forms, modales, hooks o servicios a un feature existente.
- Revisar si un import cruza un límite de feature o si una pieza debe ir a `shared/`.
- Actualizar la API pública (`index.js`) o el `README.md` de un feature.

No la uses para rediseñar la interfaz: la migración conserva rutas y comportamiento.

## Estado real del repositorio

- Features implementados:
  - `src/features/grupo/` — referencia completa: card, dos forms, dos modales, hook,
    servicio, page, `index.js` y `README.md`.
  - `src/features/tarjetas/` — card, dos modales, hook, servicio, page, `index.js` y
    `README.md`.
- `src/components/`, `src/hooks/`, `src/services/` y `src/layout/` siguen alojando las
  piezas compartidas y el resto de páginas. **No crees `shared/`, `layouts/` ni
  `routes/` por imitar el diagrama**: el traslado es gradual y solo dentro del alcance
  aprobado.
- `src/App.jsx` sigue siendo el mapa de rutas.
- Las pruebas siguen centralizadas en `src/test/`.
- `utils/` está previsto para transformaciones puras; si un feature no las necesita,
  no crees la carpeta vacía.

## Estructura canónica

```text
src/features/<dominio>/
  components/
    cards/
      <Dominio>Card.jsx
    forms/
      <Dominio>Form.jsx
      Editar<Dominio>Form.jsx
    modals/
      Crear<Dominio>Modal.jsx
      <Dominio>DetalleModal.jsx
  hooks/
    use<Dominio>s.js
  pages/
    <Dominio>sPage.jsx
    <Dominio>DetallePage.jsx        # solo si hay ruta de detalle real
  services/
    <dominio>sService.js
  utils/
    <dominio>Helpers.js             # solo funciones puras, si hacen falta
  index.js                          # API pública
  README.md
```

Ejemplo real:

```text
src/features/tarjetas/
  components/cards/TarjetaCard.jsx
  components/modals/CrearTarjetaModal.jsx
  components/modals/DetalleTarjetaModal.jsx
  hooks/useTarjetas.js
  pages/TarjetasPage.jsx
  services/tarjetasService.js
  index.js
  README.md
```

## Límites por capa

| Capa | Responsabilidad | No debe hacer |
|---|---|---|
| `pages/` | Coordinar el hook del feature, estado de UI (modales, selección, refs de foco) y composición de cards/modales | Fetch directo, validaciones de formulario, `getEndpoint` |
| `components/cards/` | Presentar un registro y emitir `alAbrir`/callbacks | Consultar API ni conocer servicios |
| `components/forms/` | Campos controlados recibidos por props (`valores`, `alCambiar`, `deshabilitado`) | Estado de fetching ni navegación |
| `components/modals/` | Estado local del formulario, validación, cierre y acciones del feature | Duplicar la lógica de foco/cierre común |
| `hooks/` | Estado, carga, errores, normalización de respuestas y acciones del listado | JSX ni `getEndpoint` |
| `services/` | Llamadas HTTP del dominio con `getEndpoint` + `httpServicio` | Estado React ni JSX |
| `utils/` | Transformaciones puras y testeables | Efectos, fetch o estado |

Regla de tamaño: si una page supera ~120 líneas o un modal ~180 por mezclar
responsabilidades, extrae primero un form, card o helper; después evalúa un hook
adicional.

## Nombres

- Carpeta del feature: nombre del dominio ya usado por la ruta (`grupo`, `tarjetas`).
  No renombres rutas ni etiquetas visibles durante la migración.
- Componentes con prefijo del dominio: `GrupoCard`, `GrupoForm`, `CrearGrupoModal`,
  `DetalleTarjetaModal`. Nunca `Modal2`, `CardNueva` ni `Componente`.
- Páginas con sufijo `Page`: `GruposPage`, `TarjetasPage`; si hay detalle real,
  `GrupoDetallePage`.
- Hook `use<Dominio>s`: `useGrupos`, `useTarjetas`.
- Servicio `<dominio>sService.js`: `gruposService.js`, `tarjetasService.js`.
- Props, estados, callbacks y eventos en español: `alAbrir`, `alCerrar`, `alGuardar`,
  `cargando`, `error`, `grupoSeleccionado`.
- Un componente por archivo.

## API pública con index.js

Dentro del feature, los archivos usan `export default`. El `index.js` los publica con
nombre estable:

```js
/**
 * @uso        API pública del feature de tarjetas
 * @funciones  Expone la página y componentes permitidos entre features
 * @datos      Ninguno
 * @eventos    Ninguno
 * @estados    Ninguno
 * @usadoPor   App.jsx y otros features integrados
 */
export { default as TarjetasPage } from "./pages/TarjetasPage";
export { default as TarjetaCard } from "./components/cards/TarjetaCard";
export { default as CrearTarjetaModal } from "./components/modals/CrearTarjetaModal";
export { default as DetalleTarjetaModal } from "./components/modals/DetalleTarjetaModal";
```

- Fuera del feature se importa desde `features/<dominio>`, nunca desde rutas internas.
- Exporta solo lo que otro consumidor necesita. Lo interno no se publica “por si acaso”.
- `index.js` también lleva cabecera JSDoc.

## Integración de rutas

`App.jsx` conserva el nombre del elemento de ruta y resuelve el export público:

```js
const PaginaDashboardTarjetas = lazy(() =>
  import("./features/tarjetas").then(({ TarjetasPage }) => ({ default: TarjetasPage }))
);
```

Mantén la ruta existente y su `Suspense`. Al migrar, elimina el import antiguo y deja
un solo camino; no mantengas la página vieja y la nueva en paralelo.

## Contrato de datos

Patrón de hook:

```js
const [datos, setDatos] = useState([]);
const [cargando, setCargando] = useState(false);
const [error, setError] = useState("");

const cargar = useCallback(async () => {
  if (!usuario?.idUsuario) { setDatos([]); setCargando(false); return; }
  try {
    setCargando(true);
    setError("");
    const respuesta = await obtenerTarjetasPorUsuario(usuario.idUsuario);
    const lista = Array.isArray(respuesta) ? respuesta : respuesta?.data || respuesta?.content || [];
    setDatos(lista.map(normalizarTarjeta));
  } catch (fallo) {
    setDatos([]);
    setError(fallo?.message || "No se pudieron cargar los datos.");
  } finally {
    setCargando(false);
  }
}, [usuario?.idUsuario]);

useEffect(() => { cargar(); }, [cargar]);
```

- Normaliza la respuesta una sola vez (array, `data` o `content`).
- Expón acciones para que la page no mute el estado a mano si pueden vivir en el hook.
- Pasos posteriores a crear/editar/eliminar actualizan la lista o recargan.
- No inventes persistencia: si el backend no está listo, el estado demo debe rotularse.

Patrón de servicio:

```js
import { getEndpoint } from "../../../config/api.config";
import { crear, obtener, actualizar, eliminar } from "../../../services/httpServicio";

const rutaBase = getEndpoint("<dominio>.base");

export function actualizarTarjeta(idTarjeta, tarjeta) {
  return actualizar(`${rutaBase}/${encodeURIComponent(idTarjeta)}`, tarjeta);
}
```

- Nunca `fetch` directo ni URLs hardcodeadas.
- Codifica ids y parámetros.
- No mezcles rutas de otros features en este servicio.

## Modales y foco

- Modales de creación simples (`CrearGrupoModal`, `CrearTarjetaModal`): overlay fijo,
  `FocusTrap`, `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, `tabIndex={-1}`,
  cierre por botón, Esc y clic exterior; `useCierreConEsc({ activo, zIndex: 60, alCerrar })`
  y `useRetornoDeFoco({ activo, triggerRef })`.
- Modales de detalle reutilizan `components/domain/modales/ModalDetalleRegistro`, que ya
  aporta cromo, cierre y foco. No dupliques esa infraestructura.
- La page guarda el disparador en un `ref` y lo pasa como `triggerRef`.
- El modal no cierra mientras `cargando`; el cierre por Esc también respeta ese estado.
- Mantén ids únicos por superficie (`crear-grupo-titulo`, `registro-tarjeta-titulo`).

## Formularios

- Componentes controlados: reciben `valores` y `alCambiar(campo, valor)`.
- `<label>` visible asociado por `htmlFor`/`id`; el placeholder es una ayuda, no la
  etiqueta.
- Errores con `role="alert"` y, si aplica, `aria-invalid` + `aria-describedby`.
- Enfoca el primer campo inválido cuando la validación lo permita.
- No pongas llamadas HTTP en el form; el modal o el hook ejecutan la acción.

## Pruebas

- Ubicación: replica la ruta del módulo bajo `src/test/`. Para un módulo nuevo:
  `src/features/tarjetas/pages/TarjetasPage.jsx` →
  `src/test/features/tarjetas/pages/TarjetasPage.test.jsx`.
- Las suites existentes pueden seguir apuntando a los módulos antiguos mientras dure la
  migración; no las muevas ni las reescribas si el alcance no lo pide.
- Mockea servicios y contexto de usuario; usa `MemoryRouter` solo si el módulo navega.
- Prueba comportamiento visible: carga, vacío, error, crear, editar, eliminar y foco.
- Comandos: `npx vitest run <ruta>`, `npm test`, `npm run build`.

## Migración incremental

1. Identifica el dominio y su ruta actual; anota qué comportamiento no debe cambiar.
2. Crea la carpeta `src/features/<dominio>/` con solo las subcarpetas necesarias.
3. Mueve un archivo a la vez y corrige imports en el mismo paso.
4. Extrae la lógica a `hooks/` y las llamadas a `services/`.
5. Divide la página en card + form + modal.
6. Añade `index.js` y actualiza el consumidor (normalmente `App.jsx`).
7. Añade el `README.md` del feature.
8. Ejecuta pruebas focales y build; después pasa al siguiente feature.
9. Revisa cabeceras JSDoc (`@usadoPor`) y elimina imports muertos o puentes antiguos.

Orden pendiente documentado en `docs/arquitectura-frontend.md`: contactos, luego
contabilidad/correos/configuración/suscripciones, y al final inicio, autenticación,
layouts y rutas.

## README del feature

Mantén el formato corto y real:

```md
# Feature: Tarjetas

## Qué hace

Consulta, registra, edita y elimina tarjetas del usuario. Los datos sensibles se
presentan enmascarados.

## Componentes

- `pages/TarjetasPage`: listado principal de `/dashboard/tarjetas`.
- `components/cards/TarjetaCard`: resumen visual.
- `components/modals/CrearTarjetaModal`: registro y validación.
- `components/modals/DetalleTarjetaModal`: detalle, edición y eliminación.

## Hook y servicio

- `hooks/useTarjetas`: carga y sincroniza el listado.
- `services/tarjetasService`: operaciones HTTP.

## API pública

`index.js` expone `TarjetasPage`, `TarjetaCard` y `CrearTarjetaModal`.
```

## Antipatrones

- Importar `features/x/components/...` desde otro feature o desde `App.jsx`.
- Pages de 300 líneas que hacen fetch, validan, renderizan y manejan foco.
- Cards o forms que llaman servicios.
- Repetir en cada feature la normalización de respuestas o la trampa de foco.
- Crear `shared/` antes de que una pieza la use más de un feature.
- Mover una página sin actualizar imports, `index.js`, rutas o pruebas.
- Duplicar endpoints o usar `fetch` directo.
- Abstraer un “componente genérico” que solo usa un feature.
- Cambiar rutas, textos o diseño como efecto secundario de la migración.

## Checklist de entrega

- [ ] El feature vive en `src/features/<dominio>/` con una responsabilidad clara.
- [ ] `pages/`, `components/`, `hooks/`, `services/` respetan sus límites.
- [ ] Un componente por archivo y nombres con prefijo de dominio.
- [ ] `index.js` exporta solo la API pública.
- [ ] El consumidor importa desde `features/<dominio>`.
- [ ] Los archivos nuevos tienen cabecera JSDoc.
- [ ] El modal respeta foco, Esc, clic exterior y estado `cargando`.
- [ ] El `README.md` describe lo que realmente existe.
- [ ] Pruebas focales y `npm run build` en verde.
- [ ] No se movieron pruebas, rutas ni piezas compartidas fuera del alcance.

## Referencias

- `docs/arquitectura-frontend.md` — contrato y orden de migración.
- `src/features/grupo/` — referencia completa del patrón.
- `src/features/tarjetas/` — segundo ejemplo, incluido el uso de `ModalDetalleRegistro`.
- `AGENTS.md`, `.agents/rules/rules.md` y `.agents/skills/file-hearder-template/SKILL.md`.
