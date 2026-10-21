import { useState, useEffect, useRef, useCallback } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { clsx } from "clsx";
import { BotMessageSquare } from "lucide-react";
import { useBreakpoint } from "../hooks/useBreakpoint";
import { useFocoEnVistaDestino } from "../hooks/useFocoEnVistaDestino";

import SidebarResponsive from "../components/layout/SidebarResponsive";
import DashboardDrawer from "../components/layout/DashboardDrawer";
import BottomNav from "../components/layout/BottomNav";
import DashboardUserModal from "../components/layout/DashboardUserModal";
import SidebarNavContenido from "../components/layout/SidebarNavContenido";
import Container from "../components/layout/Container";
import AsistenteAyuda from "../components/domain/modales/AsistenteAyuda";
import { getUsuarioMock } from "../config/app.config";

/** Selectores del cruce (tabla M8 del plan 011): navegación por versión de vista. */
const SELECTOR_NAVEGACION_LATERAL = 'aside[role="navigation"]';
const SELECTOR_NAVEGACION_INFERIOR = "nav";
const SELECTOR_CONTROL_LATERAL = 'aside[role="navigation"] button';
const SELECTOR_CONTROL_MOVIL = 'button[aria-label="Abrir menú"]';
/** La superficie global abierta y su contenedor: nunca son candidatos del respaldo (RF-14). */
const SELECTOR_DIALOGO = '[role="dialog"]';
/** El disparador del asistente no participa en el respaldo de foco del cruce (D-6). */
const SELECTOR_EXCLUIDO_RESPALDO = '[data-respaldo-foco="excluir"]';
/** Selector real del «primer control enfocable» (estilo de `ModalTarjeta.jsx`, RF-05). */
const SELECTOR_ENFOCABLE =
  'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * clasificarOrigenDeFoco
 * Clasifica el origen del foco para el recuerdo del cruce (M5 del plan 011): dentro de la
 * navegación lateral ⇒ «escritorio»; dentro de la navegación inferior (un `nav` fuera del `aside`)
 * ⇒ «movil»; contenido, campos o cualquier nodo dentro de `[role="dialog"]` ⇒ `null` (borra el
 * recuerdo, lo que hace cumplir RF-14).
 *
 * @param {EventTarget} nodo - Nodo que acaba de recibir el foco
 * @returns {{origen: ("escritorio"|"movil"|null), nodo: HTMLElement|null}}
 */
function clasificarOrigenDeFoco(nodo) {
  if (!(nodo instanceof HTMLElement) || nodo.closest(SELECTOR_DIALOGO)) {
    return { origen: null, nodo: null };
  }
  if (nodo.closest(SELECTOR_NAVEGACION_LATERAL)) return { origen: "escritorio", nodo };
  if (nodo.closest(SELECTOR_NAVEGACION_INFERIOR)) return { origen: "movil", nodo };
  return { origen: null, nodo: null };
}

/** Valida un candidato del respaldo del cruce (RF-05), excluyendo controles marcados. */
function esCandidatoDeCruce(nodo) {
  return (
    nodo instanceof HTMLElement &&
    nodo !== document.body &&
    nodo.isConnected &&
    !nodo.disabled &&
    !nodo.closest(SELECTOR_DIALOGO) &&
    !nodo.closest(SELECTOR_EXCLUIDO_RESPALDO)
  );
}

/** Devuelve el primer nodo de la lista que supera la validación del respaldo (o `null`). */
function primerCandidatoDeCruce(nodos) {
  for (const nodo of nodos) {
    if (esCandidatoDeCruce(nodo)) return nodo;
  }
  return null;
}

/**
 * trasladarFocoDeCruce
 * Traslada el foco al control equivalente de la versión de vista de destino (tabla M8) con la
 * cadena de respaldo de RF-05: (1) control estable de esa versión; (2) el otro control estable;
 * (3) primer control enfocable. Sin ninguno **no** fuerza el foco a `body` (limitación explícita).
 *
 * @param {boolean} esMovil - Versión de vista de destino (`useBreakpoint().isMobile`)
 */
function trasladarFocoDeCruce(esMovil) {
  if (typeof document === "undefined") return;
  const preferido = esMovil ? SELECTOR_CONTROL_MOVIL : SELECTOR_CONTROL_LATERAL;
  const alterno = esMovil ? SELECTOR_CONTROL_LATERAL : SELECTOR_CONTROL_MOVIL;
  const destino =
    primerCandidatoDeCruce(document.querySelectorAll(preferido)) ??
    primerCandidatoDeCruce(document.querySelectorAll(alterno)) ??
    primerCandidatoDeCruce(document.querySelectorAll(SELECTOR_ENFOCABLE));
  if (destino) destino.focus();
}

