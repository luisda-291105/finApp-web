/**
 * @uso        Fuente única de datos ficticios de tarjetas y movimientos demo (spec 004)
 * @funciones  TARJETAS_DEMO, MOVIMIENTOS_DEMO, PERIODO_DEMO
 * @datos      Constantes estáticas; fechas fijas de octubre 2026 en formato ISO
 *              ("2026-10-DD") para ordenación lexicográfica; el formato legible
 *              ("12 oct 2026") se aplica solo en la capa UI (T2, LogMovimientos);
 *              sin backend ni persistencia
 * @eventos    Ninguno
 * @estados    Ninguno
 * @usadoPor   PanelTarjetas, ModalTarjeta, LogMovimientos (spec 004)
 */

export const PERIODO_DEMO = { anio: 2026, mes: 10 };

export const TARJETAS_DEMO = [
  {
    id: "tarjeta-azul",
    titular: "MARÍA GARCÍA",
    numero: "4242 4242 4242 4242",
    expiracion: "12/28",
    cvv: "847",
    entidad: "FinApp",
    colorTema: "azul",
  },
  {
    id: "tarjeta-menta",
    titular: "ANA MARTÍNEZ",
    numero: "5555 5555 5555 4444",
    expiracion: "06/27",
    cvv: "312",
    entidad: "FinApp",
    colorTema: "menta",
  },
  {
    id: "tarjeta-morado",
    titular: "CARLOS RUIZ",
    numero: "3782 822463 10005",
    expiracion: "09/29",
    cvv: "650",
    entidad: "FinApp",
    colorTema: "morado",
  },
  {
    id: "tarjeta-azul-2",
    titular: "LUCÍA FERNÁNDEZ",
    numero: "6011 0009 9013 9424",
    expiracion: "03/30",
    cvv: "219",
    entidad: "FinApp",
    colorTema: "azul",
  },
  {
    id: "tarjeta-morado-2",
    titular: "DIEGO TORRES",
    numero: "4916 5420 7788 1236",
    expiracion: "11/27",
    cvv: "584",
    entidad: "FinApp",
    colorTema: "morado",
  },
];

export const MOVIMIENTOS_DEMO = {
  "tarjeta-azul": [
    { id: "mov-azul-1", fecha: "2026-10-01", descripcion: "Supermercado La Esquina", categoria: "Alimentación", monto: -82.4 },
    { id: "mov-azul-2", fecha: "2026-10-12", descripcion: "Nómina octubre", categoria: "Ingresos", monto: 2450.0 },
    { id: "mov-azul-3", fecha: "2026-10-08", descripcion: "Suscripción streaming", categoria: "Ocio", monto: -12.99 },
    { id: "mov-azul-4", fecha: "2026-10-03", descripcion: "Gasolinera Centro", categoria: "Transporte", monto: -45.0 },
  ],
  "tarjeta-menta": [
    { id: "mov-menta-1", fecha: "2026-10-10", descripcion: "Farmacia San Roque", categoria: "Salud", monto: -23.75 },
    { id: "mov-menta-2", fecha: "2026-10-05", descripcion: "Devolución compra online", categoria: "Compras", monto: 59.9 },
    { id: "mov-menta-3", fecha: "2026-10-02", descripcion: "Cafetería Del Parque", categoria: "Restaurantes", monto: -8.5 },
  ],
  "tarjeta-morado": [
    { id: "mov-morado-1", fecha: "2026-10-11", descripcion: "Billete tren", categoria: "Transporte", monto: -31.2 },
    { id: "mov-morado-2", fecha: "2026-10-07", descripcion: "Librería Central", categoria: "Educación", monto: -27.0 },
  ],
  "tarjeta-azul-2": [],
  "tarjeta-morado-2": [
    { id: "mov-morado2-1", fecha: "2026-10-09", descripcion: "Gimnasio mensual", categoria: "Salud", monto: -35.0 },
    { id: "mov-morado2-2", fecha: "2026-10-04", descripcion: "Reembolso compartido", categoria: "Ingresos", monto: 40.0 },
  ],
};
