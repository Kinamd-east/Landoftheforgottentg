import React from 'react'
import { Buffer } from 'buffer';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './index.js'
const manifestUrl = `${process.env.VITE_API_URL}/tonconnect-manifest.json`

ReactDOM.createRoot(document.getElementById('root')!).render(
  <TonConnectUIProvider manifestUrl={manifestUrl}>
    <React.StrictMode>
    <App />
  </React.StrictMode>,
  </TonConnectUIProvider>
)
