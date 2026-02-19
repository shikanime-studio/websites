import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

interface RecommendRequest {
  latitude: number
  longitude: number
  radiusMeters?: number
}

interface Restaurant {
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
}

type RecommendResponse
  = | {
    error: string
  }
  | {
    restaurant: Restaurant
    alternatives: Restaurant[]
  }

export const Route = createFileRoute('/api/recommend')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!GOOGLE_MAPS_API_KEY) {
          return json<RecommendResponse>(
            { error: 'Missing Google Maps API key (VITE_GOOGLE_MAPS_API_KEY)' },
            {
              status: 500,
            },
          )
        }

        let body: RecommendRequest

        try {
          body = (await request.json()) as RecommendRequest
        }
        catch {
          return json<RecommendResponse>(
            { error: 'Invalid JSON body' },
            { status: 400 },
          )
        }

        const { latitude, longitude, radiusMeters = 1500 } = body

        if (
          typeof latitude !== 'number'
          || typeof longitude !== 'number'
          || Number.isNaN(latitude)
          || Number.isNaN(longitude)
        ) {
          return json<RecommendResponse>(
            { error: 'Invalid latitude or longitude' },
            { status: 400 },
          )
        }

        const params = new URLSearchParams({
          location: `${latitude},${longitude}`,
          radius: radiusMeters.toString(),
          type: 'restaurant',
          opennow: 'true',
          key: GOOGLE_MAPS_API_KEY,
        })

        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/nearbysearch/json?${params.toString()}`,
        )

        if (!response.ok) {
          return json<RecommendResponse>(
            { error: 'Failed to contact Google Maps Places API' },
            { status: 502 },
          )
        }

        const data = (await response.json()) as {
          results?: any[]
        }

        if (!Array.isArray(data.results) || data.results.length === 0) {
          return json<RecommendResponse>(
            { error: 'No restaurants found nearby' },
            { status: 404 },
          )
        }

        const restaurants: Restaurant[] = data.results.map(place => ({
          id: place.place_id as string,
          placeId: place.place_id as string,
          name: place.name as string,
          address:
            (place.vicinity as string | undefined)
            ?? (place.formatted_address as string | undefined)
            ?? '',
          rating:
            typeof place.rating === 'number'
              ? (place.rating as number)
              : undefined,
          userRatingsTotal:
            typeof place.user_ratings_total === 'number'
              ? (place.user_ratings_total as number)
              : undefined,
          priceLevel:
            typeof place.price_level === 'number'
              ? (place.price_level as number)
              : undefined,
          location: {
            lat:
              typeof place.geometry?.location?.lat === 'number'
                ? (place.geometry.location.lat as number)
                : 0,
            lng:
              typeof place.geometry?.location?.lng === 'number'
                ? (place.geometry.location.lng as number)
                : 0,
          },
          openNow:
            typeof place.opening_hours?.open_now === 'boolean'
              ? (place.opening_hours.open_now as boolean)
              : undefined,
        }))

        const scored = restaurants
          .map((restaurant) => {
            const ratingScore = (restaurant.rating ?? 0) * 2
            const popularityScore = Math.log10(
              (restaurant.userRatingsTotal ?? 0) + 1,
            )
            const openBonus = restaurant.openNow ? 1 : 0
            const randomness = Math.random()

            const score
              = ratingScore + popularityScore + openBonus + randomness

            return { restaurant, score }
          })
          .sort((a, b) => b.score - a.score)

        const best = scored[0]?.restaurant

        if (!best) {
          return json<RecommendResponse>(
            { error: 'Unable to compute a recommendation' },
            { status: 500 },
          )
        }

        const alternatives = scored
          .slice(1, 4)
          .map(entry => entry.restaurant)

        return json<RecommendResponse>({
          restaurant: best,
          alternatives,
        })
      },
    },
  },
})
