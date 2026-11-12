# Feature: Contabilidad

## Qué hace

Administra los bolsillos del usuario, sus resúmenes y los movimientos financieros.

## Estructura

- `pages/ContabilidadPage`: compone la vista de `/dashboard/contabilidad`.
- `components/cards/BolsilloCard`: plantilla visual reutilizable para mostrar bolsillo, resumen y acciones.
- `components/cards/MovimientoItem`: presentación individual de un movimiento y sus acciones.
- `components/modals/DetalleMovimientoModal`: modal de lectura con la información del movimiento seleccionado.
- `hooks/useContabilidad`: carga datos y coordina filtros, formularios y acciones CRUD.
- `utils/contabilidadHelpers`: tipos base, etiquetas, filtros y saldos presentados por la vista.
- `components/modals/ModalBolsillo`: crea, edita y elimina bolsillos.
- `components/modals/ModalCrearMovimientoContable`: registra o edita movimientos.
- `components/feedback/RespuestaMovimiento`: muestra resultados accesibles de las acciones contables.
- `services/bolsillosService` y `services/movimientosService`: llamadas API del feature.
- `index.js`: API pública usada por el mapa de rutas.

La plantilla visual del bolsillo y la fila de movimiento están separadas en `components/cards/`. Los formatos de moneda y fecha, las etiquetas y los filtros compartidos por la página viven en `utils/contabilidadHelpers`.

Los bolsillos fijos «Ingresos» (INGRESO) y «Gastos» (GASTO) los crea y mantiene el backend en el listado: siempre existen, están activos, aparecen primero, se consolidan si hay duplicados del mismo nombre y no se pueden editar ni eliminar. En la cuadrícula se muestran en una sola card dividida (`components/cards/BolsillosFijosCard`): cada mitad registra un movimiento con el bolsillo preseleccionado. La regla compartida vive en `esBolsilloFijo` (`utils/contabilidadHelpers`), igual que en el backend (`SBolsillo.esFijo`). El botón «Nuevo movimiento» los reconoce como bolsillos y el tipo del movimiento se toma de ellos.
