---
name: react-vite
description: Arquitectura y estándares para componentes React + Vite + Tailwind CSS v4.
---

# SKILL: react-vite

Arquitectura de componentes React + Vite + Tailwind v4.

## reglas
- Un componente por archivo, header JSDoc obligatorio (ver file-header-template.md)
- Hooks reutilizables en `src/hooks/`
- Animaciones de scroll-reveal con CSS + IntersectionObserver (sin libs)
- Framer Motion permitido solo para interacciones puntuales: hover/tap, modales (AnimatePresence), indicador activo con layoutId y contadores animados; nunca para el reveal de scroll. Respetar useReducedMotion().
- Nombres de props/estados/eventos en español

## estado
Inicializado: package.json, vite.config.js, index.html, src/main.jsx, src/App.jsx.
