/**
 * @uso        Puente de compatibilidad hacia el modal del feature de grupos
 * @funciones  Reexporta GrupoDetalleModal
 * @datos      Ninguno
 * @eventos    Ninguno
 * @estados    Ninguno
 * @usadoPor   Consumidores legacy; las páginas nuevas importan desde features/grupo
 */
export { GrupoDetalleModal as default } from "../../../features/grupo";
