import { useState, type FormEvent } from 'react'
import { kg } from '../componentes'
import type { Estado } from '../datos/almacen'
import { ritmoSemanal } from '../dominio/proyeccion'
import { leerRitmo, PESADAS_MINIMAS, registrar, tendencia, type Lectura } from '../dominio/seguimiento'
import { fechaCorta } from '../dominio/tiempo'
import type { Perfil } from '../dominio/tipos'

const LECTURAS: Record<Lectura, string> = {
  'falta-dato': `Todavía no hay conclusión. Hacen falta ${PESADAS_MINIMAS} pesadas esta semana y ${PESADAS_MINIMAS} la anterior.`,
  'en-ritmo': 'Vas en el ritmo esperado. No se toca nada.',
  'muy-rapido': 'Vas más rápido de lo esperado. Si se repite la semana que viene, conviene sumar comida para cuidar el músculo.',
  'muy-lento': 'Vas más lento de lo esperado. Antes de cambiar el plan, revisá una semana más: el agua y la sal mueven la balanza.',
}

const valido = (texto: string, min: number, max: number) => {
  const n = Number(texto.replace(',', '.'))
  return texto.trim() !== '' && n >= min && n <= max ? n : null
}

export function Seguimiento({ estado, perfil, hoy, cambiar, editar, borrar }: { estado: Estado; perfil: Perfil; hoy: string; cambiar: (e: Estado) => void; editar: () => void; borrar: () => void }) {
  const [peso, setPeso] = useState('')
  const [cintura, setCintura] = useState('')
  const [confirmando, setConfirmando] = useState(false)
  const t = tendencia(estado.pesos, hoy)
  const lectura = leerRitmo(t.ritmoKgPorSemana, ritmoSemanal(perfil.objetivo, perfil.pesoKg))
  const ultimaCintura = estado.cinturas.at(-1)

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
        <h1 style={{ fontSize: 28, letterSpacing: '-0.02em' }}>Seguimiento</h1>
      </header>

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
