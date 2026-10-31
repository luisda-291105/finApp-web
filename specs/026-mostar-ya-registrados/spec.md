# Mostrar registros existentes

## Alcance

Consumir los endpoints GET por usuario y mostrar los registros existentes:

- Tarjetas: presentación en tarjetas visuales, ocultando el número salvo los últimos cuatro dígitos y sin mostrar el CVV.
- Contactos: presentación en tarjetas visuales.
- Correos: mensajes de Gmail en filas, filtrables por categoría, usando las fuentes de correo registradas.
- Configuración: titular «Fuentes registradas» y descripción «Consulta y administra las fuentes asociadas a tu usuario.»

Las transacciones quedan fuera de esta spec porque el backend todavía no ofrece un endpoint GET ni un modelo para esos registros. Se abordarán en otra spec.
