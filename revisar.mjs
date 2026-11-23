// Portón de humo: recorre la app en tamaño celular, saca capturas y falla si algo se desborda o tira un error.
// Uso: npm run build && npx vite preview --port 4173 &  y después  node revisar.mjs
import { mkdirSync } from 'node:fs'
import { createRequire } from 'node:module'

// Playwright viene instalado en el entorno (no es dependencia del proyecto), por eso se carga con require.
const { chromium } = createRequire(import.meta.url)('playwright')

const URL = process.env.QUORUM_URL ?? 'http://localhost:4173/'
const TAMANOS = [{ nombre: '390', width: 390, height: 844 }, { nombre: '360', width: 360, height: 640 }]
mkdirSync('capturas', { recursive: true })
const fallas = []
const navegador = await chromium.launch()

for (const t of TAMANOS) {
  const pagina = await navegador.newPage({ viewport: { width: t.width, height: t.height }, deviceScaleFactor: 2, locale: 'es-AR' })
  pagina.on('pageerror', (e) => fallas.push(`${t.nombre}: error de página: ${e.message}`))
  pagina.on('console', (m) => m.type() === 'error' && fallas.push(`${t.nombre}: consola: ${m.text()}`))
  const captura = async (nombre) => {
    await pagina.waitForTimeout(700)
    const desborde = await pagina.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    if (desborde > 0) fallas.push(`${t.nombre}: ${nombre} se desborda ${desborde}px a lo ancho`)
    await pagina.screenshot({ path: `capturas/${t.nombre}-${nombre}.png`, fullPage: true })
  }
  // Reloj fijo: lunes 23/11/2026 a las 11:00, hora local.
  await pagina.clock.install({ time: new Date(2026, 10, 23, 11, 0) })
  await pagina.goto(URL)

  await pagina.getByLabel('Tu nombre').fill('Matias')
  await pagina.getByLabel('Edad').fill('31')
  await pagina.getByLabel('Altura (cm)').fill('173')
  await pagina.getByLabel('Peso (kg)').fill('79')
  await captura('1-diagnostico')
  await pagina.getByRole('button', { name: 'Seguir' }).click()
  await pagina.getByLabel('Cintura (cm)').fill('95')
  await pagina.getByLabel('Cuello (cm)').fill('40,5')
  await pagina.getByRole('button', { name: 'Seguir' }).click()
  await pagina.getByLabel('Días de entrenamiento por semana').selectOption('5')
  await pagina.getByLabel('Me despierto').fill('05:15')
  await pagina.getByLabel('Entreno').fill('06:00')
  await pagina.getByLabel('Mi mejor momento para estudiar').fill('14:00')
  await pagina.getByLabel('Me acuesto').fill('21:30')
  await captura('2-semana')
  await pagina.getByRole('button', { name: 'Seguir' }).click()
  await captura('3-objetivo')
  await pagina.getByRole('button', { name: 'Convocar al Directorio' }).click()

  await pagina.getByRole('button', { name: 'Hecho', exact: true }).click()
  await pagina.getByRole('button', { name: /25 minutos de foco/ }).click()
  if (!(await pagina.getByText('Falta 1 acuerdo para tener quórum.').isVisible())) fallas.push(`${t.nombre}: el quórum no cuenta 2 de 5`)
  await captura('4-hoy')
  // La acción principal tiene que verse sin desplazar.
  const accion = await pagina.getByRole('button', { name: 'Hecho', exact: true }).boundingBox()
  if (!accion || accion.y + accion.height > t.height) fallas.push(`${t.nombre}: la acción de Hoy queda debajo del pliegue`)

  await pagina.getByRole('button', { name: 'Directorio' }).click()
  await captura('5-directorio')
  await pagina.getByRole('button', { name: 'Seguimiento' }).click()
  await pagina.getByLabel('Peso de hoy, en ayunas (kg)').fill('78,6')
  await pagina.getByRole('button', { name: 'Guardar' }).first().click()
  await captura('6-seguimiento')
  await pagina.getByRole('button', { name: 'Proyección' }).click()
  await captura('7-proyeccion')

  // Los datos sobreviven a cerrar y volver a abrir.
  await pagina.reload()
  if (!(await pagina.getByText('Hola, Matias').isVisible())) fallas.push(`${t.nombre}: el perfil no sobrevive a recargar`)
  if (!(await pagina.getByText('Falta 1 acuerdo para tener quórum.').isVisible())) fallas.push(`${t.nombre}: los acuerdos no sobreviven a recargar`)
  await pagina.close()
}

await navegador.close()
if (fallas.length) {
  console.error(fallas.join('\n'))
  process.exit(1)
}
console.log('revisar: todo en orden, capturas en capturas/')
