/**
 * ============================================================
 *  SITE CONFIG — Edit this file to customize your branding
 * ============================================================
 *
 * LOGO
 *   Opsi A — File di src/assets/ (DIREKOMENDASIKAN):
 *     Import dulu di baris bawah ini, lalu set logo: logoImg
 *   Opsi B — File di public/ :
 *     Hapus import, set logo: '/namafile.png' (string)
 *     Set null untuk pakai emoji fallback (🌾)
 *
 * BACKGROUND
 *   bgImage: path ke file di public/ (string), atau null.
 *   bgColor: warna fallback CSS.
 *
 * SITE_NAME / TAGLINE
 *   Muncul di Navbar dan tab browser.
 * ============================================================
 */

import logoImg from './assets/logo.png'

const siteConfig = {
  /** Display name shown in navbar & page title */
  siteName: 'Valleycamp',

  /** Short tagline shown on the explore / hero section */
  tagline: 'Discover & share Stardew Valley farm layouts',

  /**
   * Logo.
   * - Pakai import (src/assets): set nilai ke variabel import di atas → logoImg
   * - Pakai public/           : set string path  → '/logo.png'
   * - Nonaktifkan             : set null          → null (pakai emoji 🌾)
   */
  logo: logoImg,

  /** Alt text for the logo image (accessibility) */
  logoAlt: 'Valleycamp logo',

  /**
   * Page background settings.
   * bgImage: path to image in /public, or null for none.
   * bgColor: CSS color string used as fallback / solid bg.
   * bgRepeat: CSS background-repeat value ('repeat' | 'no-repeat' | 'cover')
   * bgSize: CSS background-size value ('auto' | 'cover' | 'contain')
   */
  background: {
    bgColor: '#0f1a12',         // dark forest green
    bgImage: '/bg.png',         // set to null to disable image
    bgRepeat: 'repeat',
    bgSize: 'auto',
  },

  /** Accent color used for highlights, active states, and CTAs */
  accentColor: '#6abf69',

  /** Brand color used for primary buttons */
  brandColor: '#4e9a5e',
}

export default siteConfig
