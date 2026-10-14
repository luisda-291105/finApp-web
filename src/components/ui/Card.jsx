/**
 * @uso        Átomo UI: envoltorio presentacional con superficie glass-card
 * @funciones  Card({ children, className, como })
 * @datos      Props: children (obligatorio), className (string, default ""), como (string|component, default "div")
 * @eventos    Ninguno
 * @estados    Ninguno
 * @usadoPor   Features, PaginaDashboardInicio, PaginaDashboardTransacciones, PaginaDashboardConfiguracion
 */
export function Card({ children, className = "", como: Tag = "div" }) {
  return (
    <Tag className={"glass-card " + className}>
      {children}
    </Tag>
  );
}