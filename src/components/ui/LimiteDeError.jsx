/**
 * @uso        Contiene errores de renderizado o de carga de un chunk de ruta y ofrece reintentar
 * @funciones  LimiteDeError (clase con getDerivedStateFromError y componentDidCatch)
 * @datos      Recibe children; guarda hayError en el estado interno
 * @eventos    Click en «Recargar página» vuelve a cargar la aplicación
 * @estados    hayError (boolean)
 * @usadoPor   App.jsx (envoltorio de las rutas)
 */

import { Component } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default class LimiteDeError extends Component {
  constructor(props) {
    super(props);
    this.state = { hayError: false };
  }

  static getDerivedStateFromError() {
    return { hayError: true };
  }

  componentDidCatch(error) {
    console.error("[UI] No se pudo cargar la página", error);
  }

  render() {
    if (this.state.hayError) {
      return (
        <section
          role="alert"
          aria-labelledby="error-carga-titulo"
          className="grid min-h-[55vh] w-full place-items-center rounded-2xl bg-bg-cream p-6"
        >
          <div className="max-w-md text-center">
            <AlertTriangle className="mx-auto h-10 w-10 text-cat-expense" aria-hidden="true" />
            <h1 id="error-carga-titulo" className="mt-4 font-display text-2xl font-semibold text-bg-dark">
              No se pudo cargar la página
            </h1>
            <p className="mt-2 text-sm text-slate-text">
              Esta sección no pudo cargarse. Puedes volver a intentarlo o continuar usando la navegación.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-primary px-4 py-2.5 text-sm font-semibold text-bg-cream transition-colors hover:bg-emerald-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-primary"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Recargar página
            </button>
          </div>
        </section>
      );
    }

    return this.props.children;
  }
}
