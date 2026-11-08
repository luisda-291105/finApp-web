# Arquitectura frontend por funcionalidades

## Propósito

Agrupar el código por funcionalidad para que una página, sus componentes y sus reglas de negocio se encuentren juntos. Cada feature ofrece una API pública desde `index.js`; el resto de la aplicación evita importar rutas internas.

## Estructura

```text
src/
  features/
    grupo/
      components/
        cards/
        forms/
        modals/
      hooks/
      pages/
      services/
      utils/
      index.js
      README.md
    usuarios/
    asistenteia/
    tarjetas/
    contabilidad/
    contactos/
  shared/
    components/
    hooks/
  layouts/
  routes/
  App.jsx
```

En el estado actual del repositorio, los componentes compartidos siguen en `src/components`, los hooks comunes en `src/hooks`, los servicios HTTP en `src/services` y el mapa de rutas en `src/App.jsx`. La migración los puede trasladar gradualmente a `shared/`, `layouts/` y `routes/` cuando cada import quede actualizado.

`src/components/ui` conserva el catálogo compartido de interfaz y publica sus componentes desde `index.js`. Los componentes que terminan siendo exclusivos de un feature se trasladan a ese feature; por ejemplo, los mensajes de movimientos están en `features/contabilidad/components/feedback`.

## Límites

- Un componente por archivo, con nombre de dominio y responsabilidad visibles.
- `pages/` coordina vistas; `components/` presenta; `hooks/` gestiona estado de feature; `services/` llama la API; `utils/` contiene transformaciones puras.
- `shared/` se reserva para piezas usadas por más de una funcionalidad.
- `index.js` es el punto de entrada público; las implementaciones internas no se exportan salvo que otro feature necesite consumirlas.
- Las pruebas Vitest permanecen en `src/test/` y reflejan el módulo cubierto.
- Los puentes en las rutas anteriores son temporales y se eliminan al completar la migración de consumidores.

## Migración

1. `grupo`, `tarjetas`, `contactos`, `correos`, `contabilidad`, `suscripciones`, `inicio`, `configuracion`, `auth`, `landing`, `error` y `asistenteia` están agrupados en `src/features/`, con página, componentes específicos y README.
2. Después se migran layouts y rutas.
3. Finalmente se revisan dependencias entre features y se retiran los puentes restantes.

Cada etapa conserva las rutas y el comportamiento de usuario. Se valida de forma focal y con build antes de integrar el siguiente dominio.
