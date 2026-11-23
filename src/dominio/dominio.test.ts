import { describe, expect, it } from 'vitest'
import { cinturaObjetivo, gastoEnReposo, grasaEstimada, pesoDeReferencia, planDeComida } from './cuerpo'
import { dictamenes } from './directorio'
import { acuerdosDelDia, alternar, constanciaSemanal, hayQuorum, sesionDelDia, type Registro } from './hoy'
import { curva, proyectar } from './proyeccion'
import { leerRitmo, registrar, tendencia } from './seguimiento'
import { fechaLarga, fechaLocal, horasDeSueno, sumarDias, sumarMinutos } from './tiempo'
import type { Perfil } from './tipos'

const matias: Perfil = {
  nombre: 'Matias', sexo: 'hombre', edad: 31, alturaCm: 173, pesoKg: 79, cinturaCm: 95, cuelloCm: 40.5,
  objetivo: 'recomposicion', diasEntreno: 5, horaDespertar: '05:15', horaEntreno: '06:00', horaFoco: '14:00',
  horaDormir: '21:30', presupuesto: 'medio', inicio: '2026-11-16',
}

describe('cuerpo', () => {
  it('estima la grasa con la fórmula de la Marina', () => {
    expect(grasaEstimada(matias)).toBeCloseTo(22.7, 0)
    expect(grasaEstimada({ sexo: 'mujer', alturaCm: 165, cinturaCm: 75, cuelloCm: 33, caderaCm: 98 })).toBeCloseTo(28.4, 1)
  })
  it('no inventa un número cuando las medidas no cierran', () => {
    expect(grasaEstimada({ ...matias, cuelloCm: 95 })).toBeNull()
    expect(grasaEstimada({ sexo: 'mujer', alturaCm: 165, cinturaCm: 75, cuelloCm: 33 })).toBeNull()
  })
  it('calcula el gasto en reposo con Mifflin-St Jeor', () => {
    expect(gastoEnReposo(matias)).toBeCloseTo(1721.25, 2)
    expect(gastoEnReposo({ ...matias, sexo: 'mujer' })).toBeCloseTo(1555.25, 2)
  })
  it('arma un plan con déficit chico y 2 g de proteína por kilo', () => {
    const plan = planDeComida(matias)
    expect(plan).toEqual({ kcal: 2300, proteinaG: 160, grasaG: 70, carbosG: 260 })
    expect(plan.proteinaG * 4 + plan.grasaG * 9 + plan.carbosG * 4).toBeCloseTo(plan.kcal, -2)
  })
  it('nunca baja las calorías del gasto en reposo', () => {
    const chica = { ...matias, sexo: 'mujer' as const, pesoKg: 48, alturaCm: 150, edad: 60, diasEntreno: 3 as const, objetivo: 'bajar-grasa' as const }
    expect(planDeComida(chica).kcal).toBeGreaterThanOrEqual(Math.floor(gastoEnReposo(chica) / 50) * 50)
  })
  it('pone la cintura objetivo en la mitad de la altura', () => {
    expect(cinturaObjetivo(173)).toBe(86)
  })
  it('calcula el peso de referencia conservando la masa magra', () => {
    expect(pesoDeReferencia(matias)).toBeCloseTo(69.4, 0)
    expect(pesoDeReferencia({ ...matias, cinturaCm: 76 })).toBeNull()
  })
})

describe('proyección', () => {
  it('proyecta un rango y no pasa del peso de referencia', () => {
    const tres = proyectar(matias, 13)
    expect(tres.maxKg).toBeCloseTo(75.1, 1)
    expect(tres.minKg).toBeCloseTo(72.5, 1)
    const doce = proyectar(matias, 52)
    expect(doce.minKg).toBeCloseTo(pesoDeReferencia(matias)!, 5)
    expect(doce.maxKg).toBeGreaterThanOrEqual(doce.minKg)
  })
  it('sube cuando el objetivo es ganar músculo', () => {
    const p = proyectar({ ...matias, objetivo: 'ganar-musculo' }, 26)
    expect(p.minKg).toBeCloseTo(81.6, 1)
    expect(p.maxKg).toBeCloseTo(85.5, 1)
  })
  it('arranca la curva en el peso de hoy', () => {
    expect(curva(matias)[0]).toEqual({ semanas: 0, minKg: 79, maxKg: 79 })
    expect(curva(matias)).toHaveLength(14)
  })
})

