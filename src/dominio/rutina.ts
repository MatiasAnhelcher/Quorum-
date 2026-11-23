import { sesionDelDia } from './hoy'
import type { Perfil } from './tipos'

export interface Ejercicio {
  nombre: string
  /** Series por repeticiones, por ejemplo 3×8–12. El rango decide el peso. */
  series: string
  descanso: string
}

const e = (nombre: string, series: string, descanso: string): Ejercicio => ({ nombre, series, descanso })

// Ejercicios en máquinas, Smith y poleas: técnica simple y segura para entrenar sin ayudante.
const PRESS_SMITH = e('Press de banca en Smith', '3×6–10', '2–3 min')
const REMO_MAQUINA = e('Remo en máquina con pecho apoyado', '3×8–12', '2 min')
const CRUCE = e('Cruce de poleas de abajo hacia arriba', '3×12–15', '90 s')
const JALON_ABIERTO = e('Jalón al pecho con agarre abierto', '3×8–12', '2 min')
const LATERALES = e('Elevaciones laterales en polea', '3×12–15', '60 s')
const CURL_Z = e('Curl con barra Z', '3×10–12', '60 s')
const TRICEPS_SOGA = e('Extensión de tríceps en polea con soga', '3×10–12', '60–90 s')
const SENTADILLA = e('Sentadilla en Smith', '4×8–10', '3 min')
const PRENSA = e('Prensa de piernas', '3×10–12', '2 min')
const GEMELOS = e('Gemelos en la prensa', '3×10–15', '60–90 s')
const CUADRICEPS = e('Extensión de cuádriceps', '3×12–15', '90 s')
const FEMORAL = e('Curl femoral', '3×10–12', '90 s')
const CRUNCH_INVERSO = e('Crunch inverso en banco', '3×10–15', '60 s')
const JALON_CERRADO = e('Jalón con agarre cerrado', '3×8–12', '2 min')
const REMO_POLEA = e('Remo sentado en polea', '3×10–12', '2 min')
const PULLOVER = e('Pullover en polea', '3×12–15', '90 s')
const FACE_PULL = e('Face pull', '3×15–20', '60 s')
const CURL_POLEA = e('Curl bayesiano en polea', '3×10–12 por brazo', '60 s')
const MARTILLO = e('Curl martillo con soga', '2×12–15', '60 s')
const CRUNCH_POLEA = e('Crunch en polea', '3×12–15', '60 s')
const INCLINADO = e('Press inclinado en Smith', '4×8–12', '2–3 min')
const PECHO_MAQUINA = e('Press de pecho en máquina', '3×10–12', '2 min')
const MARIPOSA = e('Apertura en máquina mariposa', '3×12–15', '90 s')
const HOMBROS = e('Press de hombros en máquina', '3×8–12', '2 min')
const TRICEPS_ALTO = e('Extensión de tríceps sobre la cabeza, en polea', '3×10–15', '60–90 s')
const PRENSA_ALTA = e('Prensa con los pies altos', '4×10–12', '2–3 min')
const PULL_THROUGH = e('Pull-through en polea', '3×12–15', '90 s')
const PLANCHA = e('Plancha', '3×30–45 s', '60 s')

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
