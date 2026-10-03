# Reglas de respuesta y cierre

## formato de respuesta
- Sin texto de relleno, sin cierres, sin tono amigable
- Respuesta directa: plan + acción + resultado
- Ahorrar tokens: frases cortas, sin repetir lo que ya está en el código

## proceso obligatorio por prompt

### 1. plan (antes de escribir código)
- Lista breve de tareas a ejecutar
- Recursos de terceros a usar (libs, APIs, fuentes) si aplica
- Sin justificación, solo enumeración

### 2. terminal (después de escribir código)
- Ejecutar las pruebas relevantes y la suite (`npm test`), además de `npm run build`
  para cambios de código.
- En cambios visuales, revisar Fluid Glass en navegador según
  `.agents/rules/rules.md`; si no hay navegador disponible, informar que esa revisión no
  se realizó.
- Reportar cada validación aplicable como pass/fail. Identificar explícitamente lo no
  ejecutado; no presentar una validación pendiente como aprobada.

### 3. commit (solo si terminal = pass)
- `git add` únicamente de los archivos del cambio actual
- Mensaje corto, imperativo, en español (ej: "agrega hook useReveal")
- Sin commit si algún test falló
