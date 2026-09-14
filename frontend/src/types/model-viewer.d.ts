import * as React from 'react'

/**
 * TypeScript declarations for the <model-viewer> web component (Google).
 * Loaded via CDN — not installed as an npm package.
 *
 * Full spec: https://modelviewer.dev/docs/index.html
 */

export interface ModelViewerAttributes {
  // ── Source ────────────────────────────────────────────────
  src?: string
  /** USDZ source for iOS AR Quick Look */
  'ios-src'?: string
  alt?: string

  // ── AR ────────────────────────────────────────────────────
  /** Enable AR mode (presence of attribute = true) */
  ar?: boolean | ''
  /** Space-separated list: "webxr scene-viewer quick-look" */
  'ar-modes'?: string
  /** "auto" | "fixed" */
  'ar-scale'?: 'auto' | 'fixed'
  /** "floor" | "wall" */
  'ar-placement'?: 'floor' | 'wall'

  // ── Camera ────────────────────────────────────────────────
  'camera-controls'?: boolean | ''
  'camera-orbit'?: string
  'field-of-view'?: string
  'min-camera-orbit'?: string
  'max-camera-orbit'?: string

  // ── Lighting ──────────────────────────────────────────────
  'shadow-intensity'?: string | number
  'shadow-softness'?: string | number
  exposure?: string | number
  'environment-image'?: string
  'skybox-image'?: string

  // ── Animation / Rotation ──────────────────────────────────
  'auto-rotate'?: boolean | ''
  'auto-rotate-delay'?: string | number
  'rotation-per-second'?: string

  // ── Reveal / Loading ──────────────────────────────────────
  /** "auto" | "interaction" | "manual" */
  reveal?: 'auto' | 'interaction' | 'manual'
  /** "auto" | "lazy" | "eager" */
  loading?: 'auto' | 'lazy' | 'eager'
  poster?: string

  // ── Misc HTML ─────────────────────────────────────────────
  class?: string
  tabIndex?: number
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & ModelViewerAttributes,
        HTMLElement
      >
    }
  }
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & ModelViewerAttributes,
        HTMLElement
      >
    }
  }
}
