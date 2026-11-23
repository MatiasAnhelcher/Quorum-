/** Fecha local en formato AAAA-MM-DD. Nunca se usa UTC: el día es el de la persona. */
export function fechaLocal(d: Date): string {
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mes}-${dia}`
}

/** Convierte AAAA-MM-DD en una fecha local al mediodía, para que ningún cambio de hora la corra de día. */
export function desdeFecha(fecha: string): Date {
  const [a, m, d] = fecha.split('-').map(Number)
  return new Date(a ?? 1970, (m ?? 1) - 1, d ?? 1, 12)
}

export function sumarDias(fecha: string, dias: number): string {
  const d = desdeFecha(fecha)
  d.setDate(d.getDate() + dias)
  return fechaLocal(d)
}

export function diasEntre(desde: string, hasta: string): number {
  return Math.round((desdeFecha(hasta).getTime() - desdeFecha(desde).getTime()) / 86_400_000)
}

export function aMinutos(hora: string): number {
  const [h, m] = hora.split(':').map(Number)
  return (h ?? 0) * 60 + (m ?? 0)
}

export function aHora(minutos: number): string {
  const total = ((Math.round(minutos) % 1440) + 1440) % 1440
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

export function sumarMinutos(hora: string, minutos: number): string {
  return aHora(aMinutos(hora) + minutos)
}

/** Horas en la cama entre acostarse y despertarse, cruzando la medianoche si hace falta. */
export function horasDeSueno(horaDormir: string, horaDespertar: string): number {
  const minutos = (aMinutos(horaDespertar) - aMinutos(horaDormir) + 1440) % 1440
  return minutos / 60
}

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

export function fechaLarga(fecha: string): string {
  const d = desdeFecha(fecha)
  const dia = DIAS[d.getDay()] ?? ''
  return `${dia.charAt(0).toUpperCase()}${dia.slice(1)} ${d.getDate()} de ${MESES[d.getMonth()]}`
}

export function fechaCorta(fecha: string): string {
  const d = desdeFecha(fecha)
  return `${d.getDate()}/${d.getMonth() + 1}`
}
