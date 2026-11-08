# Feature: Contactos

## Qué hace

Consulta y organiza los contactos financieros del usuario, con alta, edición y eliminación.
También permite consultar Google Contacts con una cuenta Gmail ya registrada y seleccionar contactos para importarlos a FinApp. Google solicita el permiso `contacts.readonly` al autorizar la integración; el identificador estable de cada contacto queda en el campo `origen` de la tabla existente para evitar duplicados.

## Componentes

- `pages/ContactosPage`: listado principal de `/dashboard/contactos`.
- `components/cards/ContactoCard`: resumen seleccionable de cada persona.
- `components/forms/ContactoForm`: campos de nombre, teléfono y notas.
- `components/modals/CrearContactoModal`: creación vinculada al usuario activo.
- `components/modals/DetalleContactoModal`: detalle, edición y eliminación.
- `components/ContactosToolbar`: acciones principales, búsqueda de escritorio y botones compactos móviles.
- `components/ContactosLista`: estados de carga/vacío/error y tarjetas de contactos.
- `components/BuscarContactosModal`: búsqueda y selección de resultados.
- `components/FiltrarContactosOrigenModal`: filtro por fuente de origen.
- `components/ImportarContactosGoogle`: selección e importación desde Google Contacts.

## Hook y servicio

- `hooks/useContactos`: carga y sincroniza el estado CRUD del listado.
- `services/contactosService`: llamadas a los endpoints de contactos.

## API pública

`index.js` expone `ContactosPage`, `ContactoCard` y `CrearContactoModal`; las rutas internas se reservan al feature.
