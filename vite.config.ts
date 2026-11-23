import { createHash } from 'node:crypto'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Genera sw.js al compilar, con la lista exacta de archivos de esa versión.
 * Así la app abre sin conexión desde la primera visita y cada versión nueva reemplaza limpia a la anterior.
 */
function sinConexion(): Plugin {
  return {
    name: 'quorum-sin-conexion',
    apply: 'build',
    generateBundle(_opciones, paquete) {
      const archivos = ['./', './manifest.webmanifest', './icono.svg', ...Object.keys(paquete)
        // La app está en español: las tipografías de otros alfabetos se bajan solo si hacen falta, no se guardan de entrada.
        .filter((nombre) => !/-(cyrillic|greek|vietnamese)/.test(nombre))
        .map((nombre) => `./${nombre}`)]
      const version = createHash('sha256').update(archivos.join('|')).digest('hex').slice(0, 12)
      const codigo = `// Generado al compilar. No editar: sale de vite.config.ts.
const CACHE = 'quorum-${version}'
const ARCHIVOS = ${JSON.stringify(archivos)}
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()))
})
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((claves) => Promise.all(claves.filter((k) => k.startsWith('quorum-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})
self.addEventListener('fetch', (e) => {
  const pedido = e.request
  if (pedido.method !== 'GET' || new URL(pedido.url).origin !== self.location.origin) return
  // La página se pide primero a la red para recibir versiones nuevas; sin conexión sale la guardada.
  if (pedido.mode === 'navigate') {
    e.respondWith(fetch(pedido).catch(() => caches.match('./', { cacheName: CACHE })))
    return
  }
  // ignoreVary: los archivos llevan huella en el nombre, así que la cabecera Vary del servidor no cambia el contenido.
  e.respondWith(caches.match(pedido, { cacheName: CACHE, ignoreVary: true }).then((guardado) => guardado ?? fetch(pedido)))
})
`
      this.emitFile({ type: 'asset', fileName: 'sw.js', source: codigo })
    },
  }
}

// base relativa: la app funciona igual en GitHub Pages (subcarpeta) que en la raíz de un dominio.
export default defineConfig({
  base: './',
  plugins: [react(), sinConexion()],
})
