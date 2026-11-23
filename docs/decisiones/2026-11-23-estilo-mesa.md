# Estilo visual: de Cristal a Mesa (23/11/2026)

## Contexto
Con la primera versión a la vista, Matias dijo que el estilo Cristal no lo convencía. Se hizo un análisis de qué diseño funciona hoy y hacia dónde va: https://claude.ai/artifact/48Ke3GA3vRBfZMryfzzpE3

## Opciones
Tres direcciones dibujadas sobre la pantalla Hoy (https://claude.ai/artifact/MJvtbjck7BdMW4FAkxjX95, fila de abajo): Mesa, Horizonte e Instrumento.

## Decisión
**Mesa.** El Directorio se ve como una mesa redonda con cinco sillas, una por especialista y en el orden del día. Cada silla se enciende al cumplir su acuerdo; con tres hay quórum.

## Porqué
- Cristal era correcto pero genérico: tablero oscuro, anillo y tarjetas, como tantas apps de salud.
- Claro por defecto: con visión normal se lee mejor sobre fondo claro (Nielsen Norman Group), y es lo recomendado para apps de salud. El oscuro sigue al sistema del teléfono.
- Una sola cosa grande: la carta "sigue", invertida, con la acción al alcance del pulgar.
- La mesa hace visible el nombre Quorum y es una idea que no se copia de otra app.

## Reglas que quedan
- El estado de una silla nunca depende solo del color: la votada lleva tilde, la que sigue lleva punto y la palabra "sigue".
- La acción de Hoy queda a la vista sin desplazar, también en 360×640 (lo controla `revisar.mjs`).
- Sin vidrio ni luces de fondo. El movimiento solo marca el voto, y se apaga con movimiento reducido.

## Qué la revertiría
Que en una prueba con personas la mesa no se entienda sin explicación.
