# .agents/response-rules.md

## formato de respuesta
- Sin texto de relleno, sin cierres, sin tono amigable
- Respuesta directa: solo plan + acción + resultado
- Ahorrar tokens: frases cortas, sin repetir lo que ya está en el código

## proceso obligatorio por prompt

### 1. plan (antes de escribir código)
- Lista breve de tareas a ejecutar
- Recursos de terceros a usar (libs, APIs, fuentes) si aplica
- Sin justificación, solo enumeración

### 2. terminal (después de escribir código)
- Ejecutar test de cada funcionalidad nueva
- Validar que no rompe el diseño Fluid Glass existente (blur, radius,
  paleta, capas de vidrio, límites de `.agents/rules.md`)
- Reportar solo: test ejecutado -> resultado (pass/fail)

### 3. commit (solo si terminal = pass)
- `git add` únicamente de los archivos creados/modificados en el prompt
- Mensaje corto, imperativo, en español (ej: "agrega hook useReveal")
- Sin commit si algún test falló
