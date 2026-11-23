import { useState, type FormEvent } from 'react'
import type { Objetivo, Perfil, Presupuesto, Sexo } from '../dominio/tipos'

interface Borrador {
  nombre: string; sexo: Sexo; edad: string; altura: string; peso: string
  cintura: string; cuello: string; cadera: string
  dias: '3' | '4' | '5'; despertar: string; entreno: string; foco: string; dormir: string
  objetivo: Objetivo; presupuesto: Presupuesto
}

const VACIO: Borrador = {
  nombre: '', sexo: 'hombre', edad: '', altura: '', peso: '', cintura: '', cuello: '', cadera: '',
  dias: '4', despertar: '07:00', entreno: '18:00', foco: '10:00', dormir: '23:00',
  objetivo: 'recomposicion', presupuesto: 'medio',
}

function desdePerfil(p: Perfil): Borrador {
  return {
    nombre: p.nombre, sexo: p.sexo, edad: String(p.edad), altura: String(p.alturaCm), peso: String(p.pesoKg),
    cintura: String(p.cinturaCm), cuello: String(p.cuelloCm), cadera: p.caderaCm ? String(p.caderaCm) : '',
    dias: String(p.diasEntreno) as Borrador['dias'], despertar: p.horaDespertar, entreno: p.horaEntreno, foco: p.horaFoco, dormir: p.horaDormir,
    objetivo: p.objetivo, presupuesto: p.presupuesto,
  }
}

const num = (texto: string) => Number(texto.replace(',', '.'))
const entre = (texto: string, min: number, max: number) => texto.trim() !== '' && num(texto) >= min && num(texto) <= max

const PASOS = ['Vos', 'Tus medidas', 'Tu semana real', 'Tu objetivo'] as const

const OBJETIVOS: { id: Objetivo; nombre: string; detalle: string }[] = [
  { id: 'recomposicion', nombre: 'Recomposición', detalle: 'Bajar grasa y ganar o mantener músculo a la vez.' },
  { id: 'bajar-grasa', nombre: 'Bajar grasa', detalle: 'La prioridad es bajar, cuidando el músculo.' },
  { id: 'ganar-musculo', nombre: 'Ganar músculo', detalle: 'Subir de peso despacio, con poca grasa.' },
]
const PRESUPUESTOS: { id: Presupuesto; nombre: string; detalle: string }[] = [
  { id: 'ajustado', nombre: 'Ajustado', detalle: 'Huevos, pollo, legumbres y avena.' },
  { id: 'medio', nombre: 'Medio', detalle: 'Suma carne magra y atún.' },
  { id: 'holgado', nombre: 'Holgado', detalle: 'Suma pescado y proteína en polvo.' },
]

