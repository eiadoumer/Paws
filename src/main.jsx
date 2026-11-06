import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* BrowserRouter lets every component inside use links and read the URL */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
