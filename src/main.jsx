import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './index.css'
import App from './App.jsx'
import { AppDataProvider } from './context/AppDataContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* BrowserRouter lets every component inside use links and read the URL */}
    <BrowserRouter>
      <AppDataProvider>
        <App />
      </AppDataProvider>
    </BrowserRouter>
  </StrictMode>,
)
