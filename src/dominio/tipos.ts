export type Sexo = 'hombre' | 'mujer'
export type Objetivo = 'recomposicion' | 'bajar-grasa' | 'ganar-musculo'
export type Presupuesto = 'ajustado' | 'medio' | 'holgado'

/** Lo que la persona carga en el diagnóstico. Todo se puede ver, corregir y borrar. */
export interface Perfil {
  nombre: string
  sexo: Sexo
  edad: number
  alturaCm: number
  pesoKg: number
  cinturaCm: number
  cuelloCm: number
  /** Solo se usa en la fórmula de mujeres. */
  caderaCm?: number
  objetivo: Objetivo
  diasEntreno: 3 | 4 | 5
  /** Horas en formato HH:MM, hora local. */
  horaDespertar: string
  horaEntreno: string
  horaFoco: string
  horaDormir: string
  presupuesto: Presupuesto
  /** Fecha local AAAA-MM-DD en que se hizo el diagnóstico. */
  inicio: string
}

export interface Medicion {
  fecha: string
  valor: number
}
