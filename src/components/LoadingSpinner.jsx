import React from 'react'

export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="loading-container">
      <div className="pixel-spinner"></div>
      <p className="pixel-text" style={{ color: '#efebe9', fontSize: '1.8rem', textShadow: '2px 2px 0px #000' }}>
        {message}
      </p>
    </div>
  )
}
