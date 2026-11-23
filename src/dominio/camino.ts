import { hayQuorum, cumplidos, sesionDelDia, type Registro } from './hoy'
import { lunesDe } from './herramientas'
import { diasEntre, sumarDias } from './tiempo'
import type { Perfil } from './tipos'

/** Días con quórum que hacen firme una semana. */
export const DIAS_DE_QUORUM = 5

/**
 * Una semana es firme si se cumplieron los entrenos planeados (se perdona uno) o hubo quórum 5 días.
 * La medida es la semana y no el día: un mal día no rompe nada.
 */
export function semanaFirme(p: Pick<Perfil, 'diasEntreno'>, registro: Registro, lunes: string): boolean {
  const dias = Array.from({ length: 7 }, (_, i) => sumarDias(lunes, i))
  const entrenos = dias.filter((d) => sesionDelDia(p, d) !== null && cumplidos(registro, d).includes('entreno')).length
  const quorums = dias.filter((d) => hayQuorum(registro, d)).length
  return entrenos >= p.diasEntreno - 1 || quorums >= DIAS_DE_QUORUM
}

/** Etapas por semanas firmes acumuladas (no seguidas). Los umbrales son una convención de Quorum. */
export const RANGOS = [
  { nombre: 'Iniciado', desde: 0 },
  { nombre: 'Constante', desde: 4 },
  { nombre: 'Firme', desde: 12 },
  { nombre: 'Forjado', desde: 26 },
] as const

export interface Camino {
  /** Día del camino, desde 1. */
  dia: number
  /** Semanas firmes seguidas. La semana en curso suma si ya es firme, y si todavía no lo es no corta. */
  racha: number
  mejorRacha: number
  /** Semanas firmes acumuladas: nunca baja. */
  semanasFirmes: number
  rango: string
  /** Próxima etapa y cuántas semanas firmes faltan; null en la última. */
  proximo: { nombre: string; faltan: number } | null
  /** Entrenos hechos en días de entreno, desde el inicio. */
  entrenos: number
  /** Días con quórum, desde el inicio. */
  quorums: number
}

export function camino(p: Pick<Perfil, 'diasEntreno' | 'inicio'>, registro: Registro, hoy: string): Camino {
  const actual = lunesDe(hoy)
  const firmes: boolean[] = []
  for (let lunes = lunesDe(p.inicio); lunes <= actual; lunes = sumarDias(lunes, 7)) firmes.push(semanaFirme(p, registro, lunes))
  const enCurso = firmes.pop() ?? false
  let mejorRacha = 0
  let corrida = 0
  for (const f of firmes) {
    corrida = f ? corrida + 1 : 0
    mejorRacha = Math.max(mejorRacha, corrida)
  }
  const racha = corrida + (enCurso ? 1 : 0)
  mejorRacha = Math.max(mejorRacha, racha)
  const semanasFirmes = firmes.filter(Boolean).length + (enCurso ? 1 : 0)
  let indice = 0
  RANGOS.forEach((r, i) => { if (semanasFirmes >= r.desde) indice = i })
  const siguiente = RANGOS[indice + 1]
  let entrenos = 0
  let quorums = 0
  for (const fecha of Object.keys(registro)) {
    if (fecha < p.inicio || fecha > hoy) continue
    if (sesionDelDia(p, fecha) !== null && cumplidos(registro, fecha).includes('entreno')) entrenos++
    if (hayQuorum(registro, fecha)) quorums++
  }
  return {
    dia: Math.max(1, diasEntre(p.inicio, hoy) + 1),
    racha, mejorRacha, semanasFirmes,
    rango: RANGOS[indice]!.nombre,
    proximo: siguiente ? { nombre: siguiente.nombre, faltan: siguiente.desde - semanasFirmes } : null,
    entrenos, quorums,
  }
}

/** Un principio para el día: idea de Epicteto dicha con palabras propias, con la sección del Manual de donde sale. */
export interface Principio {
  texto: string
  seccion: number
}

export const PRINCIPIOS: Principio[] = [
  { texto: 'Ocupate de lo que depende de vos: lo que pensás, lo que elegís y lo que hacés. Lo demás no es tuyo.', seccion: 1 },
  { texto: 'No te altera lo que pasó sino lo que opinás de lo que pasó. Revisá la opinión antes de culpar a alguien.', seccion: 5 },
  { texto: 'Ante cada cosa que te toca, preguntate qué fuerza tenés para responderle: dominio propio, aguante o paciencia.', seccion: 10 },
  { texto: 'Cuando algo te irrita, no respondas enseguida. Ganá tiempo y recuperá el mando.', seccion: 20 },
  { texto: 'No le entregarías tu cuerpo a un desconocido. No le entregues tu cabeza al primero que te insulta.', seccion: 28 },
  { texto: 'Cumplí tu parte como padre, hijo, hermano o amigo, haga lo que haga el otro.', seccion: 30 },
  { texto: 'Hablá poco y de lo necesario. No te compares ni andes juzgando a la gente.', seccion: 33 },
  { texto: 'Cuando un placer te tienta, esperá. Poné en la balanza el rato de gusto, el arrepentimiento de después y la satisfacción de haberte dominado.', seccion: 34 },
  { texto: 'No expliques tus principios: vivilos. Que se vean en lo que hacés.', seccion: 46 },
  { texto: 'Señal de avance: no culpás, no te quejás y no hablás de vos como si fueras alguien. Te vigilás a vos mismo.', seccion: 48 },
  { texto: 'Lo que decidiste cumplir, tratalo como una ley. Lo que digan de vos no es asunto tuyo.', seccion: 50 },
  { texto: 'Dejá de postergarte. Viví desde hoy como alguien que ya está avanzando: la pelea es ahora.', seccion: 51 },
]

/** El mismo principio todo el día, rotando por día del camino. */
export function principioDelDia(inicio: string, hoy: string): Principio {
  const n = PRINCIPIOS.length
  return PRINCIPIOS[((diasEntre(inicio, hoy) % n) + n) % n]!
}
