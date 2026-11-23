import { kg } from '../componentes'
import { cinturaObjetivo, pesoDeReferencia } from '../dominio/cuerpo'
import { curva, HORIZONTES, proyectar } from '../dominio/proyeccion'
import { diasEntre, sumarDias, fechaCorta } from '../dominio/tiempo'
import type { Medicion, Perfil } from '../dominio/tipos'

const ANCHO = 320
const ALTO = 170
const MARGEN = { izq: 34, der: 8, arriba: 10, abajo: 22 }

export function Proyeccion({ perfil, hoy, pesos }: { perfil: Perfil; hoy: string; pesos: Medicion[] }) {
  const puntos = curva(perfil)
  const reales = pesos.filter((m) => diasEntre(perfil.inicio, m.fecha) >= 0 && diasEntre(perfil.inicio, m.fecha) <= 364)
  const todos = [...puntos.flatMap((p) => [p.minKg, p.maxKg]), ...reales.map((m) => m.valor)]
  const min = Math.floor(Math.min(...todos) - 1)
  const max = Math.ceil(Math.max(...todos) + 1)
  const x = (semanas: number) => MARGEN.izq + (semanas / 52) * (ANCHO - MARGEN.izq - MARGEN.der)
  const y = (valor: number) => MARGEN.arriba + ((max - valor) / (max - min)) * (ALTO - MARGEN.arriba - MARGEN.abajo)
  const banda = [...puntos.map((p) => `${x(p.semanas)},${y(p.maxKg)}`), ...[...puntos].reverse().map((p) => `${x(p.semanas)},${y(p.minKg)}`)].join(' ')
  const referencia = pesoDeReferencia(perfil)

  return (
    <main className="pantalla">
      <header className="columna" style={{ gap: 2 }}>
        <span className="glosa">Si sostenés el plan</span>
        <h1 style={{ fontSize: 28, letterSpacing: '-0.02em' }}>Proyección</h1>
      </header>

      <section className="carta" aria-label="Peso proyectado a 12 meses">
        <svg className="grafico" viewBox={`0 0 ${ANCHO} ${ALTO}`} role="img" aria-label={`Peso esperado de ${kg(perfil.pesoKg)} kg hoy a entre ${kg(proyectar(perfil, 52).minKg)} y ${kg(proyectar(perfil, 52).maxKg)} kg en 12 meses`}>
          {[max, (max + min) / 2, min].map((v) => (
            <g key={v}>
              <line x1={MARGEN.izq} x2={ANCHO - MARGEN.der} y1={y(v)} y2={y(v)} stroke="var(--linea)" strokeWidth="1" />
              <text x={MARGEN.izq - 6} y={y(v) + 4} textAnchor="end">{Math.round(v)}</text>
            </g>
          ))}
          {HORIZONTES.map((h) => <text key={h.semanas} x={x(h.semanas)} y={ALTO - 4} textAnchor={h.semanas === 52 ? 'end' : 'middle'}>{h.nombre}</text>)}
          <text x={MARGEN.izq} y={ALTO - 4}>Hoy</text>
          <polygon points={banda} fill="var(--acento)" opacity="0.28" />
          <polyline points={puntos.map((p) => `${x(p.semanas)},${y((p.minKg + p.maxKg) / 2)}`).join(' ')} fill="none" stroke="var(--acento)" strokeWidth="2" strokeDasharray="4 4" />
          {reales.map((m) => <circle key={m.fecha} cx={x(diasEntre(perfil.inicio, m.fecha) / 7)} cy={y(m.valor)} r="3.5" fill="var(--tinta)" />)}
        </svg>
        <p className="rotulo">La banda es el rango esperado en kg. Los puntos blancos son tus pesadas reales{reales.length === 0 ? ': todavía no cargaste ninguna.' : '.'}</p>
      </section>

      {HORIZONTES.map((h) => {
        const p = proyectar(perfil, h.semanas)
        const igual = Math.abs(p.maxKg - p.minKg) < 0.05
        return (
          <section key={h.semanas} className="carta chica">
            <div className="fila">
              <div className="columna" style={{ gap: 2 }}>
                <span className="glosa">{h.nombre} · {fechaCorta(sumarDias(hoy, h.semanas * 7))}</span>
                <span className="cifra media">{igual ? kg(p.minKg) : `${kg(p.minKg)} a ${kg(p.maxKg)}`}<small> kg</small></span>
              </div>
              <span className="rotulo" style={{ textAlign: 'right' }}>{igual ? kg(Math.abs(p.minKg - perfil.pesoKg)) : `${kg(Math.abs(p.maxKg - perfil.pesoKg))} a ${kg(Math.abs(p.minKg - perfil.pesoKg))}`} kg<br />{p.minKg < perfil.pesoKg ? 'menos' : 'más'} que hoy</span>
            </div>
          </section>
        )
      })}

      <section className="carta chica">
        <div className="fila">
          <div className="columna" style={{ gap: 2 }}>
            <span className="glosa">Cintura hoy</span>
            <span className="cifra media">{kg(perfil.cinturaCm)}<small> cm</small></span>
          </div>
          <div className="columna" style={{ gap: 2, alignItems: 'flex-end' }}>
            <span className="glosa">Primer objetivo</span>
            <span className="cifra media acento">{cinturaObjetivo(perfil.alturaCm)}<small> cm</small></span>
          </div>
        </div>
      </section>

      <p className="rotulo">
        Es una proyección, no una promesa: supone constancia y se corrige con tu seguimiento.
        {referencia !== null && perfil.objetivo !== 'ganar-musculo' && ` El piso de ${kg(referencia)} kg es tu peso de referencia: tu masa magra de hoy con un nivel de grasa atlético, estimado con cinta.`}
      </p>
    </main>
  )
}
