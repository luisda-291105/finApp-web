# Feature: Contactos

## Qué hace

Consulta y organiza los contactos financieros del usuario, con alta, edición y eliminación.

## Componentes

- `pages/ContactosPage`: listado principal de `/dashboard/contactos`.
- `components/cards/ContactoCard`: resumen seleccionable de cada persona.
- `components/forms/ContactoForm`: campos de nombre, teléfono y notas.
- `components/modals/CrearContactoModal`: creación vinculada al usuario activo.
- `components/modals/DetalleContactoModal`: detalle, edición y eliminación.

## Hook y servicio

- `hooks/useContactos`: carga y sincroniza el estado CRUD del listado.
- `services/contactosService`: llamadas a los endpoints de contactos.

## API pública

`index.js` expone `ContactosPage`, `ContactoCard` y `CrearContactoModal`; las rutas internas se reservan al feature.
