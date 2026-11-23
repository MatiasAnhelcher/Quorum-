// Portón de humo: recorre la app en tamaño celular, saca capturas y falla si algo se desborda o tira un error.
// Uso: npm run build && npx vite preview --port 4173 &  y después  node revisar.mjs
import { mkdirSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'

// Playwright viene instalado en el entorno (no es dependencia del proyecto), por eso se carga con require.
const { chromium } = createRequire(import.meta.url)('playwright')

const URL = process.env.QUORUM_URL ?? 'http://localhost:4173/'
const TAMANOS = [
  { nombre: '390', width: 390, height: 844, esquema: 'light' },
  { nombre: '360', width: 360, height: 640, esquema: 'light' },
  { nombre: '390-oscuro', width: 390, height: 844, esquema: 'dark' },
]
mkdirSync('capturas', { recursive: true })
const fallas = []
const navegador = await chromium.launch()

for (const t of TAMANOS) {
  const pagina = await navegador.newPage({ viewport: { width: t.width, height: t.height }, deviceScaleFactor: 2, locale: 'es-AR', colorScheme: t.esquema })
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
  // El segundo voto se da tocando la silla en la mesa.
  await pagina.getByRole('button', { name: 'Silla de Mente: sigue' }).click()
  if (!(await pagina.getByRole('button', { name: 'Silla de Mente: cumplido' }).isVisible())) fallas.push(`${t.nombre}: tocar la silla no vota`)
  if (!(await pagina.getByRole('status').filter({ hasText: 'Falta 1 voto para tener quórum.' }).isVisible())) fallas.push(`${t.nombre}: el quórum no cuenta 2 de 5`)
  await captura('4-hoy')
  // La acción principal tiene que verse sin desplazar, por encima de la barra de navegación (72 px).
  const accion = await pagina.getByRole('button', { name: 'Hecho', exact: true }).boundingBox()
  if ((!accion || accion.y + accion.height > t.height - 72)) fallas.push(`${t.nombre}: la acción de Hoy queda debajo del pliegue`)

  await pagina.getByRole('button', { name: 'Directorio' }).click()
  await captura('5-directorio')
  await pagina.getByRole('button', { name: 'Seguimiento' }).click()
  await pagina.getByLabel('Peso de hoy, en ayunas (kg)').fill('78,6')
  await pagina.getByRole('button', { name: 'Guardar' }).first().click()
  await captura('6-seguimiento')
  // La copia de seguridad se descarga y trae el perfil.
  const [descarga] = await Promise.all([pagina.waitForEvent('download'), pagina.getByRole('button', { name: 'Descargar copia' }).click()])
  const copia = JSON.parse(readFileSync(await descarga.path(), 'utf8'))
  if (copia.perfil?.nombre !== 'Matias' || copia.pesos?.length !== 1) fallas.push(`${t.nombre}: la copia de seguridad no trae los datos`)
  // El tema elegido a mano le gana al del sistema y sobrevive a recargar.
  const elegido = t.esquema === 'dark' ? 'Claro' : 'Oscuro'
  await pagina.getByRole('button', { name: elegido, exact: true }).click()
  const fondo = () => pagina.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--fondo').trim())
  const esperado = elegido === 'Oscuro' ? '#0f1218' : '#f5f6f8'
  if ((await fondo()) !== esperado) fallas.push(`${t.nombre}: el tema ${elegido} no se aplica`)
  await pagina.reload()
  if ((await fondo()) !== esperado) fallas.push(`${t.nombre}: el tema ${elegido} no sobrevive a recargar`)
  await pagina.getByRole('button', { name: 'Seguimiento' }).click()
  await captura('6b-tema-a-mano')
  await pagina.getByRole('button', { name: 'Automático', exact: true }).click()
  await pagina.getByRole('button', { name: 'Proyección' }).click()
  await captura('7-proyeccion')

  // Los datos sobreviven a cerrar y volver a abrir.
  await pagina.reload()
  if (!(await pagina.getByRole('heading', { name: 'Tu Directorio sesiona' }).isVisible())) fallas.push(`${t.nombre}: el perfil no sobrevive a recargar`)
  if (!(await pagina.getByRole('status').filter({ hasText: 'Falta 1 voto para tener quórum.' }).isVisible())) fallas.push(`${t.nombre}: los acuerdos no sobreviven a recargar`)

  // Sin conexión: con el service worker instalado, la app abre igual.
  await pagina.evaluate(() => navigator.serviceWorker.ready)
  await pagina.context().setOffline(true)
  await pagina.reload()
  if (!(await pagina.getByRole('heading', { name: 'Tu Directorio sesiona' }).isVisible())) fallas.push(`${t.nombre}: la app no abre sin conexión`)
  await pagina.context().setOffline(false)
  await pagina.close()
}

// El plan se corrige solo: con dos semanas de pesadas quietas, propone bajar 100 kcal y al aplicarlo cambia la meta.
{
  const pagina = await navegador.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, locale: 'es-AR', colorScheme: 'light' })
  pagina.on('pageerror', (e) => fallas.push(`ajuste: error de página: ${e.message}`))
  await pagina.clock.install({ time: new Date(2026, 10, 23, 11, 0) })
  await pagina.addInitScript(() => {
    if (localStorage.getItem('quorum.estado')) return
    const dia = (n) => `2026-11-${String(n).padStart(2, '0')}`
    localStorage.setItem('quorum.estado', JSON.stringify({
      version: 1,
      perfil: { nombre: 'Matias', sexo: 'hombre', edad: 31, alturaCm: 173, pesoKg: 79, cinturaCm: 95, cuelloCm: 40.5, objetivo: 'recomposicion', diasEntreno: 5, horaDespertar: '05:15', horaEntreno: '06:00', horaFoco: '14:00', horaDormir: '21:30', presupuesto: 'medio', inicio: '2026-11-09' },
      registro: {},
      pesos: [10, 12, 14, 17, 19, 21, 23].map((n) => ({ fecha: dia(n), valor: 79 })),
      cinturas: [],
    }))
  })
  await pagina.goto(URL)
  await pagina.getByRole('button', { name: 'Seguimiento' }).click()
  if (!(await pagina.getByText('De 2.300 a 2.200 kcal por día').isVisible())) fallas.push('ajuste: no aparece la propuesta con dos semanas sin cambio')
  await pagina.waitForTimeout(500)
  await pagina.screenshot({ path: 'capturas/390-8-ajuste-propuesto.png', fullPage: true })
  await pagina.getByRole('button', { name: 'Aplicar el ajuste' }).click()
  await pagina.getByRole('button', { name: 'Directorio' }).click()
  if (!(await pagina.getByText('2.200 kcal por día, con 160 g de proteína.').isVisible())) fallas.push('ajuste: el plan del Directorio no cambió después de aplicar')
  await pagina.getByRole('button', { name: 'Seguimiento' }).click()
  if (await pagina.getByRole('button', { name: 'Aplicar el ajuste' }).isVisible()) fallas.push('ajuste: propone de nuevo sin esperar 14 días')
  await pagina.close()
}

await navegador.close()
if (fallas.length) {
  console.error(fallas.join('\n'))
  process.exit(1)
}
console.log('revisar: todo en orden, capturas en capturas/')
