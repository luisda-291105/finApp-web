Contexto

FinApp es una aplicación de gestión financiera y personal. El dashboard debe presentar información financiera de forma clara, ordenada e intuitiva.

Actualmente se está definiendo el contenido necesario que debe mostrar cada bloque del dashboard antes de diseñar o implementar la interfaz definitiva.

Objetivo

Diseñar y definir el bloque “Tarjetas” del dashboard de FinApp.

Este bloque debe permitir al usuario visualizar de forma resumida sus tarjetas financieras y consultar los movimientos asociados a cada una.

La información debe presentarse de manera clara, evitando mostrar datos sensibles completos.

1. Bloque principal: Tarjetas

El dashboard debe contener una sección dedicada a las tarjetas registradas o disponibles para el usuario.

Cada tarjeta debe representarse mediante una card individual.

La tarjeta puede ser:

Débito.

Crédito.

La información sensible debe mostrarse de forma anonimizada.

Ejemplo
┌──────────────────────────────┐
│ 💳 Tarjeta débito            │
│                              │
│ •••• 4821                    │
│                              │
│ Movimientos este mes         │
│ $1.240.000                   │
│ 18 movimientos               │
└──────────────────────────────┘


No se debe mostrar el número completo de la tarjeta.

La representación puede utilizar únicamente información parcial o identificadores seguros, como:

•••• 4821

2. Información mínima de la card

Cada card de tarjeta debe representar como mínimo:

Tipo de tarjeta.

Identificador anonimizado.

Total de movimientos del mes actual.

Cantidad de movimientos del mes actual.

Ejemplo:

Tipo:
Débito

Identificador:
•••• 4821

Movimientos este mes:
$1.240.000

Cantidad:
18 movimientos


No agregar información adicional que todavía no haya sido definida para este bloque.

3. Movimientos del mes

Cada tarjeta debe estar relacionada con sus movimientos correspondientes.

La sección:

“Movimientos este mes”

debe mostrar un resumen de los movimientos realizados durante el mes actual.

Debe permitir conocer:

Cuánto dinero se ha movido durante el mes.

Cuántos movimientos existen.

El cálculo debe estar relacionado exclusivamente con la tarjeta correspondiente.

Ejemplo:

Tarjeta •••• 4821

Movimientos este mes
$1.240.000

18 movimientos

4. Agrupación histórica de movimientos

Los movimientos deben poder organizarse cronológicamente agrupándolos por:

Año → Mes

Ejemplo:

2026

Octubre
├── Movimiento
├── Movimiento
├── Movimiento
└── ...

Septiembre
├── Movimiento
├── Movimiento
└── ...

Agosto
├── Movimiento
└── ...


La agrupación debe mantener una estructura clara para que el usuario pueda identificar rápidamente a qué período pertenece cada movimiento.

El orden debe ser cronológico, mostrando primero los períodos más recientes.

5. Relación entre tarjeta y movimientos

Cada movimiento debe estar asociado a una tarjeta determinada.

La estructura conceptual debe ser:

Tarjeta
   │
   ├── Información anonimizada
   │
   ├── Resumen del mes actual
   │
   └── Historial de movimientos
          │
          ├── Año
          │    ├── Mes
          │    │    ├── Movimiento
          │    │    ├── Movimiento
          │    │    └── Movimiento
          │    │
          │    └── Mes
          │
          └── Año anterior


Esto permitirá posteriormente consultar el historial financiero de cada tarjeta sin mezclar movimientos pertenecientes a diferentes tarjetas.

6. Privacidad

La interfaz debe evitar exponer información sensible de las tarjetas.

No mostrar:

Número completo.

CVV.

Datos bancarios sensibles.

Información de autenticación.

La identificación visual debe ser suficiente para que el usuario pueda distinguir sus tarjetas sin revelar información innecesaria.

Ejemplo permitido:

💳 Crédito
•••• 8291


Ejemplo no permitido:

💳 Crédito
4532 1234 5678 8291

7. Estructura conceptual del componente

La estructura esperada es:

Dashboard
└── Bloque Tarjetas
    │
    ├── Card Tarjeta 1
    │   ├── Tipo
    │   ├── Identificador anonimizado
    │   ├── Movimientos del mes
    │   └── Cantidad de movimientos
    │
    ├── Card Tarjeta 2
    │   ├── Tipo
    │   ├── Identificador anonimizado
    │   ├── Movimientos del mes
    │   └── Cantidad de movimientos
    │
    └── Historial de movimientos
        ├── 2026
        │   ├── Octubre
        │   ├── Septiembre
        │   └── Agosto
        │
        └── 2025
            └── ...

8. Principios de interfaz

El componente debe priorizar:

Claridad.

Lectura rápida.

Jerarquía visual.

Información resumida.

Privacidad.

Organización cronológica.

No sobrecargar la card con información secundaria.

La card debe funcionar como un resumen y el historial debe encargarse de mostrar el detalle de los movimientos.

9. Datos de demostración

Mientras el backend financiero no esté conectado, el componente puede utilizar datos ficticios.

Los datos de demostración deben dejar claro que no representan información financiera real.

Ejemplo conceptual:

{
  id: "card-001",
  tipo: "debito",
  identificador: "4821",
  movimientosMes: {
    total: 1240000,
    cantidad: 18
  },
  movimientos: [
    {
      fecha: "2026-10-01",
      valor: 25000
    },
    {
      fecha: "2026-10-03",
      valor: 85000
    }
  ]
}


La estructura anterior es conceptual y debe adaptarse al modelo de datos real cuando el backend esté definido.

10. No implementar todavía

En esta etapa no agregar funcionalidades que todavía no han sido definidas, como:

Límites de crédito.

Cupo disponible.

Fecha de corte.

Fecha de pago.

Intereses.

Recompensas.

Bancos.

Predicciones.

Alertas financieras.

IA.

Recomendaciones.

Comparaciones de consumo.

Esas funcionalidades pueden definirse posteriormente.

Resultado esperado

El resultado debe ser un bloque de dashboard donde el usuario pueda:

Identificar sus tarjetas de forma anonimizada.

Diferenciar entre tarjetas de débito y crédito.

Ver el resumen de movimientos del mes actual.

Conocer la cantidad de movimientos.

Consultar el historial de movimientos.

Ver los movimientos organizados por año y mes.

Mantener protegida la información sensible de sus tarjetas.

La prioridad actual es definir correctamente la información y estructura del bloque, no agregar funcionalidades adicionales.