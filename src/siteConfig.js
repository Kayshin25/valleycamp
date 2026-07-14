/**
 * ============================================================
 *  SITE CONFIG — Edit this file to customize your branding
 * ============================================================
 *
 * LOGO
 *   Place your logo image inside the /public folder, then set
 *   the path below.  Example: '/logo.png'
 *   Supported formats: PNG, SVG, WebP, JPG
 *   Recommended size : 40 × 40 px (will be displayed at 36px)
 *
 * BACKGROUND
 *   Option A — Solid color  : set bgColor, leave bgImage empty.
 *   Option B — Image/texture: set bgImage path, leave bgColor empty.
 *   Option C — Both         : image on top of a solid color fallback.
 *   Supported formats: PNG, SVG, WebP, JPG
 *
 * SITE_NAME / TAGLINE
 *   Shown in the Navbar and the browser <title> tag.
 * ============================================================
 */

const siteConfig = {
  /** Display name shown in navbar & page title */
  siteName: 'Stardew Share',

  /** Short tagline shown on the explore / hero section */
  tagline: 'Discover & share Stardew Valley farm layouts',

  /**
   * Logo image path (relative to /public).
   * Set to null to use the emoji fallback (🌾).
   * Example: '/logo.png'
   */
  logo: '/logo.png',

  /** Alt text for the logo image (accessibility) */
  logoAlt: 'Stardew Share logo',

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
