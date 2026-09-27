# .agents/file-header-template.md

Todo archivo nuevo (componente, hook, config) inicia con este bloque,
resumido al máximo (1 línea por campo cuando sea posible):

```js
/**
 * @uso        Qué problema resuelve este archivo (1 línea)
 * @funciones  Lista corta de funciones/exports principales
 * @datos      Cómo entra/sale la data (props, fetch, transformaciones)
 * @eventos    Eventos que dispara o escucha (onClick, onSubmit, etc.)
 * @estados    useState/useReducer relevantes que maneja
 * @usadoPor   Componentes/páginas que lo consumen
 */
```

## Ejemplo — hook
```js
/**
 * @uso        Detecta si un elemento entró al viewport para animar reveal
 * @funciones  useReveal(ref, options)
 * @datos      Recibe un ref de DOM, no transforma data externa
 * @eventos    IntersectionObserver -> agrega clase "revealed"
 * @estados    isVisible (boolean)
 * @usadoPor   Hero, Stats, Features, ComoFunciona
 */
```

## Ejemplo — config de endpoints
```js
/**
 * @uso        Punto único de acceso a endpoints del backend
 * @funciones  getEndpoint(nombre), API_BASE_URL
 * @datos      Lee de variables de entorno (import.meta.env)
 * @eventos    Ninguno
 * @estados    Ninguno
 * @usadoPor   Cualquier componente/hook que haga fetch
 */
```

Regla: si el archivo crece y el header deja de ser un resumen (>6-7 líneas
de contenido real por campo), el archivo probablemente debe dividirse.
