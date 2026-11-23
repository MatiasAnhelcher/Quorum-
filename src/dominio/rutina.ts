import { sesionDelDia } from './hoy'
import { sumarDias, desdeFecha } from './tiempo'
import type { Perfil } from './tipos'

export interface Ejercicio {
  nombre: string
  /** Series por repeticiones, por ejemplo 3×8–12. El rango decide el peso. */
  series: string
  descanso: string
  /** Músculos que trabaja, en palabras simples. */
  musculos: string
  /** Dos o tres claves de técnica: lo que hay que cuidar en cada repetición. */
  claves: string[]
  /** El error más común, para reconocerlo. */
  error: string
}

const e = (nombre: string, series: string, descanso: string, musculos: string, claves: string[], error: string): Ejercicio => ({ nombre, series, descanso, musculos, claves, error })

// Ejercicios en máquinas, Smith y poleas: técnica simple y segura para entrenar sin ayudante.
const PRESS_SMITH = e('Press de banca en Smith', '3×6–10', '2–3 min', 'Pecho, hombro delantero y tríceps',
  ['Hombros atrás y abajo, pecho arriba, pies firmes en el piso.', 'Bajás la barra a la mitad del pecho en 2 segundos.', 'Subís sin despegar la cola ni los hombros del banco.'],
  'Rebotar la barra en el pecho o abrir los codos a 90 grados.')
const REMO_MAQUINA = e('Remo en máquina con pecho apoyado', '3×8–12', '2 min', 'Espalda media, dorsales y bíceps',
  ['El pecho no se despega del apoyo.', 'Llevás los codos hacia atrás y juntás los omóplatos un segundo.', 'Volvés lento hasta estirar los brazos.'],
  'Tirar con impulso del torso en vez de con la espalda.')
const CRUCE = e('Cruce de poleas de abajo hacia arriba', '3×12–15', '90 s', 'Pecho, sobre todo la parte alta',
  ['Poleas abajo, un paso adelante, codos apenas flexionados.', 'Subís las manos hasta la altura de la cara y las juntás.', 'Bajás lento sintiendo el estiramiento del pecho.'],
  'Doblar los codos y convertirlo en un press.')
const JALON_ABIERTO = e('Jalón al pecho con agarre abierto', '3×8–12', '2 min', 'Dorsales y bíceps',
  ['Pecho arriba y una leve inclinación hacia atrás.', 'Bajás la barra hasta la clavícula llevando los codos a los bolsillos.', 'Subís controlado hasta estirar los brazos.'],
  'Tirarse hacia atrás con todo el cuerpo para mover más peso.')
const LATERALES = e('Elevaciones laterales en polea', '3×12–15', '60 s', 'Hombro, la parte del costado',
  ['Polea abajo, el cable cruza por delante del cuerpo.', 'Subís el brazo hasta la altura del hombro, codo apenas flexionado.', 'Bajás en 2 segundos sin soltar la tensión.'],
  'Encoger el hombro hacia la oreja o subir con envión.')
const CURL_Z = e('Curl con barra Z', '3×10–12', '60 s', 'Bíceps',
  ['Codos pegados al costado y quietos.', 'Subís la barra sin mover los hombros.', 'Bajás del todo, lento.'],
  'Balancear la espalda para ayudar a subir.')
const TRICEPS_SOGA = e('Extensión de tríceps en polea con soga', '3×10–12', '60–90 s', 'Tríceps',
  ['Codos pegados al cuerpo, torso apenas inclinado.', 'Estirás los brazos y abrís la soga abajo.', 'Subís hasta que el antebrazo pasa la horizontal.'],
  'Despegar los codos y empujar con los hombros.')
const SENTADILLA = e('Sentadilla en Smith', '4×8–10', '3 min', 'Cuádriceps y glúteos',
  ['Pies un poco adelante de la barra, al ancho de los hombros.', 'Bajás hasta que el muslo queda paralelo al piso, rodillas en línea con los pies.', 'Subís empujando el piso, sin trabar las rodillas de golpe.'],
  'Bajar poco para mover más peso, o dejar que las rodillas se cierren.')
const PRENSA = e('Prensa de piernas', '3×10–12', '2 min', 'Cuádriceps y glúteos',
  ['Pies al medio de la plataforma, al ancho de los hombros.', 'Bajás hasta 90 grados sin despegar la cola del asiento.', 'Subís sin trabar las rodillas.'],
  'Bajar tanto que la cadera se despega y la espalda baja se redondea.')
