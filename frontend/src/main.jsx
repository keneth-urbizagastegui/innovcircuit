import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { Toaster } from 'sonner'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <App />
          <Toaster 
            position="top-right"
            toastOptions={{
              style: {
                background: '#0F172A',
                color: '#fff',
                border: '1px solid #1E293B'
              },
              success: {
                style: {
                  background: '#065F46',
                  border: '1px solid #059669'
                }
              },
              error: {
                style: {
                  background: '#991B1B',
                  border: '1px solid #DC2626'
                }
              }
            }}
          />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
