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
