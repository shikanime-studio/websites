export interface Restaurant {
  id: string
  placeId: string
  name: string
  address: string
  rating?: number
  userRatingsTotal?: number
  priceLevel?: number
  location: {
    lat: number
    lng: number
  }
  openNow?: boolean
  types?: string[]
}

export interface ErrResponse {
  error: string
}

export interface SuccessResponse {
  restaurant: Restaurant
  alternatives: Restaurant[]
}
