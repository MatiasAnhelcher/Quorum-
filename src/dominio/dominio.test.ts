import { describe, expect, it } from 'vitest'
import { cinturaObjetivo, gastoEnReposo, grasaEstimada, pesoDeReferencia, planDeComida } from './cuerpo'
import { dictamenes } from './directorio'
import { actaSemanal, acuerdosDelDia, alternar, constanciaSemanal, estaAchicado, hayQuorum, sesionDelDia, type Registro } from './hoy'
import { EJEMPLOS, PASOS_DE_VISPERA, anotarOla, destrabadas, frenteListo, resumenDeDominio, destrabeListo, intencionCompleta, lunesDe, reloj, renglones, repartoCompleto, visperaLista } from './herramientas'
import { anotarSerie, borrarUltimaSerie, leerRango, rutinaDelDia, segundosDeDescanso, semanaDeEntreno, SESIONES, sugerencia, ultimaVez, type Bitacora } from './rutina'
import { curva, proyectar } from './proyeccion'
import { leerCopia } from '../datos/almacen'
import { ajustePropuesto, leerRitmo, registrar, tendencia } from './seguimiento'
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

describe('el plan se corrige solo', () => {
  it('no propone nada sin dato o en ritmo', () => {
    expect(ajustePropuesto('falta-dato', false, 0, undefined, '2026-12-07')).toBeNull()
    expect(ajustePropuesto('en-ritmo', false, 0, undefined, '2026-12-07')).toBeNull()
  })
  it('bajando: lento resta comida y rápido suma', () => {
    expect(ajustePropuesto('muy-lento', false, 0, undefined, '2026-12-07')).toBe(-100)
    expect(ajustePropuesto('muy-rapido', false, 0, undefined, '2026-12-07')).toBe(100)
  })
  it('subiendo es al revés', () => {
    expect(ajustePropuesto('muy-lento', true, 0, undefined, '2026-12-07')).toBe(100)
    expect(ajustePropuesto('muy-rapido', true, 0, undefined, '2026-12-07')).toBe(-100)
  })
  it('espera 14 días entre ajustes y respeta el tope', () => {
    expect(ajustePropuesto('muy-lento', false, -100, '2026-12-01', '2026-12-07')).toBeNull()
    expect(ajustePropuesto('muy-lento', false, -100, '2026-12-01', '2026-12-15')).toBe(-200)
    expect(ajustePropuesto('muy-lento', false, -300, undefined, '2026-12-07')).toBeNull()
    expect(ajustePropuesto('muy-rapido', false, -300, undefined, '2026-12-07')).toBe(-200)
  })
  it('el ajuste cambia calorías y carbohidratos, nunca la proteína ni el piso', () => {
    const base = planDeComida(matias)
    const ajustado = planDeComida({ ...matias, ajusteKcal: -100 })
    expect(ajustado.kcal).toBe(base.kcal - 100)
    expect(ajustado.proteinaG).toBe(base.proteinaG)
    expect(ajustado.carbosG).toBe(base.carbosG - 25)
    expect(planDeComida({ ...matias, ajusteKcal: -5000 }).kcal).toBeGreaterThanOrEqual(Math.floor(gastoEnReposo(matias) / 50) * 50)
  })
})

describe('copia de seguridad', () => {
  const estado = { version: 1 as const, perfil: matias, registro: { '2026-11-23': ['entreno' as const] }, pesos: [{ fecha: '2026-11-23', valor: 78.6 }], cinturas: [] }
  it('lee de vuelta lo que se descargó', () => {
    expect(leerCopia(JSON.stringify(estado))).toEqual(estado)
  })
  it('rechaza archivos que no son una copia de Quorum', () => {
    expect(leerCopia('hola')).toBeNull()
    expect(leerCopia('null')).toBeNull()
    expect(leerCopia(JSON.stringify({ ...estado, version: 2 }))).toBeNull()
    expect(leerCopia(JSON.stringify({ ...estado, perfil: null }))).toBeNull()
    expect(leerCopia(JSON.stringify({ ...estado, pesos: [{ fecha: 1 }] }))).toBeNull()
  })
})

