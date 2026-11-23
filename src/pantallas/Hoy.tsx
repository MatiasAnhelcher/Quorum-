import { Mesa, Tilde } from '../componentes'
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
  const completo = hechos.length === acuerdos.length

  return (
    <main className="pantalla">
      <header className="cabecera">
        <div className="columna" style={{ gap: 2 }}>
          <span className="glosa">{fechaLarga(hoy)}</span>
          <h1>{faltan > 0 ? 'Tu Directorio sesiona' : `Hay quórum, ${perfil.nombre}`}</h1>
        </div>
        <span className="pastilla">Día {Math.max(1, diasEntre(perfil.inicio, hoy) + 1)}</span>
      </header>

      <Mesa
        sillas={acuerdos.map((a) => ({ id: a.especialista, nombre: NOMBRE_CORTO[a.especialista], votada: hechos.includes(a.id), sigue: a.id === siguiente?.id }))}
        votar={(especialista) => {
          const acuerdo = acuerdos.find((a) => a.especialista === especialista)
          if (acuerdo) cambiar(alternar(registro, hoy, acuerdo.id))
        }}
      />

      <p className="estado" role="status">
        {completo ? 'Día completo. El Directorio no pide más.'
          : faltan <= 0 ? 'Lo que sumes ahora es extra.'
          : <>{faltan === 1 ? 'Falta' : 'Faltan'} <b>{faltan} {faltan === 1 ? 'voto' : 'votos'}</b> para tener quórum.</>}
      </p>

      {siguiente && (
        <section className="sigue" aria-label="Lo que sigue">
          <div className="columna" style={{ gap: 3 }}>
            <span className="rotulo">Sigue · {siguiente.hora} · {NOMBRE_CORTO[siguiente.especialista]}</span>
            <span className="titulo">{siguiente.titulo}</span>
            <span className="rotulo">{siguiente.detalle}</span>
          </div>
          <button type="button" className="accion" onClick={() => cambiar(alternar(registro, hoy, siguiente.id))}>Hecho</button>
        </section>
      )}

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
