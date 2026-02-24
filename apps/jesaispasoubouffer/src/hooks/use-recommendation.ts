import type { ErrResponse, SuccessResponse } from '../lib/restaurant'
import type { Coords } from './use-location'
import { useState } from 'react'
import { addHistory, getRecentIds } from '../lib/history'
import { recommendFn } from '../server/recommend'

type RecommendResponse = ErrResponse | SuccessResponse

export function useRecommendation() {
  const [data, setData] = useState<RecommendResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function getRecommendation(coords: Coords, query: string) {
    setIsLoading(true)
    setError(null)
    setData(null)

    try {
      const response = await recommendFn({
        data: {
          latitude: coords.latitude,
          longitude: coords.longitude,
          query,
          recentIds: getRecentIds(10),
          nowHour: new Date().getHours(),
        },
      })

      if ('error' in response) {
        setError(response.error)
      }
      else {
        setData(response)
        if ('restaurant' in response) {
          addHistory({
            id: response.restaurant.id,
            name: response.restaurant.name,
            timestamp: Date.now(),
            latitude: coords.latitude,
            longitude: coords.longitude,
            query,
          })
        }
      }
    }
    catch {
      setError('Network error while contacting the recommendation service.')
    }
    finally {
      setIsLoading(false)
    }
  }

  return { data, isLoading, error, getRecommendation }
}
