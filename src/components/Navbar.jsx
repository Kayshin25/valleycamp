import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LogOut, Compass, PlusCircle } from 'lucide-react'
import siteConfig from '../siteConfig'

export default function Navbar() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await signOut()
      navigate('/login')
    } catch (err) {
      console.error('Failed to log out:', err)
    }
  }

  return (
    <nav className="navbar">
      {/* Brand */}
      <Link to="/" className="nav-brand">
        {siteConfig.logo ? (
          <img
            src={siteConfig.logo}
            alt={siteConfig.logoAlt || 'Logo'}
            className="nav-logo-img"
          />
        ) : (
          <span className="nav-logo-fallback">🌾</span>
        )}
        <span className="nav-title">
          {siteConfig.siteName}
        </span>
      </Link>

      {/* Navigation links */}
      <div className="nav-links">
        <Link to="/" className="sd-btn sd-btn-ghost">
          <Compass size={15} /> Explore
        </Link>

        {user ? (
          <>
            <Link to="/share" className="sd-btn">
              <PlusCircle size={15} /> Share
            </Link>

            <Link to={`/profile/${user.id}`} className="user-badge" style={{ marginLeft: '0.25rem' }}>
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="user-avatar" />
              ) : (
                <div className="user-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.75rem', color: 'var(--accent)' }}>
                  {profile?.username ? profile.username[0].toUpperCase() : '?'}
                </div>
              )}
              <span className="user-username" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                {profile?.username || 'Farmer'}
              </span>
            </Link>

            <button
              onClick={handleLogout}
              className="sd-btn sd-btn-ghost"
              title="Sign out"
              style={{ padding: '0.5rem 0.6rem' }}
            >
              <LogOut size={15} />
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="sd-btn sd-btn-secondary">
              Sign In
            </Link>
            <Link to="/register" className="sd-btn">
              Join Valley
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
