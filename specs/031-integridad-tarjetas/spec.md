# Spec 031 — Integridad de los datos de tarjetas

**Estado: implementada** · **Fecha:** 2026-10-30

## Propósito

Corregir la captura y validación de tarjetas registradas: titular textual,
número de dígitos, vencimiento en mes/año y CVV numérico de tres dígitos. Retirar
la selección de tema visual del formulario.

## Alcance

- Cambia el formulario de alta de tarjetas y el formato de vencimiento mostrado
  en las tarjetas recuperadas.
- El vencimiento se captura como `MM/AA` y se transforma a `YYYY-MM-01` para
  mantener compatibilidad con el `LocalDate` del backend.
- El formulario deja de ofrecer opciones de tema visual. Como el modelo actual
  del backend requiere `colorTema`, se envía internamente un valor fijo por
  compatibilidad; no aparece en el formulario ni determina la tarjeta mostrada.
- El detalle de una tarjeta registrada reutiliza el flip de
  `MiTarjetaVirtual`. Mantiene oculto el CVV y el número completo conforme a la
  spec 029.

## Requisitos funcionales

- **RF1. Titular:** debe ser texto no vacío después de quitar espacios al inicio
  y al final.
- **RF2. Número:** debe contener únicamente dígitos, con longitud entre 14 y 19.
  No se aceptan espacios ni guiones. La regla de Luhn anterior queda retirada
  para este flujo.
- **RF3. Vencimiento:** el campo se etiqueta «Vencimiento (MM/AA)» y acepta un
  mes de `01` a `12` seguido de dos dígitos de año. Solo acepta el mes actual o
  uno posterior.
- **RF4. Persistencia del vencimiento:** el valor `MM/AA` se serializa como
  `20AA-MM-01`, formato compatible con el campo `LocalDate` del backend.
- **RF5. Lectura del vencimiento:** las fechas ISO `YYYY-MM-DD` o `YYYY-MM` se
  presentan como `MM/AA` en la tarjeta y su detalle.
- **RF6. CVV:** debe contener exactamente tres dígitos; no se aceptan letras ni
  longitudes de tres o cuatro como alternativa.
- **RF7. Error de validación:** cada dato inválido identifica su campo, lo
  marca con `aria-invalid`, anuncia el mensaje y evita el envío.
- **RF8. Tema visual:** el formulario no presenta selector de tema y el modal
  registrado no utiliza el `colorTema` guardado en tarjetas antiguas.
- **RF9. Flip del detalle:** la tarjeta dentro del modal registrado permite
  voltear con clic/toque y teclado para ver el reverso; conserva el CVV vacío y
  el número enmascarado.

## Criterios de aceptación

1. Valores inválidos de titular, número, vencimiento o CVV bloquean el POST y
   muestran un error asociado al campo.
2. `12/30` pasa a `2030-12-01` en el payload; un formato que no sea `MM/AA` o un
   mes anterior al mes actual es rechazado.
3. Los números con menos de 14, más de 19 dígitos o caracteres no numéricos
   son rechazados.
4. CVV de dos o cuatro dígitos o con caracteres no numéricos es rechazado.
5. Las tarjetas existentes con vencimiento ISO se muestran como `MM/AA` y no
   aparecen opciones de tema visual en el formulario.
6. La tarjeta del modal registrado puede voltear y volver al frente; el detalle
   no muestra CVV ni número completo.

## Relación con la spec 029

Esta spec reemplaza exclusivamente la regla de validación de tarjetas de
`specs/029-mostrar/spec.md`: deja sin efecto la longitud 13–19 con Luhn, el
vencimiento como fecha completa y CVV de 3–4 dígitos. Los demás requisitos de
la spec 029 permanecen vigentes.
