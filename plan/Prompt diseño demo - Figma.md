tegnologia usada React + Vite + Tailwind CSS v4


Crea una landing page para una app de finanzas personales llamada FinApp usando React + Vite + Tailwind CSS v4.

Estética: Editorial oscura. Hero con gradiente #0f1117 → #1a3a2e → #1a7a5e, grid decorativo de líneas blancas semitransparentes. Secciones de contenido sobre fondo crema #f7f6f2. Tipografía: Fraunces (display/headings) + Outfit (body), ambas de Google Fonts.

Paleta: Verde esmeralda #1a7a5e como color primario, acento menta #6ee7c0, texto oscuro #0f1117, slate #5a6475 para secundarios, regla #e0ddd8.

Navbar sticky transparente al inicio (texto blanco sobre el hero oscuro); al hacer scroll pasa con transición suave (0.4s ease) a fondo rgba(247,246,242,0.92) con blur, borde inferior y se compacta en altura. Logo "FinApp" con "Fin" en esmeralda.

Secciones en orden:

Hero — tagline serif grande, badge pill, subtítulo ligero, dos CTAs (primario + outline), y un mini-dashboard card con 4 categorías (Ingresos, Gastos, Ahorro, Otro) con glassmorphism.
Stats bar — fondo esmeralda sólido, 4 métricas en grid: "12 k+ Usuarios activos", "98 % Satisfacción", "$2.4 M Gestionados", "0 costo Para empezar".
Features — heading + 5 tarjetas en grid auto-fill (mín 280 px): Registro personal, Ahorro (verde), Gastos (rojo #c0392b), Ingresos (azul #2563eb), Otro (violeta #7c3aed). Cada tarjeta tiene ícono SVG con fondo de color tenue, título y descripción.
Cómo funciona — fondo blanco, heading slide-from-left, 3 pasos numerados 01 / 02 / 03 en grid de 3 columnas con números grandes en gris claro como decoración.
CTA final — fondo degradado oscuro, headline serif, botón primario.
Footer — logo + copyright, borde superior.
Animaciones de scroll con IntersectionObserver (sin librerías externas). Tres variantes aplicadas por clase CSS:

.reveal → fade + translateY(36px), transition: 0.7s cubic-bezier(0.22,1,0.36,1)
.reveal-stagger → los hijos aparecen en cascada con 90ms de delay entre cada uno (hasta 5 hijos)
.reveal-left → fade + translateX(-40px) Cada sección usa un useReveal hook con IntersectionObserver que agrega la clase revealed una sola vez al entrar al viewport.
Modal de autenticación (registro / login) con tabs, animación modalIn keyframe al abrir, backdrop blur. Campos con borde que cambia a esmeralda en focus.

