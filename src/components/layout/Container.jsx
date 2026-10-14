/**
 * @uso        Contenedor centrado con ancho máximo reutilizable para páginas
 * @funciones  Container({ children })
 * @datos      Recibe children como prop; no transforma data
 * @eventos    Ninguno
 * @estados    Ninguno
 * @usadoPor   LandingLayout, DashboardLayout, páginas que necesiten contenedor estándar
 */

export default function Container({ children }) {
  return (
    <div className="mx-auto max-w-6xl px-4">
      {children}
    </div>
  );
}