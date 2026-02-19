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
      const response = await fetch(recommendFn.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: coords.latitude,
          longitude: coords.longitude,
          query,
          recentIds: getRecentIds(10),
          nowHour: new Date().getHours(),
        }),
      })

      const json = (await response.json()) as RecommendResponse
      if ('error' in json) {
        setError(json.error)
      }
      else {
        setData(json)
        if ('restaurant' in json) {
          addHistory({
            id: json.restaurant.id,
            name: json.restaurant.name,
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
