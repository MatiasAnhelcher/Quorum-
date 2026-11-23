import type { ReactNode } from 'react'

export function Anillo({ hechos, total, tamano = 104 }: { hechos: number; total: number; tamano?: number }) {
  const r = 44
  const largo = 2 * Math.PI * r
  return (
    <svg className="anillo" width={tamano} height={tamano} viewBox="0 0 104 104" role="img" aria-label={`Quórum de hoy: ${hechos} de ${total}`}>
      <circle cx="52" cy="52" r={r} fill="none" stroke="var(--linea)" strokeWidth="12" />
      {hechos > 0 && (
        <circle className="avance" cx="52" cy="52" r={r} fill="none" stroke="var(--acento)" strokeWidth="12" strokeLinecap="round"
          strokeDasharray={`${(largo * hechos) / total} ${largo}`} transform="rotate(-90 52 52)" />
      )}
      <circle cx="52" cy="52" r="26" fill="var(--papel-2)" />
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

const trazo = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true } as const

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
