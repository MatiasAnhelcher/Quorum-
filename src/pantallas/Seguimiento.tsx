import { useState, type FormEvent, type ReactNode } from 'react'
import { kg } from '../componentes'
import { aplicarTema, cargarTema, leerCopia, type Estado, type Tema } from '../datos/almacen'
import { planDeComida } from '../dominio/cuerpo'
import { ritmoSemanal } from '../dominio/proyeccion'
import { ajustePropuesto, DIAS_ENTRE_AJUSTES, leerRitmo, PESADAS_MINIMAS, registrar, tendencia, type Lectura } from '../dominio/seguimiento'
import { fechaCorta } from '../dominio/tiempo'
import type { Perfil } from '../dominio/tipos'

const LECTURAS: Record<Lectura, string> = {
  'falta-dato': `Todavía no hay conclusión. Hacen falta ${PESADAS_MINIMAS} pesadas esta semana y ${PESADAS_MINIMAS} la anterior.`,
  'en-ritmo': 'Vas en el ritmo esperado. No se toca nada.',
  'muy-rapido': 'Vas más rápido de lo esperado, con dos semanas de pesadas.',
  'muy-lento': 'Vas más lento de lo esperado, con dos semanas de pesadas.',
}

const TEMAS: { id: Tema; nombre: string }[] = [
  { id: 'sistema', nombre: 'Automático' },
  { id: 'claro', nombre: 'Claro' },
  { id: 'oscuro', nombre: 'Oscuro' },
]

const miles = (n: number) => n.toLocaleString('es-AR')

const valido = (texto: string, min: number, max: number) => {
  const n = Number(texto.replace(',', '.'))
  return texto.trim() !== '' && n >= min && n <= max ? n : null
}

