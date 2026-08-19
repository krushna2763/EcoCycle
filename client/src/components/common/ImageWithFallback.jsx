import { useState } from 'react'

/**
 * Renders an <img> that swaps to a styled fallback when the asset
 * fails to load (e.g. while real images are still being added).
 */
export default function ImageWithFallback({ src, alt, className, fallback }) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div className={`flex items-center justify-center ${className ?? ''}`}>
        {fallback}
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  )
}
