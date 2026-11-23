import { useEffect, useState, type ReactNode } from 'react'
import { NOMBRE_CORTO } from '../dominio/directorio'
import { EJEMPLOS, intencionCompleta, lunesDe, reloj, type Intencion, type Intenciones, type Repasos, type Revision, type Revisiones } from '../dominio/herramientas'
import { actaSemanal, acuerdosDelDia, type IdAcuerdo, type Registro } from '../dominio/hoy'
import { fechaCorta, sumarDias } from '../dominio/tiempo'
import type { Perfil } from '../dominio/tipos'

type IdHerramienta = 'foco' | 'si-entonces' | 'revision'

const LISTA: { id: IdHerramienta; nombre: string; para: string; especialista: string; minutos: string }[] = [
  { id: 'foco', nombre: 'Bloque de foco', para: 'Estudiar o trabajar 25 minutos y fijar lo aprendido.', especialista: 'neuro', minutos: '25 min' },
  { id: 'si-entonces', nombre: 'Planes si-entonces', para: 'Decidir hoy qué vas a hacer cuando aparezca el obstáculo.', especialista: 'estratega', minutos: '5 min' },
  { id: 'revision', nombre: 'Revisión de la semana', para: 'Mirar qué funcionó y elegir un solo cambio.', especialista: 'estratega', minutos: '5 min' },
]

/** Cuenta segundos mientras está activo. Usa el reloj real, así no se atrasa si el teléfono duerme la pestaña. */
function useCronometro(activo: boolean): number {
  const [inicio, setInicio] = useState<number | null>(null)
  const [ahora, setAhora] = useState(() => Date.now())
  useEffect(() => {
    if (!activo) {
      setInicio(null)
      return
    }
    setInicio(Date.now())
    setAhora(Date.now())
    const tic = setInterval(() => setAhora(Date.now()), 250)
    return () => clearInterval(tic)
  }, [activo])
  return activo && inicio !== null ? (ahora - inicio) / 1000 : 0
}

const MINUTOS_DE_FOCO = 25

function Foco({ hoy, repasos, votado, guardar }: { hoy: string; repasos: Repasos; votado: boolean; guardar: (texto: string) => void }) {
  const [etapa, setEtapa] = useState<'listo' | 'corriendo' | 'repaso'>('listo')
  const [texto, setTexto] = useState(repasos[hoy] ?? '')
  const pasados = useCronometro(etapa === 'corriendo')
  const resta = MINUTOS_DE_FOCO * 60 - pasados
  useEffect(() => {
    if (etapa === 'corriendo' && resta <= 0) setEtapa('repaso')
  }, [etapa, resta])
  const anterior = Object.keys(repasos).filter((f) => f < hoy && repasos[f]).sort().at(-1)
  const haceUnaSemana = repasos[sumarDias(hoy, -7)]

  return (
    <>
      {etapa !== 'repaso' && (
        <section className="carta" aria-label="Cronómetro de foco">
          <span className="cifra reloj" role="timer">{reloj(etapa === 'corriendo' ? resta : MINUTOS_DE_FOCO * 60)}</span>
          <p className="glosa">Una sola tarea. El celular, en otro ambiente. Cuando termine el tiempo vas a escribir de memoria lo que aprendiste.</p>
          {etapa === 'listo'
            ? <button type="button" className="accion ancha" onClick={() => setEtapa('corriendo')}>Empezar 25 minutos</button>
            : <button type="button" className="contorno" onClick={() => setEtapa('repaso')}>Terminé antes: pasar al repaso</button>}
        </section>
      )}
      {etapa === 'listo' && anterior && (
        <section className="carta chica" aria-label="Repaso espaciado">
          <span className="glosa">Antes de empezar, repasá de memoria</span>
          <p><b>{fechaCorta(anterior)}:</b> {repasos[anterior]}</p>
          {haceUnaSemana && anterior !== sumarDias(hoy, -7) && <p><b>Hace una semana:</b> {haceUnaSemana}</p>}
        </section>
      )}
      {etapa === 'repaso' && (
        <section className="carta" aria-label="Repaso de memoria">
          <h2>Cerrá el material</h2>
          <div className="campo">
            <label htmlFor="repaso">Escribí de memoria lo que aprendiste, sin mirar</label>
            <textarea id="repaso" rows={5} value={texto} onChange={(e) => setTexto(e.target.value)} />
          </div>
          <button type="button" className="accion ancha" disabled={texto.trim().length < 3} onClick={() => { guardar(texto.trim()); setEtapa('listo') }}>{votado ? 'Guardar el repaso' : 'Guardar y votar Mente'}</button>
        </section>
      )}
      <p className="rotulo">Fuente: Dunlosky y otros, Psychological Science in the Public Interest, 2013. Ponerse a prueba de memoria y espaciar el repaso fueron las dos técnicas con utilidad alta. Los 25 minutos son una convención práctica, no un número con evidencia propia.</p>
    </>
  )
}

