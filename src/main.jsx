import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'
import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";



createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <Theme  accentColor='green'>
        <App />
      </Theme>
    </HashRouter>
  </StrictMode>,
)
