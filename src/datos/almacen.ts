import type { Destrabes, Dominio, Intenciones, Repartos, Repasos, Revisiones, Visperas } from '../dominio/herramientas'
import type { Registro } from '../dominio/hoy'
import type { Bitacora } from '../dominio/rutina'
import type { Medicion, Perfil } from '../dominio/tipos'

/** Todo lo que Quorum sabe de la persona. Vive solo en su teléfono. */
export interface Estado {
  version: 1
  perfil: Perfil | null
  registro: Registro
  pesos: Medicion[]
  cinturas: Medicion[]
  /** Series registradas en el gimnasio. */
  bitacora?: Bitacora
  /** Planes si-entonces, uno por acuerdo. */
  intenciones?: Intenciones
  /** Revisión de cada semana. */
  revisiones?: Revisiones
  /** Lo que la persona escribió de memoria después de cada bloque de foco. */
  repasos?: Repasos
  /** Tareas trabadas, achicadas a su versión mínima: una por día. */
  destrabes?: Destrabes
  /** Preocupaciones partidas en lo que depende de la persona y lo que no. */
  repartos?: Repartos
  /** Preparación de la noche anterior. */
  visperas?: Visperas
  /** El frente que la persona está dominando y su cuenta de ganas superadas y caídas. */
  dominio?: Dominio
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

const esMediciones = (v: unknown): v is Medicion[] =>
  Array.isArray(v) && v.every((m) => typeof m === 'object' && m !== null && typeof (m as Medicion).fecha === 'string' && typeof (m as Medicion).valor === 'number')

/**
 * Lee una copia de seguridad. Devuelve null si el archivo no es una copia de Quorum,
 * para no pisar los datos buenos con un archivo cualquiera.
 */
export function leerCopia(texto: string): Estado | null {
  try {
    const dato = JSON.parse(texto) as Partial<Estado> | null
    if (typeof dato !== 'object' || dato === null || dato.version !== 1) return null
    const { perfil, registro, pesos, cinturas } = dato
    if (typeof perfil !== 'object' || perfil === null || typeof perfil.nombre !== 'string' || typeof perfil.pesoKg !== 'number' || typeof perfil.inicio !== 'string') return null
    if (typeof registro !== 'object' || registro === null || !Object.values(registro).every(Array.isArray)) return null
    if (!esMediciones(pesos) || !esMediciones(cinturas)) return null
    const esObjeto = (v: unknown) => typeof v === 'object' && v !== null && !Array.isArray(v)
    const { bitacora, intenciones, revisiones, repasos, destrabes, repartos, visperas, dominio } = dato
    // Lo que se sumó después del primer formato es opcional: una copia vieja sigue sirviendo.
    return {
      version: 1, perfil, registro, pesos, cinturas,
      ...(esObjeto(bitacora) ? { bitacora } : {}),
      ...(esObjeto(intenciones) ? { intenciones } : {}),
      ...(esObjeto(revisiones) ? { revisiones } : {}),
      ...(esObjeto(repasos) ? { repasos } : {}),
      ...(esObjeto(destrabes) ? { destrabes } : {}),
      ...(esObjeto(repartos) ? { repartos } : {}),
      ...(esObjeto(visperas) ? { visperas } : {}),
      ...(esObjeto(dominio) && esObjeto((dominio as Dominio).frente) && esObjeto((dominio as Dominio).dias) && typeof (dominio as Dominio).desde === 'string' ? { dominio } : {}),
    }
  } catch {
    return null
  }
}

export type Tema = 'sistema' | 'claro' | 'oscuro'
const CLAVE_TEMA = 'quorum.tema'

export function cargarTema(): Tema {
  try {
    const t = localStorage.getItem(CLAVE_TEMA)
    return t === 'claro' || t === 'oscuro' ? t : 'sistema'
  } catch {
    return 'sistema'
  }
}

/** Aplica el tema al documento y lo recuerda. "sistema" sigue al teléfono. */
export function aplicarTema(tema: Tema, recordar = true): void {
  if (tema === 'sistema') delete document.documentElement.dataset.tema
  else document.documentElement.dataset.tema = tema
  if (!recordar) return
  try {
    if (tema === 'sistema') localStorage.removeItem(CLAVE_TEMA)
    else localStorage.setItem(CLAVE_TEMA, tema)
  } catch {
    // Sin almacenamiento el tema vale igual hasta cerrar la app.
  }
}
