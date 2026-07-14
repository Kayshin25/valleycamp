import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Explore from './pages/Explore'
import Login from './pages/Login'
import Register from './pages/Register'
import LayoutDetail from './pages/LayoutDetail'
import ShareLayout from './pages/ShareLayout'
import EditLayout from './pages/EditLayout'
import Profile from './pages/Profile'
import LoadingSpinner from './components/LoadingSpinner'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  
  if (loading) {
    return <LoadingSpinner message="Verifying credentials with Lewis..." />
  }
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

function MainLayout() {
  return (
    <div className="app-container">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Explore />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/layout/:id" element={<LayoutDetail />} />
          <Route 
            path="/share" 
            element={
              <ProtectedRoute>
                <ShareLayout />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/layout/:id/edit" 
            element={
              <ProtectedRoute>
                <EditLayout />
              </ProtectedRoute>
            } 
          />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <MainLayout />
      </BrowserRouter>
    </AuthProvider>
  )
}
