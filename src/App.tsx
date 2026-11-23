import { useCallback, useState } from 'react'
import { Barra, type Seccion } from './componentes'
import { borrarTodo, cargar, ESTADO_VACIO, guardar, type Estado } from './datos/almacen'
import { fechaLocal } from './dominio/tiempo'
import { Diagnostico } from './pantallas/Diagnostico'
import { Directorio } from './pantallas/Directorio'
import { Hoy } from './pantallas/Hoy'
import { Proyeccion } from './pantallas/Proyeccion'
import { Seguimiento } from './pantallas/Seguimiento'

export function App() {
  const [estado, setEstado] = useState<Estado>(cargar)
  const [seccion, setSeccion] = useState<Seccion>('hoy')
  const [editando, setEditando] = useState(false)
  const [falla, setFalla] = useState(false)
  const hoy = fechaLocal(new Date())

  const cambiar = useCallback((nuevo: Estado) => {
    setEstado(nuevo)
    setFalla(!guardar(nuevo))
  }, [])

  const ir = (s: Seccion) => {
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

  return (
    <div className="marco">
      {falla && <p className="aviso" role="alert" style={{ position: 'relative', zIndex: 2, padding: '12px 20px 0' }}>No se pudo guardar en este teléfono. Revisá el espacio libre o el modo privado.</p>}
      {seccion === 'hoy' && <Hoy perfil={perfil} hoy={hoy} registro={estado.registro} cambiar={(registro) => cambiar({ ...estado, registro })} />}
      {seccion === 'directorio' && <Directorio perfil={perfil} />}
      {seccion === 'proyeccion' && <Proyeccion perfil={perfil} hoy={hoy} pesos={estado.pesos} />}
      {seccion === 'seguimiento' && (
        <Seguimiento
          estado={estado}
          perfil={perfil}
          hoy={hoy}
          cambiar={cambiar}
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
