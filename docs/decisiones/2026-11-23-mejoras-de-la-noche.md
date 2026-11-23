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

| Morton y otros, Br J Sports Med 2018;52(6):376-384 | 49 ensayos y 1.863 personas. El beneficio de sumar proteína se frena en 1,62 g por kilo (intervalo 1,03 a 2,20). Ese quiebre no llegó a ser estadísticamente significativo (p = 0,079). El artículo tiene una corrección de 2020 que no se leyó. |
| Watson y otros, Sleep y J Clin Sleep Med 2015;11(6):591-592 | Consenso: 7 horas o más por noche, de forma regular, para adultos de 18 a 60 años. |
| Ashwell, Gunn y Gibson, Obesity Reviews 2012;13(3):275-286 | Solo se confirmó la ficha y el título: la relación cintura/altura detecta mejor el riesgo que el perímetro de cintura y el índice de masa corporal. |

**Lo que sigue sin confirmar en la fuente:** el corte exacto de 0,5 (cintura menor a la mitad de la altura) de Ashwell, y la fórmula de grasa para mujeres contra su informe original. Quorum usa 2 g de proteína por kilo, que queda dentro del intervalo de Morton pero por encima de su punto medio: es una decisión de producto por comer en déficit, y así lo dice la pantalla.

## Segunda tanda

- **Rutina del día.** `src/dominio/rutina.ts` trae los ejercicios, series, repeticiones y descansos de cada sesión, tomados del plan definitivo de Matias (máquinas, Smith y poleas). Las estructuras de 4 y 3 días se armaron con los mismos ejercicios y rangos. En Hoy se abre con un toque y trae la versión de veinte minutos.
- **Acuerdos que se achican.** La regla que el Directorio ya anunciaba ahora existe: si un acuerdo no se cumple en los tres días anteriores, hoy aparece en su versión chica (`estaAchicado` en `hoy.ts`). En cuanto sale un día, vuelve a su tamaño. No cuenta los primeros tres días del plan.
- **Acta de la semana.** Hoy muestra cuántos de los últimos 7 días votó cada especialista (`actaSemanal`).
- **Íconos.** PNG de 192 y 512, uno recortable y el de iPhone, para instalar la app en la pantalla de inicio.

## Lo que no se hizo

- GitHub Pages sigue sin publicar: el repositorio no tiene Pages activado y eso solo lo puede hacer el dueño (Settings › Pages › Source: GitHub Actions).
- `revisar.mjs` sigue fuera de CI porque usa el Playwright del entorno.