export function Seguimiento({ estado, perfil, hoy, cambiar, editar, borrar, arriba }: { estado: Estado; perfil: Perfil; hoy: string; cambiar: (e: Estado) => void; editar: () => void; borrar: () => void; arriba?: ReactNode }) {
  const [peso, setPeso] = useState('')
  const [cintura, setCintura] = useState('')
  const [confirmando, setConfirmando] = useState(false)
  const t = tendencia(estado.pesos, hoy)
  const lectura = leerRitmo(t.ritmoKgPorSemana, ritmoSemanal(perfil.objetivo, perfil.pesoKg))
  const ultimaCintura = estado.cinturas.at(-1)
  const [tema, setTema] = useState<Tema>(cargarTema)
  const [copia, setCopia] = useState<Estado | null>(null)
  const [avisoCopia, setAvisoCopia] = useState('')

  // El plan se corrige solo: la propuesta sale de las reglas y la persona decide si la aplica.
  const plan = planDeComida(perfil)
  const ajuste = ajustePropuesto(lectura, perfil.objetivo === 'ganar-musculo', perfil.ajusteKcal ?? 0, perfil.ajusteFecha, hoy)
  const planNuevo = ajuste === null ? null : planDeComida({ ...perfil, ajusteKcal: ajuste })
  const hayPropuesta = planNuevo !== null && planNuevo.kcal !== plan.kcal

  const descargar = () => {
    const enlace = document.createElement('a')
    enlace.href = URL.createObjectURL(new Blob([JSON.stringify(estado, null, 2)], { type: 'application/json' }))
    enlace.download = `quorum-copia-${hoy}.json`
    enlace.click()
    URL.revokeObjectURL(enlace.href)
    setAvisoCopia('Copia descargada. Guardala fuera de este teléfono.')
  }
  const elegirCopia = async (archivo: File | undefined) => {
    if (!archivo) return
    const leida = leerCopia(await archivo.text())
    setCopia(leida)
    setAvisoCopia(leida ? '' : 'Ese archivo no es una copia de Quorum. No se cambió nada.')
  }

  const cargarPeso = (e: FormEvent) => {
    e.preventDefault()
    const valor = valido(peso, 35, 250)
    if (valor === null) return
    cambiar({ ...estado, pesos: registrar(estado.pesos, { fecha: hoy, valor }) })
    setPeso('')
  }
  const cargarCintura = (e: FormEvent) => {
    e.preventDefault()
    const valor = valido(cintura, 50, 200)
    if (valor === null) return
    cambiar({ ...estado, cinturas: registrar(estado.cinturas, { fecha: hoy, valor }) })
    setCintura('')
  }

  return (
    <main className="pantalla">
      <header className="columna" style={{ gap: 2 }}>
        <span className="glosa">Manda el promedio, no el día</span>
        <h1>Seguimiento</h1>
      </header>
      {arriba}

      <section className="carta" aria-label="Peso">
        <div className="fila">
          <div className="columna" style={{ gap: 6 }}>
            <span className="glosa">Promedio de 7 días</span>
            <span className="cifra">{t.promedioKg === null ? 'Sin dato' : kg(t.promedioKg)}{t.promedioKg !== null && <small> kg</small>}</span>
          </div>
          {t.ritmoKgPorSemana !== null && (
            <div className="columna" style={{ gap: 2, alignItems: 'flex-end' }}>
              <span className="glosa">Ritmo</span>
              <span className="cifra media">{t.ritmoKgPorSemana > 0 ? '+' : ''}{kg(t.ritmoKgPorSemana)}<small> kg/sem</small></span>
            </div>
          )}
        </div>
        <p className="glosa" role="status">{LECTURAS[lectura]}</p>
        {hayPropuesta && planNuevo && ajuste !== null && (
          <div className="propuesta">
            <span className="rotulo">El Directorio propone un ajuste</span>
            <b>De {miles(plan.kcal)} a {miles(planNuevo.kcal)} kcal por día</b>
            <span className="glosa">La proteína queda en {plan.proteinaG} g. Cambian los carbohidratos: de {plan.carbosG} a {planNuevo.carbosG} g. Se vuelve a evaluar en {DIAS_ENTRE_AJUSTES} días.</span>
            <button type="button" className="accion" onClick={() => cambiar({ ...estado, perfil: { ...perfil, ajusteKcal: ajuste, ajusteFecha: hoy } })}>Aplicar el ajuste</button>
          </div>
        )}
        {!hayPropuesta && (lectura === 'muy-rapido' || lectura === 'muy-lento') && (
          <p className="rotulo">{perfil.ajusteFecha
            ? `El plan ya se ajustó el ${fechaCorta(perfil.ajusteFecha)}. Hacen falta ${DIAS_ENTRE_AJUSTES} días para leer el efecto antes de tocarlo de nuevo.`
            : 'El plan ya está en su límite. Conviene corregir el diagnóstico con tu peso de hoy.'}</p>
        )}
        {perfil.ajusteKcal ? <p className="rotulo">Corrección acumulada del plan: {perfil.ajusteKcal > 0 ? '+' : '−'}{Math.abs(perfil.ajusteKcal)} kcal por día.</p> : null}
        <form className="fila" onSubmit={cargarPeso} style={{ alignItems: 'flex-end' }}>
          <div className="campo" style={{ flexGrow: 1 }}>
            <label htmlFor="peso-hoy">Peso de hoy, en ayunas (kg)</label>
            <input id="peso-hoy" inputMode="decimal" autoComplete="off" value={peso} onChange={(e) => setPeso(e.target.value)} />
          </div>
          <button type="submit" className="accion" style={{ minHeight: 52 }} disabled={valido(peso, 35, 250) === null}>Guardar</button>
        </form>
        {estado.pesos.length > 0 && (
          <p className="rotulo">Últimas pesadas: {estado.pesos.slice(-5).reverse().map((m) => `${fechaCorta(m.fecha)}: ${kg(m.valor)}`).join(' · ')}</p>
        )}
      </section>

      <section className="carta" aria-label="Cintura">
        <div className="fila">
          <div className="columna" style={{ gap: 2 }}>
            <span className="glosa">Cintura{ultimaCintura ? ` · ${fechaCorta(ultimaCintura.fecha)}` : ' · punto de partida'}</span>
            <span className="cifra media">{kg(ultimaCintura?.valor ?? perfil.cinturaCm)}<small> cm</small></span>
          </div>
          {ultimaCintura && (
            <span className="rotulo" style={{ textAlign: 'right' }}>{kg(Math.abs(ultimaCintura.valor - perfil.cinturaCm))} cm {ultimaCintura.valor <= perfil.cinturaCm ? 'menos' : 'más'}<br />que al empezar</span>
          )}
        </div>
        <form className="fila" onSubmit={cargarCintura} style={{ alignItems: 'flex-end' }}>
          <div className="campo" style={{ flexGrow: 1 }}>
            <label htmlFor="cintura-hoy">Cintura, una vez por mes (cm)</label>
            <input id="cintura-hoy" inputMode="decimal" autoComplete="off" value={cintura} onChange={(e) => setCintura(e.target.value)} />
          </div>
          <button type="submit" className="accion" style={{ minHeight: 52 }} disabled={valido(cintura, 50, 200) === null}>Guardar</button>
        </form>
      </section>

      <section className="carta" aria-label="Apariencia">
        <h2>Apariencia</h2>
        <div className="tramos" role="group" aria-label="Tema">
          {TEMAS.map((t) => (
            <button key={t.id} type="button" aria-pressed={tema === t.id} onClick={() => { aplicarTema(t.id); setTema(t.id) }}>{t.nombre}</button>
          ))}
        </div>
        <span className="rotulo">Automático sigue al modo claro u oscuro del teléfono.</span>
      </section>

      <section className="carta" aria-label="Copia de seguridad">
        <h2>Copia de seguridad</h2>
        <p className="glosa">Tus datos viven solo en este teléfono. Si borrás el navegador o cambiás de equipo, se pierden salvo que tengas una copia.</p>
        {copia?.perfil ? (
          <div className="columna" style={{ gap: 10 }}>
            <p className="aviso" role="alert">La copia es de {copia.perfil.nombre}, con {copia.pesos.length} pesadas y {Object.keys(copia.registro).length} días registrados. Reemplaza todo lo que hay en este teléfono.</p>
            <div className="pie" style={{ marginTop: 0 }}>
              <button type="button" className="contorno" onClick={() => setCopia(null)}>Cancelar</button>
              <button type="button" className="accion" onClick={() => { cambiar(copia); setCopia(null); setAvisoCopia('Copia restaurada.') }}>Restaurar</button>
            </div>
          </div>
        ) : (
          <div className="pie" style={{ marginTop: 0 }}>
            <button type="button" className="contorno" style={{ flex: 1, padding: '0 10px' }} onClick={descargar}>Descargar copia</button>
            <label className="contorno" style={{ flex: 1, padding: '0 10px', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
              Restaurar copia
              <input className="oculto" type="file" accept="application/json,.json" onChange={(e) => { void elegirCopia(e.target.files?.[0]); e.target.value = '' }} />
            </label>
          </div>
        )}
        {avisoCopia && <p className="rotulo" role="status">{avisoCopia}</p>}
      </section>

      <section className="carta" aria-label="Mis datos">
        <h2>Lo que Quorum sabe de vos</h2>
        <p className="glosa">{perfil.nombre}, {perfil.edad} años, {perfil.alturaCm} cm y {kg(perfil.pesoKg)} kg al empezar. {perfil.diasEntreno} días de entrenamiento. Todo está guardado solo en este teléfono.</p>
        <button type="button" className="contorno" onClick={editar}>Corregir mi diagnóstico</button>
        {confirmando ? (
          <div className="columna" style={{ gap: 10 }}>
            <p className="aviso" role="alert">Se borran el diagnóstico, los acuerdos y todas las mediciones. No se puede deshacer.</p>
            <div className="pie" style={{ marginTop: 0 }}>
              <button type="button" className="contorno" onClick={() => setConfirmando(false)}>No borrar</button>
              <button type="button" className="accion" onClick={borrar}>Sí, borrar todo</button>
            </div>
          </div>
        ) : (
          <button type="button" className="contorno" onClick={() => setConfirmando(true)}>Borrar todos mis datos</button>
        )}
      </section>
    </main>
  )
}
