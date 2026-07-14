import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { UserPlus } from 'lucide-react'

export default function Register() {
  const { signUp } = useAuth()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters long.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      await signUp(email, password, username.trim())
      setSuccess(true)
      // Wait 3 seconds and navigate to login
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Failed to sign up. Email might already be taken.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '450px', margin: '4rem auto' }}>
      <div className="sd-panel">
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '1.2rem' }}>
          🧑‍🌾 Register Farmer
        </h2>

        {error && (
          <div className="sd-alert sd-alert-error">
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="sd-alert sd-alert-success">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <span style={{ fontWeight: 600 }}>Account created! 🎉</span>
              <span style={{ fontSize: '0.875rem' }}>
                A confirmation email has been sent to <strong>{email}</strong>. Click the link in the email to activate your account, then sign in.
              </span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="sd-panel-inner" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ marginBottom: '0.75rem' }}>
            <label className="sd-label" htmlFor="username">Username</label>
            <input 
              type="text" 
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="sd-input"
              required 
              placeholder="e.g. Robin"
              minLength={3}
            />
          </div>

          <div style={{ marginBottom: '0.75rem' }}>
            <label className="sd-label" htmlFor="email">Email Address</label>
            <input 
              type="email" 
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="sd-input"
              required 
              placeholder="robin@carpenter.town"
            />
          </div>

          <div style={{ marginBottom: '0.75rem' }}>
            <label className="sd-label" htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="sd-input"
              required 
              placeholder="••••••••"
              minLength={6}
            />
          </div>

          <div style={{ marginBottom: '1.2rem' }}>
            <label className="sd-label" htmlFor="confirmPassword">Confirm Password</label>
            <input 
              type="password" 
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="sd-input"
              required 
              placeholder="••••••••"
              minLength={6}
            />
          </div>

          <button 
            type="submit" 
            className="sd-btn" 
            style={{ width: '100%', justifyContent: 'center' }}
            disabled={loading || success}
          >
            <UserPlus size={16} /> {loading ? 'Signing Up...' : 'Join Valley'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
