import { useEffect, useState, type FormEvent } from 'react'
import { kg as formatoKg } from '../componentes'
import { reloj } from '../dominio/herramientas'
import { anotarSerie, borrarUltimaSerie, leerRango, rutinaDelDia, segundosDeDescanso, semanaDeEntreno, sugerencia, ultimaVez, type Bitacora, type Ejercicio, type Serie } from '../dominio/rutina'
import { desdeFecha, fechaCorta, fechaLarga } from '../dominio/tiempo'
import type { Perfil } from '../dominio/tipos'

const LETRAS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

const numero = (texto: string, min: number, max: number) => {
  const n = Number(texto.replace(',', '.'))
  return texto.trim() !== '' && n >= min && n <= max ? n : null
}

const textoSeries = (series: Serie[], porTiempo: boolean) =>
  porTiempo ? series.map((s) => `${s.reps} s`).join(', ') : `${formatoKg(series[0]?.kg ?? 0)} kg × ${series.map((s) => s.reps).join(', ')}`

function indicacion(ej: Ejercicio, anteriores: { fecha: string; series: Serie[] } | null): string {
  const rango = leerRango(ej.series)
  const s = sugerencia(ej, anteriores?.series ?? null)
  if (s.indicacion === 'primera-vez' || !anteriores) {
    return rango.porTiempo
      ? `Primera vez: aguantá entre ${rango.min} y ${rango.max} segundos por serie.`
      : `Primera vez: elegí un peso con el que llegues a ${rango.min} repeticiones y te queden 1 o 2 en reserva.`
  }
  const antes = `La última vez (${fechaCorta(anteriores.fecha)}): ${textoSeries(anteriores.series, rango.porTiempo)}.`
  if (rango.porTiempo) return `${antes} Hoy buscá unos segundos más, hasta ${rango.max}.`
  if (s.indicacion === 'subir') return `${antes} Llegaste al tope en todas las series: hoy subí el peso un escalón y volvé a ${rango.min} repeticiones.`
  if (s.indicacion === 'bajar') return `${antes} Alguna serie quedó debajo de ${rango.min}: hoy bajá el peso un escalón.`
  return `${antes} Hoy mismo peso, y buscá una repetición más en alguna serie.`
}

function Tarjeta({ ej, orden, hoy, bitacora, editable, anotar, borrar, descanso }: {
  ej: Ejercicio; orden: number; hoy: string; bitacora: Bitacora; editable: boolean
  anotar: (s: Serie) => void; borrar: () => void; descanso: number | null
}) {
  const rango = leerRango(ej.series)
  const hechas = bitacora[hoy]?.[ej.nombre] ?? []
  const anteriores = ultimaVez(bitacora, ej.nombre, hoy)
  const [peso, setPeso] = useState(() => String(hechas.at(-1)?.kg ?? anteriores?.series[0]?.kg ?? '').replace('.', ','))
  const [reps, setReps] = useState('')
  const kg = rango.porTiempo ? 0 : numero(peso, 0, 500)
  const cuenta = numero(reps, 1, 600)
  const completo = hechas.length >= rango.series

  const enviar = (e: FormEvent) => {
    e.preventDefault()
    if (kg === null || cuenta === null) return
    anotar({ kg, reps: Math.round(cuenta) })
    setReps('')
  }

  return (
    <details className={`carta chica ejercicio${completo ? ' completo' : ''}`}>
      <summary>
        <span className="orden">{orden}</span>
        <span className="columna" style={{ flexGrow: 1, gap: 2 }}>
          <b>{ej.nombre}</b>
          <span className="rotulo">{ej.series} · descanso {ej.descanso}</span>
        </span>
        <span className="rotulo avance">{editable ? `${Math.min(hechas.length, rango.series)} de ${rango.series}` : ''}</span>
      </summary>
      <p className="rotulo">{ej.musculos}</p>
      <ul>{ej.claves.map((c) => <li key={c}>{c}</li>)}</ul>
      <p className="nota"><b>Error común</b>{ej.error}</p>
      {editable && (
        <>
          <p className="glosa">{indicacion(ej, anteriores)}</p>
          {hechas.length > 0 && (
            <p className="fila" style={{ fontSize: 14 }}>
              <span>Hoy: <b>{textoSeries(hechas, rango.porTiempo)}</b></span>
              <button type="button" className="enlace" onClick={borrar}>Borrar la última</button>
            </p>
          )}
          {descanso !== null && <p className="descanso" role="timer" aria-label="Descanso">Descanso <b>{reloj(descanso)}</b></p>}
          <form className="fila" onSubmit={enviar} style={{ alignItems: 'flex-end' }}>
            {!rango.porTiempo && (
              <div className="campo" style={{ flex: 1 }}>
                <label htmlFor={`kg-${orden}`}>Peso (kg)</label>
                <input id={`kg-${orden}`} inputMode="decimal" autoComplete="off" value={peso} onChange={(e) => setPeso(e.target.value)} />
              </div>
            )}
            <div className="campo" style={{ flex: 1 }}>
              <label htmlFor={`reps-${orden}`}>{rango.porTiempo ? 'Segundos' : 'Repeticiones'}</label>
              <input id={`reps-${orden}`} inputMode="numeric" autoComplete="off" value={reps} onChange={(e) => setReps(e.target.value)} />
            </div>
            <button type="submit" className="accion" style={{ minHeight: 52 }} disabled={kg === null || cuenta === null}>Anotar</button>
          </form>
        </>
      )}
    </details>
  )
}

