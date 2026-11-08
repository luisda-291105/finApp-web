# Feature: Asistente IA

## Qué hace

Ofrece el asistente informativo de FinApp en la landing y en el dashboard. Responde preguntas sobre las funciones documentadas de la app y no consulta datos personales ni ejecuta operaciones. El historial vive solo en memoria y desaparece al cerrar o recargar la página.

## Componentes

- `components/modals/AsistenteAyudaModal`: interfaz del chat, sugerencias, estados de carga/error y acciones del asistente.
- `index.js`: API pública que exporta el modal para los consumidores de la aplicación.

## Lógica y servicios

- `hooks/useAsistenteHistorial`: administra temporalmente los mensajes del chat en memoria.
- `services/asistenteServicio`: envía preguntas informativas al backend.

## Consumidores y dependencias

- `LandingPage` y `DashboardLayout` abren el modal desde sus respectivos disparadores.
- El modal reutiliza controles de `components/ui` y hooks globales de teclado, gesto y retorno del foco.
- El servicio usa la configuración común de endpoints en `src/config/api.config`.
