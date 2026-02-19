import { createContext, use } from 'react'

export interface LightingContextType {
  exposure: number
  setExposure: (value: number) => void
  resetExposure: () => void
  contrast: number
  setContrast: (value: number) => void
  resetContrast: () => void
  saturation: number
  setSaturation: (value: number) => void
  resetSaturation: () => void
  highlights: number
  setHighlights: (value: number) => void
  resetHighlights: () => void
  shadows: number
  setShadows: (value: number) => void
  resetShadows: () => void
  whites: number
  setWhites: (value: number) => void
  resetWhites: () => void
  blacks: number
  setBlacks: (value: number) => void
  resetBlacks: () => void
  tint: number
  setTint: (value: number) => void
  resetTint: () => void
  temperature: number
  setTemperature: (value: number) => void
  resetTemperature: () => void
  vibrance: number
  setVibrance: (value: number) => void
  resetVibrance: () => void
  hue: number
  setHue: (value: number) => void
  resetHue: () => void
}

export const LightingContext = createContext<LightingContextType | null>(null)

export function useLighting() {
  const context = use(LightingContext)
  if (!context) {
    throw new Error('useLighting must be used within a LightingProvider')
  }
  return context
}
