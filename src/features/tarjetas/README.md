# Feature: Tarjetas

## Qué hace

Consulta, registra, edita y elimina tarjetas del usuario. Los datos sensibles se presentan enmascarados; el detalle no muestra CVV ni el número completo.

## Componentes

- `pages/TarjetasPage`: listado principal de `/dashboard/tarjetas`.
- `components/cards/TarjetaCard`: resumen visual con número enmascarado.
- `components/modals/CrearTarjetaModal`: formulario específico de registro y validación.
- `components/modals/DetalleTarjetaModal`: detalle, edición y eliminación.

## Hook y servicio

- `hooks/useTarjetas`: carga y sincroniza el estado del listado.
- `services/tarjetasService`: operaciones HTTP de tarjetas.

## API pública

`index.js` expone `TarjetasPage`, `TarjetaCard` y `CrearTarjetaModal`; las rutas internas se reservan al feature.
