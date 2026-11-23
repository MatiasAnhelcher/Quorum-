import type { ReactNode } from 'react'

/** Lugares de las cinco sillas alrededor de la mesa, en sentido horario desde arriba. */
const SILLAS = [
  { x: 165, y: 46, yTexto: 14 },
  { x: 271.5, y: 123.4, yTexto: 165 },
  { x: 230.8, y: 248.6, yTexto: 292 },
  { x: 99.2, y: 248.6, yTexto: 292 },
  { x: 58.5, y: 123.4, yTexto: 165 },
] as const

export interface Silla {
  id: string
  nombre: string
  votada: boolean
  sigue: boolean
}

/**
 * La mesa del Directorio: una silla por especialista, en el orden del día.
 * Se enciende cuando el acuerdo está cumplido. El estado nunca depende solo del color:
 * la silla votada lleva tilde, la que sigue lleva punto y la palabra "sigue".
 */
export function Mesa({ sillas }: { sillas: Silla[] }) {
  const votos = sillas.filter((s) => s.votada).length
  const resumen = sillas.map((s) => `${s.nombre}: ${s.votada ? 'cumplido' : s.sigue ? 'sigue' : 'pendiente'}`).join(', ')
  return (
    <svg className="mesa" viewBox="0 0 330 300" role="img" aria-label={`Mesa del Directorio, ${votos} de ${sillas.length} votos. ${resumen}.`}>
      <circle cx="165" cy="158" r="112" fill="none" stroke="var(--trazo)" strokeWidth="1.5" strokeDasharray="3 7" />
      <circle cx="165" cy="158" r="68" fill="var(--papel)" stroke="var(--borde)" strokeWidth="1.5" />
      <text className="cuenta" x="165" y="166" textAnchor="middle">{votos}<tspan> de {sillas.length}</tspan></text>
      <text x="165" y="188" textAnchor="middle">votos de hoy</text>
      {sillas.map((s, i) => {
        const lugar = SILLAS[i]
        if (!lugar) return null
        const color = `var(--${s.id})`
        return (
          <g key={s.id}>
            <g className={`silla${s.votada ? ' votada' : ''}`}>
              {s.votada ? (
                <>
                  <circle cx={lugar.x} cy={lugar.y} r="24" fill={color} />
                  <path d={`M${lugar.x - 10} ${lugar.y + 0.5}l7 7 13-14`} fill="none" stroke="var(--papel)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                </>
              ) : s.sigue ? (
                <>
                  <circle cx={lugar.x} cy={lugar.y} r="25" fill="var(--papel)" stroke={color} strokeWidth="4" />
                  <circle cx={lugar.x} cy={lugar.y} r="6" fill={color} />
                </>
              ) : (
                <circle cx={lugar.x} cy={lugar.y} r="23" fill="var(--papel)" stroke={color} strokeWidth="2.5" />
              )}
            </g>
            <text className={s.votada || s.sigue ? 'fuerte' : undefined} x={lugar.x} y={lugar.yTexto} textAnchor="middle">{s.nombre}{s.sigue ? ' · sigue' : ''}</text>
          </g>
        )
      })}
    </svg>
  )
}

export function Tilde() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  )
}

export type Seccion = 'hoy' | 'directorio' | 'proyeccion' | 'seguimiento'

const trazo = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true } as const

const SECCIONES: { id: Seccion; nombre: string; icono: ReactNode }[] = [
  { id: 'hoy', nombre: 'Hoy', icono: <svg {...trazo}><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="2.5" fill="currentColor" /></svg> },
  { id: 'directorio', nombre: 'Directorio', icono: <svg {...trazo}><circle cx="6" cy="9" r="2.5" /><circle cx="12" cy="7" r="2.5" /><circle cx="18" cy="9" r="2.5" /><path d="M3 18c1-3 5-3 6 0M9 17c1-4 5-4 6 0M15 18c1-3 5-3 6 0" /></svg> },
  { id: 'proyeccion', nombre: 'Proyección', icono: <svg {...trazo}><path d="M3 17l6-6 4 4 8-9M15 6h6v6" /></svg> },
  { id: 'seguimiento', nombre: 'Seguimiento', icono: <svg {...trazo}><path d="M5 20v-6M12 20V5M19 20v-9" /></svg> },
]

export function Barra({ actual, ir }: { actual: Seccion; ir: (s: Seccion) => void }) {
  return (
    <nav className="barra" aria-label="Secciones">
      {SECCIONES.map((s) => (
        <button key={s.id} type="button" aria-current={actual === s.id ? 'page' : undefined} onClick={() => ir(s.id)}>
          {s.icono}
          {s.nombre}
        </button>
      ))}
    </nav>
  )
}

export const kg = (n: number) => n.toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