function SiEntonces({ perfil, hoy, intenciones, guardar }: { perfil: Perfil; hoy: string; intenciones: Intenciones; guardar: (i: Intenciones) => void }) {
  const cambiar = (id: IdAcuerdo, parte: Partial<Intencion>) => guardar({ ...intenciones, [id]: { si: '', entonces: '', ...intenciones[id], ...parte } })
  return (
    <>
      <p className="glosa">Un plan que dice cuándo, dónde y cómo se cumple más que una buena intención. Escribí uno por acuerdo, con tu situación real. Aparece en Hoy cuando ese acuerdo es el que sigue.</p>
      {acuerdosDelDia(perfil, hoy).map((a) => {
        const actual = intenciones[a.id]
        return (
          <section key={a.id} className="carta chica" aria-label={`Plan para ${NOMBRE_CORTO[a.especialista]}`}>
            <div className="fila" style={{ justifyContent: 'flex-start', gap: 8 }}>
              <span className="punto" style={{ background: `var(--${a.especialista})`, width: 10, height: 10 }} />
              <b>{NOMBRE_CORTO[a.especialista]}</b>
              {intencionCompleta(actual) && <span className="rotulo" style={{ marginLeft: 'auto' }}>Listo</span>}
            </div>
            <div className="campo">
              <label htmlFor={`si-${a.id}`}>Si…</label>
              <input id={`si-${a.id}`} value={actual?.si ?? ''} placeholder={EJEMPLOS[a.id].si} onChange={(e) => cambiar(a.id, { si: e.target.value })} />
            </div>
            <div className="campo">
              <label htmlFor={`entonces-${a.id}`}>entonces…</label>
              <input id={`entonces-${a.id}`} value={actual?.entonces ?? ''} placeholder={EJEMPLOS[a.id].entonces} onChange={(e) => cambiar(a.id, { entonces: e.target.value })} />
            </div>
            {!intencionCompleta(actual) && <button type="button" className="enlace" onClick={() => guardar({ ...intenciones, [a.id]: EJEMPLOS[a.id] })}>Usar el ejemplo</button>}
          </section>
        )
      })}
      <p className="rotulo">Fuente: Gollwitzer y Sheeran, Advances in Experimental Social Psychology, 2006;38:69-119. En 94 pruebas independientes, los planes "si pasa Y, entonces hago X" tuvieron un efecto medio a grande sobre cumplir el objetivo (d = 0,65).</p>
    </>
  )
}

const VACIA: Revision = { bien: '', trabo: '', cambio: '' }

