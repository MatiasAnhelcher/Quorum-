import { dictamenes } from '../dominio/directorio'
import type { Perfil } from '../dominio/tipos'

export function Directorio({ perfil }: { perfil: Perfil }) {
  return (
    <main className="pantalla">
      <header className="columna" style={{ gap: 2 }}>
        <span className="glosa">Cinco especialistas, un solo plan</span>
        <h1 style={{ fontSize: 28, letterSpacing: '-0.02em' }}>Directorio</h1>
      </header>
      {dictamenes(perfil).map((d) => (
        <article key={d.id} className="carta dictamen">
          <div className="fila" style={{ justifyContent: 'flex-start', gap: 8 }}>
            <span className="punto" style={{ background: `var(--${d.id})`, width: 10, height: 10 }} />
            <span className="glosa">{d.rol}</span>
          </div>
          <p className="veredicto">{d.veredicto}</p>
          <ul>{d.puntos.map((punto) => <li key={punto}>{punto}</li>)}</ul>
          <p className="nota"><b>Plan B</b>{d.planB}</p>
          <p className="rotulo">Fuente: {d.fuente}</p>
        </article>
      ))}
      <p className="rotulo">Quorum no reemplaza a un profesional. Ante dolor, una lesión, síntomas o medicación, consultá a un médico o a un kinesiólogo.</p>
    </main>
  )
}
