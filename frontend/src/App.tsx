import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from './store'
import routes from './routes'
import type { RouteDef } from './routes'
import * as Pages from './pages'
import { ProtectedRoute } from './components'

function renderRouteElement(
  PageComponent: React.ComponentType,
  isProtected: boolean,
) {
  if (!isProtected) {
    return <PageComponent />
  }

  return (
    <ProtectedRoute>
      <PageComponent />
    </ProtectedRoute>
  )
}

export function App() {
  const { hydrate } = useAuthStore()
  const pagesMap = Pages

  // Hydrate auth state from localStorage on app start
  useEffect(() => {
    hydrate()
  }, [hydrate])

  return (
    <BrowserRouter>
      <Routes>
        {routes.map((route: RouteDef) => {
          const { path, componentName, isProtected = false } = route
          const PageComponent = pagesMap[componentName]

          return (
            <Route
              key={path}
              path={path}
              element={renderRouteElement(PageComponent, isProtected)}
            />
          )
        })}

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
