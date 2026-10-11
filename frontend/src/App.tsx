import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext.js'
import Login from './pages/Login'
import Register from './pages/Register.js'

function Home() {
  const { user, logout } = useAuth()
  return (
    <div className="p-8">
      <h1 className="text-xl font-medium">Hello, {user?.name}</h1>
      <button onClick={logout} className="mt-4 text-sm text-indigo-600 hover:underline">
        Log out
      </button>
    </div>
  )
}

function Protected({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? <>{children}</> : <Navigate to="/login" replace />
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Protected><Home /></Protected>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App