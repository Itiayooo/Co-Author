import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom'
import type { ReactNode } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'

function Protected({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? <>{children}</> : <Navigate to="/login" replace />
}

function EditorPlaceholder() {
  const { id } = useParams()
  return <div className="p-8">Editor for {id} coming soon</div>
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Protected><Dashboard /></Protected>} />
          <Route path="/doc/:id" element={<Protected><EditorPlaceholder /></Protected>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App