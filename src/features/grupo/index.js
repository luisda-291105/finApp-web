/**
 * @uso        API pública del feature de grupos
 * @funciones  Exporta páginas y componentes destinados a otros features
 * @datos      Mantiene la ruta pública estable frente a cambios internos
 * @eventos    Ninguno
 * @estados    Ninguno
 * @usadoPor   App.jsx y features que integran grupos
 */
export { default as GruposPage } from "./pages/GruposPage";
export { default as GrupoCard } from "./components/cards/GrupoCard";
export { default as CrearGrupoModal } from "./components/modals/CrearGrupoModal";
export { default as GrupoDetalleModal } from "./components/modals/GrupoDetalleModal";