describe('rutina', () => {
  it('trae los ejercicios de la sesión del día y la versión mínima', () => {
    const r = rutinaDelDia(matias, '2026-11-23')
    expect(r?.sesion).toBe('Torso completo')
    expect(r?.ejercicios).toHaveLength(7)
    expect(r?.ejercicios[0]).toMatchObject({ nombre: 'Press de banca en Smith', series: '3×6–10', descanso: '2–3 min' })
    expect(r?.minima.map((x) => x.nombre)).toEqual(['Press de banca en Smith', 'Remo en máquina con pecho apoyado'])
  })
  it('no hay rutina en día de descanso', () => {
    expect(rutinaDelDia(matias, '2026-11-22')).toBeNull()
  })
  it('toda sesión de cualquier estructura tiene su rutina', () => {
    for (const dias of [3, 4, 5] as const) {
      for (let i = 0; i < 7; i++) {
        const fecha = sumarDias('2026-11-23', i)
        const sesion = sesionDelDia({ diasEntreno: dias }, fecha)
        if (sesion) expect(SESIONES[sesion]?.length).toBeGreaterThanOrEqual(6)
      }
    }
  })
})

describe('acta y acuerdos que se achican', () => {
  // matias empezó el 16/11. Del 20 al 22 no hizo foco.
  const r: Registro = { '2026-11-20': ['entreno', 'comida'], '2026-11-21': ['comida'], '2026-11-22': ['comida', 'sueno'] }
  it('cuenta los votos de cada acuerdo en 7 días', () => {
    expect(actaSemanal(r, '2026-11-23')).toEqual({ entreno: 1, comida: 3, foco: 0, plan: 0, sueno: 1 })
  })
  it('achica el acuerdo que falló tres días seguidos, y solo ese', () => {
    expect(estaAchicado(r, '2026-11-23', matias.inicio, 'foco')).toBe(true)
    expect(estaAchicado(r, '2026-11-23', matias.inicio, 'comida')).toBe(false)
    expect(estaAchicado(r, '2026-11-23', matias.inicio, 'sueno')).toBe(false)
    const acuerdos = acuerdosDelDia(matias, '2026-11-23', r)
    expect(acuerdos.find((a) => a.id === 'foco')).toMatchObject({ titulo: '5 minutos de repaso de memoria', achicado: true })
    expect(acuerdos.find((a) => a.id === 'comida')?.achicado).toBeUndefined()
    expect(acuerdos.find((a) => a.id === 'entreno')?.titulo).toBe('Entrenar: Torso completo')
    expect(acuerdosDelDia(matias, '2026-11-23', {}).find((a) => a.id === 'entreno')?.titulo).toBe('Entrenar 20 minutos: Torso completo')
  })
  it('no achica nada en los primeros tres días del plan', () => {
    expect(estaAchicado({}, '2026-11-18', matias.inicio, 'foco')).toBe(false)
    expect(estaAchicado({}, '2026-11-19', matias.inicio, 'foco')).toBe(true)
  })
  it('vuelve a su tamaño en cuanto sale un día', () => {
    expect(estaAchicado({ ...r, '2026-11-23': ['foco'] }, '2026-11-24', matias.inicio, 'foco')).toBe(false)
  })
})