/**doc
 * @uso        Layout del dashboard con dos versiones de vista (móvil / pantallas grandes)
 * @funciones  DashboardLayout()
 * @datos      Orquesta navegación, superficies globales y el asistente de ayuda en Outlet context
 * @eventos    Cruce del corte de 768px en ambos sentidos (con el recuerdo del origen por `focusin`):
 *             con el panel superpuesto abierto lo cierra y traslada el foco al control lateral; sin
 *             panel, traslada solo si el foco pertenecía a la navegación que se desmonta (RF-12/
 *             RF-13/RF-14). Navegación BottomNav, apertura del modal de usuario: abrir «Cuenta»
 *             CIERRA el menú superpuesto (una sola superficie y una sola trampa por diseño;
 *             RF-07/RF-13) y pasa un `triggerRef` estable al modal para el retorno de foco (RF-08).
 *             Cierre que navega: con la marca `focoEnDestino` en el estado de la ruta,
 *             `useFocoEnVistaDestino` coloca el foco una sola vez tras el render del destino, en el
 *             control estable de la versión de vista (botón «Menú» / navegación lateral; RF-15).
 *             Abrir el asistente cierra las demás superficies y devuelve el foco al robot.
 * @estados    mobileMenuAbierto (móvil), userModalAbierto y ayudaAbierta (global)
 * @usadoPor   App.jsx (rutas /dashboard/*)

 * DashboardLayout
 * Composición raíz del área autenticada (dashboard). Dos versiones de vista con un único
 * corte en 768px: «pantallas grandes» (≥768px) con navegación lateral permanente y
 * colapsable; «móvil» (<768px) con navegación inferior y menú superpuesto. Sin categoría intermedia.
 *
 * Márgenes/padding condicionales:
 * - Pantallas grandes expandida: ml-64 | colapsada: ml-[72px]
 * - Móvil: ml-0
 * - Main: pb-20 (espacio de la navegación inferior de móvil)
 *
 * @returns {JSX.Element} Layout completo del dashboard
 */


