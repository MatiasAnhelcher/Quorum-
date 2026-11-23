import { Anillo, Tilde } from '../componentes'
import { NOMBRE_CORTO } from '../dominio/directorio'
import { acuerdosDelDia, alternar, constanciaSemanal, cumplidos, MAYORIA, type Registro } from '../dominio/hoy'
import { diasEntre, fechaLarga } from '../dominio/tiempo'
import type { Perfil } from '../dominio/tipos'

export function Hoy({ perfil, hoy, registro, cambiar }: { perfil: Perfil; hoy: string; registro: Registro; cambiar: (r: Registro) => void }) {
  const acuerdos = acuerdosDelDia(perfil, hoy)
  const hechos = cumplidos(registro, hoy)
  const siguiente = acuerdos.find((a) => !hechos.includes(a.id))
  const faltan = MAYORIA - hechos.length
  const semana = constanciaSemanal(registro, hoy)
  const diasConQuorum = semana.filter(Boolean).length

  const estado =
    hechos.length === acuerdos.length ? 'Día completo. El Directorio no pide más.'
    : faltan <= 0 ? 'Hay quórum. Lo que sumes ahora es extra.'
    : faltan === 1 ? 'Falta 1 acuerdo para tener quórum.'
    : `Faltan ${faltan} acuerdos para tener quórum.`

  return (
    <main className="pantalla">
      <header className="cabecera">
        <div className="columna" style={{ gap: 2 }}>
          <span className="glosa">{fechaLarga(hoy)}</span>
          <h1>Hola, {perfil.nombre}</h1>
        </div>
        <span className="pastilla">Día {Math.max(1, diasEntre(perfil.inicio, hoy) + 1)}</span>
      </header>

      <section className="carta" aria-label="Quórum de hoy">
        <div className="fila">
          <div className="columna" style={{ gap: 6 }}>
            <span className="glosa">Quórum de hoy</span>
            <span className="cifra">{hechos.length}<small> de {acuerdos.length}</small></span>
            <span className="glosa" role="status">{estado}</span>
          </div>
          <Anillo hechos={hechos.length} total={acuerdos.length} />
        </div>
        {siguiente && (
          <div className="interior">
            <div className="columna" style={{ gap: 2 }}>
              <span className="rotulo">Sigue · {siguiente.hora}</span>
              <span style={{ fontSize: 16, fontWeight: 700 }}>{siguiente.titulo}</span>
              <span className="rotulo">{siguiente.detalle}</span>
            </div>
            <button type="button" className="accion" onClick={() => cambiar(alternar(registro, hoy, siguiente.id))}>Hecho</button>
          </div>
        )}
      </section>

      <section className="carta lista" aria-label="Acuerdos del día">
        {acuerdos.map((a) => {
          const hecho = hechos.includes(a.id)
          return (
            <button key={a.id} type="button" aria-pressed={hecho} className={`acuerdo${hecho ? ' hecho' : ''}${a.id === siguiente?.id ? ' siguiente' : ''}`} onClick={() => cambiar(alternar(registro, hoy, a.id))}>
              <span className="hora">{a.hora}</span>
              <span className="columna" style={{ flexGrow: 1, gap: 2 }}>
                <span className="titulo">{a.titulo}</span>
                <span className="rotulo fila" style={{ justifyContent: 'flex-start', gap: 6 }}>
                  <span className="punto" style={{ background: `var(--${a.especialista})` }} />
                  {NOMBRE_CORTO[a.especialista]}{hecho ? ' · Hecho' : ''}
                </span>
              </span>
              <span className="marca">{hecho && <Tilde />}</span>
            </button>
          )
        })}
      </section>

      <section className="carta chica" aria-label="Constancia de la semana">
        <div className="fila">
          <span className="glosa">Últimos 7 días</span>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{diasConQuorum} con quórum</span>
        </div>
        <div className="semana" aria-hidden="true">{semana.map((si, i) => <span key={i} className={si ? 'si' : ''} />)}</div>
        <span className="rotulo">Un día sin quórum no borra nada: mañana se vuelve a votar.</span>
      </section>
    </main>
  )
}
