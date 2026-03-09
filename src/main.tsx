// @ts-ignore
window.process = {
  env: {
    LMS_NO_FANCY_ERRORS: 'true'
  }
};

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './animation.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