export default function DashboardLayout() {
  const { isMobile, isDesktop, sidebarColapsada, toggleSidebar } = useBreakpoint();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuAbierto, setMobileMenuAbierto] = useState(false);
  const [userModalAbierto, setUserModalAbierto] = useState(false);
  const [ayudaAbierta, setAyudaAbierta] = useState(false);

  const bottomNavMenuRef = useRef(null);
  const asistenteTriggerRef = useRef(null);
  const cierreDetalleRef = useRef(null);
  // Recuerdo del último foco dentro de una navegación (`{ origen, nodo }`): permite saber, al
  // cruzar, si el elemento enfocado pertenecía a la navegación que se desmonta (M5 del plan 011).
  const origenFocoRef = useRef({ origen: null, nodo: null });
  // Versión de vista del render anterior: distingue la dirección del cruce (el primer render no actúa).
  const versionPreviaRef = useRef(isMobile);

  // Vista de destino del cierre que navega (RF-15): si la entrada de historial trae la marca, coloca
  // el foco una sola vez en el control estable de la versión de vista (botón «Menú» en móvil,
  // navegación lateral en ≥768px).
  useFocoEnVistaDestino();

  // Único punto de apertura del modal de Cuenta (plan §2.3-M9): cerrar el menú superpuesto
  // antes de abrirlo garantiza una sola superficie y una sola trampa por diseño (RF-07/RF-13).
  // Sirve a los dos disparadores: el menú de móvil y la navegación lateral (≥768px).
  const alAbrirUserModal = () => {
    setMobileMenuAbierto(false);
    setUserModalAbierto(true);
  };
  const alCerrarUserModal = () => setUserModalAbierto(false);
  const usuario = getUsuarioMock();

  const registrarCierreDetalle = useCallback((cerrar) => {
    cierreDetalleRef.current = cerrar;
  }, []);
  const alAbrirAsistente = () => {
    cierreDetalleRef.current?.();
    setMobileMenuAbierto(false);
    setUserModalAbierto(false);
    setAyudaAbierta(true);
  };
  const alCerrarAsistente = () => setAyudaAbierta(false);

  // Único listener `focusin` sobre `document` (registrado una vez al montar, retirado al
  // desmontar): mantiene el recuerdo del origen del foco para el cruce del corte.
  useEffect(() => {
    const registrarOrigen = (evento) => {
      origenFocoRef.current = clasificarOrigenDeFoco(evento.target);
    };
    document.addEventListener("focusin", registrarOrigen);
    return () => document.removeEventListener("focusin", registrarOrigen);
  }, []);

  // Efecto: cruce del corte de 768px en ambos sentidos (RF-12/RF-13/RF-14). (a) Con el panel
  // superpuesto abierto al pasar a pantallas grandes, lo cierra y traslada el foco de forma
  // incondicional al control lateral (camino vigente). (b) Sin panel, solo traslada si el elemento
  // enfocado pertenecía a la navegación que se desmonta (recuerdo no `null` y nodo desconectado);
  // si sobrevive (contenido, campo o modal de cuenta con su trampa), no le roba el foco (RF-14).
  useEffect(() => {
    const versionPrevia = versionPreviaRef.current;
    versionPreviaRef.current = isMobile;
    if (versionPrevia === isMobile) return;

    if (!isMobile && mobileMenuAbierto) {
      setMobileMenuAbierto(false);
      trasladarFocoDeCruce(isMobile);
      return;
    }

    const { origen, nodo } = origenFocoRef.current;
    if (origen === null || (nodo && nodo.isConnected)) return;
    if (isMobile && origen !== "escritorio") return;
    if (!isMobile && origen !== "movil") return;

    trasladarFocoDeCruce(isMobile);
  }, [isMobile, mobileMenuAbierto]);

  return (
    <>
      
      {/* Navegación lateral permanente (pantallas grandes ≥768px) */}
      {isDesktop && (
        <SidebarResponsive
          colapsada={sidebarColapsada}
          alToggleColapso={toggleSidebar}
          alAbrirUserModal={alAbrirUserModal}
        />
      )}

      {/* Área principal: margen reservado para la navegación desde 768px (sin prefijo lg:) */}
      <div
        className={clsx(
          "min-h-screen bg-bg-cream transition-all duration-300",
          isDesktop ? (sidebarColapsada ? "ml-[72px]" : "ml-64") : "ml-0"
        )}
      >
        <Container>
          <main className="pb-20">
            <Outlet context={{ registrarCierreDetalle }} />
          </main>
        </Container>
      </div>

      {/* Navegación inferior (móvil) */}
      {isMobile && (
        <BottomNav
          itemActivo={location.pathname}
          alNavegar={(ruta) => navigate(ruta)}
          alAbrirMenu={() => setMobileMenuAbierto(true)}
          menuTriggerRef={bottomNavMenuRef}
        />
      )}

      {/* Menú superpuesto (móvil, 5.º item del BottomNav) */}
      {isMobile && (
        <DashboardDrawer
          abierto={mobileMenuAbierto}
          alCerrar={() => setMobileMenuAbierto(false)}
          triggerRef={bottomNavMenuRef}
        >
          <SidebarNavContenido
            alAbrirUserModal={alAbrirUserModal}
            alCerrarSidebar={() => setMobileMenuAbierto(false)}
          />
        </DashboardDrawer>
      )}

      {/* Modal usuario global (portal, siempre al final para z-index).
          triggerRef = botón «Menú» del BottomNav: control estable de retorno de foco en móvil
          (RF-08); en ≥768px el ref no tiene elemento y la cadena de M4 cae al control lateral. */}
      <DashboardUserModal
        abierto={userModalAbierto}
        alCerrar={alCerrarUserModal}
        triggerRef={bottomNavMenuRef}
      />

      <AsistenteAyuda
        abierto={ayudaAbierta}
        estadoVisual="vacio"
        alCerrar={alCerrarAsistente}
        triggerRef={asistenteTriggerRef}
      />

      <button
        ref={asistenteTriggerRef}
        type="button"
        aria-label="Abrir el asistente de ayuda"
        data-respaldo-foco="excluir"
        onClick={alAbrirAsistente}
        className="fixed right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-border-line/30 bg-emerald-primary text-bg-cream shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-dark bottom-[calc(60px_+_env(safe-area-inset-bottom,0px)_+_16px)]"
      >
        <BotMessageSquare size={20} aria-hidden="true" />
      </button>
    </>
  );
}