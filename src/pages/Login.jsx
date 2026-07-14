import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../utils/supabaseClient'
import { LogIn, Mail } from 'lucide-react'

export default function Login() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [emailUnconfirmed, setEmailUnconfirmed] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSent, setResendSent] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setEmailUnconfirmed(false)
    setResendSent(false)
    setLoading(true)

    try {
      await signIn(email, password)
      navigate('/')
    } catch (err) {
      console.error(err)
      const msg = err.message || ''
      if (msg.toLowerCase().includes('email not confirmed')) {
        setEmailUnconfirmed(true)
        setError('Your email address has not been confirmed yet. Please check your inbox and click the confirmation link.')
      } else if (msg.toLowerCase().includes('invalid login credentials') || msg.toLowerCase().includes('invalid credentials')) {
        setError('Incorrect email or password. Please try again.')
      } else {
        setError(msg || 'Failed to sign in. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResendConfirmation = async () => {
    setResendLoading(true)
    try {
      const { error } = await supabase.auth.resend({ type: 'signup', email })
      if (error) throw error
      setResendSent(true)
    } catch (err) {
      setError('Failed to resend confirmation email. Please try again.')
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '450px', margin: '4rem auto' }}>
      <div className="sd-panel">
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '1.2rem' }}>
          🧑‍🌾 Sign In
        </h2>

        {error && (
          <div className="sd-alert sd-alert-error" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.6rem' }}>
            <span>{error}</span>
            {emailUnconfirmed && !resendSent && (
              <button
                type="button"
                onClick={handleResendConfirmation}
                disabled={resendLoading}
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#ff8a80', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem', textDecoration: 'underline' }}
              >
                <Mail size={13} /> {resendLoading ? 'Sending...' : 'Resend confirmation email'}
              </button>
            )}
            {resendSent && (
              <span style={{ fontSize: '0.85rem', color: '#a5d6a7' }}>✅ Confirmation email sent! Check your inbox.</span>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="sd-panel-inner" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label className="sd-label" htmlFor="email">Email Address</label>
            <input 
              type="email" 
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="sd-input"
              required 
              placeholder="farmer@pelican.town"
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label className="sd-label" htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="sd-input"
              required 
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            className="sd-btn" 
            style={{ width: '100%', justifyContent: 'center' }}
            disabled={loading}
          >
            <LogIn size={16} /> {loading ? 'Signing In...' : 'Enter Farm'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          New here?{' '}
          <Link to="/register">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}
