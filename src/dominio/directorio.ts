import { cinturaObjetivo, grasaEstimada, planDeComida } from './cuerpo'
import type { IdEspecialista } from './hoy'
import { horasDeSueno, sumarMinutos } from './tiempo'
import type { Perfil, Presupuesto } from './tipos'

export interface Dictamen {
  id: IdEspecialista
  rol: string
  /** Una frase con la decisión del especialista para esta persona. */
  veredicto: string
  puntos: string[]
  /** Versión mínima viable para un día caótico. */
  planB: string
  fuente: string
}

const PROTEINAS: Record<Presupuesto, string> = {
  ajustado: 'huevos, pollo, lentejas y avena',
  medio: 'pollo, huevos, carne magra y atún',
  holgado: 'pollo, carne magra, pescado, huevos y proteína en polvo',
}

const ESTRUCTURA: Record<Perfil['diasEntreno'], string> = {
  5: 'Cinco días: torso, pierna, tirón, empuje y pierna.',
  4: 'Cuatro días: torso y pierna, dos veces cada uno.',
  3: 'Tres días de cuerpo completo, con un día libre entre sesiones.',
}

const numero = (n: number, decimales = 0) => n.toLocaleString('es-AR', { maximumFractionDigits: decimales, minimumFractionDigits: decimales })

/** El Directorio: cada especialista mira el mismo perfil y entrega su parte del plan único. */
export function dictamenes(p: Perfil): Dictamen[] {
  const comida = planDeComida(p)
  const grasa = grasaEstimada(p)
  const sueno = horasDeSueno(p.horaDormir, p.horaDespertar)
  const suenoCorto = sueno < 7
  const entrenaTemprano = horasDeSueno(p.horaDespertar, p.horaEntreno) <= 2

  return [
    {
      id: 'biomecanico',
      rol: 'Biomecánico y entrenador',
      veredicto: ESTRUCTURA[p.diasEntreno],
      puntos: [
        'Cada músculo se entrena dos veces por semana.',
        'Cada serie termina con 1 o 2 repeticiones en reserva.',
        'Cuando llegás al tope de repeticiones en todas las series, la próxima vez subís el peso.',
      ],
      planB: 'Día sin tiempo: los dos primeros ejercicios de la sesión, tres series cada uno. Veinte minutos.',
      fuente: 'Schoenfeld, Ogborn y Krieger, Sports Medicine, 2016;46(11):1689-1697. Metaanálisis de 10 estudios: entrenar cada músculo dos veces por semana da más crecimiento que una. Si tres veces rinde todavía más, no está resuelto.',
    },
    {
      id: 'nutricion',
      rol: 'Biólogo y nutricionista deportivo',
      veredicto: `${numero(comida.kcal)} kcal por día, con ${comida.proteinaG} g de proteína.`,
      puntos: [
        `El resto: ${comida.grasaG} g de grasa y ${comida.carbosG} g de carbohidratos.`,
        `Con tu presupuesto, la proteína sale de ${PROTEINAS[p.presupuesto]}.`,
        grasa === null
          ? 'Con estas medidas no se puede estimar tu grasa corporal. Revisá cintura y cuello.'
          : `Grasa corporal estimada con cinta: ${numero(grasa)} %. Es una estimación, con varios puntos de error.`,
        `Primer objetivo de cintura: menos de ${cinturaObjetivo(p.alturaCm)} cm, la mitad de tu altura.`,
      ],
      planB: 'Día caótico: cuidá solo la proteína. Las calorías se compensan con el promedio de la semana.',
      fuente: 'Mifflin y otros, American Journal of Clinical Nutrition, 1990: ecuación de gasto en reposo, medida en 498 personas sanas. Morton y otros, British Journal of Sports Medicine, 2018;52(6):376-384: en 49 ensayos, sumar proteína dejó de dar más músculo cerca de 1,6 g por kilo, con un intervalo de 1,0 a 2,2. Quorum usa 2 g, dentro de ese intervalo, porque comés en déficit. Cintura: Ashwell, Gunn y Gibson, Obesity Reviews, 2012;13(3):275-286, la relación cintura/altura detecta el riesgo mejor que el índice de masa corporal.',
    },
    {
      id: 'sueno',
      rol: 'Especialista en sueño y recuperación',
      veredicto: suenoCorto
        ? `Tus horarios dan ${numero(sueno, 1)} horas en la cama. Es poco: adelantá la hora de dormir a las ${sumarMinutos(p.horaDespertar, -450)}.`
        : `Tus horarios dan ${numero(sueno, 1)} horas en la cama. Alcanza: el trabajo es sostener la hora.`,
      puntos: [
        `Acostarte y levantarte a la misma hora todos los días, también el fin de semana.`,
        'Pantallas afuera 30 minutos antes de dormir.',
        'Última comida 2 horas antes de acostarte.',
      ],
      planB: 'Noche corta: no la compenses durmiendo hasta tarde. Levantate a tu hora y esa noche acostate 30 minutos antes.',
      fuente: 'Watson y otros, Sleep y Journal of Clinical Sleep Medicine, 2015: consenso de las dos sociedades de sueño de Estados Unidos. Los adultos de 18 a 60 años deberían dormir 7 horas o más por noche, de forma regular.',
    },
    {
      id: 'neuro',
      rol: 'Neurocientífico de aprendizaje',
      veredicto: `Un bloque de 25 minutos de foco por día, a las ${p.horaFoco}.`,
      puntos: [
        'Una sola tarea y el celular en otro ambiente.',
        'Al terminar, cerrás el material y escribís de memoria lo que aprendiste.',
        'Repasás lo mismo al día siguiente y a la semana: espaciar rinde más que repetir de corrido.',
      ],
      planB: 'Día sin tiempo: cinco minutos de repaso de memoria de lo último que estudiaste.',
      fuente: 'Dunlosky y otros, Psychological Science in the Public Interest, 2013: de diez técnicas de estudio, solo dos sacaron utilidad alta, ponerse a prueba de memoria y espaciar el repaso. Releer y subrayar sacaron utilidad baja.',
    },
    {
      id: 'estratega',
      rol: 'Estratega de tiempo y hábitos',
      veredicto: entrenaTemprano
        ? 'Entrenás apenas te levantás: todo se decide la noche anterior.'
        : 'Cada hábito va pegado a algo que ya hacés todos los días.',
      puntos: [
        'Dos minutos antes de dormir: ropa, comida y la primera tarea de mañana.',
        'Hay quórum con 3 de los 5 acuerdos. Un día imperfecto igual cuenta.',
        'Si un acuerdo falla tres días seguidos, se achica: no se abandona.',
      ],
      planB: 'Semana complicada: sostené solo dos acuerdos, sueño y proteína. El resto vuelve cuando afloja.',
      fuente: 'Lally y otros, European Journal of Social Psychology, 2010: un hábito tardó en promedio 66 días en volverse automático, con un rango de 18 a 254 según la persona. Fallar un día suelto casi no cambió el resultado.',
    },
  ]
}

export const NOMBRE_CORTO: Record<IdEspecialista, string> = {
  biomecanico: 'Entreno',
  nutricion: 'Nutrición',
  sueno: 'Sueño',
  neuro: 'Mente',
  estratega: 'Estrategia',
}
