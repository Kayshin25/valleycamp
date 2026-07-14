import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../utils/supabaseClient'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'
import { Calendar, Download, Edit, Trash2, ArrowLeft, ExternalLink, Copy, Check } from 'lucide-react'
import confetti from 'canvas-confetti'

export default function LayoutDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [layout, setLayout] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function getLayoutDetails() {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('layouts')
          .select('*, profiles(username, avatar_url)')
          .eq('id', id)
          .single()

        if (error) throw error
        setLayout(data)
      } catch (err) {
        console.error('Error fetching layout:', err)
        setError('Layout not found or failed to load.')
      } finally {
        setLoading(false)
      }
    }

    getLayoutDetails()
  }, [id])

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this farm layout? This cannot be undone!')) {
      return
    }

    try {
      setDeleteLoading(true)
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token

      const { data, error } = await supabase.functions.invoke('layout-service', {
        body: { action: 'delete', id },
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (error) throw new Error(error.message || 'Failed to delete layout')
      if (data && data.error) throw new Error(data.error)

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 }
      })

      navigate('/')
    } catch (err) {
      console.error('Error deleting layout:', err)
      alert(err.message || 'An error occurred during deletion.')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleDownloadPlanner = () => {
    if (!layout?.planner_data) return

    let textToDownload = layout.planner_data
    // Check if JSON
    try {
      const parsed = JSON.parse(layout.planner_data)
      textToDownload = JSON.stringify(parsed, null, 2)
    } catch (e) {
      // Keep as is (plain text/url)
    }

    const blob = new Blob([textToDownload], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${layout.title.replace(/\s+/g, '_')}_planner_data.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleCopyPlannerData = () => {
    if (!layout?.planner_data) return
    navigator.clipboard.writeText(layout.planner_data)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatFarmType = (type) => {
    if (!type) return 'Standard'
    return type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  if (loading) return <LoadingSpinner message="Walking down the farm path..." />
  if (error) return <div className="sd-panel sd-alert sd-alert-error" style={{ margin: '2rem auto', maxWidth: '600px' }}>{error}</div>
  if (!layout) return null

  const isOwner = user && user.id === layout.user_id
  const creator = layout.profiles || { username: 'Farmer', avatar_url: '' }

  const isPlannerUrl = layout.planner_data && (layout.planner_data.startsWith('http://') || layout.planner_data.startsWith('https://'))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Back button */}
      <div>
        <Link to="/" className="sd-btn sd-btn-secondary" style={{ fontSize: '0.65rem', padding: '0.5rem 0.8rem' }}>
          <ArrowLeft size={14} /> Back to explore
        </Link>
      </div>

      <div className="sd-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>{layout.title}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', fontSize: '0.9rem', color: '#5d4037' }}>
              <span className={`sd-badge sd-badge-${layout.category}`}>{layout.category}</span>
              <span>🌾 {formatFarmType(layout.farm_type)}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Calendar size={14} /> {new Date(layout.created_at).toLocaleDateString('en-US', { dateStyle: 'medium' })}
              </span>
            </div>
          </div>

          {/* Owner controls */}
          {isOwner && (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link to={`/layout/${layout.id}/edit`} className="sd-btn sd-btn-secondary" style={{ fontSize: '0.65rem', padding: '0.5rem 0.8rem' }}>
                <Edit size={14} /> Edit
              </Link>
              <button 
                onClick={handleDelete} 
                className="sd-btn sd-btn-danger" 
                style={{ fontSize: '0.65rem', padding: '0.5rem 0.8rem' }}
                disabled={deleteLoading}
              >
                <Trash2 size={14} /> {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          )}
        </div>

        {/* Layout details */}
        <div className="detail-layout">
          {/* Left panel: Image */}
          <div className="detail-img-container">
            <img src={layout.image_url} alt={layout.title} className="detail-img" />
          </div>

          {/* Right panel: Info & Stardew Planner integrations */}
          <div className="detail-info">
            {/* Creator info */}
            <div className="sd-panel-inner" style={{ padding: '1rem' }}>
              <span className="sd-label" style={{ fontSize: '0.65rem' }}>CREATED BY</span>
              <Link to={`/profile/${layout.user_id}`} className="user-badge" style={{ marginTop: '0.5rem' }}>
                {creator.avatar_url ? (
                  <img src={creator.avatar_url} alt="Avatar" className="user-avatar" style={{ width: '40px', height: '40px' }} />
                ) : (
                  <div className="user-avatar" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                    {creator.username ? creator.username[0].toUpperCase() : '?' }
                  </div>
                )}
                <div>
                  <div className="user-username" style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{creator.username}</div>
                  <div style={{ fontSize: '0.75rem', color: '#7d4e28' }}>View other layouts</div>
                </div>
              </Link>
            </div>

            {/* Description */}
            <div className="sd-panel-inner" style={{ padding: '1rem' }}>
              <span className="sd-label" style={{ fontSize: '0.65rem' }}>DESCRIPTION</span>
              <p style={{ marginTop: '0.5rem', lineHeight: '1.6', color: '#4a2c11' }}>
                {layout.description || 'No description provided for this farm layout.'}
              </p>
            </div>

            {/* Stardew Planner Integration Box */}
            <div className="planner-integration-box">
              <h3 style={{ fontSize: '0.8rem', color: '#1f618d', marginBottom: '0.5rem' }}>🧭 Stardew Planner Info</h3>
              
              {layout.planner_data ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <p style={{ fontSize: '0.85rem', color: '#2c3e50', lineHeight: '1.4' }}>
                    This layout includes custom design data. You can import it into the interactive planner to modify it yourself!
                  </p>

                  {isPlannerUrl ? (
                    <a 
                      href={layout.planner_data} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="sd-btn sd-btn-success" 
                      style={{ width: '100%', justifyContent: 'center', fontSize: '0.65rem' }}
                    >
                      <ExternalLink size={14} /> Open Design Link <ExternalLink size={12} />
                    </a>
                  ) : (
                    <>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          onClick={handleDownloadPlanner}
                          className="sd-btn sd-btn-success" 
                          style={{ flex: 1, justifyContent: 'center', fontSize: '0.65rem', padding: '0.5rem' }}
                        >
                          <Download size={14} /> Download JSON
                        </button>
                        <button 
                          onClick={handleCopyPlannerData}
                          className="sd-btn sd-btn-secondary" 
                          style={{ flex: 1, justifyContent: 'center', fontSize: '0.65rem', padding: '0.5rem' }}
                          title="Copy JSON to Clipboard"
                        >
                          {copied ? <Check size={14} /> : <Copy size={14} />} 
                          {copied ? 'Copied!' : 'Copy Code'}
                        </button>
                      </div>

                      <div style={{ fontSize: '0.8rem', color: '#4d5656', borderTop: '1px dashed #a9dfbf', paddingTop: '0.6rem', marginTop: '0.2rem' }}>
                        <strong>How to import:</strong>
                        <ol style={{ paddingLeft: '1.1rem', marginTop: '0.25rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          <li>Click "Download JSON" to save the plan.</li>
                          <li>Open <a href="https://stardewplanner.com" target="_blank" rel="noopener noreferrer" style={{ color: '#d35400', fontWeight: 'bold' }}>stardewplanner.com</a>.</li>
                          <li>Click "Import" in the top header and upload the downloaded file.</li>
                        </ol>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <p style={{ fontSize: '0.85rem', color: '#566573', fontStyle: 'italic' }}>
                    No planner design data was provided for this layout.
                  </p>
                  <a 
                    href="https://stardewplanner.com/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="sd-btn sd-btn-secondary" 
                    style={{ width: '100%', justifyContent: 'center', fontSize: '0.65rem' }}
                  >
                    Create a plan at Stardew Planner
                  </a>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
