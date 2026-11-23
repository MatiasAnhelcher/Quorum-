import { planDeComida } from './cuerpo'
import { desdeFecha, sumarDias, sumarMinutos } from './tiempo'
import type { Perfil } from './tipos'

export type IdAcuerdo = 'entreno' | 'comida' | 'foco' | 'plan' | 'sueno'
export type IdEspecialista = 'biomecanico' | 'nutricion' | 'neuro' | 'estratega' | 'sueno'

export interface Acuerdo {
  id: IdAcuerdo
  especialista: IdEspecialista
  hora: string
  titulo: string
  detalle: string
}

/** Registro de acuerdos cumplidos: fecha local → ids cumplidos ese día. */
export type Registro = Record<string, IdAcuerdo[]>

const SEMANAS: Record<Perfil['diasEntreno'], Record<number, string>> = {
  5: { 1: 'Torso completo', 2: 'Pierna A', 3: 'Tirón', 4: 'Empuje', 5: 'Pierna B' },
  4: { 1: 'Torso A', 2: 'Pierna A', 4: 'Torso B', 5: 'Pierna B' },
  3: { 1: 'Cuerpo completo A', 3: 'Cuerpo completo B', 5: 'Cuerpo completo C' },
}

/** Sesión que toca en una fecha, o null si es día de descanso. */
export function sesionDelDia(p: Pick<Perfil, 'diasEntreno'>, fecha: string): string | null {
  return SEMANAS[p.diasEntreno][desdeFecha(fecha).getDay()] ?? null
}

/** Los cinco acuerdos del día, uno por especialista, ordenados por hora. */
export function acuerdosDelDia(p: Perfil, fecha: string): Acuerdo[] {
  const sesion = sesionDelDia(p, fecha)
  const comida = planDeComida(p)
  const acuerdos: Acuerdo[] = [
    sesion
      ? { id: 'entreno', especialista: 'biomecanico', hora: p.horaEntreno, titulo: `Entrenar: ${sesion}`, detalle: 'Cada serie termina con 1 o 2 repeticiones en reserva.' }
      : { id: 'entreno', especialista: 'biomecanico', hora: p.horaEntreno, titulo: 'Caminar 8.000 pasos', detalle: 'Día de descanso: moverte suave también cuenta.' },
    { id: 'comida', especialista: 'nutricion', hora: sumarMinutos(p.horaDormir, -120), titulo: `Llegar a ${comida.proteinaG} g de proteína`, detalle: `Meta del día: ${comida.kcal.toLocaleString('es-AR')} kcal. Última comida 2 horas antes de dormir.` },
    { id: 'foco', especialista: 'neuro', hora: p.horaFoco, titulo: '25 minutos de foco', detalle: 'Una sola tarea, el celular lejos, y al final repasás de memoria.' },
    { id: 'plan', especialista: 'estratega', hora: sumarMinutos(p.horaDormir, -60), titulo: 'Dejar listo mañana', detalle: 'Dos minutos: ropa, comida y la primera tarea del día.' },
    { id: 'sueno', especialista: 'sueno', hora: p.horaDormir, titulo: `En la cama a las ${p.horaDormir}`, detalle: 'Pantallas afuera 30 minutos antes.' },
  ]
  return acuerdos.sort((a, b) => ordenDelDia(a.hora, p.horaDespertar) - ordenDelDia(b.hora, p.horaDespertar))
}

/** Minutos desde que la persona se despierta: así un acuerdo de la madrugada queda al final del día. */
function ordenDelDia(hora: string, horaDespertar: string): number {
  const [h = 0, m = 0] = hora.split(':').map(Number)
  const [hd = 0, md = 0] = horaDespertar.split(':').map(Number)
  return (h * 60 + m - (hd * 60 + md) + 1440) % 1440
}

/** Hay quórum cuando se cumple la mayoría: 3 de los 5 acuerdos. Un día imperfecto igual cuenta. */
export const MAYORIA = 3

export function cumplidos(registro: Registro, fecha: string): IdAcuerdo[] {
  return registro[fecha] ?? []
}

export function hayQuorum(registro: Registro, fecha: string): boolean {
  return cumplidos(registro, fecha).length >= MAYORIA
}

export function alternar(registro: Registro, fecha: string, id: IdAcuerdo): Registro {
  const actuales = cumplidos(registro, fecha)
  const nuevos = actuales.includes(id) ? actuales.filter((x) => x !== id) : [...actuales, id]
  return { ...registro, [fecha]: nuevos }
}

/** Días con quórum en los últimos 7, contando hoy. No es una racha: un día sin quórum no borra nada. */
export function constanciaSemanal(registro: Registro, hoy: string): boolean[] {
  return Array.from({ length: 7 }, (_, i) => hayQuorum(registro, sumarDias(hoy, i - 6)))
}
