import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Editor from './pages/Editor'
import Join from './pages/Join'

function Protected({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? <>{children}</> : <Navigate to="/login" replace />
}

// logged in: your boards. logged out: the landing page
function Home() {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? <Dashboard /> : <Landing />
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/join/:code" element={<Join />} />
          <Route
            path="/doc/:id"
            element={
              <Protected>
                <Editor />
              </Protected>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App