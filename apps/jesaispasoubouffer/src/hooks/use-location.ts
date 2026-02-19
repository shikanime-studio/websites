import { useState } from 'react'

export interface Coords {
  latitude: number
  longitude: number
}

export function useLocation() {
  const [coords, setCoords] = useState<Coords | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function ensureLocation() {
    if (coords) {
      return coords
    }

    if (!navigator.geolocation) {
      setError('Geolocation is not supported on this device.')
      return null
    }

    setIsLocating(true)
    setError(null)

    return new Promise<Coords | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const next = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }
          setCoords(next)
          setIsLocating(false)
          resolve(next)
        },
        () => {
          setError('Unable to access your location.')
          setIsLocating(false)
          resolve(null)
        },
        { enableHighAccuracy: true, timeout: 10000 },
      )
    })
  }

  return { coords, isLocating, error, ensureLocation }
}
