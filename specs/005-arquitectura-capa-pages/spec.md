# Spec 005 — Arquitectura: capa de páginas (`src/pages/`)

**Estado: borrador**

## Contexto y problema

Hoy `src/App.jsx` mezcla dos responsabilidades: define las rutas y, además,
contiene la composición completa de dos vistas (la landing `LandingPage` y las
secciones del dashboard `DashboardSection`). Otros componentes usados como
vistas (`LoginPage`, `Dashboard`, `PanelTarjetas`) viven en `src/components/`
sin distinción respecto a piezas reutilizables (`Hero`, `AcordeonTarjetas`,
etc.). Resultado: la navegación y la redirección son difíciles de rastrear y
confusas de mantener.

## Objetivo

Crear la capa `src/pages/` como el único lugar donde se **arman las páginas**
de la aplicación, componiendo los componentes de `src/components/`. Las
páginas orquestan componentes; los componentes reutilizables permanecen en
`src/components/`. `App.jsx` pasa a ser exclusivamente la capa de rutas:
importa páginas y define el mapa de navegación, sin composición de vistas.

## Alcance

### Dentro

- Crear la carpeta `src/pages/` con un archivo por página, en plano, con
  nombre `Pagina<Seccion>.jsx` en español y PascalCase.
- Migrar a esa capa todas las vistas hoy enrutadas: la landing, el login, el
  layout del dashboard, las cuatro secciones del dashboard y el panel de
  tarjetas (`PanelTarjetas`, alojado en `src/pages/` por decisión explícita
  del usuario, como excepción documentada a la regla "las páginas orquestan y
  los componentes quedan en `src/components/`"; es un subcomponente de
  sección que vive junto a su página).
- Es un movimiento, no una duplicación: los archivos originales
  `src/components/LoginPage.jsx`, `src/components/Dashboard.jsx` y
  `src/components/PanelTarjetas.jsx` se eliminan tras la migración, y todos
  los imports/referencias (internos y en pruebas) se actualizan a las nuevas
  rutas.
- Dejar `App.jsx` como capa de rutas pura (solo `Routes`/`Route`/`Navigate` e
  imports de páginas).
- Eliminar el alias `/inicio`: la landing pasa a ser la ruta `/`.
- Reubicar las pruebas de las páginas migradas junto a su archivo en
  `src/pages/` (siguiendo el patrón "pruebas junto al código") y ajustar las
  pruebas existentes afectadas por el cambio de rutas.
- Todos los archivos nuevos/movidos a `src/pages/` llevan el header de
  `.agents/file-header-template.md` (excepción: los archivos de prueba
  movidos, ver RF-10).
- Actualizar los headers/comentarios que queden obsoletos al mover archivos:
  referencias a `/inicio` (comentario de la landing en `App.jsx`, navegación
  en `LoginPage`) y `@usadoPor App.jsx` (en `Dashboard.jsx` y `LoginPage.jsx`)
  en los archivos movidos, más el header de `App.jsx`.
- Actualizar `MEMORY.md` (su sección "Estado actual" registra las rutas
  antiguas `/inicio`, `/login` y el comportamiento de la raíz durante el
  trial) para reflejar el nuevo mapa de rutas y la nueva capa.

### Fuera de alcance

- Ningún cambio visual, de contenido ni de comportamiento de las vistas, salvo
  lo explícito en RF-04 y RF-06. En particular, los literales hexadecimales
  heredados presentes hoy en el JSX de la landing (p. ej. `bg-[#0f1117]`,
  `hover:bg-[#1a7a5e]`, `text-[#0f1117]` en `App.jsx`) se conservan **tal
  cual** al mover el código a `PaginaInicio.jsx`; su migración a tokens se
  trata como deuda técnica y queda fuera de esta spec.
- No se añaden ni eliminan componentes de `src/components/` (las páginas solo
  los componen; los subcomponentes de sección como `PanelTarjetas` se mueven,
  no se modifican internamente).
- No se cambia `TRIAL_ACTIVO` ni la lógica de autenticación/demo; solo se
  conservan las redirecciones semánticamente iguales.
- No se toca el estilado, ni tokens, ni límites Fluid Glass.

## Mapa final de rutas (contrato)

