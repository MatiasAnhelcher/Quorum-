import { useEffect, useState, type ReactNode } from 'react'
import { CODIGO, type Pieza } from '../dominio/codigo'
import { NOMBRE_CORTO } from '../dominio/directorio'
import { parteSemanal } from '../dominio/parte'
import type { Bitacora } from '../dominio/rutina'
import { BUSCADOR_DE_LINEAS, EJEMPLOS, LINEAS, PASOS_DEL_PLAN, PASOS_DE_VISPERA, pasosDelPlanEscritos, type PlanSeguro, anotarOla, destrabadas, frenteListo, resumenDeDominio, type Dominio, type Frente, destrabeListo, intencionCompleta, lunesDe, reloj, renglones, repartoCompleto, visperaLista, type Destrabe, type Destrabes, type Intencion, type Intenciones, type Reparto, type Repartos, type Repasos, type Revision, type Revisiones, type Vispera, type Visperas } from '../dominio/herramientas'
import { actaSemanal, acuerdosDelDia, type IdAcuerdo, type Registro } from '../dominio/hoy'
import { fechaCorta, sumarDias } from '../dominio/tiempo'
import type { Perfil } from '../dominio/tipos'

type IdHerramienta = 'fondo' | 'destrabar' | 'impulso' | 'reparto' | 'foco' | 'si-entonces' | 'vispera' | 'revision'

const FONDO = { id: 'fondo' as const, nombre: 'Si estás en el fondo', para: 'Para cuando no ves salida. Ayuda ahora y un plan para los días negros.', especialista: 'sueno', minutos: '' }

