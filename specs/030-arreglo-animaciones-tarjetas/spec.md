# Spec 030 — Animación y adelgazamiento de tarjetas registradas

**Estado: implementada (inventario sin eliminaciones verificadas)** · **Fecha:** 2026-10-30

## Propósito

Aplicar a las tarjetas registradas de `/dashboard/tarjetas` la respuesta de
interacción que ya usa el dominio de dashboard, y adelgazar el proyecto
eliminando únicamente recursos sin referencias verificables.

## Alcance

- Las tarjetas registradas conservan su contenido, presentación, activación del
  detalle y comportamiento responsive.
- Al apuntar con un dispositivo que soporte hover, cada tarjeta sube 4 px; al
  presionarla, reduce su escala a 0.99. La interacción usa los mismos valores
  que `MiTarjetaVirtual` en `src/components/domain/dashboard/`.
- `prefers-reduced-motion` desactiva hover y tap animados.
- La revisión de adelgazamiento considera código fuente, estilos, recursos
  estáticos y dependencias. Solo se elimina un recurso cuando no tiene
  referencias desde código de producción, pruebas, configuración ni
  documentación vigente.
- No se eliminan funciones de demostración que siguen referenciadas por pruebas
  o por la rama de detalle; requieren una spec de retiro si se decide retirarlas.

## Fuera de alcance

- Cambios al modelo o carga de tarjetas registradas, al modal de detalle y a sus
  datos.
- Nuevas dependencias, animaciones de entrada/scroll, cambios de diseño o
  limpieza masiva de artefactos generados e ignorados por Git.

## Requisitos funcionales

- **RF1.** Cada tarjeta registrada usa una superficie animable con elevación
  (`y: -4`) en hover y escala (`0.99`) en tap, sin cambiar su acción de apertura
  ni su nombre accesible.
- **RF2.** Con movimiento reducido activo no se aplican las animaciones de hover
  ni tap.
- **RF3.** La animación sigue los patrones y tiempos existentes en
  `src/components/domain/dashboard/MiTarjetaVirtual.jsx`; no añade una librería.
- **RF4.** La poda de recursos requiere ausencia de referencias en producción,
  pruebas, configuración y documentación vigente. Las referencias históricas
  obsoletas se documentan antes de borrar.

## Criterios de aceptación

1. Las tarjetas registradas mantienen contenido, detalle y activación con
   teclado; hover eleva y tap comprime la tarjeta.
2. Con `prefers-reduced-motion`, ambas interacciones animadas quedan desactivadas.
3. No se añade ninguna dependencia.
4. Los recursos analizados y su decisión de conservarlos quedan documentados;
   no se retira un recurso con referencias activas.

## Evidencia de adelgazamiento

En la revisión inicial no se encontraron imágenes o fuentes locales ni
dependencias directas sin importaciones. Los componentes de tarjetas de
demostración tienen pruebas dedicadas y la rama no registrada de `ModalTarjeta`
consume su fixture y el log; no se consideran recursos sin uso bajo RF4. La
carpeta `dist/` es salida generada e ignorada por Git.
