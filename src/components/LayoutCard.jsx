import React from 'react'
import { Link } from 'react-router-dom'
import { Eye, Hammer } from 'lucide-react'

export default function LayoutCard({ layout }) {
  // Check category badge class
  const getBadgeClass = (category) => {
    switch (category) {
      case 'animals':
        return 'sd-badge-animals'
      case 'artisan':
        return 'sd-badge-artisan'
      case 'farm':
      default:
        return 'sd-badge-farm'
    }
  }

  // Format farm type names
  const formatFarmType = (type) => {
    if (!type) return 'Standard'
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  // Resolve user profile info
  const creator = layout.profiles || { username: 'Farmer', avatar_url: '' }

  return (
    <div className="sd-panel layout-card">
      <div className="layout-card-img-wrapper">
        <img 
          src={layout.image_url} 
          alt={layout.title} 
          className="layout-card-img" 
          loading="lazy"
        />
      </div>

      <div className="layout-card-content">
        <div className="layout-card-meta">
          <span className={`sd-badge ${getBadgeClass(layout.category)}`}>
            {layout.category}
          </span>
          <span className="pixel-text" style={{ fontSize: '1rem', color: '#7d4e28' }}>
            🌾 {formatFarmType(layout.farm_type)}
          </span>
        </div>

        <h3 className="layout-card-title">{layout.title}</h3>
        <p className="layout-card-description">{layout.description || 'No description provided.'}</p>

        <div className="layout-card-footer">
          <Link to={`/profile/${layout.user_id}`} className="user-badge">
            {creator.avatar_url ? (
              <img src={creator.avatar_url} alt="Avatar" className="user-avatar" />
            ) : (
              <div className="user-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>
                {creator.username ? creator.username[0].toUpperCase() : '?' }
              </div>
            )}
            <span className="user-username">{creator.username}</span>
          </Link>

          <Link to={`/layout/${layout.id}`} className="sd-btn sd-btn-secondary" style={{ fontSize: '0.6rem', padding: '0.4rem 0.6rem' }}>
            <Eye size={12} /> View
          </Link>
        </div>
      </div>
    </div>
  )
}
