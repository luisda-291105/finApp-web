---
name: api-endpoints
description: Guía de acceso centralizado a endpoints de backend mediante src/config/api.config.js.
---

# SKILL: api-endpoints

Acceso centralizado a backend.

## reglas
- Único punto de acceso: `src/config/api.config.js`
- Prohibido hardcodear URLs/fetch en componentes
- Nuevo endpoint -> registrar en `ENDPOINTS`, consumir con `getEndpoint(path)`

## archivo
`src/config/api.config.js`