describe('entreno guiado', () => {
  it('cada ejercicio tiene rango legible, descanso en segundos y ficha de técnica', () => {
    for (const ejercicios of Object.values(SESIONES)) {
      for (const ej of ejercicios) {
        const rango = leerRango(ej.series)
        expect(rango.series).toBeGreaterThanOrEqual(2)
        expect(rango.max).toBeGreaterThan(rango.min)
        expect(segundosDeDescanso(ej.descanso)).toBeGreaterThanOrEqual(60)
        expect(ej.claves.length).toBeGreaterThanOrEqual(2)
        expect(ej.musculos.length).toBeGreaterThan(3)
        expect(ej.error.length).toBeGreaterThan(10)
      }
    }
  })
  it('lee rangos por repeticiones y por tiempo', () => {
    expect(leerRango('3×6–10')).toEqual({ series: 3, min: 6, max: 10, porTiempo: false })
    expect(leerRango('3×10–12 por brazo')).toMatchObject({ series: 3, min: 10, max: 12, porTiempo: false })
    expect(leerRango('3×30–45 s')).toEqual({ series: 3, min: 30, max: 45, porTiempo: true })
    expect(segundosDeDescanso('2–3 min')).toBe(180)
    expect(segundosDeDescanso('60–90 s')).toBe(90)
  })
  it('arma la semana de lunes a domingo con la sesión de cada día', () => {
    const semana = semanaDeEntreno(matias, '2026-11-25')
    expect(semana.map((d) => d.fecha)).toEqual(['2026-11-23', '2026-11-24', '2026-11-25', '2026-11-26', '2026-11-27', '2026-11-28', '2026-11-29'])
    expect(semana.map((d) => d.sesion)).toEqual(['Torso completo', 'Pierna A', 'Tirón', 'Empuje', 'Pierna B', null, null])
    expect(semanaDeEntreno(matias, '2026-11-29')[0]?.fecha).toBe('2026-11-23')
  })
  it('anota series, corrige la última y encuentra la vez anterior', () => {
    let b: Bitacora = {}
    b = anotarSerie(b, '2026-11-16', 'Press de banca en Smith', { kg: 40, reps: 10 })
    b = anotarSerie(b, '2026-11-23', 'Press de banca en Smith', { kg: 40, reps: 9 })
    b = anotarSerie(b, '2026-11-23', 'Press de banca en Smith', { kg: 40, reps: 99 })
    b = borrarUltimaSerie(b, '2026-11-23', 'Press de banca en Smith')
    expect(b['2026-11-23']?.['Press de banca en Smith']).toEqual([{ kg: 40, reps: 9 }])
    expect(ultimaVez(b, 'Press de banca en Smith', '2026-11-23')).toEqual({ fecha: '2026-11-16', series: [{ kg: 40, reps: 10 }] })
    expect(ultimaVez(b, 'Curl femoral', '2026-11-23')).toBeNull()
  })
  it('doble progresión: sube al llegar al tope, baja si no llega al mínimo, y si no suma una repetición', () => {
    const press = { series: '3×6–10' }
    expect(sugerencia(press, null)).toEqual({ indicacion: 'primera-vez', kg: null })
    expect(sugerencia(press, [{ kg: 40, reps: 10 }, { kg: 40, reps: 10 }, { kg: 40, reps: 10 }])).toEqual({ indicacion: 'subir', kg: 40 })
    expect(sugerencia(press, [{ kg: 40, reps: 10 }, { kg: 40, reps: 10 }])).toEqual({ indicacion: 'sumar-repeticion', kg: 40 })
    expect(sugerencia(press, [{ kg: 40, reps: 10 }, { kg: 40, reps: 8 }, { kg: 40, reps: 7 }])).toEqual({ indicacion: 'sumar-repeticion', kg: 40 })
    expect(sugerencia(press, [{ kg: 45, reps: 7 }, { kg: 45, reps: 5 }, { kg: 45, reps: 4 }])).toEqual({ indicacion: 'bajar', kg: 45 })
  })
})