| Ruta                      | Página que la sirve            | Comportamiento |
| ------------------------- | ------------------------------ | -------------- |
| `/`                       | `PaginaInicio` (landing)       | **Cambia**: muestra siempre la landing, con independencia de `TRIAL_ACTIVO` (desaparece la redirección `/` → `/dashboard`); ver RF-02 y RF-04. |
| `/login`                  | `PaginaLogin`                  | Sin cambio. |
| `/inicio`                 | —                              | **Eliminado**: redirige a `/` con `replace`. |
| `/dashboard`              | `PaginaDashboard` (layout) + `PaginaDashboardInicio` (index) | Protegida: si `TRIAL_ACTIVO === false`, redirige a `/login` (replace). |
| `/dashboard/transacciones`| `PaginaDashboard` + `PaginaDashboardTransacciones` | Idem. |
| `/dashboard/tarjetas`     | `PaginaDashboard` + `PaginaDashboardTarjetas` | Idem. |
| `/dashboard/configuracion`| `PaginaDashboard` + `PaginaDashboardConfiguracion` | Idem. |
| Cualquier `/dashboard/*` desconocida | `PaginaDashboard` | Con `TRIAL_ACTIVO = true`: redirige a `/dashboard` (replace), sin cambio. Con `TRIAL_ACTIVO = false`: la guardia de la ruta padre `/dashboard` la intercepta antes y redirige a `/login` (replace). |
| Cualquier otra ruta       | —                              | Redirige a `/` (replace), sin cambio. |

> **Contradicción resuelta por el usuario (2026-10-13):** el código actual
> redirige `/` a `/dashboard` cuando `TRIAL_ACTIVO = true` (corrección
> registrada en MEMORY.md). Con el nuevo mapa, esa redirección **desaparece**:
> `/` muestra siempre la landing. El acceso demo al dashboard se conserva:
> `/dashboard/*` sigue siendo accesible directamente mientras
> `TRIAL_ACTIVO = true`, y el flujo de `/login` → cierre/acceso → `/dashboard`
> permanece (ver RF-03 y RF-05). El alias `/inicio` desaparece.

## Requisitos funcionales (EARS)

