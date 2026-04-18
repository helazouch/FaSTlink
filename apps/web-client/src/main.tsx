import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'
import { queryClient } from './config/queryClient'
import { AppRuntimeProvider } from './providers/AppRuntimeProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppRuntimeProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AppRuntimeProvider>
    </QueryClientProvider>
  </StrictMode>,
)
