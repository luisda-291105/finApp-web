/**
 * @uso        Centraliza interruptores de comportamiento de la aplicación
 * @estados    TRIAL_MODE controla el modo demo de la aplicación
 * @usadoPor   App.jsx, features/auth/pages/LoginPage.jsx, componentes de header/usuario
 */

// Se configura con VITE_TRIAL_MODE=true para permitir el modo demo
// mientras el backend no esté listo. Si no se define, se mantiene el comportamiento histórico
// de trial activo para no bloquear el flujo de desarrollo.
const valorTrialMode = import.meta.env.VITE_TRIAL_MODE;
export const TRIAL_MODE = valorTrialMode === undefined ? true : valorTrialMode === "true";

// Alias mantenido por compatibilidad con el código previo y los tests existentes.
export const TRIAL_ACTIVO = TRIAL_MODE;