const GEMELOS = e('Gemelos en la prensa', '3×10–15', '60–90 s', 'Gemelos',
  ['Solo la punta de los pies en el borde de abajo de la plataforma.', 'Bajás el talón hasta estirar y hacés una pausa de un segundo.', 'Subís todo lo que puedas y apretás arriba.'],
  'Rebotar rápido con recorrido corto.')
const CUADRICEPS = e('Extensión de cuádriceps', '3×12–15', '90 s', 'Cuádriceps',
  ['La rodilla queda alineada con el eje de la máquina.', 'Estirás las piernas y apretás un segundo arriba.', 'Bajás en 2 o 3 segundos.'],
  'Patear el peso y dejarlo caer.')
const FEMORAL = e('Curl femoral', '3×10–12', '90 s', 'Isquiotibiales, la parte de atrás del muslo',
  ['La cadera queda pegada al apoyo todo el tiempo.', 'Llevás los talones hacia la cola.', 'Volvés lento hasta casi estirar.'],
  'Levantar la cadera para ayudarse.')
const CRUNCH_INVERSO = e('Crunch inverso en banco', '3×10–15', '60 s', 'Abdominales, sobre todo la parte baja',
  ['Acostado, manos agarrando el banco detrás de la cabeza.', 'Llevás las rodillas al pecho despegando la cola del banco.', 'Bajás lento sin arquear la espalda.'],
  'Hamacar las piernas con impulso.')
const JALON_CERRADO = e('Jalón con agarre cerrado', '3×8–12', '2 min', 'Dorsales y bíceps',
  ['Agarre neutro o cerrado, pecho arriba.', 'Bajás hasta el pecho llevando los codos pegados al cuerpo.', 'Subís controlado, estirando los dorsales.'],
  'Tirar con los brazos sin bajar los hombros primero.')
const REMO_POLEA = e('Remo sentado en polea', '3×10–12', '2 min', 'Espalda media y dorsales',
  ['Espalda derecha, rodillas apenas flexionadas.', 'Llevás el agarre al ombligo y juntás los omóplatos.', 'Estirás los brazos sin redondear la espalda.'],
  'Hamacar el torso adelante y atrás.')
const PULLOVER = e('Pullover en polea', '3×12–15', '90 s', 'Dorsales',
  ['De pie, polea alta, brazos casi estirados.', 'Bajás la barra en arco hasta los muslos.', 'Subís lento hasta sentir el estiramiento.'],
  'Doblar los codos y convertirlo en tríceps.')
const FACE_PULL = e('Face pull', '3×15–20', '60 s', 'Hombro de atrás y parte alta de la espalda',
  ['Polea a la altura de la cara, soga.', 'Tirás hacia la frente abriendo los codos, pulgares hacia atrás.', 'Volvés lento.'],
  'Usar mucho peso y tirar con la espalda baja.')
const CURL_POLEA = e('Curl bayesiano en polea', '3×10–12 por brazo', '60 s', 'Bíceps',
  ['De espaldas a la polea baja, un paso adelante, brazo detrás del cuerpo.', 'Flexionás el codo sin adelantar el hombro.', 'Bajás hasta estirar del todo.'],
  'Mover el hombro hacia adelante al subir.')
const MARTILLO = e('Curl martillo con soga', '2×12–15', '60 s', 'Bíceps y antebrazo',
  ['Polea baja, palmas enfrentadas.', 'Codos quietos al costado.', 'Subís y bajás controlado.'],
  'Separar los codos del cuerpo.')
const CRUNCH_POLEA = e('Crunch en polea', '3×12–15', '60 s', 'Abdominales',
  ['De rodillas, soga a los costados de la cabeza.', 'Enrollás el torso llevando los codos a las rodillas.', 'La cadera no se mueve: trabaja el abdomen.'],
  'Sentarse sobre los talones y tirar con los brazos.')
const INCLINADO = e('Press inclinado en Smith', '4×8–12', '2–3 min', 'Pecho alto, hombro delantero y tríceps',
  ['Banco a 30 grados, hombros atrás y abajo.', 'Bajás la barra a la parte alta del pecho.', 'Subís sin despegar los hombros del banco.'],
  'Poner el banco muy vertical: pasa a ser un press de hombros.')
const PECHO_MAQUINA = e('Press de pecho en máquina', '3×10–12', '2 min', 'Pecho y tríceps',
  ['Asiento a una altura en que las manos quedan a media altura del pecho.', 'Empujás sin trabar los codos.', 'Volvés lento hasta sentir el estiramiento.'],
  'Despegar los hombros del respaldo al empujar.')