describe('hoy', () => {
  it('sabe qué sesión toca según el día de la semana', () => {
    expect(sesionDelDia(matias, '2026-11-23')).toBe('Torso completo')
    expect(sesionDelDia(matias, '2026-11-27')).toBe('Pierna B')
    expect(sesionDelDia(matias, '2026-11-22')).toBeNull()
    expect(sesionDelDia({ diasEntreno: 3 }, '2026-11-24')).toBeNull()
  })
  it('arma cinco acuerdos ordenados por hora, uno por especialista', () => {
    const acuerdos = acuerdosDelDia(matias, '2026-11-23')
    expect(acuerdos.map((a) => a.id)).toEqual(['entreno', 'foco', 'comida', 'plan', 'sueno'])
    expect(acuerdos.map((a) => a.hora)).toEqual(['06:00', '14:00', '19:30', '20:30', '21:30'])
    expect(new Set(acuerdos.map((a) => a.especialista)).size).toBe(5)
    expect(acuerdosDelDia(matias, '2026-11-22')[0]?.titulo).toBe('Caminar 8.000 pasos')
  })
  it('ordena al final lo que pasa después de medianoche', () => {
    const nocturno = { ...matias, horaDespertar: '09:00', horaEntreno: '18:00', horaDormir: '00:30' }
    expect(acuerdosDelDia(nocturno, '2026-11-23').at(-1)?.id).toBe('sueno')
  })
  it('hay quórum con la mayoría, y marcar dos veces desmarca', () => {
    let r: Registro = {}
    r = alternar(r, '2026-11-23', 'entreno')
    r = alternar(r, '2026-11-23', 'comida')
    expect(hayQuorum(r, '2026-11-23')).toBe(false)
    r = alternar(r, '2026-11-23', 'sueno')
    expect(hayQuorum(r, '2026-11-23')).toBe(true)
    r = alternar(r, '2026-11-23', 'sueno')
    expect(r['2026-11-23']).toEqual(['entreno', 'comida'])
  })
  it('cuenta la constancia de los últimos 7 días sin castigar un día flojo', () => {
    const r: Registro = { '2026-11-17': ['entreno', 'comida', 'sueno'], '2026-11-23': ['entreno', 'comida', 'sueno', 'foco'] }
    expect(constanciaSemanal(r, '2026-11-23')).toEqual([true, false, false, false, false, false, true])
  })
})

describe('seguimiento', () => {
  const dias = (desde: string, valores: number[]) => valores.map((valor, i) => ({ fecha: sumarDias(desde, i), valor }))
  it('reemplaza la pesada del mismo día y ordena por fecha', () => {
    const pesos = registrar(registrar([{ fecha: '2026-11-20', valor: 79 }], { fecha: '2026-11-18', valor: 79.4 }), { fecha: '2026-11-20', valor: 78.8 })
    expect(pesos).toEqual([{ fecha: '2026-11-18', valor: 79.4 }, { fecha: '2026-11-20', valor: 78.8 }])
  })
  it('no saca conclusiones con pocas pesadas', () => {
    const t = tendencia(dias('2026-11-21', [79, 78.9]), '2026-11-23')
    expect(t.promedioKg).toBeCloseTo(78.95, 2)
    expect(t.ritmoKgPorSemana).toBeNull()
    expect(leerRitmo(t.ritmoKgPorSemana, { lento: -0.3, rapido: -0.5 })).toBe('falta-dato')
  })
  it('compara el promedio de esta semana con el de la anterior', () => {
    const pesos = [...dias('2026-11-10', [79.2, 79, 79.1]), ...dias('2026-11-19', [78.7, 78.6, 78.8])]
    const t = tendencia(pesos, '2026-11-23')
    expect(t.ritmoKgPorSemana).toBeCloseTo(-0.4, 1)
    expect(leerRitmo(t.ritmoKgPorSemana, { lento: -0.3, rapido: -0.5 })).toBe('en-ritmo')
  })
  it('distingue muy rápido de muy lento según la dirección del objetivo', () => {
    expect(leerRitmo(-1.2, { lento: -0.3, rapido: -0.5 })).toBe('muy-rapido')
    expect(leerRitmo(0.1, { lento: -0.3, rapido: -0.5 })).toBe('muy-lento')
    expect(leerRitmo(0.6, { lento: 0.1, rapido: 0.25 })).toBe('muy-rapido')
    expect(leerRitmo(-0.2, { lento: 0.1, rapido: 0.25 })).toBe('muy-lento')
  })
})

describe('directorio', () => {
  it('entrega un dictamen por especialista con plan B y fuente', () => {
    const d = dictamenes(matias)
    expect(d.map((x) => x.id)).toEqual(['biomecanico', 'nutricion', 'sueno', 'neuro', 'estratega'])
    for (const x of d) {
      expect(x.planB.length).toBeGreaterThan(10)
      expect(x.fuente.length).toBeGreaterThan(10)
    }
    expect(d[1]?.veredicto).toBe('2.300 kcal por día, con 160 g de proteína.')
    expect(d[2]?.veredicto).toContain('7,8 horas')
  })
  it('avisa cuando los horarios dejan poco sueño y propone la hora', () => {
    const d = dictamenes({ ...matias, horaDormir: '23:30' })
    expect(d[2]?.veredicto).toContain('Es poco')
    expect(d[2]?.veredicto).toContain('21:45')
  })
})

describe('tiempo', () => {
  it('trabaja siempre en hora local', () => {
    expect(fechaLocal(new Date(2026, 10, 23, 23, 59))).toBe('2026-11-23')
    expect(fechaLocal(new Date(2026, 10, 23, 0, 1))).toBe('2026-11-23')
    expect(sumarDias('2026-12-31', 1)).toBe('2027-01-01')
    expect(fechaLarga('2026-11-23')).toBe('Lunes 23 de noviembre')
  })
  it('suma minutos cruzando la medianoche', () => {
    expect(sumarMinutos('00:30', -60)).toBe('23:30')
    expect(horasDeSueno('21:30', '05:15')).toBeCloseTo(7.75, 2)
    expect(horasDeSueno('00:30', '08:00')).toBeCloseTo(7.5, 2)
  })
})
