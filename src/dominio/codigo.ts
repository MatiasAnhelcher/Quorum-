/**
 * El código: piezas cortas que se leen en dos minutos y terminan en una acción.
 * Cada una dice de dónde sale. Las ideas de Epicteto están dichas con palabras propias.
 */
export interface Pieza {
  id: string
  titulo: string
  bajada: string
  parrafos: string[]
  /** Lo que se hace hoy con esto. */
  accion: string
  /** Herramienta de la app que lo pone en práctica, si hay. */
  herramienta?: 'impulso' | 'reparto' | 'si-entonces' | 'destrabar' | 'vispera'
  fuente: string
}

export const CODIGO: Pieza[] = [
  {
    id: 'dominio',
    titulo: 'Las ganas no son órdenes',
    bajada: 'Dominio propio frente a la lujuria, el vicio y cualquier impulso.',
    parrafos: [
      'Un impulso se siente como una orden, pero es una ola: sube, llega a un pico y baja sola, la obedezcas o no. Quien no lo sabe cree que la única forma de que termine es ceder.',
      'Epicteto lo dijo hace dos mil años: cuando un placer te tienta, no te dejes arrastrar; esperá, y poné en la balanza el rato de gusto, el arrepentimiento de después y la satisfacción de haberte dominado.',
      'La psicología encontró lo mismo. En un estudio con fumadores, quienes aprendieron a observar las ganas sin actuar fumaron menos esa semana. Las ganas no bajaron: cambió lo que hacían con ellas.',
      'Y si caés, lo que decide el futuro es cómo leés la caída. "No tengo voluntad" lleva a seguir cayendo. "Esta situación todavía no la sé manejar" lleva a prepararla mejor.',
    ],
    accion: 'Elegí un solo frente y decidí ahora qué vas a hacer cuando aparezcan las ganas.',
    herramienta: 'impulso',
    fuente: 'Epicteto, Manual, sección 34. Bowen y Marlatt, Psychology of Addictive Behaviors, 2009 (123 fumadores, 7 días). Larimer, Palmer y Marlatt, Alcohol Research & Health, 1999;23(2):151-160. Los estudios son de tabaco y alcohol.',
  },
  {
    id: 'valor',
    titulo: 'Tu valor no lo decide otro',
    bajada: 'Para después de un rechazo, una ruptura o una decepción.',
    parrafos: [
      'Lo que otra persona siente, elige o dice de vos no depende de vos. Si ponés tu valor ahí, se lo entregaste a alguien que puede irse cuando quiera.',
      'Epicteto separa lo propio de lo ajeno: es tuyo lo que pensás, lo que elegís y lo que hacés. La reputación y las decisiones de los demás no lo son. Y agrega que lo que perturba no es lo que pasó, sino la opinión que te formás de lo que pasó.',
      'No le entregarías tu cuerpo a un desconocido. No le entregues tu cabeza a quien te rechazó.',
      'El dolor es real y no hay que taparlo. Pero el valor se reconstruye con hechos: entrenar, cumplir, aprender, cuidar a los tuyos. Eso nadie te lo puede sacar ni dar.',
    ],
    accion: 'Escribí qué de todo esto depende de vos y elegí un paso para hoy.',
    herramienta: 'reparto',
    fuente: 'Epicteto, Manual, secciones 1, 5 y 28. Es filosofía, no un ensayo clínico. Si la tristeza no afloja con las semanas, hablalo con un profesional.',
  },
  {
    id: 'palabra',
    titulo: 'Lo que decidís cumplir es ley',
    bajada: 'La palabra que te das a vos mismo vale tanto como la que le das a otro.',
    parrafos: [
      'Cada vez que te prometés algo y no lo hacés, aprendés que tu palabra no vale. Cada vez que cumplís, aunque sea algo chico, aprendés lo contrario. La confianza en uno mismo es ese historial.',
      'Epicteto pide tratar lo que uno decidió como una ley que no se rompe, dejar de postergarse y cumplir el propio papel de padre, hijo, hermano o amigo sin esperar a que el otro cumpla el suyo.',
      'Para que la palabra se cumpla conviene prometer poco y concreto. Los planes que dicen "si pasa tal cosa, hago tal otra" se cumplen más que las buenas intenciones: en 94 pruebas, el efecto fue de medio a grande.',
    ],
    accion: 'Prometete una sola cosa para hoy, con su momento exacto, y cumplila.',
    herramienta: 'si-entonces',
    fuente: 'Epicteto, Manual, secciones 30, 50 y 51. Gollwitzer y Sheeran, Advances in Experimental Social Psychology, 2006;38:69-119 (d = 0,65).',
  },
  {
    id: 'silencio',
    titulo: 'Hablá poco, que se vea en lo que hacés',
    bajada: 'Presencia sin ruido: ni queja, ni alarde, ni crítica.',
    parrafos: [
      'El que anuncia lo que va a hacer ya cobró el aplauso y le quedan menos ganas de hacerlo. El que critica a todos muestra en qué anda pensando.',
      'Epicteto es directo: hablá poco y de lo necesario, no te compares ni andes juzgando a la gente, no cuentes tus hazañas. No expliques tus principios: vivilos.',
      'Su señal de avance es práctica: el que progresa no culpa a nadie, no se queja y no habla de sí mismo como si fuera alguien. Se vigila a sí mismo.',
    ],
    accion: 'Hasta la noche: ninguna queja, ninguna crítica y ningún anuncio. Solo hacer.',
    fuente: 'Epicteto, Manual, secciones 33, 46 y 48.',
  },
  {
    id: 'constancia',
    titulo: 'Fallar un día no rompe nada',
    bajada: 'Constancia de verdad: volver, no ser perfecto.',
    parrafos: [
      'Un hábito tarda más de lo que se dice. En un estudio que siguió a personas armando un hábito nuevo, volverse automático llevó 66 días en promedio, con casos de 18 y casos de 254.',
      'El dato que más importa de ese estudio es otro: fallar un día suelto casi no cambió el resultado. Lo que rompe un hábito no es la falla sino abandonar después de la falla.',
      'Por eso en Quorum la racha se mide en semanas y lo ganado nunca vuelve a cero. Hecho es mejor que perfecto: la versión chica de hoy vale más que la versión ideal de nunca.',
    ],
    accion: 'Elegí lo que venís pateando y terminá hoy su versión más chica.',
    herramienta: 'destrabar',
    fuente: 'Lally y otros, European Journal of Social Psychology, 2010.',
  },
]