const LISTA: { id: IdHerramienta; nombre: string; para: string; especialista: string; minutos: string }[] = [
  { id: 'destrabar', nombre: 'Hecho, no perfecto', para: 'Achicar lo que venís pateando hasta que se pueda terminar hoy.', especialista: 'estratega', minutos: '10 min' },
  { id: 'impulso', nombre: 'Dominar un impulso', para: 'Para lo que querés dejar: pasar las ganas sin obedecerlas.', especialista: 'neuro', minutos: '10 min' },
  { id: 'reparto', nombre: 'Lo que depende de mí', para: 'Separar lo que podés cambiar de lo que no, y elegir un paso.', especialista: 'neuro', minutos: '5 min' },
  { id: 'foco', nombre: 'Bloque de foco', para: 'Estudiar o trabajar 25 minutos y fijar lo aprendido.', especialista: 'neuro', minutos: '25 min' },
  { id: 'si-entonces', nombre: 'Planes si-entonces', para: 'Decidir hoy qué vas a hacer cuando aparezca el obstáculo.', especialista: 'estratega', minutos: '5 min' },
  { id: 'vispera', nombre: 'La noche antes', para: 'Sacar los pendientes de la cabeza y dejar mañana armado.', especialista: 'sueno', minutos: '5 min' },
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

const MINUTOS_DE_ARRANQUE = 10
const SIN_DESTRABE: Destrabe = { tarea: '', minimo: '', hora: '' }

function Destrabar({ hoy, destrabes, guardar }: { hoy: string; destrabes: Destrabes; guardar: (d: Destrabes) => void }) {
  const actual = destrabes[hoy] ?? SIN_DESTRABE
  const [corriendo, setCorriendo] = useState(false)
  const pasados = useCronometro(corriendo)
  const resta = MINUTOS_DE_ARRANQUE * 60 - pasados
  useEffect(() => {
    if (corriendo && resta <= 0) setCorriendo(false)
  }, [corriendo, resta])
  const cambiar = (parte: Partial<Destrabe>) => guardar({ ...destrabes, [hoy]: { ...actual, ...parte } })
  const semana = destrabadas(destrabes, hoy)
  return (
    <>
      <p className="glosa">Lo que no arranca casi nunca es por falta de tiempo: es porque la versión que imaginás es demasiado grande. Achicala hasta que no dé miedo, ponele hora y terminá esa. Mañana la mejorás.</p>
      <section className="carta" aria-label="Tarea trabada">
        <div className="campo">
          <label htmlFor="des-tarea">¿Qué venís pateando?</label>
          <input id="des-tarea" value={actual.tarea} placeholder="Armar el currículum" onChange={(e) => cambiar({ tarea: e.target.value })} />
        </div>
        <div className="campo">
          <label htmlFor="des-minimo">La versión más chica que igual cuenta como hecha</label>
          <input id="des-minimo" value={actual.minimo} placeholder="Una página, sin diseño, con los tres últimos trabajos" onChange={(e) => cambiar({ minimo: e.target.value })} />
        </div>
        <div className="campo">
          <label htmlFor="des-hora">¿A qué hora de hoy?</label>
          <input id="des-hora" type="time" value={actual.hora} onChange={(e) => cambiar({ hora: e.target.value })} />
        </div>
        {!destrabeListo(actual) && <span className="rotulo">Sin hora no es un plan: es una intención.</span>}
      </section>
      {destrabeListo(actual) && !actual.hecho && (
        <section className="carta" aria-label="Arranque">
          <span className="cifra reloj" role="timer" aria-label="Arranque">{reloj(corriendo ? resta : MINUTOS_DE_ARRANQUE * 60)}</span>
          <p className="glosa">Diez minutos de la versión chica. Si al terminar querés seguir, seguís. Si no, ya avanzaste.</p>
          {!corriendo && <button type="button" className="accion ancha" onClick={() => setCorriendo(true)}>Arrancar 10 minutos</button>}
          <button type="button" className="contorno" onClick={() => { setCorriendo(false); cambiar({ hecho: true }) }}>Hecho: terminé la versión chica</button>
        </section>
      )}
      {actual.hecho && (
        <p className="nota"><b>Hecho</b>{actual.minimo}. No quedó perfecto y está terminado, que es lo que vale.</p>
      )}
      {semana > 0 && <p className="rotulo">Destrabaste {semana} {semana === 1 ? 'tarea' : 'tareas'} en los últimos 7 días.</p>}
      <p className="rotulo">Respaldo: ponerle hora y lugar a la acción es un plan si-entonces (Gollwitzer y Sheeran, 2006, 94 pruebas, d = 0,65). Achicar la tarea y los 10 minutos son práctica de oficio, no un número con estudio propio.</p>
    </>
  )
}

function EnElFondo({ plan, guardar }: { plan: PlanSeguro; guardar: (p: PlanSeguro) => void }) {
  const escritos = pasosDelPlanEscritos(plan)
  return (
    <>
      <section className="carta" aria-label="Ayuda ahora">
        <h2>No lo pases solo</h2>
        <p>Si estás pensando en matarte, o sentís que no hay salida, llamá ahora. Del otro lado hay una persona preparada para escucharte, gratis y sin juzgarte. Si tu vida corre peligro en este momento, llamá a emergencias o andá a una guardia.</p>
        {LINEAS.map((l) => (
          <div key={l.lugar} className="columna" style={{ gap: 6 }}>
            <span className="glosa">{l.lugar} · {l.nombre}</span>
            <div className="fila" style={{ justifyContent: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
              {l.telefonos.map((t) => <a key={t} className="accion" href={`tel:${t.replace(/\s/g, '')}`}>Llamar al {t}</a>)}
            </div>
            {l.nota && <span className="rotulo">{l.nota}</span>}
          </div>
        ))}
        <a className="contorno" href={BUSCADOR_DE_LINEAS} target="_blank" rel="noreferrer">Buscar la línea de mi país</a>
      </section>
      <section className="carta chica" aria-label="Lo que es verdad">
        <p>Lo que sentís ahora es dolor, y el dolor más fuerte no es para siempre aunque hoy parezca que sí. Pedir ayuda no te hace menos hombre: es lo más difícil y lo más valiente que se puede hacer en el fondo.</p>
        <p className="glosa">Hoy alcanza con una sola cosa: decirle a una persona cómo estás de verdad.</p>
      </section>
      <section className="carta" aria-label="Mi plan para los días negros">
        <h2>Mi plan para los días negros</h2>
        <p className="glosa">Se arma con la cabeza fría para usarlo cuando no se puede pensar. Seis pasos, en orden. Queda solo en tu teléfono.</p>
        {PASOS_DEL_PLAN.map((p, i) => (
          <div key={p.id} className="campo">
            <label htmlFor={`plan-${p.id}`}>{i + 1}. {p.pregunta}</label>
            <textarea id={`plan-${p.id}`} rows={2} value={plan[p.id] ?? ''} placeholder={p.ayuda} onChange={(e) => guardar({ ...plan, [p.id]: e.target.value })} />
          </div>
        ))}
        <span className="rotulo">{escritos} de {PASOS_DEL_PLAN.length} pasos escritos. Se guarda solo.</span>
      </section>
      <section className="carta chica" aria-label="Si es un compa">
        <b>Si el que está mal es un compa</b>
        <p className="glosa">Tomalo en serio si habla de querer morirse, de no tener salida o de ser una carga, si se aísla, regala sus cosas, se despide, o pasa de golpe de estar muy mal a estar muy tranquilo. No lo dejes solo, escuchalo sin retarlo y ayudalo a llamar a una línea o a llegar a una guardia.</p>
      </section>
      <p className="rotulo">Fuentes: señales de alerta y línea 988, Instituto Nacional de Salud Mental de Estados Unidos (página en español, revisada en agosto de 2024). Líneas de Argentina, según Find A Helpline. El plan sigue los seis pasos de la Intervención de Planificación de Seguridad (Stanley, Brown y otros, JAMA Psychiatry, 2018;75(9):894-900): en guardias de hospitales de veteranos, quienes armaron el plan con un profesional y recibieron seguimiento tuvieron cerca de la mitad de conductas suicidas en seis meses. De ese estudio leí resúmenes, no el artículo completo, y ahí el plan se arma con un profesional: esta pantalla no lo reemplaza.</p>
    </>
  )
}

const MINUTOS_DE_OLA = 10
const SIN_FRENTE: Frente = { nombre: '', disparador: '', salida: '' }

function Impulso({ hoy, dominio, guardar }: { hoy: string; dominio: Dominio | undefined; guardar: (d: Dominio) => void }) {
  const actual: Dominio = dominio ?? { frente: SIN_FRENTE, desde: hoy, dias: {} }
  const [etapa, setEtapa] = useState<'quieto' | 'ola' | 'caida'>('quieto')
  const [editando, setEditando] = useState(!frenteListo(actual.frente))
  const pasados = useCronometro(etapa === 'ola')
  const resta = Math.max(0, MINUTOS_DE_OLA * 60 - pasados)
  const frente = (parte: Partial<Frente>) => guardar({ ...actual, frente: { ...actual.frente, ...parte } })
  const r = resumenDeDominio(actual, hoy)
  const listo = frenteListo(actual.frente)
  const deHoy = actual.dias[hoy]

  return (
    <>
      <p className="glosa">Elegí un solo frente: lo que hoy más te aleja del hombre que querés ser. Las ganas no se discuten ni se obedecen: se dejan pasar, como una ola que sube, llega al pico y baja sola.</p>
      {editando || !listo ? (
        <section className="carta" aria-label="Tu frente">
          <div className="campo">
            <label htmlFor="imp-nombre">¿Qué querés dejar?</label>
            <input id="imp-nombre" value={actual.frente.nombre} onChange={(e) => frente({ nombre: e.target.value })} />
          </div>
          <div className="campo">
            <label htmlFor="imp-disparador">¿Cuándo aparecen las ganas?</label>
            <input id="imp-disparador" value={actual.frente.disparador} placeholder="De noche, solo, con el celular en la cama" onChange={(e) => frente({ disparador: e.target.value })} />
          </div>
          <div className="campo">
            <label htmlFor="imp-salida">¿Qué vas a hacer en vez de ceder?</label>
            <input id="imp-salida" value={actual.frente.salida} placeholder="Dejo el celular en la cocina y hago 20 flexiones" onChange={(e) => frente({ salida: e.target.value })} />
          </div>
          <span className="rotulo">Esto queda solo en tu teléfono. Si descargás la copia de seguridad, va adentro de ese archivo.</span>
          {listo && <button type="button" className="accion ancha" onClick={() => setEditando(false)}>Listo</button>}
        </section>
      ) : (
        <>
          {etapa === 'quieto' && (
            <section className="carta" aria-label="Tu frente">
              <span className="glosa">Tu frente</span>
              <h2>{actual.frente.nombre}</h2>
              <p className="glosa">Si {actual.frente.disparador}, {actual.frente.salida}.</p>
              <button type="button" className="accion ancha" onClick={() => setEtapa('ola')}>Tengo ganas ahora</button>
              <button type="button" className="enlace" onClick={() => setEditando(true)}>Cambiar el frente</button>
            </section>
          )}
          {etapa === 'ola' && (
            <section className="carta" aria-label="La ola">
              <span className="cifra reloj" role="timer" aria-label="La ola">{reloj(resta)}</span>
              <p><b>No hagas nada con las ganas.</b> Fijate en qué parte del cuerpo las sentís y miralas subir y bajar, sin pelearlas y sin seguirlas.</p>
              <p className="glosa">Mientras tanto: {actual.frente.salida}.</p>
              <button type="button" className="accion ancha" onClick={() => { guardar(anotarOla(actual, hoy, 'pasada')); setEtapa('quieto') }}>Pasó: no cedí</button>
              <button type="button" className="contorno" onClick={() => { guardar(anotarOla(actual, hoy, 'caida')); setEtapa('caida') }}>Cedí</button>
            </section>
          )}
          {etapa === 'caida' && (
            <section className="carta" aria-label="Después de una caída">
              <h2>Una caída no borra lo ganado</h2>
              <p className="glosa">No es prueba de que no tenés voluntad: es una situación que todavía no sabés manejar. Lo que hunde no es la caída sino el "ya fue, sigo". Cortala acá y aprendé de esta.</p>
              <div className="campo">
                <label htmlFor="imp-leccion">¿Qué situación fue y qué vas a hacer distinto la próxima?</label>
                <textarea id="imp-leccion" rows={3} value={deHoy?.leccion ?? ''} onChange={(e) => guardar({ ...actual, dias: { ...actual.dias, [hoy]: { ...(deHoy ?? { pasadas: 0, caidas: 1 }), leccion: e.target.value } } })} />
              </div>
              <button type="button" className="accion ancha" onClick={() => setEtapa('quieto')}>Sigo en el camino</button>
            </section>
          )}
          <section className="carta chica" aria-label="Tu cuenta">
            <div className="fila">
              <span className="columna" style={{ gap: 2 }}><span className="cifra media">{r.superadas}</span><span className="glosa">{r.superadas === 1 ? 'vez que no cediste' : 'veces que no cediste'}</span></span>
              <span className="columna" style={{ gap: 2 }}><span className="cifra media">{r.diasFirmes}</span><span className="glosa">{r.diasFirmes === 1 ? 'día firme' : 'días firmes'} de {r.dias}</span></span>
            </div>
            <span className="rotulo">Las dos cuentas solo suman. Una caída no las vuelve a cero.</span>
          </section>
        </>
      )}
      <p className="rotulo">Fuentes: Bowen y Marlatt, Psychology of Addictive Behaviors, 2009, páginas 666-671: 123 fumadores universitarios; quienes recibieron una instrucción breve de observar las ganas sin actuar fumaron menos en los 7 días siguientes, aunque las ganas no bajaron: cambió la respuesta. Larimer, Palmer y Marlatt, Alcohol Research &amp; Health, 1999;23(2):151-160: leer la caída como falta de voluntad lleva a más culpa y hace más probable la recaída completa; leerla como un error del que se aprende, menos. Los estudios son sobre tabaco y alcohol; para otros impulsos es una extensión razonable, no un resultado medido. Los 10 minutos son una convención.</p>
      <p className="nota"><b>Si es más grande que vos</b>Si hay una sustancia de por medio, o esto ya te cuesta el trabajo, la plata o la gente que querés, esta herramienta no alcanza: pedí ayuda profesional. Pedirla también es disciplina.</p>
    </>
  )
}

const SIN_REPARTO: Reparto = { asunto: '', mio: '', ajeno: '', paso: '' }

function LoQueDepende({ hoy, repartos, guardar }: { hoy: string; repartos: Repartos; guardar: (r: Repartos) => void }) {
  const actual = repartos[hoy] ?? SIN_REPARTO
  const cambiar = (parte: Partial<Reparto>) => guardar({ ...repartos, [hoy]: { ...actual, ...parte } })
  return (
    <>
      <p className="glosa">Para cuando algo te da vueltas en la cabeza: una discusión, un rechazo, un resultado que no llega. El valor propio se arma con lo que hacés, no con lo que te toca.</p>
      <section className="carta" aria-label="Reparto">
        <div className="campo">
          <label htmlFor="rep-asunto">¿Qué te está pesando?</label>
          <input id="rep-asunto" value={actual.asunto} onChange={(e) => cambiar({ asunto: e.target.value })} />
        </div>
        <div className="campo">
          <label htmlFor="rep-ajeno">No depende de mí</label>
          <textarea id="rep-ajeno" rows={3} value={actual.ajeno} placeholder="Lo que el otro piensa, dice o decide. Lo que ya pasó." onChange={(e) => cambiar({ ajeno: e.target.value })} />
        </div>
        <div className="campo">
          <label htmlFor="rep-mio">Depende de mí</label>
          <textarea id="rep-mio" rows={3} value={actual.mio} placeholder="Cómo lo interpreto, qué decido y qué hago hoy." onChange={(e) => cambiar({ mio: e.target.value })} />
        </div>
        <div className="campo">
          <label htmlFor="rep-paso">Un paso de hoy, sacado de lo que depende de mí</label>
          <input id="rep-paso" value={actual.paso} onChange={(e) => cambiar({ paso: e.target.value })} />
        </div>
        <span className="rotulo">{repartoCompleto(actual) ? 'Listo. Lo de arriba se suelta; el paso se hace.' : 'Se guarda sola mientras escribís.'}</span>
      </section>
      <p className="rotulo">Fuente: Epicteto, Manual, secciones 1 y 5. Dependen de nosotros la opinión, el impulso, el deseo y el rechazo; no dependen el cuerpo, los bienes, la reputación ni los cargos. Lo que perturba no son los hechos sino la opinión sobre ellos. Es filosofía con dos mil años de uso, no un ensayo clínico.</p>
    </>
  )
}

const SIN_VISPERA: Vispera = { pendientes: '', listos: [] }

function LaNocheAntes({ hoy, visperas, guardar }: { hoy: string; visperas: Visperas; guardar: (v: Visperas) => void }) {
  const actual = visperas[hoy] ?? SIN_VISPERA
  const cambiar = (parte: Partial<Vispera>) => guardar({ ...visperas, [hoy]: { ...actual, ...parte } })
  const alternar = (id: string) => cambiar({ listos: actual.listos.includes(id) ? actual.listos.filter((l) => l !== id) : [...actual.listos, id] })
  const escritos = renglones(actual.pendientes)
  return (
    <>
      <p className="glosa">Cinco minutos antes de acostarte, sobre todo si mañana es un día importante. Lo que queda escrito deja de darte vueltas en la cama.</p>
      <section className="carta" aria-label="Pendientes">
        <div className="campo">
          <label htmlFor="vis-pendientes">Todo lo que tenés que hacer mañana y en los próximos días, uno por renglón y bien específico</label>
          <textarea id="vis-pendientes" rows={7} value={actual.pendientes} placeholder={'Llamar al contador antes de las 10\nComprar pollo y arroz\nMandar el presupuesto a Laura'} onChange={(e) => cambiar({ pendientes: e.target.value })} />
        </div>
        <span className="rotulo">{escritos} {escritos === 1 ? 'pendiente escrito' : 'pendientes escritos'}. Cuanto más específico, mejor.</span>
      </section>
      <section className="carta chica" aria-label="Preparación">
        {PASOS_DE_VISPERA.map((p) => (
          <label key={p.id} className="tilde">
            <input type="checkbox" checked={actual.listos.includes(p.id)} onChange={() => alternar(p.id)} />
            <span>{p.texto}</span>
          </label>
        ))}
      </section>
      {visperaLista(actual) && <p className="nota"><b>Mañana está armado</b>Ya no hay nada que resolver esta noche. A dormir.</p>}
      <p className="rotulo">Fuente: Scullin y otros, Journal of Experimental Psychology: General, 2018;147(1):139-146. 57 adultos jóvenes sanos, medidos con polisomnografía: quienes escribieron 5 minutos su lista de pendientes se durmieron más rápido que quienes escribieron lo ya hecho, y más rápido cuanto más específica fue la lista. Es un solo estudio chico y no se probó en personas con insomnio. Los tres pasos de preparación son práctica, no parte del estudio.</p>
    </>
  )
}

const VACIA: Revision = { bien: '', trabo: '', cambio: '' }

function RevisionSemanal({ perfil, hoy, registro, bitacora, revisiones, guardar }: { perfil: Perfil; hoy: string; registro: Registro; bitacora: Bitacora; revisiones: Revisiones; guardar: (r: Revisiones) => void }) {
  const semana = lunesDe(hoy)
  const actual = revisiones[semana] ?? VACIA
  const pasada = revisiones[sumarDias(semana, -7)]
  const acta = actaSemanal(registro, hoy)
  const acuerdos = acuerdosDelDia(perfil, hoy)
  const cambiar = (parte: Partial<Revision>) => guardar({ ...revisiones, [semana]: { ...actual, ...parte } })
  const parte = parteSemanal(registro, bitacora, hoy)
  const signo = (n: number) => (n > 0 ? `+${n}` : `${n}`)
  return (
    <>
      <section className="carta chica" aria-label="Parte de la semana">
        <span className="glosa">Parte de los últimos 7 días</span>
        {parte ? (
          <>
            <div className="fila">
              <span className="columna" style={{ gap: 2 }}><span className="cifra media">{parte.votos}</span><span className="rotulo">votos de 35 · {signo(parte.votos - parte.votosAntes)} contra la semana anterior</span></span>
              {(parte.kilos > 0 || parte.kilosAntes > 0) && <span className="columna" style={{ gap: 2 }}><span className="cifra media">{parte.kilos.toLocaleString('es-AR')}</span><span className="rotulo">kg movidos · antes {parte.kilosAntes.toLocaleString('es-AR')}</span></span>}
            </div>
            <ul className="acta">
              {acuerdos.map((a) => (
                <li key={a.id}>
                  <span className="punto" style={{ background: `var(--${a.especialista})` }} />
                  <span>{NOMBRE_CORTO[a.especialista]}</span>
                  <span className="rotulo">{acta[a.id]} de 7</span>
                </li>
              ))}
            </ul>
            {parte.subio && <span className="rotulo">Lo que más subió: {parte.subio.nombre}, {parte.subio.diferencia} {parte.subio.diferencia === 1 ? 'voto' : 'votos'} más que la semana anterior.</span>}
            {parte.flojo
              ? <p className="nota"><b>Consejo de la semana · {parte.flojo.nombre}, {parte.flojo.votos} de 7</b>{parte.flojo.consejo}</p>
              : <span className="rotulo">Ningún pilar quedó por debajo de 4 de 7. No hay nada que corregir: sostené.</span>}
          </>
        ) : <span className="rotulo">Todavía no hay votos para armar el parte. Sin datos no hay consejo.</span>}
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
  bitacora: Bitacora
  intenciones: Intenciones
  revisiones: Revisiones
  repasos: Repasos
  destrabes: Destrabes
  repartos: Repartos
  visperas: Visperas
  dominio: Dominio | undefined
  planSeguro: PlanSeguro
}

export function Herramientas({ perfil, hoy, datos, abrir, cambiar, votar }: {
  perfil: Perfil; hoy: string; datos: DatosDeHerramientas; abrir?: IdHerramienta
  cambiar: (parte: Partial<Omit<DatosDeHerramientas, 'registro' | 'bitacora'>>) => void
  votar: (id: IdAcuerdo, extra?: Partial<Omit<DatosDeHerramientas, 'registro' | 'bitacora'>>) => void
}) {
  const [abierta, setAbierta] = useState<IdHerramienta | null>(abrir ?? null)
  const [pieza, setPieza] = useState<Pieza | null>(null)
  const hechos = datos.registro[hoy] ?? []
  const actual = abierta === 'fondo' ? FONDO : LISTA.find((h) => h.id === abierta)

  if (pieza) {
    const destino = LISTA.find((h) => h.id === pieza.herramienta)
    return (
      <main className="pantalla lectura">
        <header className="columna" style={{ gap: 6, alignItems: 'flex-start' }}>
          <button type="button" className="enlace" onClick={() => setPieza(null)}>‹ Herramientas</button>
          <span className="glosa">El código</span>
          <h1>{pieza.titulo}</h1>
          <span className="glosa">{pieza.bajada}</span>
        </header>
        {pieza.parrafos.map((texto) => <p key={texto}>{texto}</p>)}
        <section className="sigue" aria-label="Para hoy">
          <div className="columna" style={{ gap: 3 }}>
            <span className="rotulo">Para hoy</span>
            <span className="titulo">{pieza.accion}</span>
          </div>
          {destino && <button type="button" className="accion" onClick={() => { setPieza(null); setAbierta(destino.id); window.scrollTo(0, 0) }}>Abrir</button>}
        </section>
        <p className="rotulo">Fuente: {pieza.fuente}</p>
      </main>
    )
  }

  if (!actual) {
    return (
      <main className="pantalla">
        <header className="columna" style={{ gap: 2 }}>
          <span className="glosa">El valor propio se entrena. Cortas, concretas y con su fuente.</span>
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
        <header className="columna" style={{ gap: 2, marginTop: 12 }}>
          <span className="glosa">Dos minutos de lectura y una acción</span>
          <h2>El código</h2>
        </header>
        {CODIGO.map((c) => (
          <button key={c.id} type="button" className="carta chica herramienta" onClick={() => { setPieza(c); window.scrollTo(0, 0) }}>
            <b>{c.titulo}</b>
            <span className="glosa">{c.bajada}</span>
          </button>
        ))}
        <button type="button" className="carta chica herramienta" onClick={() => { setAbierta('fondo'); window.scrollTo(0, 0) }}>
          <b>{FONDO.nombre}</b>
          <span className="glosa">{FONDO.para}</span>
        </button>
        <p className="rotulo">Pocas y buenas: una herramienta entra solo si tiene respaldo o se usa todas las semanas.</p>
      </main>
    )
  }

  let cuerpo: ReactNode
  if (actual.id === 'foco') cuerpo = <Foco hoy={hoy} repasos={datos.repasos} votado={hechos.includes('foco')} guardar={(texto) => { const repasos = { ...datos.repasos, [hoy]: texto }; if (hechos.includes('foco')) cambiar({ repasos }); else votar('foco', { repasos }) }} />
  else if (actual.id === 'si-entonces') cuerpo = <SiEntonces perfil={perfil} hoy={hoy} intenciones={datos.intenciones} guardar={(intenciones) => cambiar({ intenciones })} />
  else if (actual.id === 'fondo') cuerpo = <EnElFondo plan={datos.planSeguro} guardar={(planSeguro) => cambiar({ planSeguro })} />
  else if (actual.id === 'destrabar') cuerpo = <Destrabar hoy={hoy} destrabes={datos.destrabes} guardar={(destrabes) => cambiar({ destrabes })} />
  else if (actual.id === 'impulso') cuerpo = <Impulso hoy={hoy} dominio={datos.dominio} guardar={(dominio) => cambiar({ dominio })} />
  else if (actual.id === 'reparto') cuerpo = <LoQueDepende hoy={hoy} repartos={datos.repartos} guardar={(repartos) => cambiar({ repartos })} />
  else if (actual.id === 'vispera') cuerpo = <LaNocheAntes hoy={hoy} visperas={datos.visperas} guardar={(visperas) => cambiar({ visperas })} />
  else cuerpo = <RevisionSemanal perfil={perfil} hoy={hoy} registro={datos.registro} bitacora={datos.bitacora} revisiones={datos.revisiones} guardar={(revisiones) => cambiar({ revisiones })} />

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
