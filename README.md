He recopilado la idea que fuimos definiendo y la separé del estado técnico actual para que pueda servir como base de documentación del proyecto.

 # FinApp

 ## Visión

 **FinApp busca ayudar a una persona a organizar, comprender y gestionar su vida digital y financiera desde un solo lugar.**

 La idea parte de un problema cotidiano: una persona puede recibir ingresos de diferentes fuentes, realizar compras mediante distintos medios, tener deudas, pagos recurrentes, suscripciones, estudios, entretenimiento, compromisos y conversaciones relacionadas con su vida personal.

 Toda esta información suele estar distribuida entre correos electrónicos, chats, cuentas, aplicaciones, contactos y servicios diferentes.

 FinApp busca centralizar esa información, organizarla y convertirla en datos útiles para que la persona pueda entender mejor su propia vida y tomar el control de ella.

 La aplicación comienza enfocándose en las **finanzas personales**, pero su visión es más amplia: convertirse en una plataforma capaz de organizar información relacionada con una persona, sus relaciones y los grupos a los que pertenece.

---

 ## Problema

 Una persona puede:

 - Recibir dinero de diferentes fuentes.
- Tener un salario y otros ingresos.
- Realizar compras con tarjeta y efectivo.
- Tener deudas y pagos recurrentes.
- Olvidar cuándo debe pagar algo.
- Tener múltiples suscripciones.
- Recibir cientos de correos relacionados con gastos, estudios, entretenimiento y servicios.
- Tener información importante distribuida entre chats y otras fuentes.
- No saber cuánto está gastando realmente.
- No tener una visión centralizada de sus actividades y compromisos.

 El problema no es únicamente registrar información.

 El problema es que **la información existe, pero está dispersa, desorganizada y requiere demasiado esfuerzo humano para convertirla en algo útil.**

---

 ## Objetivo

 FinApp busca reducir ese esfuerzo mediante:

 1. Recopilación de información.
2. Clasificación automática.
3. Organización contextual.
4. Priorización.
5. Automatización.
6. Visualización.
7. Personalización.
8. Control mediante permisos.
9. Uso de IA para interpretar información.
10. Integración progresiva con diferentes fuentes.

---

 # Concepto central

 FinApp puede entenderse como un sistema que transforma información desordenada en información estructurada.

```
Información
    ↓
Recopilación
    ↓
Validación
    ↓
Interpretación
    ↓
Clasificación
    ↓
Priorización
    ↓
Registro
    ↓
Automatización
    ↓
Presentación
```

 La información puede provenir de:

 - Correos electrónicos.
- Chats.
- Contactos.
- Servicios externos.
- APIs.
- Información financiera.
- Suscripciones.
- Compras.
- Ingresos.
- Gastos.
- Estudios.
- Entretenimiento.
- Otras fuentes que puedan integrarse posteriormente.

---

 # Finanzas personales

 Las finanzas son uno de los principales puntos de partida de FinApp.

 El sistema debe poder representar información como:

 - Ingresos.
- Gastos.
- Deudas.
- Pagos fijos.
- Pagos automáticos.
- Suscripciones.
- Compras con tarjeta.
- Compras en efectivo.
- Diferentes fuentes de ingresos.
- Próximos pagos.
- Categorías de gastos.
- Historial financiero.

 La información debería poder visualizarse mediante gráficos y tablas para que la persona pueda comprender rápidamente su situación.

---

 # Ejemplo de interpretación de un mensaje

 Un usuario podría escribir o recibir un mensaje como:

 > "Hoy me gasté $20.000 en un helado de ron con pasas en efectivo."

 FinApp debería poder recopilar la información y estructurarla:

 | Campo | Información |
| --- | --- |
| Mensaje original | Hoy me gasté $20.000 en un helado de ron con pasas en efectivo |
| Tipo | Gasto |
| Valor | $20.000 |
| Método | Efectivo |
| Concepto | Helado de ron con pasas |
| Categoría | Alimentación / Ocio |
| Fecha | Hoy |
| Origen | Chat |
| Estado | Registrado |

La IA puede ayudar a interpretar el contenido y extraer los diferentes elementos.

---

 # Correos electrónicos

 FinApp busca poder registrar y analizar correos relacionados con la vida del usuario.

 Entre ellos:

 - Gastos.