export function Entreno({ perfil, hoy, bitacora, votado, cambiar, votar }: {
  perfil: Perfil; hoy: string; bitacora: Bitacora; votado: boolean
  cambiar: (b: Bitacora) => void; votar: () => void
}) {
  const [dia, setDia] = useState(hoy)
  const [descanso, setDescanso] = useState<{ ejercicio: string; hasta: number } | null>(null)
  const [ahora, setAhora] = useState(() => Date.now())
  const semana = semanaDeEntreno(perfil, hoy)
  const rutina = rutinaDelDia(perfil, dia)
  const esHoy = dia === hoy

  useEffect(() => {
    if (!descanso) return
    const reloj = setInterval(() => setAhora(Date.now()), 250)
    return () => clearInterval(reloj)
  }, [descanso])
  const resta = descanso ? (descanso.hasta - ahora) / 1000 : 0
  useEffect(() => {
    if (descanso && resta <= 0) setDescanso(null)
  }, [descanso, resta])

  return (
    <main className="pantalla">
      <header className="columna" style={{ gap: 2 }}>
        <span className="glosa">{perfil.diasEntreno} días por semana · cada músculo dos veces</span>
        <h1>Entreno</h1>
      </header>

      <div className="dias" role="group" aria-label="Semana de entrenamiento">
        {semana.map((d, i) => (
          <button key={d.fecha} type="button" aria-pressed={d.fecha === dia} aria-label={`${fechaLarga(d.fecha)}: ${d.sesion ?? 'descanso'}`} className={d.fecha === hoy ? 'hoy' : ''} onClick={() => setDia(d.fecha)}>
            <span>{LETRAS[i]}</span>
            <b>{desdeFecha(d.fecha).getDate()}</b>
            <span className={`punto${d.sesion ? ' si' : ''}`} />
          </button>
        ))}
      </div>

      <section className="columna" style={{ gap: 2 }} aria-live="polite">
        <span className="glosa">{esHoy ? 'Hoy' : fechaLarga(dia)}</span>
        <h2 className="sesion">{rutina ? rutina.sesion : 'Descanso'}</h2>
      </section>

      {rutina ? (
        <>
          {rutina.ejercicios.map((ej, i) => (
            <Tarjeta
              key={`${dia}-${ej.nombre}`}
              ej={ej}
              orden={i + 1}
              hoy={hoy}
              bitacora={bitacora}
              editable={esHoy}
              descanso={descanso?.ejercicio === ej.nombre && resta > 0 ? resta : null}
              anotar={(s) => {
                cambiar(anotarSerie(bitacora, hoy, ej.nombre, s))
                setAhora(Date.now())
                setDescanso({ ejercicio: ej.nombre, hasta: Date.now() + segundosDeDescanso(ej.descanso) * 1000 })
              }}
              borrar={() => cambiar(borrarUltimaSerie(bitacora, hoy, ej.nombre))}
            />
          ))}
          <p className="nota"><b>Día sin tiempo</b>{rutina.minima.map((ej) => ej.nombre).join(' y ')}, tres series cada uno. Veinte minutos.</p>
          {esHoy && (votado
            ? <p className="estado" role="status">Entreno votado en la mesa de hoy.</p>
            : <button type="button" className="accion ancha" onClick={votar}>Terminé: votar Entreno</button>)}
          <p className="rotulo">Cada serie termina con 1 o 2 repeticiones en reserva. Ante dolor en una articulación, cortá el ejercicio y consultá a un kinesiólogo.</p>
        </>
      ) : (
        <section className="carta">
          <p>Hoy el cuerpo construye lo que entrenaste. El acuerdo es caminar 8.000 pasos, suave.</p>
          {esHoy && (votado
            ? <p className="estado" role="status">Entreno votado en la mesa de hoy.</p>
            : <button type="button" className="accion ancha" onClick={votar}>Caminé: votar Entreno</button>)}
        </section>
      )}
    </main>
  )
}
