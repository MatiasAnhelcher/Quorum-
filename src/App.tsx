import { useCallback, useState } from 'react'
import { flushSync } from 'react-dom'
import { Barra, type Seccion } from './componentes'
import { borrarTodo, cargar, ESTADO_VACIO, guardar, type Estado } from './datos/almacen'
import { alternar, type IdAcuerdo } from './dominio/hoy'
import { diasEntre, fechaLocal } from './dominio/tiempo'
import { Diagnostico } from './pantallas/Diagnostico'
import { Directorio } from './pantallas/Directorio'
import { Entreno } from './pantallas/Entreno'
import { Herramientas } from './pantallas/Herramientas'
import { Hoy } from './pantallas/Hoy'
import { Proyeccion } from './pantallas/Proyeccion'
import { Seguimiento } from './pantallas/Seguimiento'

const ORDEN: Seccion[] = ['hoy', 'entreno', 'herramientas', 'directorio', 'progreso']

export function App() {
  const [estado, setEstado] = useState<Estado>(cargar)
  const [seccion, setSeccion] = useState<Seccion>('hoy')
  const [editando, setEditando] = useState(false)
  const [visita, setVisita] = useState(0)
  const [abrir, setAbrir] = useState<'fondo' | undefined>(undefined)
  const [progreso, setProgreso] = useState<'seguimiento' | 'proyeccion'>('seguimiento')
  const [falla, setFalla] = useState(false)
  const hoy = fechaLocal(new Date())
  // La apertura se muestra una vez por sesión, y nunca si la persona pidió menos movimiento.
  const [apertura, setApertura] = useState(() => {
    try {
      if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || sessionStorage.getItem('quorum.apertura')) return false
      sessionStorage.setItem('quorum.apertura', '1')
      return true
    } catch {
      return false
    }
  })

  const cambiar = useCallback((nuevo: Estado) => {
    setEstado(nuevo)
    setFalla(!guardar(nuevo))
  }, [])

  const ir = (s: Seccion, herramienta?: 'fondo') => {
    // Tocar la sección de nuevo la reinicia: sirve para volver a la lista desde adentro de una herramienta.
    const cambio = () => {
      setVisita((v) => v + 1)
      setAbrir(herramienta)
      setSeccion(s)
      window.scrollTo(0, 0)
    }
    // Cambio de sección con fundido y desplazamiento, donde el navegador lo permite y la persona no pidió menos movimiento.
    const quieto = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (!quieto && s !== seccion && 'startViewTransition' in document) {
      document.documentElement.dataset.sentido = ORDEN.indexOf(s) >= ORDEN.indexOf(seccion) ? 'adelante' : 'atras'
      document.startViewTransition(() => flushSync(cambio))
    } else cambio()
  }

  const { perfil } = estado
  if (!perfil || editando) {
    return (
      <div className="marco">
        <Diagnostico
          inicial={perfil}
          hoy={hoy}
          cancelar={perfil ? () => setEditando(false) : undefined}
          listo={(p) => {
            cambiar({ ...estado, perfil: p })
            setEditando(false)
            ir('hoy')
          }}
        />
      </div>
    )
  }

  const hechosHoy = estado.registro[hoy] ?? []
  /** Vota un acuerdo desde otra sección (no lo retira si ya estaba) y guarda lo que venga con él. */
  const votar = (id: IdAcuerdo, extra: Partial<Estado> = {}) =>
    cambiar({ ...estado, ...extra, registro: hechosHoy.includes(id) ? estado.registro : alternar(estado.registro, hoy, id) })
  const pestanas = (
    <div className="tramos dos-tramos" role="group" aria-label="Vista de progreso">
      <button type="button" aria-pressed={progreso === 'seguimiento'} onClick={() => setProgreso('seguimiento')}>Seguimiento</button>
      <button type="button" aria-pressed={progreso === 'proyeccion'} onClick={() => setProgreso('proyeccion')}>Proyección</button>
    </div>
  )

  return (
    <div className="marco">
      {apertura && (
        <div className="apertura" aria-hidden="true" onAnimationEnd={(e) => { if (e.target === e.currentTarget) setApertura(false) }}>
          <b>Día {Math.max(1, diasEntre(perfil.inicio, hoy) + 1)}</b>
          <span>en el camino</span>
        </div>
      )}
      {falla && <p className="aviso" role="alert" style={{ position: 'relative', zIndex: 2, padding: '12px 20px 0' }}>No se pudo guardar en este teléfono. Revisá el espacio libre o el modo privado.</p>}
      {seccion === 'hoy' && <Hoy perfil={perfil} hoy={hoy} registro={estado.registro} intenciones={estado.intenciones ?? {}} dominio={estado.dominio} cambiar={(registro) => cambiar({ ...estado, registro })} ir={ir} />}
      {seccion === 'entreno' && (
        <Entreno
          perfil={perfil}
          hoy={hoy}
          bitacora={estado.bitacora ?? {}}
          votado={hechosHoy.includes('entreno')}
          cambiar={(bitacora) => cambiar({ ...estado, bitacora })}
          votar={() => votar('entreno')}
        />
      )}
      {seccion === 'herramientas' && (
        <Herramientas
          key={visita}
          perfil={perfil}
          hoy={hoy}
          abrir={abrir}
          datos={{ registro: estado.registro, bitacora: estado.bitacora ?? {}, intenciones: estado.intenciones ?? {}, revisiones: estado.revisiones ?? {}, repasos: estado.repasos ?? {}, destrabes: estado.destrabes ?? {}, repartos: estado.repartos ?? {}, visperas: estado.visperas ?? {}, dominio: estado.dominio, planSeguro: estado.planSeguro ?? {} }}
          cambiar={(parte) => cambiar({ ...estado, ...parte })}
          votar={votar}
        />
      )}
      {seccion === 'directorio' && <Directorio perfil={perfil} />}
      {seccion === 'progreso' && progreso === 'proyeccion' && <Proyeccion perfil={perfil} hoy={hoy} pesos={estado.pesos} arriba={pestanas} />}
      {seccion === 'progreso' && progreso === 'seguimiento' && (
        <Seguimiento
          estado={estado}
          perfil={perfil}
          hoy={hoy}
          cambiar={cambiar}
          arriba={pestanas}
          editar={() => setEditando(true)}
          borrar={() => {
            setFalla(!borrarTodo())
            setEstado(ESTADO_VACIO)
            setSeccion('hoy')
          }}
        />
      )}
      <Barra actual={seccion} ir={(s) => ir(s)} />
    </div>
  )
}
