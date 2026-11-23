import type { Registro } from '../dominio/hoy'
import type { Medicion, Perfil } from '../dominio/tipos'

/** Todo lo que Quorum sabe de la persona. Vive solo en su teléfono. */
export interface Estado {
  version: 1
  perfil: Perfil | null
  registro: Registro
  pesos: Medicion[]
  cinturas: Medicion[]
}

const CLAVE = 'quorum.estado'

export const ESTADO_VACIO: Estado = { version: 1, perfil: null, registro: {}, pesos: [], cinturas: [] }

export function cargar(): Estado {
  try {
    const crudo = localStorage.getItem(CLAVE)
    if (!crudo) return ESTADO_VACIO
    const dato = JSON.parse(crudo) as Partial<Estado>
    if (dato.version !== 1) return ESTADO_VACIO
    return { ...ESTADO_VACIO, ...dato }
  } catch {
    return ESTADO_VACIO
  }
}

/** Devuelve false si no se pudo guardar, para avisarle a la persona en vez de decir "listo". */
export function guardar(estado: Estado): boolean {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(estado))
    return true
  } catch {
    return false
  }
}

export function borrarTodo(): boolean {
  try {
    localStorage.removeItem(CLAVE)
    return true
  } catch {
    return false
  }
}