describe('herramientas', () => {
  it('un plan si-entonces vale cuando las dos partes dicen algo', () => {
    expect(intencionCompleta(undefined)).toBe(false)
    expect(intencionCompleta({ si: 'suena la alarma', entonces: '' })).toBe(false)
    expect(intencionCompleta({ si: '  ', entonces: 'me levanto' })).toBe(false)
    for (const ejemplo of Object.values(EJEMPLOS)) expect(intencionCompleta(ejemplo)).toBe(true)
  })
  it('la semana de la revisión empieza el lunes', () => {
    expect(lunesDe('2026-11-23')).toBe('2026-11-23')
    expect(lunesDe('2026-11-29')).toBe('2026-11-23')
    expect(lunesDe('2026-11-30')).toBe('2026-11-30')
  })
  it('muestra el cronómetro en minutos y segundos', () => {
    expect(reloj(1500)).toBe('25:00')
    expect(reloj(59.2)).toBe('01:00')
    expect(reloj(-3)).toBe('00:00')
  })
  it('una tarea trabada arranca cuando tiene mínimo y hora', () => {
    expect(destrabeListo(undefined)).toBe(false)
    expect(destrabeListo({ tarea: 'Armar el currículum', minimo: 'Una página', hora: '' })).toBe(false)
    expect(destrabeListo({ tarea: 'Armar el currículum', minimo: '  ', hora: '18:30' })).toBe(false)
    expect(destrabeListo({ tarea: 'Armar el currículum', minimo: 'Una página', hora: '25:00' })).toBe(false)
    expect(destrabeListo({ tarea: 'Armar el currículum', minimo: 'Una página', hora: '18:30' })).toBe(true)
  })
  it('cuenta solo lo terminado en los últimos 7 días', () => {
    const d = { tarea: 'algo', minimo: 'poco', hora: '10:00' }
    const todos = { '2026-11-16': { ...d, hecho: true }, '2026-11-17': { ...d, hecho: true }, '2026-11-20': d, '2026-11-23': { ...d, hecho: true }, '2026-11-24': { ...d, hecho: true } }
    expect(destrabadas(todos, '2026-11-23')).toBe(2)
    expect(destrabadas({}, '2026-11-23')).toBe(0)
  })
  it('el reparto pide un paso propio; lo ajeno puede quedar vacío', () => {
    expect(repartoCompleto(undefined)).toBe(false)
    expect(repartoCompleto({ asunto: 'La entrevista', mio: 'Prepararme', ajeno: 'Si me eligen', paso: '' })).toBe(false)
    expect(repartoCompleto({ asunto: 'La entrevista', mio: 'Prepararme', ajeno: '', paso: 'Ensayar la apertura' })).toBe(true)
  })
  it('la víspera cierra con tres pendientes escritos y todos los pasos', () => {
    const todos = PASOS_DE_VISPERA.map((p) => p.id)
    expect(renglones('Llamar al contador\n\n  \nComprar pollo\nx')).toBe(2)
    expect(visperaLista(undefined)).toBe(false)
    expect(visperaLista({ pendientes: 'uno solo', listos: todos })).toBe(false)
    expect(visperaLista({ pendientes: 'Llamar\nComprar\nMandar', listos: todos.slice(1) })).toBe(false)
    expect(visperaLista({ pendientes: 'Llamar\nComprar\nMandar', listos: todos })).toBe(true)
  })
  it('el frente necesita qué se deja, cuándo aparece y qué se hace en cambio', () => {
    expect(frenteListo(undefined)).toBe(false)
    expect(frenteListo({ nombre: 'El cigarrillo', disparador: 'Después de comer', salida: '' })).toBe(false)
    expect(frenteListo({ nombre: 'El cigarrillo', disparador: 'Después de comer', salida: 'Salgo a caminar' })).toBe(true)
  })
  it('una caída no borra lo ganado: las ganas superadas y los días firmes solo suman', () => {
    const frente = { nombre: 'El cigarrillo', disparador: 'Después de comer', salida: 'Salgo a caminar' }
    let d = { frente, desde: '2026-11-20', dias: {} }
    expect(resumenDeDominio(d, '2026-11-20')).toEqual({ superadas: 0, diasFirmes: 1, dias: 1, ultimaCaida: null })
    d = anotarOla(d, '2026-11-20', 'pasada')
    d = anotarOla(d, '2026-11-21', 'pasada')
    d = anotarOla(d, '2026-11-21', 'pasada')
    expect(resumenDeDominio(d, '2026-11-22')).toEqual({ superadas: 3, diasFirmes: 3, dias: 3, ultimaCaida: null })
    d = anotarOla(d, '2026-11-22', 'caida')
    d = anotarOla(d, '2026-11-22', 'caida')
    expect(resumenDeDominio(d, '2026-11-23')).toEqual({ superadas: 3, diasFirmes: 3, dias: 4, ultimaCaida: '2026-11-22' })
    d = anotarOla(d, '2026-11-23', 'pasada')
    expect(resumenDeDominio(d, '2026-11-23').superadas).toBe(4)
  })
  it('la copia de seguridad conserva la bitácora y las herramientas, y acepta copias viejas', () => {
    const base = { version: 1 as const, perfil: matias, registro: {}, pesos: [], cinturas: [] }
    const nuevo = { ...base, bitacora: { '2026-11-23': { Plancha: [{ kg: 0, reps: 40 }] } }, intenciones: { foco: EJEMPLOS.foco }, revisiones: {}, repasos: { '2026-11-23': 'hola' }, destrabes: { '2026-11-23': { tarea: 'cv', minimo: 'una página', hora: '18:30', hecho: true } }, repartos: {}, visperas: { '2026-11-23': { pendientes: 'a', listos: ['cosas'] } }, dominio: { frente: { nombre: 'x', disparador: 'y', salida: 'z' }, desde: '2026-11-23', dias: {} } }
    expect(leerCopia(JSON.stringify(nuevo))).toEqual(nuevo)
    expect(leerCopia(JSON.stringify(base))).toEqual(base)
    expect(leerCopia(JSON.stringify({ ...base, bitacora: 'x' }))).toEqual(base)
    expect(leerCopia(JSON.stringify({ ...base, dominio: { frente: 'x' } }))).toEqual(base)
  })
})
