# Spec 035 — Agente de chat para FinApp

**Estado: implementada; requiere claves locales para responder** · **Fecha:** 2026-10-30

## Objetivo

Integrar el asistente del dashboard con un modelo NVIDIA y búsqueda pública web, con recuperación de documentación de FinApp. El navegador se comunica solo con `finApp-backend`; las claves nunca llegan al frontend.

## Comportamiento implementado

- `POST /asistente/chat` acepta `{ "mensaje": string, "historial"?: [{"rol":"user|assistant","contenido":string}] }` y devuelve `{ "respuesta": string, "fuentes": [{"id":string,"tipo":string,"titulo":string,"url":string|null}], "busquedaWebUsada": boolean, "aviso": string }`.
- `finApp-web/src/services/asistenteServicio.js` consume el endpoint y `AsistenteAyuda.jsx` muestra sugerencias, conversación efímera, carga, errores, reintento, avisos y fuentes enlazadas. Al cerrar el modal se cancela la petición activa.
- `finApp-backend` recupera hasta tres fragmentos del manual local `src/main/resources/agent/knowledge/finapp.md`. Si la consulta pide actualidad o la documentación no alcanza, consulta Tavily con hasta cuatro resultados y los entrega como contexto no confiable.
- NVIDIA NIM genera una respuesta en español citando las fuentes disponibles. Usa `meta/llama-3.1-8b-instruct` por defecto; endpoint y modelo se pueden cambiar desde el backend.
- Si Tavily no está configurado o falla, el modelo responde con el contexto documental y devuelve un aviso. Si NVIDIA no está configurado o falla, el endpoint devuelve un error recuperable; no genera respuestas simuladas.
- El backend limita el mensaje a 500 caracteres, el historial a ocho turnos de hasta 1.200 caracteres y el endpoint a 12 solicitudes por minuto por IP. Rechaza correos y secuencias que parezcan números de tarjeta. El historial no se persiste.
- El asistente solo responde con documentación de producto y fuentes públicas. No consulta cuentas, datos financieros privados ni ejecuta operaciones.

## Configuración local

Definir en el entorno donde corre `finApp-backend`:

```text
NVIDIA_API_KEY=<clave de NVIDIA NIM>
NVIDIA_MODEL=meta/llama-3.1-8b-instruct
TAVILY_API_KEY=<clave de Tavily>
WEB_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:5500
```

Las claves no se guardan en el repositorio. Para el frontend, `VITE_API_BASE_URL` debe apuntar al backend (por ejemplo `http://localhost:8080`); si queda vacío, el endpoint se resuelve en el mismo origen.

## Proveedores y límites

- NVIDIA NIM: [API de chat](https://docs.api.nvidia.com/nim/reference/llm-apis). El acceso de catálogo gratuito es para prototipos/evaluación y tiene cuotas variables. Antes de servir usuarios en producción se debe confirmar licencia, disponibilidad y coste con NVIDIA ([FAQ](https://forums.developer.nvidia.com/t/nvidia-nim-faq/300317)).
- Tavily Search: [planes y cuotas](https://www.tavily.com/pricing). La cuota gratuita publicada puede cambiar; se deben revisar límites y condiciones vigentes al configurar la cuenta.
- La búsqueda web no se invoca en todas las consultas; la decisión inicial usa términos de actualidad y relevancia documental. Es un criterio heurístico.
- El límite por IP es en memoria del proceso. Producción con múltiples instancias requiere rate limiting compartido y protección de abuso acorde al despliegue.

## Validación del cambio

- Claves de proveedor: no configuradas en el entorno de desarrollo al implementar; la conversación real depende de que el usuario las obtenga y configure.
- Build frontend: pendiente en esta sesión.
- Compilación backend: pendiente de disponibilidad de JDK/Maven.
- Pruebas automatizadas: no ejecutadas.
