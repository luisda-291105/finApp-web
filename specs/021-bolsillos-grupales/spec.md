# Spec 021 — Bolsillos Grupales y Reasignación de Icono de Contactos

**Estado:** aprobada e implementada (2026-10-21)

## 1. Propósito

Proporcionar a los usuarios una nueva vista en el Dashboard dedicada a la gestión y visualización de «Bolsillos Grupales», permitiendo a equipos compartir fuentes financieras, consultar balances colectivos, ver miembros asignados y simular la acción de compartir entradas o invitar colaboradores. Asimismo, reasignar el icono de navegación de «Contactos» por un icono representativo de libreta/lista de contactos (`Contact`), liberando el icono de personas (`Users`) para identificar los «Bolsillos Grupales».

## 2. Alcance

### Incluido
- Creación de la página `/dashboard/bolsillos` («Bolsillos Grupales») dentro de la navegación autenticada del Dashboard.
- Incorporación del enlace a «Bolsillos» en la navegación lateral (`SidebarNavContenido`) con el icono de personas (`Users`).
- Reemplazo del icono del enlace «Contactos» en la navegación lateral y en el BottomNav adaptativo por el icono de libreta de contactos móviles (`Contact`).
- Vista interactiva de demostración para «Bolsillos Grupales» que incluye:
  - Resumen métrico: Balance total agrupado, aportes del ciclo y número de bolsillos activos.
  - Tarjetas de bolsillos de equipo (ej. «Gastos de Oficina», «Fondo Común de Viaje», «Proyectos Compartidos») con balance individual, fuentes asociadas, barra de progreso y avatares de participantes.
  - Botón de acción rápida «Compartir entrada» / «Copiar enlace de invitación» con retroalimentación visual accesible.
  - Botón de acción para «Nuevo bolsillo grupal» (disparador demostrativo accesible).
- Preservación del diseño Fluid Glass, tokens semánticos de FinApp (`emerald-primary`, `bg-cream`, `bg-dark`, `mint-accent`), navegación accesible y safe-area.

### Fuera de alcance
- Persistencia en base de datos real o backend (FinApp opera actualmente en modo demostración interactiva sin backend).
- Integración con pasarelas de pago o APIs bancarias externas reales.
- Sistema de mensajería o chat interno dentro de los bolsillos.

## 3. Convenciones existentes y compatibilidad
- La arquitectura del dashboard organiza páginas en `src/pages/` y las rutas en `src/App.jsx` bajo el layout `DashboardLayout`.
- La navegación se define de forma centralizada en `src/components/layout/SidebarNavContenido.jsx` y se adapta responsivamente en `src/components/layout/BottomNav.jsx`.
- Las pruebas se ubican en `src/test/` con Vitest y React Testing Library.

## 4. Casos límite
- **Bolsillo sin movimientos o vacío:** La interfaz debe mostrar un estado visual claro cuando un bolsillo no tenga fuentes asignadas o su balance sea cero.
- **Lista extensa de miembros:** Cuando un equipo cuente con más de 4 participantes, los avatares deben agruparse con un contador restante accesible (+N) sin desbordar las tarjetas.
- **Viewport móvil estrecho (<375px):** Las tarjetas y el resumen deben apilarse verticalmente asegurando legibilidad sin desbordamiento horizontal.
- **Acción de compartir en entornos sin API de portapapeles:** Se debe gestionar de forma segura la copia o simulación de enlace sin provocar errores de ejecución.

## 5. Requisitos funcionales (EARS)

- **RF-01 — Ruta de Bolsillos Grupales:** EL SISTEMA DEBE disponer de una ruta `/dashboard/bolsillos` dentro del layout principal del dashboard, accesible al navegar directamente o mediante la barra lateral.
- **RF-02 — Navegación e Iconografía:**
  - CUANDO se renderice la navegación lateral, EL SISTEMA DEBE mostrar «Bolsillos» utilizando el icono de grupo de personas (`Users`).
  - CUANDO se renderice la navegación de «Contactos» en el sidebar o en el BottomNav responsivo, EL SISTEMA DEBE utilizar el icono de lista/libreta de contactos (`Contact`).
- **RF-03 — Resumen Métrico Colectivo:** CUANDO el usuario acceda a `/dashboard/bolsillos`, EL SISTEMA DEBE mostrar un bloque de resumen con el balance consolidado grupal y métricas clave de los bolsillos activos.
- **RF-04 — Listado de Bolsillos de Equipo:** EL SISTEMA DEBE listar las tarjetas de bolsillos grupales con su nombre, balance disponible, fuente vinculada, avatares de miembros y estado de meta o presupuesto.
- **RF-05 — Compartir Entrada o Enlace:** CUANDO el usuario pulse el botón de compartir en un bolsillo, EL SISTEMA DEBE simular la copia del enlace de invitación o entrada compartida y mostrar una confirmación visual accesible.
- **RF-06 — Accesibilidad y Foco:** MIENTRAS el usuario navegue en la página de bolsillos, TODOS los elementos interactivos DEBEN contar con etiquetas accesibles (`aria-label`), foco visible con tokens de FinApp y contraste compatible con WCAG AA.

## 6. Validación
- Pruebas unitarias para la nueva página `PaginaDashboardBolsillos.test.jsx`.
- Pruebas unitarias actualizadas para `SidebarNavContenido.test.jsx` y `BottomNav.test.jsx` confirmando la actualización de iconos y rutas.
- Ejecución completa de `npm test` verificando cero regresiones.
- Verificación con `npm run build`.