const MARIPOSA = e('Apertura en máquina mariposa', '3×12–15', '90 s', 'Pecho',
  ['Codos apenas flexionados y a la altura del pecho.', 'Juntás las manos adelante y apretás un segundo.', 'Abrís lento hasta donde el hombro esté cómodo.'],
  'Abrir de más y forzar el hombro.')
const HOMBROS = e('Press de hombros en máquina', '3×8–12', '2 min', 'Hombros y tríceps',
  ['Espalda apoyada, manos apenas por delante de los hombros.', 'Empujás hacia arriba sin arquear la espalda.', 'Bajás hasta la altura de las orejas.'],
  'Arquear la zona lumbar para terminar la repetición.')
const TRICEPS_ALTO = e('Extensión de tríceps sobre la cabeza, en polea', '3×10–15', '60–90 s', 'Tríceps, la cabeza larga',
  ['De espaldas a la polea, soga detrás de la cabeza, codos apuntando adelante.', 'Estirás los brazos sin abrir los codos.', 'Volvés lento hasta sentir el estiramiento.'],
  'Abrir los codos hacia los costados.')
const PRENSA_ALTA = e('Prensa con los pies altos', '4×10–12', '2–3 min', 'Glúteos e isquiotibiales',
  ['Pies arriba en la plataforma, un poco más abiertos.', 'Bajás profundo sin despegar la cola.', 'Empujás con los talones.'],
  'Empujar con la punta del pie y cargar las rodillas.')
const PULL_THROUGH = e('Pull-through en polea', '3×12–15', '90 s', 'Glúteos e isquiotibiales',
  ['De espaldas a la polea baja, soga entre las piernas.', 'Llevás la cola hacia atrás con la espalda derecha.', 'Volvés empujando la cadera adelante y apretando glúteos.'],
  'Convertirlo en sentadilla doblando mucho las rodillas.')
const PLANCHA = e('Plancha', '3×30–45 s', '60 s', 'Abdominales y zona media',
  ['Codos debajo de los hombros.', 'Cuerpo en línea recta, glúteos y abdomen apretados.', 'Respirás normal.'],
  'Dejar caer la cadera o levantar la cola.')

/** Las sesiones, por nombre. Cada músculo aparece dos veces por semana en cualquiera de las tres estructuras. */
export const SESIONES: Record<string, Ejercicio[]> = {
  'Torso completo': [PRESS_SMITH, REMO_MAQUINA, CRUCE, JALON_ABIERTO, LATERALES, CURL_Z, TRICEPS_SOGA],
  'Pierna A': [SENTADILLA, PRENSA, GEMELOS, CUADRICEPS, FEMORAL, CRUNCH_INVERSO],
  'Tirón': [JALON_CERRADO, REMO_POLEA, PULLOVER, FACE_PULL, CURL_POLEA, MARTILLO, CRUNCH_POLEA],
  'Empuje': [INCLINADO, PECHO_MAQUINA, MARIPOSA, HOMBROS, LATERALES, TRICEPS_ALTO],
  'Pierna B': [PRENSA_ALTA, GEMELOS, FEMORAL, PULL_THROUGH, CUADRICEPS, PLANCHA],
  'Torso A': [PRESS_SMITH, REMO_MAQUINA, CRUCE, JALON_ABIERTO, LATERALES, CURL_Z, TRICEPS_SOGA],
  'Torso B': [INCLINADO, JALON_CERRADO, MARIPOSA, REMO_POLEA, HOMBROS, CURL_POLEA, TRICEPS_ALTO],
  'Cuerpo completo A': [PRESS_SMITH, SENTADILLA, REMO_MAQUINA, FEMORAL, LATERALES, CRUNCH_POLEA],
  'Cuerpo completo B': [INCLINADO, PRENSA_ALTA, JALON_CERRADO, CUADRICEPS, CURL_Z, TRICEPS_SOGA],
  'Cuerpo completo C': [PECHO_MAQUINA, PRENSA, REMO_POLEA, PULL_THROUGH, HOMBROS, PLANCHA],
}

export interface Rutina {
  sesion: string
  ejercicios: Ejercicio[]
  /** Versión mínima para un día sin tiempo: los dos primeros ejercicios. */
  minima: Ejercicio[]
}

/** La rutina que toca en una fecha, o null si es día de descanso. */
export function rutinaDelDia(p: Pick<Perfil, 'diasEntreno'>, fecha: string): Rutina | null {
  const sesion = sesionDelDia(p, fecha)
  const ejercicios = sesion ? SESIONES[sesion] : undefined
  if (!sesion || !ejercicios) return null
  return { sesion, ejercicios, minima: ejercicios.slice(0, 2) }
}