- **RF-01** El sistema dispondrá de una capa de páginas en `src/pages/`, con
  un archivo por página en plano, en español y PascalCase
  (`PaginaInicio.jsx`, `PaginaLogin.jsx`, `PaginaDashboard.jsx`,
  `PaginaDashboardInicio.jsx`, `PaginaDashboardTransacciones.jsx`,
  `PaginaDashboardTarjetas.jsx`, `PaginaDashboardConfiguracion.jsx` y
  `PanelTarjetas.jsx` — este último alojado en `src/pages/` por decisión
  explícita del usuario, como excepción documentada a la regla "las páginas
  orquestan y los componentes quedan en `src/components/`"); cada una
  compondrá componentes de `src/components/` y no definirá piezas de interfaz
  reutilizables nuevas.
- **RF-02** Cuando el usuario navegue a `/`, el sistema mostrará siempre la
  landing (con independencia del valor de `TRIAL_ACTIVO`) compuesta por
  `PaginaInicio` con exactamente los mismos elementos que hoy: `Navbar`,
  `Hero`, `StatsBar`, `Features`, `HowItWorks`, `CtaSection`, `Footer`,
  `AuthModal` (con el estado `modalAbierto`/`modoAuth` y sus manejadores) y
  el botón flotante "?" como parte interna de la página. Los literales
  hexadecimales heredados del JSX actual (p. ej. `bg-[#0f1117]`,
  `hover:bg-[#1a7a5e]`) se conservan **tal cual** sin migración a tokens
  (decisión del usuario; fuera de alcance, ver sección de alcance).
- **RF-03** Cuando el usuario navegue a `/login`, el sistema mostrará
  `PaginaLogin`, equivalente a `LoginPage` actual; al cerrar el modal, el
  sistema navegará a `/dashboard` si `TRIAL_ACTIVO` es `true` (acceso demo),
  y a `/` en caso contrario (antes: `/inicio`, alias eliminado).
- **RF-04** El sistema eliminará la ruta alias `/inicio` y la redirección
  condicional de la raíz (`/` → `/dashboard` o `/login` según
  `TRIAL_ACTIVO`); si el usuario navega a `/inicio`, el sistema redirigirá
  a `/` con `replace`.
- **RF-05** Mientras `TRIAL_ACTIVO` sea `false`, si el usuario navega a
  cualquier ruta de `/dashboard`, el sistema redirigirá a `/login` con
  `replace` (lógica actual: guardia por ruta en `App.jsx`); si
  `TRIAL_ACTIVO` es `true`, el sistema mostrará `PaginaDashboard`, permitiendo
  el acceso demo tanto por navegación directa como desde `/login`.
- **RF-06** `PaginaDashboard` será el layout de rutas anidadas del panel
  (barra lateral con navegación, cabecera y `<Outlet />`), conteniendo el
  contenido hoy en `Dashboard.jsx`, sin cambios visuales ni de navegación.
- **RF-07** El sistema repartirá el contenido del componente local actual
  `DashboardSection` en cuatro páginas: `PaginaDashboardInicio` (título "Tu
  dinero, en equilibrio." y las tres tarjetas de cifras),
  `PaginaDashboardTransacciones` (título "Transacciones" y su placeholder),
  `PaginaDashboardTarjetas` (título "Tus tarjetas" y el panel de tarjetas
  migrado como `PanelTarjetas` movido a `src/pages/` sin cambios internos,
  accesible como página de contenido) y `PaginaDashboardConfiguracion`
  (título "Configuración" y su placeholder); cada una conservará el bloque
  "FinApp / Panel" y el `<h1 id="dashboard-title">` con `aria-labelledby`.
- **RF-08** `App.jsx` contendrá únicamente la definición del mapa de rutas
  (imports de páginas, `Routes`/`Route`/`Navigate` y la consulta de
  `TRIAL_ACTIVO`); no definirá componentes de vista ni JSX de composición.
- **RF-09** Las pruebas de las páginas movidas residirán en `src/pages/`
  junto a su página; las pruebas existentes seguirán pasando tras ajustar
  las rutas afectadas (`Navbar.test.jsx` usa `/` en lugar de `/inicio` como
  entrada inicial; `App.test.jsx` se adapta al nuevo mapa de rutas) y tras
  corregir las rutas de importación relativas en los archivos movidos.
- **RF-10** Todo archivo nuevo o movido a `src/pages/` incluirá el header
  JSDoc según `.agents/file-header-template.md` y actualizará sus imports
  relativos (`../components/...`, `../config/...`). Los archivos de prueba
  movidos (`PanelTarjetas.test.jsx`) quedan **exentos** del header JSDoc,
  alineado con AGENTS.md ("No se requiere ese header en documentos Markdown
  ni en archivos de pruebas"); solo actualizan sus imports.

## Casos límite

- **Ruta desconocida fuera del dashboard** (p. ej. `/xyz`): redirige a `/`
  (landing), igual que hoy.
- **Ruta desconocida dentro del dashboard** (p. ej. `/dashboard/xyz`): con
  `TRIAL_ACTIVO = true` redirige a `/dashboard`, igual que hoy; con
  `TRIAL_ACTIVO = false` la guardia de la ruta padre la intercepta antes y
  redirige a `/login`.
- **`/inicio` enmarcado en memoria/tests antiguos**: redirige a `/`; los tests
  que lo usan como ubicación inicial se actualizan a `/`.
- **`TRIAL_ACTIVO = false`**: `/` muestra igualmente la landing; el dashboard
  queda protegido y `/login` funciona como acceso.
- **Imports relativos al mover archivos**: todo archivo que cambie de carpeta
  debe actualizar sus `import` relativos o la build fallará.
- **Nombres de componentes referidos desde tests** (p. ej. el rol
  `dialog` del login, los encabezados del dashboard): no cambian; las
  aserciones por texto/rol deben seguir encontrando los mismos elementos.

## Pruebas afectadas

- `src/App.test.jsx` — adaptar al mapa final: la prueba actual
  `"redirige la raíz al dashboard durante el trial"` (líneas 33-38) se
  renombra y cambia su aserción: deja de esperar redirección a `/dashboard`
  y verifica que `/` muestra la landing (p. ej. contenido del `Hero`);
  se añade verificación de redirección `/inicio` → `/`. El resto de
  aserciones de rutas/secciones se conservan. Nota técnica: al renderizar
  `PaginaInicio` (que incluye componentes con `useReveal`) en jsdom, las
  pruebas dependen de la guardia ya existente en `useReveal` para
  `IntersectionObserver` indefinido (registrada en MEMORY.md, corrección
  post-review de spec 001), por lo que no hace falta mock adicional.
- `src/components/Navbar.test.jsx` — `initialEntries={["/inicio"]}` pasa a
  `["/"]`.
- `src/components/PanelTarjetas.test.jsx` — se mueve a `src/pages/` junto a
  `PanelTarjetas.jsx` y ajusta imports relativos.
- Tests de componentes restantes (`Hero`, `Features`, `LogMovimientos`,
  `ModalTarjeta`, `MiTarjetaVirtual`, `AcordeonTarjetas`, `GridTarjetas`,
  `useReveal`, `index.css`): sin cambios.

## Validación

Por tarea: `npm test` completo y `npm run build` en verde. La validación
visual Fluid Glass en navegador se reportará como ejecutada o no realizada,
se explícito.
