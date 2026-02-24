import type { ErrResponse, Restaurant, SuccessResponse } from '../lib/restaurant'
import { createServerFn } from '@tanstack/react-start'
import { config } from './config'

interface RecommendRequest {
  latitude: number
  longitude: number
  radiusMeters?: number
  query?: string
  recentIds?: string[]
  nowHour?: number
}

export const recommendFn = createServerFn({ method: 'POST' })
  .inputValidator((data: RecommendRequest) => data)
  .handler(async ({ data }): Promise<ErrResponse | SuccessResponse> => {
    const { latitude, longitude, radiusMeters, query, recentIds = [], nowHour } = data
    if (
      typeof latitude !== 'number'
      || typeof longitude !== 'number'
      || Number.isNaN(latitude)
      || Number.isNaN(longitude)
    ) {
      return { error: 'Invalid latitude or longitude' }
    }

    // infer radius from user query when not provided
    const q = (query ?? '').toLowerCase()
    let radius = typeof radiusMeters === 'number' ? radiusMeters : 1500
    if (q.includes('near') || q.includes('près') || q.includes('proche')) {
      radius = 1000
    }
    else if (q.includes('loin') || q.includes('far')) {
      radius = 4000
    }
    else if (q.includes('rapide') || q.includes('fast') || q.includes('takeaway')) {
      radius = 1500
    }

    const { Client } = await import('@googlemaps/google-maps-services-js')
    const client = new Client({})
    const res = await client.placesNearby({
      params: {
        key: config.GOOGLE_MAPS_API_KEY,
        location: { lat: latitude, lng: longitude },
        radius,
        type: 'restaurant',
        opennow: true,
      },
    })

    const results = res.data.results ?? []
    if (!Array.isArray(results) || results.length === 0) {
      return { error: 'No restaurants found nearby' }
    }

    const restaurants: Restaurant[] = results.map(place => ({
      id: (place.place_id as string) ?? '',
      placeId: (place.place_id as string) ?? '',
      name: (place.name as string) ?? '',
      address: ((place.vicinity as string | undefined) ?? (place.formatted_address as string | undefined) ?? ''),
      rating:
        typeof place.rating === 'number' ? (place.rating as number) : undefined,
      userRatingsTotal:
        typeof place.user_ratings_total === 'number'
          ? (place.user_ratings_total as number)
          : undefined,
      priceLevel:
        typeof place.price_level === 'number'
          ? (place.price_level as number)
          : undefined,
      location: {
        lat: typeof place.geometry?.location?.lat === 'number' ? (place.geometry.location.lat as number) : 0,
        lng: typeof place.geometry?.location?.lng === 'number' ? (place.geometry.location.lng as number) : 0,
      },
      openNow:
        typeof place.opening_hours?.open_now === 'boolean'
          ? (place.opening_hours.open_now as boolean)
          : undefined,
      types: Array.isArray(place.types) ? (place.types as string[]) : undefined,
    }))

    const scored = restaurants
      .map((restaurant) => {
        const ratingScore = (restaurant.rating ?? 0) * 2
        const popularityScore = Math.log10((restaurant.userRatingsTotal ?? 0) + 1)
        const openBonus = restaurant.openNow ? 1 : 0
        const randomness = Math.random()
        const recencyPenalty = recentIds.includes(restaurant.id) ? -1.5 : 0
        const queryBonus = q && restaurant.name.toLowerCase().includes(q) ? 2 : 0
        let timeBonus = 0
        const hour = typeof nowHour === 'number' ? nowHour : new Date().getHours()
        if (hour >= 11 && hour <= 14) {
          if ((restaurant.priceLevel ?? 1) <= 2)
            timeBonus += 0.5
        }
        if (hour >= 18 && hour <= 21) {
          if ((restaurant.priceLevel ?? 2) >= 2)
            timeBonus += 0.5
        }
        const score
          = ratingScore
            + popularityScore
            + openBonus
            + timeBonus
            + queryBonus
            + recencyPenalty
            + randomness
        return { restaurant, score }
      })
      .sort((a, b) => b.score - a.score)

    const best = scored[0]?.restaurant
    if (!best) {
      return { error: 'Unable to compute a recommendation' }
    }

    const alternatives = scored.slice(1, 4).map(entry => entry.restaurant)
    return {
      restaurant: best,
      alternatives,
    }
  })
