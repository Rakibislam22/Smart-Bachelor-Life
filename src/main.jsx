import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import router from './router/router.jsx'
import { RouterProvider } from 'react-router'
import HaloBackground from './component/common/HaloBackground.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HaloBackground/>
    <RouterProvider router={router} />
  </StrictMode>,
)
