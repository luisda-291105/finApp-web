# Spec 033 — Validación y formato de tarjetas

**Estado: implementada** · **Fecha:** 2026-10-30

## Propósito

Corregir la captura de vencimiento y CVV, y retirar `colorTema` del contrato
vigente entre `finApp-web` y `finApp-backend`.

## Requisitos

- El vencimiento se captura como mes y año (`MM/AA`), completa con cero los
  meses de un dígito y agrega `/` automáticamente al terminar el mes.
- Solo se admiten meses `01` a `12`; el calendario determina que el mes tenga
  entre 28 y 31 días. El vencimiento actual o futuro se serializa a
  `YYYY-MM-01`.
- Número de tarjeta y CVV filtran caracteres no numéricos mientras se escribe.
  El CVV debe contener exactamente tres dígitos.
- `colorTema` se elimina del payload web, entidad y servicio Java, y ejemplos
  HTTP del backend.
- El directorio heredado `finApp-web/backend` aparece eliminado en el árbol de
  trabajo; `finApp-backend` es el backend fuente activo.

## Migración de base de datos

La aplicación configura Hibernate con `ddl-auto=update`, que no elimina la
columna antigua automáticamente. Se incluye
`finApp-backend/sql/eliminar-color-tema-tarjetas.sql` para eliminar
`color_tema` de la tabla existente. El script no se ejecutó contra ninguna base
de datos.

## Verificación

- Revisión estática de las referencias de `colorTema` en el código fuente.
- Build de producción frontend correcto.
- `git diff --check` correcto en ambos repositorios.
- La compilación Maven no pudo ejecutarse porque `JAVA_HOME` no está definido.
- Pruebas automatizadas no ejecutadas.
