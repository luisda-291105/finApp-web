# Corrección de tests fallidos

## Objetivo

Dejar la suite Vitest compatible con el comportamiento actual de FinApp y sus contratos de servicios. Corregir expectativas obsoletas y mocks incompletos; cambiar código de producción solo si la investigación confirma una regresión frente a una spec vigente.

## Línea base

Ejecución de `npm run test` en `finApp-web` el 2026-10-29:

- 42 archivos: 33 pasaron y 9 fallaron.
- 570 tests: 557 pasaron y 13 fallaron.
- Además, `PaginaDashboardBolsillos.test.jsx` no pudo cargar porque al mock de `grupoServicio` le falta la exportación `crearGrupo`.
- Resultado total: 14 fallos entre tests y carga de suite.

## Archivos incluidos

1. `src/test/App.test.jsx` — 3 fallos: las aserciones de tarjetas siguen esperando el panel de demostración retirado; la sección de transacciones busca una copia ambigua del mismo texto.
2. `src/test/layout/AsistenteDashboard.test.jsx` — 1 fallo: busca el nombre accesible antiguo «Abrir cuenta de usuario» en el control dinámico de cuenta.
3. `src/test/pages/PaginaDashboardBolsillos.test.jsx` — suite no cargada: el mock usa `obtenerGrupos` aunque la página importa `obtenerGruposPorUsuario`, y tampoco exporta `crearGrupo`, requerido al cargar `ModalRegistroEntidad`.
4. `src/test/pages/PaginaDashboardConfiguracion.test.jsx` — 1 fallo: busca un campo «Correo electrónico» que el modal actual no ofrece; el formulario usa tipo y contenido de fuente, y obtiene el usuario del contexto.
5. `src/test/pages/PaginaDashboardContactos.test.jsx` — 1 fallo: espera una vista de demostración sin acciones ni registros, en conflicto con la consulta GET y las tarjetas de contactos.
6. `src/test/pages/PaginaDashboardCorreos.test.jsx` — 1 fallo: espera una vista de demostración sin lista, en conflicto con la bandeja Gmail y sus filas/categorías.
7. `src/test/components/domain/modales/AuthModal.test.jsx` — 4 fallos iniciales: dos pruebas buscaban un campo de correo que el formulario actual no renderiza; otras dos confirmaron una regresión real de AC-22: `AuthModal` borraba los campos al cerrar, pese a que la spec 010 exige conservarlos.
8. `src/test/components/domain/modales/ModalFuentes.test.jsx` — 1 fallo: espera ingresar la identificación del usuario en el modal; el usuario activo debe suministrarse mediante contexto.
9. `src/test/components/domain/modales/ModalPerfil.test.jsx` — 1 fallo: `ModalPerfilUsuario` importa `crearUsuario` y `actualizarUsuario`, pero el mock de `usuarioServicio` solo exporta `actualizarUsuario`; el error esperado no llega al modal.

## Criterios de aceptación

- Las pruebas conservan cobertura de navegación, formularios, cierre, foco y mensajes de error según el comportamiento actual.
- Las páginas de tarjetas, contactos y correos verifican estados de carga, error, vacío y datos registrados con servicios simulados por usuario.
- Los mocks incluyen todas las exportaciones consumidas por el módulo importado o usan mocks parciales seguros.
- No se cambian componentes de producción para recuperar expectativas que contradigan las specs vigentes.
- `AuthModal` conserva identificación, nombre y contraseña al cerrar y reabrir, según AC-22 de la spec 010.
- `npm run test` pasa completo: 583/583 tests en 43 archivos; `npm run build` también pasa.

## Fuera de alcance

No implementar persistencia ni endpoint de transacciones. No ampliar features de Gmail, perfil, grupos o fuentes; esta spec solo corrige sus pruebas asociadas a los fallos reportados.
