import type { Objetivo, Perfil } from './tipos'

/**
 * Grasa corporal estimada con la fórmula de la Marina de Estados Unidos (Hodgdon y Beckett, 1984).
 * Es una estimación con cinta: tiene varios puntos de error y siempre se muestra como estimación.
 * Devuelve null si las medidas no permiten calcularla.
 */
export function grasaEstimada(p: Pick<Perfil, 'sexo' | 'alturaCm' | 'cinturaCm' | 'cuelloCm' | 'caderaCm'>): number | null {
  const base = p.sexo === 'hombre' ? p.cinturaCm - p.cuelloCm : p.cinturaCm + (p.caderaCm ?? NaN) - p.cuelloCm
  if (!(base > 0) || !(p.alturaCm > 0)) return null
  const densidad =
    p.sexo === 'hombre'
      ? 1.0324 - 0.19077 * Math.log10(base) + 0.15456 * Math.log10(p.alturaCm)
      : 1.29579 - 0.35004 * Math.log10(base) + 0.221 * Math.log10(p.alturaCm)
  const grasa = 495 / densidad - 450
  if (!Number.isFinite(grasa) || grasa < 3 || grasa > 60) return null
  return grasa
}

/** Gasto en reposo con la ecuación de Mifflin-St Jeor (1990), en kcal por día. */
export function gastoEnReposo(p: Pick<Perfil, 'sexo' | 'edad' | 'alturaCm' | 'pesoKg'>): number {
  return 10 * p.pesoKg + 6.25 * p.alturaCm - 5 * p.edad + (p.sexo === 'hombre' ? 5 : -161)
}

const FACTOR_ACTIVIDAD: Record<Perfil['diasEntreno'], number> = { 3: 1.45, 4: 1.5, 5: 1.55 }

/** Gasto diario estimado. Es un punto de partida: el seguimiento del peso lo corrige. */
export function gastoDiario(p: Pick<Perfil, 'sexo' | 'edad' | 'alturaCm' | 'pesoKg' | 'diasEntreno'>): number {
  return gastoEnReposo(p) * FACTOR_ACTIVIDAD[p.diasEntreno]
}

/** Ajuste de calorías según el objetivo. La recomposición usa un déficit chico para no frenar el músculo. */
export const AJUSTE_KCAL: Record<Objetivo, number> = {
  recomposicion: -350,
  'bajar-grasa': -500,
  'ganar-musculo': 250,
}

export interface PlanDeComida {
  kcal: number
  proteinaG: number
  grasaG: number
  carbosG: number
}

const redondear = (valor: number, paso: number) => Math.round(valor / paso) * paso

export function planDeComida(p: Pick<Perfil, 'sexo' | 'edad' | 'alturaCm' | 'pesoKg' | 'diasEntreno' | 'objetivo'>): PlanDeComida {
  // Nunca por debajo del gasto en reposo: comer menos que eso no es un plan sostenible.
  const kcal = redondear(Math.max(gastoDiario(p) + AJUSTE_KCAL[p.objetivo], gastoEnReposo(p)), 50)
  const proteinaG = redondear(p.pesoKg * 2, 5)
  const grasaG = redondear(p.pesoKg * 0.9, 5)
  const carbosG = Math.max(0, redondear((kcal - proteinaG * 4 - grasaG * 9) / 4, 5))
  return { kcal, proteinaG, grasaG, carbosG }
}

/** Primer objetivo de cintura: la mitad de la altura (Ashwell y otros, 2012). */
export function cinturaObjetivo(alturaCm: number): number {
  return Math.floor(alturaCm / 2)
}

/** Grasa de referencia para el piso de la proyección: un nivel atlético y sostenible. */
const GRASA_REFERENCIA = { hombre: 12, mujer: 22 } as const

/**
 * Peso de referencia: el que tendría la persona con su masa magra de hoy y la grasa de referencia.
 * Devuelve null si no se puede estimar la grasa o si ya está por debajo de la referencia.
 */
export function pesoDeReferencia(p: Pick<Perfil, 'sexo' | 'alturaCm' | 'pesoKg' | 'cinturaCm' | 'cuelloCm' | 'caderaCm'>): number | null {
  const grasa = grasaEstimada(p)
  if (grasa === null) return null
  const referencia = GRASA_REFERENCIA[p.sexo]
  if (grasa <= referencia) return null
  const magra = p.pesoKg * (1 - grasa / 100)
  return magra / (1 - referencia / 100)
}
