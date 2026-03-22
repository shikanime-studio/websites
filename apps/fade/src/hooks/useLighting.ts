import type { LightingParams } from '@shikanime-studio/medialab/hooks/image'
import { createContext, use } from 'react'

export interface LightingContextType extends LightingParams {
  setExposure: (value: number) => void
  resetExposure: () => void
  setContrast: (value: number) => void
  resetContrast: () => void
  setSaturation: (value: number) => void
  resetSaturation: () => void
  setHighlights: (value: number) => void
  resetHighlights: () => void
  setShadows: (value: number) => void
  resetShadows: () => void
  setWhites: (value: number) => void
  resetWhites: () => void
  setBlacks: (value: number) => void
  resetBlacks: () => void
  setTint: (value: number) => void
  resetTint: () => void
  setTemperature: (value: number) => void
  resetTemperature: () => void
  setVibrance: (value: number) => void
  resetVibrance: () => void
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
