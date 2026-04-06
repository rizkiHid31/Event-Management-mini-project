import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Apply theme before paint to avoid flash
const stored = localStorage.getItem("theme");
if (stored === "light") document.documentElement.classList.add("light");

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
