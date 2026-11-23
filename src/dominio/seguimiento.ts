import { diasEntre } from './tiempo'
import type { Medicion } from './tipos'

/** Guarda una medición por fecha: cargar de nuevo el mismo día reemplaza la anterior. */
export function registrar(mediciones: Medicion[], nueva: Medicion): Medicion[] {
  return [...mediciones.filter((m) => m.fecha !== nueva.fecha), nueva].sort((a, b) => a.fecha.localeCompare(b.fecha))
}

function promedio(valores: number[]): number {
  return valores.reduce((suma, v) => suma + v, 0) / valores.length
}

/** Promedio de las mediciones entre `desdeDias` y `hastaDias` días antes de hoy (hoy es 0). */
function promedioVentana(mediciones: Medicion[], hoy: string, desdeDias: number, hastaDias: number): { valor: number; cantidad: number } | null {
  const valores = mediciones
    .filter((m) => {
      const dias = diasEntre(m.fecha, hoy)
      return dias >= desdeDias && dias <= hastaDias
    })
    .map((m) => m.valor)
  return valores.length ? { valor: promedio(valores), cantidad: valores.length } : null
}

/** Mínimo de pesadas por semana para sacar una conclusión. Con menos, se dice que falta dato. */
export const PESADAS_MINIMAS = 3

export interface Tendencia {
  /** Promedio de los últimos 7 días. */
  promedioKg: number | null
  /** Cambio contra el promedio de los 7 días anteriores, en kg por semana. Null si falta dato. */
  ritmoKgPorSemana: number | null
  pesadasEstaSemana: number
}

/** El peso de un día engaña (agua, sal, comida): manda el promedio de la semana. */
export function tendencia(pesos: Medicion[], hoy: string): Tendencia {
  const actual = promedioVentana(pesos, hoy, 0, 6)
  const anterior = promedioVentana(pesos, hoy, 7, 13)
  const suficiente = actual !== null && anterior !== null && actual.cantidad >= PESADAS_MINIMAS && anterior.cantidad >= PESADAS_MINIMAS
  return {
    promedioKg: actual?.valor ?? null,
    ritmoKgPorSemana: suficiente ? actual.valor - anterior.valor : null,
    pesadasEstaSemana: actual?.cantidad ?? 0,
  }
}

export type Lectura = 'falta-dato' | 'en-ritmo' | 'muy-rapido' | 'muy-lento'

/** Compara el ritmo real con el rango esperado (kg por semana, con signo). */
export function leerRitmo(ritmo: number | null, esperado: { lento: number; rapido: number }): Lectura {
  if (ritmo === null) return 'falta-dato'
  const min = Math.min(esperado.lento, esperado.rapido) - 0.1
  const max = Math.max(esperado.lento, esperado.rapido) + 0.1
  if (ritmo >= min && ritmo <= max) return 'en-ritmo'
  const bajando = esperado.rapido < 0
  if (bajando) return ritmo < min ? 'muy-rapido' : 'muy-lento'
  return ritmo > max ? 'muy-rapido' : 'muy-lento'
}
