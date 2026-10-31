/**
 * @uso        Átomo UI: envoltorio presentacional con superficie glass-card
 * @funciones  Card({ children, className, como })
 * @datos      Props: children (obligatorio), className (string, default ""), como (string|component, default "div")
 * @eventos    Ninguno
 * @estados    Ninguno
 * @param {string|React.ElementType} [props.como="div"] - Etiqueta o componente con el que se
 *   renderiza el contenedor (por defecto, `div`).
 * @usadoPor   Features, PaginaDashboardInicio, PaginaDashboardTransacciones, PaginaDashboardConfiguracion
 */
export function Card({ children, className = "", como: Tag = "div", ...props }) {
  return (
    <Tag className={"glass-card " + className} {...props}>
      {children}
    </Tag>
  );
}