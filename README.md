# Quorum

Quorum es un sistema operativo de alto rendimiento personal. No es una app de hábitos: es un **Directorio de especialistas** (entrenamiento, nutrición, sueño, aprendizaje y estrategia de hábitos) que mira tu vida real y entrega un solo plan, con una proyección de tu cuerpo a 3, 6 y 12 meses.

## Qué hace la primera versión

| Pantalla | Qué resuelve |
|---|---|
| Diagnóstico | Alta guiada en cuatro pasos: vos, tus medidas, tu semana real, tu objetivo y presupuesto. |
| Hoy | La mesa del Directorio: cinco sillas que se tocan, una por especialista, que se encienden al cumplir cada acuerdo. Trae la rutina del día con ejercicios, el acta de la semana, y achica el acuerdo que falla tres días seguidos. Hay **quórum** con 3 de 5: un día imperfecto igual cuenta. |
| Entreno | La semana completa y la rutina guiada de cada día: técnica y error común de cada ejercicio, registro de series, qué peso usar hoy según la última vez (doble progresión) y cronómetro de descanso. |
| Herramientas | Bloque de foco con repaso de memoria, planes si-entonces y revisión de la semana. Pocas y con respaldo. |
| Directorio | El dictamen de cada especialista, con su plan B para días caóticos y su fuente. |
| Progreso · Proyección | Rango de peso esperado a 3, 6 y 12 meses, con tus pesadas reales dibujadas encima. |
| Progreso · Seguimiento | Peso (manda el promedio de 7 días), cintura, el ajuste del plan cuando el ritmo se sale de lo esperado, tema claro u oscuro, copia de seguridad, y todo lo que Quorum sabe de vos para corregirlo o borrarlo. |

## Reglas de producto

- Los datos viven solo en el teléfono (`localStorage`). No hay servidor ni cuentas.
- No hay rachas que castigan. La constancia se ve y un día flojo no borra nada.
- Ninguna conclusión sin datos suficientes: el ritmo de peso recién se lee con 3 pesadas por semana durante dos semanas.
- Cada afirmación de salud lleva su fuente. La grasa corporal con cinta se presenta siempre como estimación.
- El plan se corrige solo, de a 100 kcal y con 14 días entre ajustes. La app propone y la persona aplica.
- Funciona sin conexión después de la primera visita (service worker generado al compilar).
- El contraste de todos los colores se mide en los tests, en claro y en oscuro.
- Quorum no reemplaza a un profesional.

## Cómo está armado

- React 19, Vite 8 y TypeScript. Sin router ni librería de estado: son cinco secciones.
- `src/dominio/` tiene todas las reglas como funciones puras con tests (Vitest). Las pantallas solo las usan.
- `src/estilos.css` tiene el sistema visual **Mesa** como tokens, claro por defecto, oscuro según el sistema o elegido a mano. Ninguna pantalla escribe un color.
- `src/datos/almacen.ts` guarda y carga el estado, con versión.

## Comandos

```
npm ci
npm run dev          # desarrollo
npm run typecheck
npm test             # también: TZ=Australia/Sydney npm test
npm run build
npx vite preview --port 4173 &
node revisar.mjs     # recorre la app en 390×844 y 360×640, en claro y en oscuro, saca capturas y falla si algo se desborda
```

`revisar.mjs` usa el Playwright que ya esté instalado en el entorno; no es dependencia del proyecto y por ahora no corre en CI.

## Publicación

Cada push a `main` con CI en verde publica en GitHub Pages. Hay que activarlo una vez en Settings › Pages › Source: "GitHub Actions".

## Pendientes conocidos

- Las fuentes citadas en `src/dominio/directorio.ts` se escribieron de memoria y falta verificarlas una por una contra el estudio.
- Todavía no funciona sin conexión (falta el service worker) y el ícono es un SVG provisorio.
- El Directorio usa reglas fijas. La consulta conversacional con IA es el paso siguiente y necesita un servidor.

Decisiones: [`docs/decisiones/`](docs/decisiones/).
