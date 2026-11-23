import { useCallback, useState } from 'react'
import { Barra, type Seccion } from './componentes'
import { borrarTodo, cargar, ESTADO_VACIO, guardar, type Estado } from './datos/almacen'
import { alternar, type IdAcuerdo } from './dominio/hoy'
import { fechaLocal } from './dominio/tiempo'
import { Diagnostico } from './pantallas/Diagnostico'
import { Directorio } from './pantallas/Directorio'
import { Entreno } from './pantallas/Entreno'
import { Herramientas } from './pantallas/Herramientas'
import { Hoy } from './pantallas/Hoy'
import { Proyeccion } from './pantallas/Proyeccion'
import { Seguimiento } from './pantallas/Seguimiento'

export function App() {
  const [estado, setEstado] = useState<Estado>(cargar)
  const [seccion, setSeccion] = useState<Seccion>('hoy')
  const [editando, setEditando] = useState(false)
  const [visita, setVisita] = useState(0)
  const [progreso, setProgreso] = useState<'seguimiento' | 'proyeccion'>('seguimiento')
  const [falla, setFalla] = useState(false)
  const hoy = fechaLocal(new Date())

  const cambiar = useCallback((nuevo: Estado) => {
    setEstado(nuevo)
    setFalla(!guardar(nuevo))
  }, [])

  const ir = (s: Seccion) => {
    // Tocar la sección de nuevo la reinicia: sirve para volver a la lista desde adentro de una herramienta.
    setVisita((v) => v + 1)
    setSeccion(s)
    window.scrollTo(0, 0)
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
      {falla && <p className="aviso" role="alert" style={{ position: 'relative', zIndex: 2, padding: '12px 20px 0' }}>No se pudo guardar en este teléfono. Revisá el espacio libre o el modo privado.</p>}
      {seccion === 'hoy' && <Hoy perfil={perfil} hoy={hoy} registro={estado.registro} intenciones={estado.intenciones ?? {}} cambiar={(registro) => cambiar({ ...estado, registro })} ir={ir} />}
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
          datos={{ registro: estado.registro, intenciones: estado.intenciones ?? {}, revisiones: estado.revisiones ?? {}, repasos: estado.repasos ?? {}, destrabes: estado.destrabes ?? {}, repartos: estado.repartos ?? {}, visperas: estado.visperas ?? {} }}
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
      <Barra actual={seccion} ir={ir} />
    </div>
  )
}
