import type { IdAcuerdo } from './hoy'
import { desdeFecha, sumarDias } from './tiempo'

/** Plan si-entonces: una situación concreta dispara una acción concreta. */
export interface Intencion {
  si: string
  entonces: string
}

export type Intenciones = Partial<Record<IdAcuerdo, Intencion>>

/** Un plan sirve cuando las dos partes dicen algo concreto. */
export function intencionCompleta(i: Intencion | undefined): i is Intencion {
  return i !== undefined && i.si.trim().length >= 3 && i.entonces.trim().length >= 3
}

/** Puntos de partida para escribir el plan: la persona los cambia por su situación real. */
export const EJEMPLOS: Record<IdAcuerdo, Intencion> = {
  entreno: { si: 'suena la alarma y no tengo ganas', entonces: 'me pongo la ropa y hago solo los dos primeros ejercicios' },
  comida: { si: 'llego a la cena sin haber llegado a la proteína', entonces: 'sumo una lata de atún o dos huevos' },
  foco: { si: 'termino de almorzar', entonces: 'dejo el celular en otro ambiente y abro el material' },
  plan: { si: 'termino de cenar', entonces: 'dejo la ropa y la comida de mañana listas' },
  sueno: { si: 'son 30 minutos antes de mi hora de dormir', entonces: 'pongo el celular a cargar fuera de la pieza' },
}

/** Lunes de la semana de una fecha: sirve de clave para la revisión semanal. */
export function lunesDe(fecha: string): string {
  return sumarDias(fecha, -((desdeFecha(fecha).getDay() + 6) % 7))
}

export interface Revision {
  /** Qué funcionó. */
  bien: string
  /** Qué trabó. */
  trabo: string
  /** El único cambio para la semana que viene. */
  cambio: string
}

/** Revisiones semanales: lunes de la semana → respuestas. */
export type Revisiones = Record<string, Revision>

/** Lo aprendido en cada bloque de foco: fecha → texto escrito de memoria. */
export type Repasos = Record<string, string>

