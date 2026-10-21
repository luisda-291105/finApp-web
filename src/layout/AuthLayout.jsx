/**
 * @uso        Layout mínimo para páginas de autenticación (login/registro)
 * @funciones  AuthLayout({ children })
 * @datos      Recibe children como prop; no transforma data
 * @eventos    Ninguno
 * @estados    Ninguno
 * @usadoPor   PaginaLogin
 */

export default function AuthLayout({ children }) {
  return (
    <main className="grid min-h-screen place-items-center bg-bg-dark px-5">
      {children}
    </main>
  );
}