import React from 'react'
import { Buffer } from 'buffer';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './index.js'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <TonConnectUIProvider manifestUrl='http://localhost:5173/tonconnect-manifest.json'>
    <React.StrictMode>
    <App />
  </React.StrictMode>,
  </TonConnectUIProvider>
)
