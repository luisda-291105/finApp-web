/**
 * @uso        API pública del feature de error
 * @funciones  Expone la página de error y los componentes de límite/alertas globales
 * @datos      Ninguno
 * @eventos    Ninguno
 * @estados    Ninguno
 * @usadoPor   App.jsx, DashboardLayout, AlertasContext y features consumidores de AlertaGlobal
 */
export { default as ErrorPage } from "./pages/ErrorPage";
export { default as LimiteDeError } from "./components/LimiteDeError";
export { default as AlertaGlobal } from "./components/alertas/AlertaGlobal";
export { default as NotificacionLateral } from "./components/alertas/NotificacionLateral";
export { default as PilaNotificacionesLaterales } from "./components/alertas/PilaNotificacionesLaterales";
