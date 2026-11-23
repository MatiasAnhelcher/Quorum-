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

  // Entreno: la rutina guiada del lunes, con técnica, registro de series, sugerencia y descanso.
  await pagina.getByRole('button', { name: 'Entreno', exact: true }).click()
  if (!(await pagina.getByRole('heading', { name: 'Torso completo' }).isVisible())) fallas.push(`${t.nombre}: Entreno no muestra la sesión de hoy`)
  await pagina.getByText('Press de banca en Smith').first().click()
  if (!(await pagina.getByText('Rebotar la barra en el pecho').isVisible())) fallas.push(`${t.nombre}: el ejercicio no muestra su técnica`)
  await pagina.getByLabel('Peso (kg)').first().fill('40')
  await pagina.getByLabel('Repeticiones').first().fill('10')
  await pagina.getByRole('button', { name: 'Anotar' }).first().click()
  if (!(await pagina.getByText('40,0 kg × 10').isVisible())) fallas.push(`${t.nombre}: la serie no quedó anotada`)
  if (!(await pagina.getByRole('timer', { name: 'Descanso' }).isVisible())) fallas.push(`${t.nombre}: no arranca el descanso`)
  await captura('4b-entreno')
  await pagina.getByRole('button', { name: /Miércoles 25/i }).click()
  if (!(await pagina.getByRole('heading', { name: 'Tirón' }).isVisible())) fallas.push(`${t.nombre}: la semana no deja ver otro día`)

  // Herramientas: un plan si-entonces aparece después en Hoy; el foco guarda el repaso.
  await pagina.getByRole('button', { name: 'Herramientas', exact: true }).click()
  await captura('4c-herramientas')
  await pagina.getByRole('button', { name: /Planes si-entonces/ }).click()
  await pagina.getByLabel('Si…').nth(2).fill('llego a la cena corto de proteína')
  await pagina.getByLabel('entonces…').nth(2).fill('sumo una lata de atún')
  await captura('4d-si-entonces')
  await pagina.getByRole('button', { name: 'Herramientas', exact: true }).first().click()
  await pagina.getByRole('button', { name: /Bloque de foco/ }).click()
  await pagina.getByRole('button', { name: 'Empezar 25 minutos' }).click()
  await pagina.getByRole('button', { name: /Terminé antes/ }).click()
  await pagina.getByLabel(/Escribí de memoria/).fill('Doble progresión: el rango decide el peso.')
  await pagina.getByRole('button', { name: 'Guardar el repaso' }).click()
  // Hecho, no perfecto: sin hora no arranca; con hora aparece el arranque y se puede cerrar.
  await pagina.getByRole('button', { name: 'Herramientas', exact: true }).first().click()
  await pagina.getByRole('button', { name: /Hecho, no perfecto/ }).click()
  await pagina.getByLabel('¿Qué venís pateando?').fill('Armar el currículum')
  await pagina.getByLabel(/La versión más chica/).fill('Una página con los tres últimos trabajos')
  if (await pagina.getByRole('button', { name: 'Arrancar 10 minutos' }).isVisible()) fallas.push(`${t.nombre}: la tarea trabada arranca sin hora`)
  await pagina.getByLabel('¿A qué hora de hoy?').fill('18:30')
  await captura('4e-hecho-no-perfecto')
  await pagina.getByRole('button', { name: /Hecho: terminé/ }).click()
  if (!(await pagina.getByText('Destrabaste 1 tarea en los últimos 7 días.').isVisible())) fallas.push(`${t.nombre}: la tarea destrabada no se cuenta`)
  // Dominar un impulso: se arma el frente, una ola superada suma y una caída no vuelve la cuenta a cero.
  await pagina.getByRole('button', { name: 'Herramientas', exact: true }).first().click()
  await pagina.getByRole('button', { name: /Dominar un impulso/ }).click()
  await pagina.getByLabel('¿Qué querés dejar?').fill('El cigarrillo')
  await pagina.getByLabel('¿Cuándo aparecen las ganas?').fill('termino de comer')
  await pagina.getByLabel(/en vez de ceder/).fill('salgo a caminar diez minutos')
  await pagina.getByRole('button', { name: 'Listo', exact: true }).click()
  await pagina.getByRole('button', { name: 'Tengo ganas ahora' }).click()
  await captura('4h-la-ola')
  await pagina.getByRole('button', { name: 'Pasó: no cedí' }).click()
  await pagina.getByRole('button', { name: 'Tengo ganas ahora' }).click()
  await pagina.getByRole('button', { name: 'Cedí', exact: true }).click()
  await captura('4i-caida')
  await pagina.getByRole('button', { name: 'Sigo en el camino' }).click()
  if (!(await pagina.getByText('vez que no cediste').isVisible())) fallas.push(`${t.nombre}: la caída borró las ganas superadas`)
  await captura('4j-impulso')
  // Lo que depende de mí y La noche antes guardan lo escrito.
  await pagina.getByRole('button', { name: 'Herramientas', exact: true }).first().click()
  await pagina.getByRole('button', { name: /Lo que depende de mí/ }).click()
  await pagina.getByLabel('¿Qué te está pesando?').fill('La entrevista del jueves')
  await pagina.getByLabel('Depende de mí', { exact: true }).fill('Prepararme y llegar descansado')
  await pagina.getByLabel(/Un paso de hoy/).fill('Ensayar la apertura cinco veces')
  if (!(await pagina.getByText('Listo. Lo de arriba se suelta; el paso se hace.').isVisible())) fallas.push(`${t.nombre}: el reparto no se da por completo`)
  await captura('4f-lo-que-depende')
  await pagina.getByRole('button', { name: 'Herramientas', exact: true }).first().click()
  await pagina.getByRole('button', { name: /La noche antes/ }).click()
  await pagina.getByLabel(/Todo lo que tenés que hacer/).fill('Llamar al contador antes de las 10\nComprar pollo y arroz\nMandar el presupuesto')
  for (const casilla of await pagina.getByRole('checkbox').all()) await casilla.check()
  if (!(await pagina.getByText('Mañana está armado').isVisible())) fallas.push(`${t.nombre}: la víspera no cierra`)
  await captura('4g-la-noche-antes')
  await pagina.getByRole('button', { name: 'Hoy', exact: true }).click()
  if (!(await pagina.getByText('Tu plan: si llego a la cena corto de proteína, sumo una lata de atún.').isVisible())) fallas.push(`${t.nombre}: el plan si-entonces no aparece en Hoy`)

  await pagina.getByRole('button', { name: 'Directorio', exact: true }).click()
  await captura('5-directorio')
  await pagina.getByRole('button', { name: 'Progreso', exact: true }).click()
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
  await pagina.getByRole('button', { name: 'Progreso', exact: true }).click()
  await captura('6b-tema-a-mano')
  await pagina.getByRole('button', { name: 'Automático', exact: true }).click()
  await pagina.getByRole('button', { name: 'Proyección', exact: true }).click()
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
  // Dos semanas sin votar: los acuerdos aparecen en su versión chica.
  if (!(await pagina.getByText('5 minutos de repaso de memoria').first().isVisible())) fallas.push('achicar: un acuerdo que falló tres días no se achica')
  await pagina.waitForTimeout(500)
  await pagina.screenshot({ path: 'capturas/390-9-acuerdos-chicos.png', fullPage: true })
  await pagina.getByRole('button', { name: 'Progreso', exact: true }).click()
  if (!(await pagina.getByText('De 2.300 a 2.200 kcal por día').isVisible())) fallas.push('ajuste: no aparece la propuesta con dos semanas sin cambio')
  await pagina.waitForTimeout(500)
  await pagina.screenshot({ path: 'capturas/390-8-ajuste-propuesto.png', fullPage: true })
  await pagina.getByRole('button', { name: 'Aplicar el ajuste' }).click()
  await pagina.getByRole('button', { name: 'Directorio', exact: true }).click()
  if (!(await pagina.getByText('2.200 kcal por día, con 160 g de proteína.').isVisible())) fallas.push('ajuste: el plan del Directorio no cambió después de aplicar')
  await pagina.getByRole('button', { name: 'Progreso', exact: true }).click()
  if (await pagina.getByRole('button', { name: 'Aplicar el ajuste' }).isVisible()) fallas.push('ajuste: propone de nuevo sin esperar 14 días')
  await pagina.close()
}

await navegador.close()
if (fallas.length) {
  console.error(fallas.join('\n'))
  process.exit(1)
}
console.log('revisar: todo en orden, capturas en capturas/')
