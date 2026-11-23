// Portón de contraste: mide los tokens de estilos.css en claro y en oscuro. Corre con los tests, también en CI.
// Es .mjs para poder leer el archivo con node:fs sin sumar tipos de Node al proyecto.
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const estilos = readFileSync(new URL('./estilos.css', import.meta.url), 'utf8')

describe('contraste de los colores (WCAG 2.2)', () => {
  const bloque = (desde) => {
    const inicio = estilos.indexOf(desde)
    if (inicio < 0) throw new Error(`No está el bloque ${desde}`)
    const cuerpo = estilos.slice(inicio, estilos.indexOf('}', inicio))
    return Object.fromEntries([...cuerpo.matchAll(/--([a-z0-9-]+):\s*(#[0-9a-f]{6})/g)].map((m) => [m[1], m[2]]))
  }
  const claro = bloque(':root {')
  const oscuro = { ...claro, ...bloque(":root[data-tema='oscuro'] {") }
  const luminancia = (hex) => {
    const canal = (i) => {
      const v = parseInt(hex.slice(i, i + 2), 16) / 255
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
    }
    return 0.2126 * canal(1) + 0.7152 * canal(3) + 0.0722 * canal(5)
  }
  const contraste = (a, b) => {
    const [alta, baja] = [luminancia(a), luminancia(b)].sort((x, y) => y - x)
    return (alta + 0.05) / (baja + 0.05)
  }
  // [color de adelante, fondo, mínimo]: 4,5 para texto y 3 para trazos y figuras.
  const PARES = [
    ['tinta', 'fondo', 4.5], ['tinta', 'papel', 4.5], ['tinta', 'papel-2', 4.5],
    ['glosa', 'fondo', 4.5], ['glosa', 'papel', 4.5], ['glosa', 'papel-2', 4.5],
    ['sobre-acento', 'acento', 4.5], ['fondo', 'tinta', 4.5], ['aviso', 'papel', 4.5], ['aviso', 'fondo', 4.5],
    ['senal', 'papel', 3], ['senal', 'fondo', 3],
    ...['biomecanico', 'nutricion', 'sueno', 'neuro', 'estratega'].flatMap((e) => [[e, 'papel', 3], [e, 'fondo', 3]]),
  ]
  for (const [nombre, tokens] of [['claro', claro], ['oscuro', oscuro]]) {
    it.each(PARES)(`${nombre}: %s sobre %s llega a %s`, (adelante, atras, minimo) => {
      const a = tokens[adelante]
      const b = tokens[atras]
      if (!a || !b) throw new Error(`Falta el token ${adelante} o ${atras}`)
      expect(contraste(a, b)).toBeGreaterThanOrEqual(minimo)
    })
  }
  it('el oscuro del sistema y el oscuro elegido llevan los mismos valores', () => {
    expect(bloque(":root:not([data-tema='claro']) {")).toEqual(bloque(":root[data-tema='oscuro'] {"))
  })
})
