# 23/11/2026 · Mejoras de la noche

Matias pidió seguir mejorando la app en modo automático y elegir lo recomendado en cada caso. Esto es lo que se decidió y por qué.

## El plan se corrige solo

- La regla vive en `ajustePropuesto` (`src/dominio/seguimiento.ts`), con tests.
- Solo propone cuando hay dato suficiente (3 pesadas esta semana y 3 la anterior) y el ritmo se sale del rango esperado.
- Cada corrección mueve 100 kcal. Bajando de peso: lento resta y rápido suma. Subiendo es al revés.
- Entre dos ajustes pasan 14 días, para leer el efecto del anterior. El tope acumulado es 300 kcal: más que eso pide rehacer el diagnóstico.
- La proteína no se toca y las calorías nunca bajan del gasto en reposo.
- La app propone y la persona aplica. Nada cambia sin un toque.
- La corrección se guarda en el perfil (`ajusteKcal`, `ajusteFecha`) y se reinicia al corregir el diagnóstico, porque un diagnóstico nuevo es un punto de partida nuevo.

## Las sillas se tocan

Cada silla de la mesa es un botón (teclado incluido) que vota o retira el voto. La lista de abajo sigue igual: son dos caminos a la misma acción.

## Sin conexión

`vite.config.ts` genera `sw.js` al compilar, con la lista exacta de archivos de esa versión. La página se pide primero a la red (para recibir versiones nuevas) y sin conexión sale la guardada. No se sumó ninguna dependencia. Las tipografías de otros alfabetos no se guardan de entrada.

## Copia de seguridad y tema

- Seguimiento permite descargar un archivo `.json` con todo y restaurarlo. `leerCopia` rechaza archivos que no son de Quorum, y restaurar pide confirmación porque reemplaza lo que hay.
- Tema: Automático (sigue al teléfono), Claro u Oscuro. Se guarda aparte de los datos (`quorum.tema`).

## Contraste medido

`src/estilos.test.mjs` mide los tokens en claro y en oscuro contra WCAG 2.2 (4,5 para texto, 3 para trazos y figuras) y corre con `npm test`, también en CI. Todos los pares pasaron sin cambiar ningún color.

## Fuentes científicas

Leídas esta noche en la fuente y corregidas en `directorio.ts` para decir solo lo que el estudio dice:

| Fuente | Qué se confirmó |
| --- | --- |
| Schoenfeld, Ogborn y Krieger, Sports Med 2016;46(11):1689-1697 | Metaanálisis de 10 estudios: dos veces por semana supera a una. Tres veces queda sin resolver. |
| Mifflin y otros, 1990 | La ecuación del código coincide con la del resumen (498 personas sanas). |
| Dunlosky y otros, PSPI 2013 | Utilidad alta solo para ponerse a prueba y espaciar el repaso. |
| Lally y otros, EJSP 2010 (vía el resumen de la British Psychological Society) | Promedio de 66 días, rango de 18 a 254. Un día suelto perdido casi no pesa. |
| Hodgdon y Beckett, 1984, informe 84-11 | Coeficientes de la fórmula de hombres iguales a los del código. Error estándar de unos 3,5 puntos. |

**Sin leer todavía** (PubMed bloqueó la lectura automática): Morton y otros 2018 (proteína), Watson y otros 2015 (sueño) y Ashwell y otros 2012 (cintura). Se citan sin cifras nuevas. La fórmula de grasa para mujeres tampoco se contrastó con su informe original. Queda pendiente.

## Lo que no se hizo

- GitHub Pages sigue sin publicar: el repositorio no tiene Pages activado y eso solo lo puede hacer el dueño (Settings › Pages › Source: GitHub Actions).
- `revisar.mjs` sigue fuera de CI porque usa el Playwright del entorno.
