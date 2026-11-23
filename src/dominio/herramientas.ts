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
