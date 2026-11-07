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

## Límites

- Un componente por archivo, con nombre de dominio y responsabilidad visibles.
- `pages/` coordina vistas; `components/` presenta; `hooks/` gestiona estado de feature; `services/` llama la API; `utils/` contiene transformaciones puras.
- `shared/` se reserva para piezas usadas por más de una funcionalidad.
- `index.js` es el punto de entrada público; las implementaciones internas no se exportan salvo que otro feature necesite consumirlas.
- Las pruebas Vitest permanecen en `src/test/` y reflejan el módulo cubierto.
- Los puentes en las rutas anteriores son temporales y se eliminan al completar la migración de consumidores.

## Migración

1. `grupo` es el feature piloto: listado, hook, tarjeta, formulario, modales y servicio ya están agrupados en `src/features/grupo/`.
2. A continuación se migran contactos y tarjetas, separando el modal genérico actual por dominio.
3. Después se migran contabilidad, correos, configuración y suscripciones.
4. Finalmente se agrupan inicio, autenticación, layouts y rutas; se eliminan puentes antiguos y se revisan dependencias entre features.

Cada etapa conserva las rutas y el comportamiento de usuario. Se valida de forma focal y con build antes de integrar el siguiente dominio.
