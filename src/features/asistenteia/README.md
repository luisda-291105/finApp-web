# Feature: Asistente IA

## Qué hace

Ofrece el asistente informativo público en la landing y el asistente personal en el dashboard. La landing solo explica funciones; dentro del dashboard autenticado, consulta datos propios y propone operaciones limitadas a la sesión, que requieren confirmación explícita. El historial del asistente personal se guarda en el almacenamiento local del navegador, separado por usuario, y permite reabrir hasta 30 sesiones recientes.

## Componentes

- `components/modals/AsistenteAyudaModal`: interfaz del chat, sugerencias, estados de carga/error y acciones del asistente.
- `index.js`: API pública que exporta el modal para los consumidores de la aplicación.

## Lógica y servicios

- `hooks/useAsistenteHistorial`: administra y persiste sesiones locales del asistente personal; excluye tokens temporales de confirmación.
- `services/asistenteServicio`: envía preguntas al endpoint público o personal y confirma operaciones propuestas.

## Consumidores y dependencias

- `LandingPage` y `DashboardLayout` abren el modal desde sus respectivos disparadores.
- El modal reutiliza controles de `components/ui` y hooks globales de teclado, gesto y retorno del foco.
- El servicio usa la configuración común de endpoints en `src/config/api.config`.
