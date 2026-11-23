import { NOMBRE_CORTO } from './directorio'
import { actaSemanal, type IdAcuerdo, type IdEspecialista, type Registro } from './hoy'
import type { Bitacora } from './rutina'
import { sumarDias } from './tiempo'

/** Kilos movidos (peso por repeticiones) en los 7 días que terminan en `hasta`. */
export function kilosMovidos(bitacora: Bitacora, hasta: string): number {
  const desde = sumarDias(hasta, -6)
  let total = 0
  for (const [fecha, ejercicios] of Object.entries(bitacora)) {
    if (fecha < desde || fecha > hasta) continue
    for (const series of Object.values(ejercicios)) for (const s of series) total += s.kg * s.reps
  }
  return Math.round(total)
}

const ESPECIALISTA: Record<IdAcuerdo, IdEspecialista> = { entreno: 'biomecanico', comida: 'nutricion', foco: 'neuro', plan: 'estratega', sueno: 'sueno' }

/** Qué hacer con el pilar más flojo: siempre una acción concreta que ya existe en la app. */
const CONSEJO: Record<IdAcuerdo, string> = {
  entreno: 'Escribí un plan si-entonces para el momento exacto en que solés aflojar, y los días malos hacé solo los dos primeros ejercicios.',
  comida: 'Resolvé la proteína antes de la cena: sumala en el almuerzo y dejá a mano una opción rápida para la noche.',
  foco: 'Poné el bloque de foco pegado a algo que ya hacés todos los días y dejá el celular en otro ambiente antes de empezar.',
  plan: 'Usá "La noche antes": cinco minutos de lista y la ropa lista. Es el pilar que más barato se arregla.',
  sueno: 'Mové la alarma de "a la cama" 30 minutos antes y dejá el celular cargando lejos de la cama.',
}

export interface Parte {
  /** Votos de cada pilar en los últimos 7 días y en los 7 anteriores. */
  pilares: { id: IdAcuerdo; nombre: string; ahora: number; antes: number }[]
  votos: number
  votosAntes: number
  kilos: number
  kilosAntes: number
  /** El pilar con menos votos, si quedó por debajo de 4 de 7. */
  flojo: { id: IdAcuerdo; nombre: string; votos: number; consejo: string } | null
  /** El pilar que más subió contra la semana anterior. */
  subio: { nombre: string; diferencia: number } | null
}

/** Parte de la semana. Sin ningún voto en 14 días no hay nada que decir: devuelve null. */
export function parteSemanal(registro: Registro, bitacora: Bitacora, hoy: string): Parte | null {
  const ahora = actaSemanal(registro, hoy)
  const antes = actaSemanal(registro, sumarDias(hoy, -7))
  const ids = Object.keys(ESPECIALISTA) as IdAcuerdo[]
  const pilares = ids.map((id) => ({ id, nombre: NOMBRE_CORTO[ESPECIALISTA[id]], ahora: ahora[id], antes: antes[id] }))
  const votos = pilares.reduce((s, p) => s + p.ahora, 0)
  const votosAntes = pilares.reduce((s, p) => s + p.antes, 0)
  if (votos + votosAntes === 0) return null
  const menor = [...pilares].sort((a, b) => a.ahora - b.ahora)[0]!
  const mayorSuba = [...pilares].sort((a, b) => b.ahora - b.antes - (a.ahora - a.antes))[0]!
  return {
    pilares, votos, votosAntes,
    kilos: kilosMovidos(bitacora, hoy),
    kilosAntes: kilosMovidos(bitacora, sumarDias(hoy, -7)),
    flojo: menor.ahora < 4 ? { id: menor.id, nombre: menor.nombre, votos: menor.ahora, consejo: CONSEJO[menor.id] } : null,
    subio: mayorSuba.ahora - mayorSuba.antes > 0 ? { nombre: mayorSuba.nombre, diferencia: mayorSuba.ahora - mayorSuba.antes } : null,
  }
}
