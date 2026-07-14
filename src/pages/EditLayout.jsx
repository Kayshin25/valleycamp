import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../utils/supabaseClient'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'
import { Upload, ArrowLeft, Save, AlertTriangle } from 'lucide-react'
import confetti from 'canvas-confetti'

export default function EditLayout() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('farm')
  const [farmType, setFarmType] = useState('standard')
  const [plannerData, setPlannerData] = useState('')
  const [existingImageUrl, setExistingImageUrl] = useState('')
  
  const [imagePreview, setImagePreview] = useState(null)
  const [base64Image, setBase64Image] = useState(null)
  
  const [fetching, setFetching] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const farmTypes = [
    { value: 'standard', label: 'Standard Farm' },
    { value: 'riverland', label: 'Riverland Farm' },
    { value: 'forest', label: 'Forest Farm' },
    { value: 'hilltop', label: 'Hill-top Farm' },
    { value: 'wilderness', label: 'Wilderness Farm' },
    { value: 'four_corners', label: 'Four Corners' },
    { value: 'beach', label: 'Beach Farm' },
    { value: 'meadowlands', label: 'Meadowlands Farm' }
  ]

  useEffect(() => {
    async function getLayoutDetails() {
      try {
        setFetching(true)
        const { data, error } = await supabase
          .from('layouts')
          .select('*')
          .eq('id', id)
          .single()

        if (error) throw error
        
        if (data) {
          setTitle(data.title)
          setDescription(data.description || '')
          setCategory(data.category)
          setFarmType(data.farm_type)
          setPlannerData(data.planner_data || '')
          setExistingImageUrl(data.image_url)
          
          // Guard ownership
          if (user && user.id !== data.user_id) {
            setError('You do not have permission to edit this layout.')
          }
        }
      } catch (err) {
        console.error('Error fetching layout detail:', err)
        setError('Failed to load layout details.')
      } finally {
        setFetching(false)
      }
    }

    if (user) {
      getLayoutDetails()
    } else {
      setFetching(false)
      setError('You must be logged in to edit layouts.')
    }
  }, [id, user])

  const handleImageChange = (e) => {
    setError(null)
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setError('Image file is too large! Maximum size is 5MB.')
      return
    }

    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed!')
      return
    }

    setImagePreview(URL.createObjectURL(file))

    const reader = new FileReader()
    reader.onloadend = () => {
      setBase64Image(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (title.trim().length < 3) {
      setError('Title must be at least 3 characters long.')
      return
    }

    setLoading(true)

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token

      if (!token) throw new Error('Session token not found. Please log in again.')

      const { data, error: functionError } = await supabase.functions.invoke('layout-service', {
        body: {
          action: 'edit',
          id,
          title: title.trim(),
          description: description.trim(),
          category,
          farm_type: farmType,
          planner_data: plannerData.trim(),
          image: base64Image // sends null if not changed, Edge Function handles it
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (functionError) throw new Error(functionError.message || 'Function execution failed')
      if (data && data.error) throw new Error(data.error)

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })

      navigate(`/layout/${id}`)

    } catch (err) {
      console.error('Error editing layout:', err)
      setError(err.message || 'An error occurred during updating. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return <LoadingSpinner message="Retrieving design documents..." />

  return (
    <div style={{ maxWidth: '750px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to={`/layout/${id}`} className="sd-btn sd-btn-secondary" style={{ fontSize: '0.65rem', padding: '0.5rem 0.8rem' }}>
          <ArrowLeft size={14} /> Back to details
        </Link>
      </div>

      <div className="sd-panel">
        <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', textAlign: 'center' }}>
          🪵 Edit Farm Design 🪵
        </h2>

        {error ? (
          <div className="sd-alert sd-alert-error" style={{ marginBottom: '1.5rem' }}>
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="sd-panel-inner" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Title */}
            <div>
              <label className="sd-label" htmlFor="title">Layout Title</label>
              <input 
                type="text" 
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="sd-input"
                required 
                placeholder="e.g. My Cozy Year 3 Forest Farm Layout"
                minLength={3}
                maxLength={100}
              />
            </div>

            {/* Grid for Dropdowns */}
            <div className="grid-2">
              <div>
                <label className="sd-label" htmlFor="category">Category</label>
                <select 
                  id="category" 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                  className="sd-select"
                >
                  <option value="farm">Farm Layout</option>
                  <option value="animals">Animals Focus</option>
                  <option value="artisan">Artisan & Processing</option>
                </select>
              </div>

              <div>
                <label className="sd-label" htmlFor="farmType">Farm Type</label>
                <select 
                  id="farmType" 
                  value={farmType} 
                  onChange={(e) => setFarmType(e.target.value)}
                  className="sd-select"
                >
                  {farmTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="sd-label" htmlFor="description">Description</label>
              <textarea 
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="sd-textarea"
                placeholder="Tell other farmers about your design! Mention what mods you used, your design ideas, or key highlights..."
                maxLength={1000}
              />
            </div>

            {/* Image Upload Zone */}
            <div>
              <label className="sd-label">Replace Farm Screenshot (Optional)</label>
              <div className="file-upload-zone" onClick={() => document.getElementById('imageFile').click()}>
                <Upload size={32} style={{ color: '#8d6e63' }} />
                <div className="pixel-text" style={{ fontSize: '1.2rem' }}>Click or drop files here to upload a new image</div>
                <div style={{ fontSize: '0.75rem', color: '#7f8c8d' }}>Leave empty to keep current screenshot</div>
                <input 
                  type="file" 
                  id="imageFile" 
                  style={{ display: 'none' }} 
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>

              {/* Show current image or new preview */}
              <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <span className="sd-label" style={{ fontSize: '0.65rem' }}>
                  {imagePreview ? 'NEW SCREENSHOT PREVIEW' : 'CURRENT SCREENSHOT'}
                </span>
                <div className="file-preview-container">
                  <img 
                    src={imagePreview || existingImageUrl} 
                    alt="Farm Preview" 
                    className="file-preview-img" 
                  />
                </div>
              </div>
            </div>

            {/* Stardew Planner Data */}
            <div>
              <label className="sd-label" htmlFor="plannerData">Stardew Planner Save Data</label>
              <textarea 
                id="plannerData"
                value={plannerData}
                onChange={(e) => setPlannerData(e.target.value)}
                className="sd-textarea"
                style={{ minHeight: '80px', fontFamily: 'monospace', fontSize: '0.85rem' }}
                placeholder="Paste the JSON export string or shareable link from stardewplanner.com"
              />
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="sd-btn" 
              style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}
              disabled={loading}
            >
              <Save size={16} /> {loading ? 'Saving Changes...' : 'Save Design Changes'}
            </button>

          </form>
        )}
      </div>
    </div>
  )
}
