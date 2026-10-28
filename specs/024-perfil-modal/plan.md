# Plan — Spec 024: Modal de perfil

## Objetivo
Crear y desplegar el modal de perfil de usuario, actualizar referencias y pruebas, y garantizar la compilación.

## Arquitectura propuesta
1. **Nuevo componente** `src/components/domain/modales/ModalPerfilUsuario.jsx` que extiende `ModalCrearUsuario` con ajustes de datos y edición limitada.
2. **Estado local** en `src/components/pages/PaginaDashboardConfiguracion.jsx` para controlar apertura y modo edición del modal.
3. **Enlaces de contexto**: `UsuarioActivoContext` es la fuente de datos del usuario activo. El modal recibe su data como prop `usuario` y mantiene `idUsuario` sin modificación.
4. **Propiedades de cierre**: `unsetFocusTrap`, `useCierreConEsc`, y `useDeslizarParaCerrar` son los encargados de la lógica de cierre.
5. **Pruebas**: Se crearán pruebas en `src/test/components/` siguiendo la convención de Vitest, cubriendo apertura, interacción, cierre y guardado.

## Decisiones y justificación
- Se reutiliza el código de `ModalCrearUsuario` para evitar duplicar lógica de modal y mantener consistencia visual.
- El modal tendrá un único `id` para evitar conflictos de DOM.
- Se evita hardcoding de URLs; `usuarioServicio.actualizarUsuario` proviene de `src/services/usuario.js`.

## Objetivos de pruebas
- Verificar apertura del modal con los datos correctos.
- Validar que la edición solo habilita Cédula, Nombre y Contraseña.
- Confirmar que se hace una llamada PUT con la payload correcta.
- Asegurar cierre con Escape y clic fuera.
- Garantizar que `vitest run` y `npm run build` pasan sin errores.

## Plan de trabajo (7 pasos)
1. **Crear y configurar `ModalPerfilUsuario.jsx`**.
2. **Actualizar referencias** en `PaginaDashboardConfiguracion`.
3. **Agregar pruebas: apertura e interacción**.
4. **Agregar pruebas: cierre**.
5. **Agregar pruebas: guardado**.
6. **Ejecutar Vitest**.
7. **Validar build**.