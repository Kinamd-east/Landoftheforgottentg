import React from 'react'
import { Buffer } from 'buffer';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './index.js'
const manifestUrl = `https://raw.githubusercontent.com/OiseEjemai/tonconnect-manifest-json/main/tonconnect-manifest.json`

ReactDOM.createRoot(document.getElementById('root')!).render(
  <TonConnectUIProvider manifestUrl={manifestUrl}>
    <React.StrictMode>
    <App />
  </React.StrictMode>,
  </TonConnectUIProvider>
)
