import { ChakraProvider } from '@chakra-ui/react'
import { AuthProvider } from './context/AuthContext'
import { OpenAPI } from './client'
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { system } from './theme'
import ErrorBoundary from './components/common/ErrorBoundary'

async function enableMocking() {
  if (process.env.NODE_ENV !== 'development') {
    return
  }

  const { worker } = await import('./mocks/browser')

  // `worker.start()` returns a Promise that resolves
  // once the Service Worker is up and ready to intercept requests.
  return worker.start({
    serviceWorker: {
      url: '/recipes/mockServiceWorker.js',
    },
  })
}


OpenAPI.BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster, Box, Text } from '@chakra-ui/react'
import { toaster } from './toaster'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ChakraProvider value={system}>
          <ErrorBoundary>
            <AuthProvider>
              <App />
              <Toaster toaster={toaster}>
                {(toast) => (
                  <Box p={3} bg={toast.type === 'error' ? 'red.100' : 'green.100'} color="black" borderRadius="md" boxShadow="lg" m={2}>
                    <Text fontWeight="bold">{toast.title}</Text>
                    {toast.description && <Text>{toast.description}</Text>}
                  </Box>
                )}
              </Toaster>
            </AuthProvider>
          </ErrorBoundary>
        </ChakraProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </StrictMode>,
  )
})
