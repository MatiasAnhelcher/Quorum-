# 23/11/2026 · Entreno y Herramientas

Matias probó la app publicada y dijo que estaba buena pero no era "wow": pidió que fuera mucho más útil, con rutinas para cada día y muchas más herramientas para la vida y el desarrollo. Este es el primer salto.

## Qué se decidió

- **Entreno pasa a ser una sección propia.** La rutina estaba escondida en una tarjeta plegada de Hoy y no se veía. Ahora tiene la semana de lunes a domingo, la sesión de cada día y cada ejercicio con músculos, claves de técnica y error común.
- **Registro de series y doble progresión.** Se anota peso y repeticiones. La próxima vez la app dice qué hacer: si llegaste al tope del rango en todas las series, subís el peso; si alguna quedó debajo del mínimo, bajás; si no, mismo peso y una repetición más (`sugerencia` en `rutina.ts`). Al anotar arranca el descanso de ese ejercicio.
- **Herramientas es la quinta sección**, con cinco para empezar:
  - Bloque de foco de 25 minutos que termina escribiendo de memoria lo aprendido, y antes de empezar muestra el repaso anterior (repaso espaciado). Vota Mente.
  - Planes si-entonces, uno por acuerdo. El plan aparece en la carta "sigue" de Hoy.
  - Cierre del día en tres pasos. Vota Estrategia.
  - Respiración lenta guiada: 4 segundos de entrada y 6 de salida, 5 minutos.
  - Revisión de la semana: acta, tres preguntas y el cambio elegido la semana anterior.
- **Navegación en cinco secciones:** Hoy, Entreno, Herramientas, Directorio y Progreso (Seguimiento y Proyección quedan juntas, con dos pestañas).
- **Datos:** `bitacora`, `intenciones`, `revisiones` y `repasos` se suman al estado como campos opcionales. La copia de seguridad los incluye y sigue aceptando copias viejas.

## Fuentes leídas

| Herramienta | Fuente | Qué dice |
| --- | --- | --- |
| Planes si-entonces | Gollwitzer y Sheeran, Advances in Experimental Social Psychology 2006;38:69-119 | 94 pruebas independientes, efecto medio a grande (d = 0,65) sobre cumplir el objetivo. |
| Foco con repaso | Dunlosky y otros, PSPI 2013 | Ponerse a prueba y espaciar el repaso, utilidad alta. Los 25 minutos son una convención, sin evidencia propia, y la pantalla lo dice. |
| Respiración lenta | Zaccaro y otros, Frontiers in Human Neuroscience 2018;12 | Revisión de 15 estudios: menos de 10 respiraciones por minuto se asocia con más variabilidad del pulso y más calma. Evidencia limitada, en personas sanas, sin ensayos controlados, y no mide el sueño de forma directa. Solo se leyó textual el resumen. |

Las claves de técnica de los ejercicios son práctica general de entrenamiento en máquinas, no salen de un estudio. Los ejercicios, series y descansos son los del plan definitivo de Matias.

## Lo que sigue (no entra en este cambio)

- Menú del día con cantidades por comida. Necesita una tabla de alimentos verificada contra una fuente antes de mostrar gramos.
- Más herramientas: comunicación (preparar una conversación difícil), energía del día, decisiones, lectura activa.
- Recordatorios: necesitan permiso de notificaciones y, para ser confiables, un servidor.
