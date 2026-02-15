import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import router from './router/router.jsx'
import { RouterProvider } from 'react-router'
import HaloBackground from './component/common/HaloBackground.jsx'
import AuthProvider from './provider/AuthProvider.jsx'
import { ToastContainer } from 'react-toastify'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HaloBackground />
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
    <ToastContainer  theme="colorful" position="bottom-right"/>
  </StrictMode>,
)