/** Minutos y segundos para mostrar un cronómetro: 1500 → "25:00". */
export function reloj(segundos: number): string {
  const s = Math.max(0, Math.ceil(segundos))
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

/** Destrabar: lo que se viene postergando, achicado a una versión que se pueda terminar hoy. */
export interface Destrabe {
  /** Lo que se viene pateando. */
  tarea: string
  /** La versión más chica que igual cuenta como hecha. */
  minimo: string
  /** Hora en que se hace, "18:30". Sin hora no es un plan. */
  hora: string
  hecho?: boolean
}

/** Un destrabe por día: fecha → tarea. */
export type Destrabes = Record<string, Destrabe>

const HORA = /^([01]\d|2[0-3]):[0-5]\d$/

/** Está listo para arrancar cuando dice qué, cuál es el mínimo y a qué hora. */
export function destrabeListo(d: Destrabe | undefined): d is Destrabe {
  return d !== undefined && d.tarea.trim().length >= 3 && d.minimo.trim().length >= 3 && HORA.test(d.hora)
}

/** Cuántas tareas trabadas se terminaron en los últimos `dias` días, contando hoy. */
export function destrabadas(destrabes: Destrabes, hoy: string, dias = 7): number {
  const desde = sumarDias(hoy, -(dias - 1))
  return Object.entries(destrabes).filter(([fecha, d]) => fecha >= desde && fecha <= hoy && d.hecho).length
}

/** Lo que depende de mí: una preocupación partida en lo propio y lo ajeno. */
export interface Reparto {
  asunto: string
  /** Lo que depende de mí: lo que pienso, decido y hago. */
  mio: string
  /** Lo que no depende de mí: lo que hacen, dicen o deciden otros, y lo que ya pasó. */
  ajeno: string
  /** El próximo paso, que sale de la columna propia. */
  paso: string
}

export type Repartos = Record<string, Reparto>

/** El reparto sirve cuando termina en un paso propio: sin eso es solo darle vueltas. */
export function repartoCompleto(r: Reparto | undefined): r is Reparto {
  return r !== undefined && r.asunto.trim().length >= 3 && r.mio.trim().length >= 3 && r.paso.trim().length >= 3
}

/** La noche antes: sacar los pendientes de la cabeza y dejar el día siguiente armado. */
export interface Vispera {
  /** Lista bien específica de lo que hay que hacer mañana y los días que siguen. */
  pendientes: string
  /** Pasos de preparación ya hechos. */
  listos: string[]
}

export type Visperas = Record<string, Vispera>

export const PASOS_DE_VISPERA: { id: string; texto: string }[] = [
  { id: 'cosas', texto: 'Ropa y cosas de mañana, listas y a la vista' },
  { id: 'primero', texto: 'Decidí qué es lo primero que hago al levantarme' },
  { id: 'celular', texto: 'Alarma puesta y celular cargando lejos de la cama' },
]

/** Cuántos renglones con algo escrito tiene la lista: cada renglón es un pendiente. */
export function renglones(texto: string): number {
  return texto.split('\n').filter((l) => l.trim().length >= 3).length
}

/** La víspera está cerrada con al menos tres pendientes escritos y todos los pasos hechos. */
export function visperaLista(v: Vispera | undefined): boolean {
  return v !== undefined && renglones(v.pendientes) >= 3 && PASOS_DE_VISPERA.every((p) => v.listos.includes(p.id))
}

/** Dominar un impulso: un solo frente por vez, con su disparador y su salida. */
export interface Frente {
  /** Lo que la persona quiere dejar. Queda solo en su dispositivo. */
  nombre: string
  /** La situación en la que suelen aparecer las ganas. */
  disparador: string
  /** Lo que hace en vez de ceder. */
  salida: string
}

/** Lo que pasó en un día: ganas que pasaron sin ceder, y caídas. */
export interface Olas {
  pasadas: number
  caidas: number
  /** Qué situación fue y qué cambia la próxima vez: la caída se usa para aprender. */
  leccion?: string
}

export interface Dominio {
  frente: Frente
  /** Fecha en que se empezó a llevar la cuenta. */
  desde: string
  dias: Record<string, Olas>
}

export function frenteListo(f: Frente | undefined): f is Frente {
  return f !== undefined && f.nombre.trim().length >= 3 && f.disparador.trim().length >= 3 && f.salida.trim().length >= 3
}

const SIN_OLAS: Olas = { pasadas: 0, caidas: 0 }

export function anotarOla(d: Dominio, fecha: string, que: 'pasada' | 'caida'): Dominio {
  const dia = d.dias[fecha] ?? SIN_OLAS
  return { ...d, dias: { ...d.dias, [fecha]: que === 'pasada' ? { ...dia, pasadas: dia.pasadas + 1 } : { ...dia, caidas: dia.caidas + 1 } } }
}

/**
 * Lo ganado no se pierde con una caída: las ganas superadas y los días firmes se suman siempre.
 * Un día firme es un día, desde que se empezó, sin ninguna caída anotada.
 */
export function resumenDeDominio(d: Dominio, hoy: string): { superadas: number; diasFirmes: number; dias: number; ultimaCaida: string | null } {
  let superadas = 0
  let conCaida = 0
  let ultimaCaida: string | null = null
  for (const [fecha, o] of Object.entries(d.dias)) {
    if (fecha < d.desde || fecha > hoy) continue
    superadas += o.pasadas
    if (o.caidas > 0) {
      conCaida++
      if (ultimaCaida === null || fecha > ultimaCaida) ultimaCaida = fecha
    }
  }
  const dias = Math.max(1, Math.round((desdeFecha(hoy).getTime() - desdeFecha(d.desde).getTime()) / 86_400_000) + 1)
  return { superadas, diasFirmes: dias - conCaida, dias, ultimaCaida }
}

/** Líneas de ayuda en crisis. Solo números leídos en una fuente; para el resto, un buscador por país. */
export interface Linea {
  lugar: string
  nombre: string
  /** Números para llamar, como se marcan. */
  telefonos: string[]
  nota?: string
}

export const LINEAS: Linea[] = [
  { lugar: 'Argentina', nombre: 'Línea de Prevención del Suicidio', telefonos: ['135', '0800 345 1435', '011 5275 1135'], nota: '135 es gratis desde Capital y Gran Buenos Aires. Los otros dos, desde todo el país.' },
  { lugar: 'Estados Unidos', nombre: 'Línea 988 de Prevención del Suicidio y Crisis', telefonos: ['988'], nota: 'Llamada o mensaje de texto, gratis, las 24 horas, en español o inglés.' },
]

/** Buscador de líneas gratuitas por país, para todos los demás lugares. */
export const BUSCADOR_DE_LINEAS = 'https://findahelpline.com'

/** Plan para los días negros: se arma en frío para usarlo en caliente. Queda solo en el dispositivo. */
export const PASOS_DEL_PLAN = [
  { id: 'senales', pregunta: 'Mis señales de que se viene un día negro', ayuda: 'Lo que pienso, siento o hago justo antes: me aíslo, no duermo, tomo de más.' },
  { id: 'solo', pregunta: 'Lo que puedo hacer solo para bajar un cambio', ayuda: 'Salir a caminar, una ducha, entrenar, música.' },
  { id: 'gente', pregunta: 'Gente y lugares que me sacan de la cabeza', ayuda: 'Un compa, el gimnasio, la casa de mi vieja, un bar con gente.' },
  { id: 'ayuda', pregunta: 'A quién le digo la verdad y le pido ayuda', ayuda: 'Nombre y teléfono de una o dos personas.' },
  { id: 'profesional', pregunta: 'Profesional o línea a la que llamo', ayuda: 'Psicólogo, médico, guardia o la línea de tu país.' },
  { id: 'entorno', pregunta: 'Lo que alejo de mi alcance mientras dure', ayuda: 'Pedile a alguien de confianza que te lo guarde.' },
] as const

export type PlanSeguro = Partial<Record<(typeof PASOS_DEL_PLAN)[number]['id'], string>>

/** Cuántos pasos del plan tienen algo escrito. */
export function pasosDelPlanEscritos(plan: PlanSeguro): number {
  return PASOS_DEL_PLAN.filter((p) => (plan[p.id] ?? '').trim().length >= 3).length
}