- Ingresos.
- Servicios.
- Suscripciones.
- Estudios.
- Entretenimiento.
- Compras.
- Pagos.
- Notificaciones.
- Spam.
- Información administrativa.
- Otros contenidos relevantes.

 La finalidad no es simplemente almacenar correos, sino **convertir información relevante de los correos en datos estructurados**.

---

 # Suscripciones

 FinApp debe poder detectar servicios y suscripciones.

 Por ejemplo:

```
Correo
   ↓
Detectar servicio
   ↓
Identificar pago
   ↓
Registrar suscripción
   ↓
Categorizar
   ↓
Determinar próximo pago
   ↓
Asignar prioridad
```

 Los próximos pagos pueden clasificarse según su importancia.

 Por ejemplo:

 - Importante.
- No importante.
- Requiere revisión.

---

 # Validación de correos

 FinApp también busca utilizar el contexto disponible para detectar inconsistencias.

 Por ejemplo, si llega un correo relacionado con un supuesto cobro:

```
Correo recibido
      ↓
Identificar remitente
      ↓
Identificar servicio
      ↓
Buscar registro relacionado
      ↓
Comprobar suscripción / pago / relación
      ↓
Clasificar
```

 Si el servicio ya está registrado, puede reconocerse como una actividad conocida.

 Si no existe información suficiente, puede clasificarse como:

 **Desconocido / Requiere revisión**

 Esto no significa automáticamente que el correo sea fraudulento. La ausencia de un registro puede significar simplemente que se trata de un servicio nuevo o que todavía no ha sido registrado.

---

 # Clasificación

 La clasificación es una de las partes fundamentales de FinApp.

 La información puede clasificarse según:

 - Tipo.
- Categoría.
- Persona.
- Grupo.
- Organización.
- Servicio.
- Prioridad.
- Fuente.
- Contexto.
- Estado.
- Relación.

 La clasificación puede realizarse mediante una combinación de:

 - Reglas.
- Contexto.
- Datos registrados por el usuario.
- Automatizaciones.
- IA.

---

 # Conocimiento y desconocimiento

 FinApp debe poder determinar si determinada información está relacionada con algo que el usuario ya conoce.

 Por ejemplo:

```
Correo
  ↓
Remitente conocido
  ↓
Servicio registrado
  ↓
Suscripción existente
  ↓
Pago esperado
  ↓
Información conocida
```

 En cambio:

```
Correo
  ↓
Remitente desconocido
  ↓
Servicio no registrado
  ↓
Pago no reconocido
  ↓
Requiere revisión
```

 La clasificación no debe depender exclusivamente del texto del mensaje.

 También puede utilizar:

 - Remitente.
- Contactos.
- Historial.
- Servicios registrados.
- Suscripciones.
- Relaciones.
- Grupos.
- Permisos.
- Contexto.

---

 # Automatización

 FinApp busca funcionar parcialmente en segundo plano.

 El usuario no debería tener que registrar manualmente cada elemento de su vida.

 El sistema puede:

 - Detectar información.
- Clasificarla.
- Registrarla.
- Actualizar información existente.
- Crear registros.
- Detectar próximos pagos.
- Organizar correos.
- Procesar información recibida.
- Ejecutar automatizaciones.
- Informar resultados.

 Las automatizaciones pueden tener filtros personalizados.

---

 # n8n

 n8n será una de las herramientas utilizadas para las automatizaciones.

 Conceptualmente:

```
Fuente
  ↓
n8n
  ↓
Validaciones
  ↓
IA
  ↓
Clasificación
  ↓
FinApp
  ↓
Base de datos
  ↓
Dashboard
```

 n8n puede encargarse de procesos como:

 - Filtrado de correos.
- Clasificación.
- Detección de contexto.
- Identificación de remitentes.
- Ejecución de triggers.
- Actualización de información.
- Comunicación entre servicios.

 La aplicación puede comprobar posteriormente si una automatización produjo correctamente el resultado esperado.

---

 # IA

 La IA tendrá un papel dentro de FinApp como mecanismo de interpretación y automatización.

 Puede ayudar a:

 - Interpretar mensajes.
- Extraer información.
- Clasificar contenido.
- Detectar contexto.
- Identificar entidades.
- Relacionar información.
- Ayudar a determinar prioridades.
- Procesar correos.
- Procesar mensajes.
- Aplicar criterios personalizados.

 La IA no debería trabajar sin contexto.

 FinApp busca proporcionarle información estructurada sobre:

 - Usuario.