export function Diagnostico({ inicial, hoy, listo, cancelar }: { inicial: Perfil | null; hoy: string; listo: (p: Perfil) => void; cancelar?: () => void }) {
  const [b, setB] = useState<Borrador>(() => (inicial ? desdePerfil(inicial) : VACIO))
  const [paso, setPaso] = useState(0)
  const poner = <K extends keyof Borrador>(clave: K, valor: Borrador[K]) => setB((antes) => ({ ...antes, [clave]: valor }))

  const validos = [
    b.nombre.trim() !== '' && entre(b.edad, 16, 90) && entre(b.altura, 130, 220) && entre(b.peso, 35, 250),
    entre(b.cintura, 50, 200) && entre(b.cuello, 25, 60) && num(b.cintura) > num(b.cuello) && (b.sexo === 'hombre' || entre(b.cadera, 60, 200)),
    [b.despertar, b.entreno, b.foco, b.dormir].every((h) => /^\d{2}:\d{2}$/.test(h)),
    true,
  ]
  const ultimo = paso === PASOS.length - 1

  const avanzar = (e: FormEvent) => {
    e.preventDefault()
    if (!validos[paso]) return
    if (!ultimo) {
      setPaso(paso + 1)
      window.scrollTo(0, 0)
      return
    }
    listo({
      nombre: b.nombre.trim(), sexo: b.sexo, edad: num(b.edad), alturaCm: num(b.altura), pesoKg: num(b.peso),
      cinturaCm: num(b.cintura), cuelloCm: num(b.cuello), caderaCm: b.sexo === 'mujer' ? num(b.cadera) : undefined,
      objetivo: b.objetivo, diasEntreno: Number(b.dias) as Perfil['diasEntreno'],
      horaDespertar: b.despertar, horaEntreno: b.entreno, horaFoco: b.foco, horaDormir: b.dormir,
      presupuesto: b.presupuesto, inicio: inicial?.inicio ?? hoy,
    })
  }

  const numero = (clave: 'edad' | 'altura' | 'peso' | 'cintura' | 'cuello' | 'cadera', etiqueta: string) => (
    <div className="campo">
      <label htmlFor={clave}>{etiqueta}</label>
      <input id={clave} inputMode="decimal" autoComplete="off" value={b[clave]} onChange={(e) => poner(clave, e.target.value)} />
    </div>
  )
  const hora = (clave: 'despertar' | 'entreno' | 'foco' | 'dormir', etiqueta: string) => (
    <div className="campo">
      <label htmlFor={clave}>{etiqueta}</label>
      <input id={clave} type="time" value={b[clave]} onChange={(e) => poner(clave, e.target.value)} />
    </div>
  )

  return (
    <form className="pantalla" onSubmit={avanzar} style={{ paddingBottom: 40 }}>
      <div className="pasos" aria-hidden="true">{PASOS.map((_, i) => <span key={i} className={i <= paso ? 'si' : ''} />)}</div>
      <div className="columna">
        <span className="glosa">Diagnóstico · paso {paso + 1} de {PASOS.length}</span>
        <h1>{PASOS[paso]}</h1>
      </div>

      {paso === 0 && (
        <>
          <p className="glosa">El Directorio arma tu plan con estos datos. Quedan solo en tu teléfono y los podés corregir o borrar cuando quieras.</p>
          <div className="campo">
            <label htmlFor="nombre">Tu nombre</label>
            <input id="nombre" autoComplete="given-name" value={b.nombre} onChange={(e) => poner('nombre', e.target.value)} />
          </div>
          <div className="dos">
            <div className="campo">
              <label htmlFor="sexo">Sexo</label>
              <select id="sexo" value={b.sexo} onChange={(e) => poner('sexo', e.target.value as Sexo)}>
                <option value="hombre">Hombre</option>
                <option value="mujer">Mujer</option>
              </select>
            </div>
            {numero('edad', 'Edad')}
          </div>
          <div className="dos">
            {numero('altura', 'Altura (cm)')}
            {numero('peso', 'Peso (kg)')}
          </div>
        </>
      )}

      {paso === 1 && (
        <>
          <p className="glosa">Con una cinta métrica, a la mañana y en ayunas. La cintura se mide a la altura del ombligo, sin meter la panza.</p>
          <div className="dos">
            {numero('cintura', 'Cintura (cm)')}
            {numero('cuello', 'Cuello (cm)')}
          </div>
          {b.sexo === 'mujer' && numero('cadera', 'Cadera (cm), en la parte más ancha')}
        </>
      )}

      {paso === 2 && (
        <>
          <p className="glosa">Poné tus horarios de verdad, no los ideales. El plan se arma alrededor de tu vida.</p>
          <div className="campo">
            <label htmlFor="dias">Días de entrenamiento por semana</label>
            <select id="dias" value={b.dias} onChange={(e) => poner('dias', e.target.value as Borrador['dias'])}>
              <option value="3">3 días (lunes, miércoles y viernes)</option>
              <option value="4">4 días (lunes, martes, jueves y viernes)</option>
              <option value="5">5 días (lunes a viernes)</option>
            </select>
          </div>
          <div className="dos">
            {hora('despertar', 'Me despierto')}
            {hora('entreno', 'Entreno')}
          </div>
          <div className="dos">
            {hora('foco', 'Mi mejor momento para estudiar')}
            {hora('dormir', 'Me acuesto')}
          </div>
        </>
      )}

      {paso === 3 && (
        <>
          <fieldset className="opciones">
            <legend className="glosa" style={{ marginBottom: 8 }}>Qué buscás</legend>
            {OBJETIVOS.map((o) => (
              <label key={o.id} className="opcion">
                <input type="radio" name="objetivo" checked={b.objetivo === o.id} onChange={() => poner('objetivo', o.id)} />
                <span><b>{o.nombre}</b><span className="glosa">{o.detalle}</span></span>
              </label>
            ))}
          </fieldset>
          <fieldset className="opciones">
            <legend className="glosa" style={{ marginBottom: 8 }}>Presupuesto para comida</legend>
            {PRESUPUESTOS.map((o) => (
              <label key={o.id} className="opcion">
                <input type="radio" name="presupuesto" checked={b.presupuesto === o.id} onChange={() => poner('presupuesto', o.id)} />
                <span><b>{o.nombre}</b><span className="glosa">{o.detalle}</span></span>
              </label>
            ))}
          </fieldset>
        </>
      )}

      {!validos[paso] && <p className="glosa" role="status">Completá todos los campos con valores reales para seguir.</p>}
      <div className="pie">
        {paso > 0 && <button type="button" className="contorno" onClick={() => setPaso(paso - 1)}>Atrás</button>}
        {paso === 0 && cancelar && <button type="button" className="contorno" onClick={cancelar}>Cancelar</button>}
        <button type="submit" className="accion" disabled={!validos[paso]}>{ultimo ? 'Convocar al Directorio' : 'Seguir'}</button>
      </div>
    </form>
  )
}
