import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../utils/supabaseClient'
import { useAuth } from '../context/AuthContext'
import LayoutCard from '../components/LayoutCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { Edit2, Save, X, Camera, Info, Image as ImageIcon } from 'lucide-react'
import confetti from 'canvas-confetti'

export default function Profile() {
  const { id } = useParams()
  const { user, profile: currentUserProfile, updateProfile, uploadAvatar, refreshProfile } = useAuth()

  const [profile, setProfile] = useState(null)
  const [layouts, setLayouts] = useState([])
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(true)
  const [error, setError] = useState(null)

  // Edit states
  const [isEditing, setIsEditing] = useState(false)
  const [editUsername, setEditUsername] = useState('')
  const [editBio, setEditBio] = useState('')
  const [saveLoading, setSaveLoading] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [successMessage, setSuccessMessage] = useState(null)

  const isOwnProfile = user && user.id === id

  // Load profile data
  useEffect(() => {
    async function loadProfile() {
      try {
        setProfileLoading(true)
        setError(null)
        
        // Fetch profile
        const { data: profileData, error: profileErr } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .single()

        if (profileErr) throw profileErr
        
        setProfile(profileData)
        setEditUsername(profileData.username || '')
        setEditBio(profileData.bio || '')
      } catch (err) {
        console.error('Error fetching profile:', err)
        setError('Failed to load profile. This user might not exist.')
      } finally {
        setProfileLoading(false)
      }
    }

    loadProfile()
  }, [id])

  // Load layouts by user
  useEffect(() => {
    async function loadUserLayouts() {
      try {
        setLoading(true)
        const { data, error: layoutsErr } = await supabase
          .from('layouts')
          .select('*, profiles(username, avatar_url)')
          .eq('user_id', id)
          .order('created_at', { ascending: false })

        if (layoutsErr) throw layoutsErr
        setLayouts(data || [])
      } catch (err) {
        console.error('Error fetching user layouts:', err)
      } finally {
        setLoading(false)
      }
    }

    loadUserLayouts()
  }, [id])

  // Monitor Auth context changes if own profile
  useEffect(() => {
    if (isOwnProfile && currentUserProfile) {
      setProfile(currentUserProfile)
    }
  }, [currentUserProfile, isOwnProfile])

  const handleProfileSave = async (e) => {
    e.preventDefault()
    setSaveLoading(true)
    setError(null)
    setSuccessMessage(null)

    if (editUsername.trim().length < 3) {
      setError('Username must be at least 3 characters long.')
      setSaveLoading(false)
      return
    }

    try {
      await updateProfile({
        username: editUsername.trim(),
        bio: editBio.trim()
      })

      // Refetch profile data to sync
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single()
      
      setProfile(data)
      setIsEditing(false)
      setSuccessMessage('Profile updated successfully!')
      
      confetti({
        particleCount: 80,
        spread: 50,
        origin: { y: 0.8 }
      })

      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Failed to update profile. Username might be taken.')
    } finally {
      setSaveLoading(false)
    }
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      alert('Avatar image is too large! Maximum size is 2MB.')
      return
    }

    setAvatarUploading(true)
    setError(null)

    try {
      const publicUrl = await uploadAvatar(file)
      await updateProfile({ avatar_url: publicUrl })
      
      // Sync local profile state
      setProfile(prev => ({ ...prev, avatar_url: publicUrl }))
      setSuccessMessage('Avatar updated successfully!')
      
      confetti({
        particleCount: 50,
        spread: 40,
        origin: { y: 0.8 }
      })

      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      console.error(err)
      setError('Failed to upload avatar: ' + (err.message || 'Please check your connection.'))
    } finally {
      setAvatarUploading(false)
    }
  }

  if (profileLoading) return <LoadingSpinner message="Entering the farmhouse..." />
  if (error && !profile) return <div className="sd-panel sd-alert sd-alert-error" style={{ margin: '2rem auto', maxWidth: '600px' }}>{error}</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Success Alert */}
      {successMessage && (
        <div className="sd-alert sd-alert-success">
          <span>{successMessage}</span>
        </div>
      )}

      {/* Profile Info Header */}
      <div className="sd-panel">
        <div className="profile-header">
          {/* Avatar Container */}
          <div style={{ position: 'relative' }}>
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="profile-avatar-large" />
            ) : (
              <div className="profile-avatar-large" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', fontWeight: 'bold' }}>
                {profile?.username ? profile.username[0].toUpperCase() : '?'}
              </div>
            )}
            
            {/* Avatar upload overlay */}
            {isOwnProfile && (
              <label 
                htmlFor="avatarFile" 
                style={{ 
                  position: 'absolute', 
                  bottom: '5px', 
                  right: '5px', 
                  backgroundColor: '#7d4e28', 
                  border: '2px solid #3a1f04',
                  color: 'white', 
                  borderRadius: '50%', 
                  width: '32px', 
                  height: '32px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  cursor: 'pointer',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                }}
                title="Change Avatar"
              >
                <Camera size={14} />
                <input 
                  type="file" 
                  id="avatarFile" 
                  style={{ display: 'none' }} 
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={avatarUploading}
                />
              </label>
            )}
          </div>

          {/* Profile details */}
          <div style={{ flex: 1 }}>
            {!isEditing ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <h2 className="pixel-text" style={{ fontSize: '2rem', color: '#4a2c11' }}>
                    🧑‍🌾 {profile?.username}
                  </h2>
                  {isOwnProfile && (
                    <button 
                      onClick={() => setIsEditing(true)} 
                      className="sd-btn sd-btn-secondary" 
                      style={{ fontSize: '0.6rem', padding: '0.35rem 0.6rem' }}
                    >
                      <Edit2 size={10} /> Edit Profile
                    </button>
                  )}
                </div>
                <p className="profile-bio">
                  {profile?.bio || 'This farmer has no biography yet.'}
                </p>
              </>
            ) : (
              <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <label className="sd-label" htmlFor="editUsername">Username</label>
                  <input 
                    type="text" 
                    id="editUsername"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="sd-input"
                    required
                    minLength={3}
                  />
                </div>
                <div>
                  <label className="sd-label" htmlFor="editBio">Farmer Biography</label>
                  <textarea 
                    id="editBio"
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    className="sd-textarea"
                    style={{ minHeight: '80px' }}
                    placeholder="Write something about your farm, layout styles, mods, etc..."
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    type="submit" 
                    className="sd-btn" 
                    style={{ fontSize: '0.65rem', padding: '0.5rem 0.8rem' }}
                    disabled={saveLoading}
                  >
                    <Save size={12} /> {saveLoading ? 'Saving...' : 'Save Profile'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      setIsEditing(false)
                      setEditUsername(profile?.username || '')
                      setEditBio(profile?.bio || '')
                    }} 
                    className="sd-btn sd-btn-secondary" 
                    style={{ fontSize: '0.65rem', padding: '0.5rem 0.8rem' }}
                  >
                    <X size={12} /> Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* User's layouts grid */}
      <div>
        <h2 style={{ fontSize: '1rem', marginBottom: '1.5rem' }}>
          🌾 {isOwnProfile ? 'My Farm Designs' : `${profile?.username}'s Designs`} ({layouts.length})
        </h2>

        {loading ? (
          <LoadingSpinner message="Checking the barns..." />
        ) : layouts.length === 0 ? (
          <div className="sd-panel" style={{ textAlign: 'center', padding: '3rem' }}>
            <ImageIcon size={48} style={{ color: '#8d6e63', marginBottom: '1rem' }} />
            <p className="pixel-text" style={{ fontSize: '1.6rem' }}>This farmer hasn't shared any layouts yet!</p>
            {isOwnProfile && (
              <Link to="/share" className="sd-btn" style={{ marginTop: '1rem' }}>
                Share Your First Design
              </Link>
            )}
          </div>
        ) : (
          <div className="layouts-grid">
            {layouts.map((layout) => (
              <LayoutCard key={layout.id} layout={layout} />
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
