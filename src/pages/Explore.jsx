import React, { useEffect, useState } from 'react'
import { supabase } from '../utils/supabaseClient'
import LayoutCard from '../components/LayoutCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { Search, SlidersHorizontal, Image as ImageIcon } from 'lucide-react'

export default function Explore() {
  const [layouts, setLayouts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeFarmType, setActiveFarmType] = useState('all')

  const farmTypes = [
    { value: 'all', label: 'All Farm Types' },
    { value: 'standard', label: 'Standard Farm' },
    { value: 'riverland', label: 'Riverland Farm' },
    { value: 'forest', label: 'Forest Farm' },
    { value: 'hilltop', label: 'Hill-top Farm' },
    { value: 'wilderness', label: 'Wilderness Farm' },
    { value: 'four_corners', label: 'Four Corners' },
    { value: 'beach', label: 'Beach Farm' },
    { value: 'meadowlands', label: 'Meadowlands Farm' }
  ]

  const categories = [
    { value: 'all', label: 'All Layouts' },
    { value: 'farm', label: 'Farm Layouts' },
    { value: 'animals', label: 'Animal Focus' },
    { value: 'artisan', label: 'Artisan & Processing' }
  ]

  useEffect(() => {
    async function getLayouts() {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('layouts')
          .select('*, profiles(username, avatar_url)')
          .order('created_at', { ascending: false })

        if (error) throw error
        setLayouts(data || [])
      } catch (err) {
        console.error('Error fetching layouts:', err)
        setError('Failed to load layouts. Please refresh the page.')
      } finally {
        setLoading(false)
      }
    }

    getLayouts()
  }, [])

  // Filter layouts
  const filteredLayouts = layouts.filter((layout) => {
    const matchesSearch = 
      layout.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (layout.description && layout.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      layout.farm_type.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = activeCategory === 'all' || layout.category === activeCategory
    const matchesFarmType = activeFarmType === 'all' || layout.farm_type === activeFarmType

    return matchesSearch && matchesCategory && matchesFarmType
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Intro Banner */}
      <div className="sd-panel" style={{ padding: '2rem 1.5rem', textAlign: 'center', backgroundColor: '#e5c290' }}>
        <h1 style={{ fontSize: '1.4rem', color: '#4a2c11', marginBottom: '0.8rem' }}>
          Pelican Town Layout Gallery
        </h1>
        <p className="pixel-text" style={{ fontSize: '1.4rem', color: '#5d4037', maxWidth: '800px', margin: '0 auto' }}>
          Browse, share, and export beautiful layouts designed by the community. Need inspiration? 
          Filters are below. Ready to share? Click "Share Layout" in the menu!
        </p>
      </div>

      {/* Search and Filters */}
      <div className="sd-panel">
        <div className="search-filter-section">
          {/* Search box */}
          <div className="search-box">
            <Search className="search-icon" size={18} />
            <input 
              type="text" 
              placeholder="Search layout title, description, or farm type..." 
              className="sd-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center' }}>
            {/* Category pills */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <span className="sd-label" style={{ margin: 0 }}><SlidersHorizontal size={10} /> CATEGORIES</span>
              <div className="filter-pills">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    className={`filter-pill ${activeCategory === cat.value ? 'active' : ''}`}
                    onClick={() => setActiveCategory(cat.value)}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Farm Type selection */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <span className="sd-label" style={{ margin: 0 }}><SlidersHorizontal size={10} /> FARM TYPE</span>
              <select
                className="sd-select"
                style={{ padding: '0.4rem 2rem 0.4rem 0.5rem', fontSize: '0.85rem', width: 'auto' }}
                value={activeFarmType}
                onChange={(e) => setActiveFarmType(e.target.value)}
              >
                {farmTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Content */}
      {loading ? (
        <LoadingSpinner message="Fetching layouts from the valley..." />
      ) : error ? (
        <div className="sd-alert sd-alert-error">{error}</div>
      ) : filteredLayouts.length === 0 ? (
        <div className="sd-panel" style={{ textAlign: 'center', padding: '3rem' }}>
          <ImageIcon size={48} style={{ color: '#8d6e63', marginBottom: '1rem' }} />
          <p className="pixel-text" style={{ fontSize: '1.6rem' }}>No layouts found matching your search!</p>
          <button 
            className="sd-btn sd-btn-secondary" 
            style={{ marginTop: '1rem' }}
            onClick={() => {
              setSearchTerm('')
              setActiveCategory('all')
              setActiveFarmType('all')
            }}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div>
          <h2 style={{ fontSize: '1rem', marginBottom: '1.5rem' }}>
            🌻 Shared Designs ({filteredLayouts.length})
          </h2>
          <div className="layouts-grid">
            {filteredLayouts.map((layout) => (
              <LayoutCard key={layout.id} layout={layout} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
