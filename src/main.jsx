import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import siteConfig from './siteConfig.js'

// Apply siteConfig to CSS custom properties so background & accent
// from siteConfig.js are reflected across the whole app.
const root = document.documentElement
const { background, accentColor, brandColor } = siteConfig

root.style.setProperty('--bg-color', background.bgColor || '#0f1a12')
root.style.setProperty('--bg-image', background.bgImage ? `url('${background.bgImage}')` : 'none')
root.style.setProperty('--bg-repeat', background.bgRepeat || 'repeat')
root.style.setProperty('--bg-size', background.bgSize || 'auto')
if (accentColor) root.style.setProperty('--accent', accentColor)
if (brandColor)  root.style.setProperty('--accent-dim', brandColor)

// Set the browser tab title
document.title = siteConfig.siteName

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
