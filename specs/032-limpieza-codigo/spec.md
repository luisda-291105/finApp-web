# Spec 032 — Limpieza de código sin uso

**Estado: implementada** · **Fecha:** 2026-10-30

## Propósito

Retirar código de FinApp Web que no participa en la aplicación vigente y reducir
comentarios obsoletos o que solo repiten lo que el código ya expresa.

## Alcance

- Revisar referencias desde `src/main.jsx`, `src/App.jsx`, rutas activas,
  consumidores de servicios y pruebas vigentes.
- Retirar los layouts, servicios y flujo demo de tarjetas que no forman parte del
  recorrido actual de la aplicación.
- Conservar el registro de tarjetas reales del usuario, su detalle compartido y
  el flip de `MiTarjetaVirtual` activo dentro del modal.
- Quitar de `MiTarjetaVirtual` variantes y modos que solo servían al flujo demo
  retirado; mantener su interacción vigente, accesibilidad y movimiento reducido.
- Retirar pruebas que solo cubrían el flujo demo eliminado y actualizar las
  pruebas transversales para que apunten a tarjetas registradas.
- Reducir comentarios redundantes u obsoletos en los módulos modificados,
  conservando headers requeridos y notas que documenten una decisión no obvia.
- Eliminar texto marcador accidental visible en el detalle.

## Recursos que se retiran

El mapa de rutas de `App.jsx` no incluye estos módulos y no hay consumidores de
producción:

- `src/layout/AuthLayout.jsx`.
- `src/services/fuenteServicioAxios.js` (la app usa `fuenteServicio.js`).
- El panel demo no enrutable y sus piezas: `PanelTarjetas.jsx`,
  `AcordeonTarjetas.jsx`, `GridTarjetas.jsx`, `LogMovimientos.jsx` y
  `src/data/tarjetasDemo.js`.
- El modo de movimientos y cierre animado del modal demo de tarjetas; el modal
  registrado conserva `ModalDetalleRegistro` y `MiTarjetaVirtual`.

Los datos ficticios solo usados por esos recursos y sus pruebas específicas se
retiran. Las specs anteriores quedan como historial y esta spec documenta el
retiro del comportamiento demo.

## Requisitos funcionales

- **RF1. Código activo:** cada módulo de producción restante tiene al menos un
  consumidor desde la entrada/rutas activas, o es configuración/estilo requerido
  por dichas rutas.
- **RF2. Tarjetas:** `/dashboard/tarjetas` conserva el listado registrado,
  apertura/cierre accesible del detalle, flip 3D en el modal y movimiento
  reducido. El reverso sigue sin exponer CVV y el número completo.
- **RF3. Registro:** se mantienen las validaciones y el vencimiento `MM/AA` de
  la spec 031; el formulario no recupera el selector de tema visual.
- **RF4. Pruebas:** no quedan pruebas que monten módulos eliminados ni harnesses
  con rutas que la app ya no ofrece.
- **RF5. Comentarios:** se conservan headers JSDoc del proyecto y explicaciones
  de privacidad, accesibilidad, foco o compatibilidad; se quitan narraciones
  duplicadas, instrucciones obsoletas y comentarios de componentes eliminados.
- **RF6. Dependencias:** se conservan las dependencias usadas por código o
  configuración activa; no se añaden herramientas para limpiar.

## Criterios de aceptación

1. Los módulos retirados no aparecen en imports activos ni en rutas de pruebas
   vigentes.
2. La tarjeta registrada aún abre su detalle común y permite girar en el modal;
   el flip conserva el CVV oculto.
3. No se borra el cambio manual de espaciado en el reverso de `MiTarjetaVirtual`.
4. Se eliminan referencias a `PanelTarjetas`, sus datos demo y el modo demo de
   `ModalTarjeta` de pruebas activas y cabeceras de código.
5. El build de producción pasa y `git diff --check` queda limpio.

## Exclusiones

- No se borran specs históricas, datos persistidos, endpoints del backend, estilos
  globales utilizados por vistas activas, ni módulos alcanzables desde rutas.
- No se cambia la experiencia de registro ni las interacciones del dashboard
  ajenas al código identificado como obsoleto.

## Resultado

- Retirados `AuthLayout`, `fuenteServicioAxios` y el panel demo de tarjetas con
  sus componentes, datos y pruebas específicas.
- `ModalTarjeta` ahora representa únicamente tarjetas registradas y conserva el
  modal común y el giro 3D con CVV oculto.
- `MiTarjetaVirtual` ya no expone props/modos del flujo demo ni tema configurable;
  mantiene accesibilidad, movimiento reducido y el espaciado manual del reverso.
- El harness del asistente ya no monta la antigua ruta demo; las pruebas
  transversales usan una tarjeta registrada.
- Referencias residuales a módulos eliminados: ninguna en `src`; se mantiene
  `colorTema: "azul"` únicamente como campo de compatibilidad del POST requerido
  por el backend.
- Verificación: `npm run build` correcto y `git diff --check` limpio (solo aviso
  de conversión LF/CRLF en `ModalTarjeta.jsx`). No se ejecutaron pruebas.
