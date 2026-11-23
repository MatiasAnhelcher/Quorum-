import '@fontsource-variable/bricolage-grotesque'
import '@fontsource-variable/inter'
import './estilos.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { aplicarTema, cargarTema } from './datos/almacen'

// El tema elegido se aplica antes de dibujar, para que no parpadee el otro.
aplicarTema(cargarTema(), false)

// Sin conexión: el service worker guarda la app entera en el teléfono. Solo en la versión publicada.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      // Sin service worker la app funciona igual, solo que necesita conexión para abrir.
    })
  })
}

createRoot(document.getElementById('raiz')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
