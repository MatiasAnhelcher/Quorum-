import { pesoDeReferencia } from './cuerpo'
import type { Objetivo, Perfil } from './tipos'

/** Ritmo semanal esperado, en kg. Negativo es bajar. Los de "bajar grasa" son proporción del peso. */
export function ritmoSemanal(objetivo: Objetivo, pesoKg: number): { lento: number; rapido: number } {
  if (objetivo === 'recomposicion') return { lento: -0.3, rapido: -0.5 }
  if (objetivo === 'bajar-grasa') return { lento: -0.005 * pesoKg, rapido: -0.01 * pesoKg }
  return { lento: 0.1, rapido: 0.25 }
}

export interface PuntoProyectado {
  semanas: number
  /** Rango de peso esperado, de menor a mayor. */
  minKg: number
  maxKg: number
}

export const HORIZONTES = [
  { semanas: 13, nombre: '3 meses' },
  { semanas: 26, nombre: '6 meses' },
  { semanas: 52, nombre: '12 meses' },
] as const

/**
 * Rango de peso esperado a una cantidad de semanas. Es una proyección, no una promesa:
 * supone constancia y se corrige con el seguimiento real. Al bajar, el peso no pasa del peso de referencia.
 */
export function proyectar(p: Perfil, semanas: number): PuntoProyectado {
  const ritmo = ritmoSemanal(p.objetivo, p.pesoKg)
  const piso = pesoDeReferencia(p)
  const limitar = (kg: number) => (ritmo.lento < 0 && piso !== null ? Math.max(kg, Math.min(piso, p.pesoKg)) : kg)
  const a = limitar(p.pesoKg + ritmo.lento * semanas)
  const b = limitar(p.pesoKg + ritmo.rapido * semanas)
  return { semanas, minKg: Math.min(a, b), maxKg: Math.max(a, b) }
}

export function curva(p: Perfil, hastaSemanas = 52, paso = 4): PuntoProyectado[] {
  const puntos: PuntoProyectado[] = []
  for (let s = 0; s <= hastaSemanas; s += paso) puntos.push(proyectar(p, s))
  return puntos
}
