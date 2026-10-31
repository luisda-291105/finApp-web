# Spec 034 — Temas y consistencia de tarjetas

**Estado: implementada** · **Fecha:** 2026-10-30

## Propósito

Corregir la normalización del vencimiento al salir del campo, homogeneizar el
color de tarjetas listadas y añadir una preferencia persistente de tema oscuro.

## Requisitos

- Mientras se escribe, el campo permite un mes de uno o dos dígitos; al perder
  el foco agrega el cero inicial si el mes tiene un dígito y automatiza `/`.
- La tarjeta del listado mantiene el estilo frontal de `MiTarjetaVirtual` en
  el detalle.
- El frente de las tarjetas del listado y del detalle usa fondo transparente y
  borde visible, conservando texto y datos; el reverso mantiene su fondo.
- Configuración ofrece un switch accesible entre modo claro (actual) y oscuro.
  La preferencia se conserva en `localStorage` y aplica estilos a las vistas de
  FinApp.
- El sidebar de escritorio y el menú lateral móvil siguen el modo elegido:
  superficie clara y texto oscuro en tema claro; superficie y texto claros en
  modo oscuro.

## Verificación

- Build de producción y `git diff --check`.
- Build de producción correcto; `git diff --check` correcto.
- La revisión en navegador no se pudo iniciar: Computer Use no identificó con
  suficiente confianza la URL actual de Brave.
- Pruebas automatizadas no ejecutadas.