function RevisionSemanal({ perfil, hoy, registro, revisiones, guardar }: { perfil: Perfil; hoy: string; registro: Registro; revisiones: Revisiones; guardar: (r: Revisiones) => void }) {
  const semana = lunesDe(hoy)
  const actual = revisiones[semana] ?? VACIA
  const pasada = revisiones[sumarDias(semana, -7)]
  const acta = actaSemanal(registro, hoy)
  const acuerdos = acuerdosDelDia(perfil, hoy)
  const cambiar = (parte: Partial<Revision>) => guardar({ ...revisiones, [semana]: { ...actual, ...parte } })
  const flojo = [...acuerdos].sort((a, b) => acta[a.id] - acta[b.id])[0]
  return (
    <>
      <section className="carta chica" aria-label="Acta de los últimos 7 días">
        <span className="glosa">Votos de los últimos 7 días</span>
        <ul className="acta">
          {acuerdos.map((a) => (
            <li key={a.id}>
              <span className="punto" style={{ background: `var(--${a.especialista})` }} />
              <span>{NOMBRE_CORTO[a.especialista]}</span>
              <span className="rotulo">{acta[a.id]} de 7</span>
            </li>
          ))}
        </ul>
        {flojo && acta[flojo.id] < 4 && <span className="rotulo">La silla más floja fue {NOMBRE_CORTO[flojo.especialista]}. Es buena candidata para el cambio de la semana.</span>}
      </section>
      {pasada?.cambio && <p className="nota"><b>El cambio que elegiste la semana pasada</b>{pasada.cambio}</p>}
      <section className="carta" aria-label="Preguntas de la revisión">
        <div className="campo">
          <label htmlFor="rev-bien">¿Qué funcionó esta semana?</label>
          <textarea id="rev-bien" rows={3} value={actual.bien} onChange={(e) => cambiar({ bien: e.target.value })} />
        </div>
        <div className="campo">
          <label htmlFor="rev-trabo">¿Qué te trabó?</label>
          <textarea id="rev-trabo" rows={3} value={actual.trabo} onChange={(e) => cambiar({ trabo: e.target.value })} />
        </div>
        <div className="campo">
          <label htmlFor="rev-cambio">Un solo cambio para la semana que viene</label>
          <textarea id="rev-cambio" rows={2} value={actual.cambio} onChange={(e) => cambiar({ cambio: e.target.value })} />
        </div>
        <span className="rotulo">Se guarda sola mientras escribís. Semana del {fechaCorta(semana)}.</span>
      </section>
    </>
  )
}

export interface DatosDeHerramientas {
  registro: Registro
  intenciones: Intenciones
  revisiones: Revisiones
  repasos: Repasos
}

export function Herramientas({ perfil, hoy, datos, cambiar, votar }: {
  perfil: Perfil; hoy: string; datos: DatosDeHerramientas
  cambiar: (parte: Partial<Omit<DatosDeHerramientas, 'registro'>>) => void
  votar: (id: IdAcuerdo, extra?: Partial<Omit<DatosDeHerramientas, 'registro'>>) => void
}) {
  const [abierta, setAbierta] = useState<IdHerramienta | null>(null)
  const hechos = datos.registro[hoy] ?? []
  const actual = LISTA.find((h) => h.id === abierta)

  if (!actual) {
    return (
      <main className="pantalla">
        <header className="columna" style={{ gap: 2 }}>
          <span className="glosa">Cortas, concretas y con su fuente</span>
          <h1>Herramientas</h1>
        </header>
        {LISTA.map((h) => (
          <button key={h.id} type="button" className="carta chica herramienta" onClick={() => { setAbierta(h.id); window.scrollTo(0, 0) }}>
            <span className="fila">
              <span className="fila" style={{ justifyContent: 'flex-start', gap: 8 }}>
                <span className="punto" style={{ background: `var(--${h.especialista})`, width: 10, height: 10 }} />
                <b>{h.nombre}</b>
              </span>
              <span className="rotulo">{h.minutos}</span>
            </span>
            <span className="glosa">{h.para}</span>
          </button>
        ))}
        <p className="rotulo">Pocas y buenas: una herramienta entra solo si tiene respaldo o se usa todas las semanas.</p>
      </main>
    )
  }

  let cuerpo: ReactNode
  if (actual.id === 'foco') cuerpo = <Foco hoy={hoy} repasos={datos.repasos} votado={hechos.includes('foco')} guardar={(texto) => { const repasos = { ...datos.repasos, [hoy]: texto }; if (hechos.includes('foco')) cambiar({ repasos }); else votar('foco', { repasos }) }} />
  else if (actual.id === 'si-entonces') cuerpo = <SiEntonces perfil={perfil} hoy={hoy} intenciones={datos.intenciones} guardar={(intenciones) => cambiar({ intenciones })} />
  else cuerpo = <RevisionSemanal perfil={perfil} hoy={hoy} registro={datos.registro} revisiones={datos.revisiones} guardar={(revisiones) => cambiar({ revisiones })} />

  return (
    <main className="pantalla">
      <header className="columna" style={{ gap: 6, alignItems: 'flex-start' }}>
        <button type="button" className="enlace" onClick={() => setAbierta(null)}>‹ Herramientas</button>
        <h1>{actual.nombre}</h1>
      </header>
      {cuerpo}
    </main>
  )
}
