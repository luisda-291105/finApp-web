/**
 * @uso        Centraliza interruptores de comportamiento de la aplicación
 * @funciones  getUsuarioMock()
 * @datos      Valores de configuración en tiempo de compilación
 * @eventos    N/A
 * @estados    TRIAL_ACTIVO controla la protección de rutas
 * @usadoPor   App.jsx, PaginaLogin.jsx, componentes de header/usuario
 */

// TRIAL_ACTIVO = true mientras el backend no esté listo.
// En producción, esta bandera debe controlarse por variable de entorno
// y el dashboard debe requerir autenticación real.
export const TRIAL_ACTIVO = true;

/**
 * getUsuarioMock
 * Devuelve un objeto de usuario simulado para modo demo.
 * @returns {{ nombre: string, iniciales: string, email: string }}
 */
export const getUsuarioMock = () => ({
  nombre: 'Usuario Demo',
  iniciales: 'UD',
  email: 'demo@finapp.local'
});