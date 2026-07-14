import React from 'react'
import siteConfig from '../siteConfig'

export default function Footer() {
  return (
    <footer style={{
      marginTop: '4rem',
      padding: '1.5rem 1.25rem',
      borderTop: '1px solid rgba(106, 191, 105, 0.12)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.5rem',
      textAlign: 'center',
    }}>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
        {siteConfig.tagline}
      </p>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        Design your layout at{' '}
        <a
          href="https://stardewplanner.com/"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--accent)', fontWeight: 500 }}
        >
          stardewplanner.com
        </a>
        {' '}then share it here.
      </p>
    </footer>
  )
}