- Personas.
- Grupos.
- Organizaciones.
- Servicios.
- Categorías.
- Relaciones.
- Historial.
- Preferencias.
- Permisos.

---

 # Aprendizaje mediante correcciones

 El usuario debe poder corregir las clasificaciones.

 Por ejemplo:

```
IA:
Netflix → Entretenimiento → No importante

Usuario:
Netflix → Entretenimiento → Importante
```

 La corrección puede convertirse en una preferencia del usuario para futuras clasificaciones.

 De esta manera, FinApp puede adaptarse progresivamente a la forma en que cada persona organiza su información.

---

 # Usuario

 La entidad principal de FinApp es el **usuario**.

 Un usuario representa a una persona real.

 Una persona puede tener:

 - Familia.
- Amigos.
- Trabajo.
- Estudios.
- Proyectos.
- Organizaciones.
- Grupos.
- Servicios.
- Contactos.
- Diferentes contextos.

 Por ello, un usuario puede pertenecer simultáneamente a diferentes grupos.

 Ejemplo:

```
Juan
├── Familia García
├── Universidad
├── Empresa XYZ
└── Proyecto personal
```

 Cada contexto puede tener diferentes relaciones, permisos, información y reglas.

---

 # Grupos

 Un grupo es una estructura que reúne usuarios relacionados.

 Ejemplos:

 - Familia.
- Amigos.
- Trabajo.
- Universidad.
- Proyecto.
- Comunidad.
- Organización.

 Un usuario puede pertenecer a múltiples grupos.

 Los grupos pueden tener:

 - Usuarios.
- Administradores.
- Roles.
- Permisos.
- Información compartida.
- Reglas.
- Automatizaciones.

---

 # Administradores

 Un administrador no es una entidad completamente diferente del usuario.

 Un **administrador es un usuario con privilegios dentro de un grupo u organización**.

 Por ejemplo:

```
Familia García

Padre → Admin
Madre → Admin
Hijo  → Usuario
```

 El mismo usuario puede ser administrador en un grupo y usuario normal en otro.

 Ejemplo:

```
Juan

Familia       → Admin
Universidad   → Usuario
Empresa       → Usuario
Proyecto      → Admin
```

---

 # Organizaciones

 Una organización es un grupo organizado de usuarios.

 Puede representar:

 - Empresas.
- Instituciones.
- Equipos.
- Comunidades.
- Organizaciones.

 Una organización puede tener:

 - Usuarios.
- Administradores.
- Roles.
- Dominios relacionados.
- Propietarios o responsables.
- Permisos.
- Políticas.
- Información compartida.

 La organización puede utilizar el contexto de sus usuarios y dominios relacionados para organizar información.

---

 # Permisos y consentimiento

 El acceso a la información debe estar controlado mediante permisos.

 Un administrador puede registrar o invitar usuarios relacionados y solicitar determinados permisos.

 Por ejemplo:

 | Recurso | Solicitud | Decisión |
| --- | --- | --- |
| Gmail | Leer correos | Aceptar |
| Contactos | Consultar contactos | Limitar |
| Calendario | Consultar eventos | Rechazar |
| Finanzas | Consultar gastos | Aceptar |
| Chats | Consultar mensajes | Rechazar |

El usuario puede:

 - Aceptar.
- Rechazar.
- Limitar.

 El administrador no obtiene automáticamente toda la información de una persona por el simple hecho de ser administrador.

 Debe existir una relación válida y el nivel de acceso correspondiente.

---

 # Historial de permisos

 Las decisiones sobre permisos deben poder quedar registradas.

 Ejemplo:

```
12/10
Gmail solicitado
Resultado: Rechazado

20/10
Gmail solicitado nuevamente
Resultado: Limitado

25/10
Gmail actualizado
Resultado: Aceptado
```

 Esto permite tener trazabilidad sobre los accesos y cambios de permisos.

---

 # Fuentes de información

 Cada usuario puede conectar diferentes fuentes.

 Entre ellas:

 - Correos electrónicos.
- Contactos.
- Calendarios.
- APIs.
- Servicios externos.
- Información financiera.
- Chats.
- Otras fuentes futuras.

 El usuario debe poder controlar qué fuentes están conectadas y qué puede hacer FinApp con la información obtenida.

---

 # Arquitectura conceptual

 La visión general puede representarse así:

```
                 ┌───────────────────┐
                 │      USUARIO      │
                 └─────────┬─────────┘
                           │
             ┌─────────────┼─────────────┐
             │             │             │
          Grupos     Organizaciones   Fuentes
             │             │             │
             └─────────────┼─────────────┘
                           │
                    Permisos / Contexto
                           │
                    ┌──────▼──────┐
                    │    n8n      │
                    └──────┬──────┘
                           │
                    Reglas + IA
                           │
                    Clasificación
                           │
                    ┌──────▼──────┐
                    │  FinApp API │
                    └──────┬──────┘
                           │
                    Base de datos
                           │
                    ┌──────▼──────┐
                    │  Dashboard  │
                    └─────────────┘
```

---

 # Backend

 El backend de FinApp está siendo desarrollado con:

 - Java.
- Spring Boot.
- Base de datos.
- Servidor propio o AWS.

 El backend será responsable progresivamente de:

 - Usuarios.
- Autenticación.
- Grupos.
- Organizaciones.
- Roles.
- Permisos.
- Relaciones.
- Registros.
- Información financiera.
- Integraciones.
- Persistencia.
- Automatizaciones.

---

 # Estado actual

 La versión actual del frontend todavía es una aplicación de demostración.

 Actualmente:

 - El dashboard utiliza cifras de ejemplo.
- No se manejan cuentas financieras reales.
- No existe persistencia financiera real.
- El backend todavía está en construcción.
- El login y registro no tienen una autenticación real conectada.
- La interfaz no procesa todavía la información financiera real.
- La integración con bancos todavía no está implementada.
- La IA todavía no funciona como una característica integrada directamente en el frontend.
- n8n forma parte de la visión de automatización futura.

---

 # Tecnología actual

 Frontend:

 - React 18.
- Vite 5.
- Tailwind CSS 4.
- React Router 6.
- Vitest.
- Testing Library.

 Backend en desarrollo:

 - Java.
- Spring Boot.
- Base de datos.
- Infraestructura propia o AWS.

 Automatización:

 - n8n.

 IA:

 - Servicios/modelos de IA utilizados mediante los flujos de automatización.

---

 # Visión de producto

 FinApp no busca limitarse a ser una aplicación para registrar gastos.

 La visión es crear un sistema capaz de:

 > **Recopilar información relacionada con una persona, comprenderla, organizarla, clasificarla, priorizarla y presentarla de manera útil para ayudar a gestionar su vida.**

 La información puede pertenecer a:

 - Una persona.
- Una relación.
- Un grupo.
- Una organización.
- Un servicio.
- Una actividad.
- Un evento.
- Una transacción.

---

 # Ejemplo de experiencia futura

 Una persona conecta su correo con FinApp.

 FinApp detecta:

```
Netflix
Spotify
Universidad
Banco
Tienda
Correo laboral
Spam
```

 La información se procesa:

```
Netflix
→ Suscripción
→ Entretenimiento
→ Próximo pago
→ Prioridad

Universidad
→ Estudios
→ Evento / pago
→ Prioridad

Banco
→ Finanzas
→ Movimiento
→ Registro financiero

Correo laboral
→ Trabajo
→ Usuario / organización correspondiente

Spam
→ Spam
→ Baja prioridad
```

 Posteriormente el dashboard puede presentar una visión general de la vida del usuario.

---

 # Objetivo final

 FinApp busca que una persona no tenga que revisar manualmente cada fuente de información para entender qué está ocurriendo en su vida.

 En lugar de:

```
Correo + WhatsApp + bancos + calendario + contactos
+ suscripciones + notas + gastos + diferentes aplicaciones
```

 la intención es construir:

```
                    FINAPP
                       │
        ┌──────────────┼──────────────┐
        │              │              │
     Finanzas       Relaciones      Actividades
        │              │              │
     Pagos          Contactos       Estudios
     Gastos         Grupos          Trabajo
     Ingresos       Familia         Entretenimiento
     Deudas         Organizaciones  Eventos
        │              │              │
        └──────────────┼──────────────┘
                       │
                 Información
                 organizada
                       │
                  Automatización
                       │
                     IA
                       │
                 Usuario informado
```

 El objetivo no es controlar la vida de la persona, sino **darle una visión centralizada y organizada de la información que decide conectar para que pueda gestionarla de forma más sencilla.**

 Este documento ya puede funcionar como **base conceptual del proyecto**. La siguiente evolución natural sería separar esta visión de la documentación técnica: `README.md` para explicar FinApp rápidamente y documentos específicos para **arquitectura, permisos, modelo de datos, IA/n8n y roadmap**.