export interface DiaDeSemana {
  fecha: string
  /** Nombre de la sesión, o null si es día de descanso. */
  sesion: string | null
}

/** La semana de lunes a domingo que contiene a la fecha, con la sesión de cada día. */
export function semanaDeEntreno(p: Pick<Perfil, 'diasEntreno'>, fecha: string): DiaDeSemana[] {
  const lunes = sumarDias(fecha, -((desdeFecha(fecha).getDay() + 6) % 7))
  return Array.from({ length: 7 }, (_, i) => {
    const dia = sumarDias(lunes, i)
    return { fecha: dia, sesion: sesionDelDia(p, dia) }
  })
}

/** Una serie registrada. En ejercicios por tiempo (plancha), reps son segundos y kg es 0. */
export interface Serie {
  kg: number
  reps: number
}

/** Series registradas: fecha local → nombre del ejercicio → series de ese día. */
export type Bitacora = Record<string, Record<string, Serie[]>>

export interface Rango {
  series: number
  min: number
  max: number
  /** true cuando se cuenta en segundos (plancha). */
  porTiempo: boolean
}

/** Lee "3×8–12", "3×10–12 por brazo" o "3×30–45 s". */
export function leerRango(series: string): Rango {
  const m = /^(\d+)×(\d+)–(\d+)( s)?/.exec(series)
  if (!m) throw new Error(`Rango de series ilegible: ${series}`)
  return { series: Number(m[1]), min: Number(m[2]), max: Number(m[3]), porTiempo: m[4] !== undefined }
}

/** La última vez que se registró un ejercicio antes de una fecha. */
export function ultimaVez(bitacora: Bitacora, ejercicio: string, antesDe: string): { fecha: string; series: Serie[] } | null {
  const fecha = Object.keys(bitacora).filter((f) => f < antesDe && (bitacora[f]?.[ejercicio]?.length ?? 0) > 0).sort().at(-1)
  const series = fecha ? bitacora[fecha]?.[ejercicio] : undefined
  return fecha && series ? { fecha, series } : null
}

export type Indicacion = 'primera-vez' | 'subir' | 'sumar-repeticion' | 'bajar'

export interface Sugerencia {
  indicacion: Indicacion
  /** Peso de la última vez (el de la primera serie). Null la primera vez. */
  kg: number | null
}

/**
 * Doble progresión: el rango de repeticiones decide el peso.
 * Si la última vez se llegó al tope del rango en todas las series, hoy se sube el peso.
 * Si alguna serie quedó por debajo del mínimo, el peso era mucho: se baja.
 * En el medio, mismo peso y a sumar una repetición.
 */
export function sugerencia(ejercicio: Pick<Ejercicio, 'series'>, ultimas: Serie[] | null): Sugerencia {
  if (!ultimas || ultimas.length === 0) return { indicacion: 'primera-vez', kg: null }
  const rango = leerRango(ejercicio.series)
  const kg = ultimas[0]?.kg ?? 0
  if (ultimas.length >= rango.series && ultimas.every((s) => s.reps >= rango.max)) return { indicacion: 'subir', kg }
  if (ultimas.some((s) => s.reps < rango.min)) return { indicacion: 'bajar', kg }
  return { indicacion: 'sumar-repeticion', kg }
}

/** Segundos de descanso: toma el valor más alto del texto ("2–3 min" son 180, "60–90 s" son 90). */
export function segundosDeDescanso(descanso: string): number {
  const numeros = [...descanso.matchAll(/\d+/g)].map((m) => Number(m[0]))
  const mayor = Math.max(...numeros)
  return descanso.includes('min') ? mayor * 60 : mayor
}

/** Guarda una serie en la bitácora de un día. */
export function anotarSerie(bitacora: Bitacora, fecha: string, ejercicio: string, serie: Serie): Bitacora {
  const dia = bitacora[fecha] ?? {}
  return { ...bitacora, [fecha]: { ...dia, [ejercicio]: [...(dia[ejercicio] ?? []), serie] } }
}

/** Borra la última serie anotada de un ejercicio en un día (para corregir un error de tipeo). */
export function borrarUltimaSerie(bitacora: Bitacora, fecha: string, ejercicio: string): Bitacora {
  const dia = bitacora[fecha] ?? {}
  return { ...bitacora, [fecha]: { ...dia, [ejercicio]: (dia[ejercicio] ?? []).slice(0, -1) } }
}
