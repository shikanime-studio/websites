import { createFileRoute } from '@tanstack/react-router'
import {
  Loader2,
  MapPin,
  Navigation,
  Sparkles,
  UtensilsCrossed,
} from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/')({ component: App })

interface Coords {
  latitude: number
  longitude: number
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
}

type RecommendResponse
  = | {
    error: string
  }
  | {
    restaurant: Restaurant
    alternatives: Restaurant[]
  }

// eslint-disable-next-line react-refresh/only-export-components
function App() {
  const [coords, setCoords] = useState<Coords | null>(null)
  const [radius, setRadius] = useState(1500)
  const [isLocating, setIsLocating] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<RecommendResponse | null>(null)

  const mainRestaurant
    = data && 'restaurant' in data ? data.restaurant : undefined
  const alternatives
    = data && 'alternatives' in data ? (data.alternatives ?? []) : []

  function handleUseMyLocation() {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported on this device.')
      return
    }

    setIsLocating(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
        setIsLocating(false)
      },
      () => {
        setError('Unable to access your location.')
        setIsLocating(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      },
    )
  }

  async function handleFindRestaurant() {
    if (!coords) {
      setError('Start by using your location at work.')
      return
    }

    setIsLoading(true)
    setError(null)
    setData(null)

    try {
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude: coords.latitude,
          longitude: coords.longitude,
          radiusMeters: radius,
        }),
      })

      const json = (await response.json()) as RecommendResponse

      if (!response.ok) {
        if ('error' in json) {
          setError(json.error)
        }
        else {
          setError('Something went wrong while talking to the server.')
        }
        return
      }

      if ('error' in json) {
        setError(json.error)
        return
      }

      setData(json)
    }
    catch {
      setError('Network error while contacting the recommendation service.')
    }
    finally {
      setIsLoading(false)
    }
  }

  function formatPriceLevel(priceLevel?: number) {
    if (priceLevel == null) {
      return 'N/A'
    }

    return '€'.repeat(Math.max(1, Math.min(4, priceLevel + 1)))
  }

  function formatRating(rating?: number, count?: number) {
    if (rating == null) {
      return 'No rating'
    }

    const base = rating.toFixed(1)
    if (count == null) {
      return `${base}`
    }
    return `${base} (${count})`
  }

  function buildGoogleMapsLink(restaurant: Restaurant) {
    const query = `${restaurant.name} ${restaurant.address}`.trim()
    const base = 'https://www.google.com/maps/search/?api=1'
    const params = new URLSearchParams({
      query,
      query_place_id: restaurant.placeId,
    })
    return `${base}&${params.toString()}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <main className="mx-auto max-w-4xl space-y-10 px-4 py-12">
        <section className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-slate-900/60 px-4 py-1 text-xs font-medium text-cyan-200 shadow-sm">
            <Sparkles className="h-3 w-3" />
            <span>Je sais pas où bouffer au boulot</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
            Laisse l&apos;IA choisir ton resto de midi
          </h1>
          <p className="max-w-xl text-slate-300">
            Tu ne sais jamais où manger au travail ? Donne ta position, on
            interroge Google Maps et une petite IA choisit un bon spot pour toi.
          </p>
        </section>

        <section className="grid items-start gap-6 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl shadow-cyan-900/20">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <MapPin className="h-5 w-5 text-cyan-400" />
              Ton lieu de travail
            </h2>
            <p className="text-sm text-slate-300">
              Utilise ta position actuelle (au bureau, en télétravail, etc.).
              Nous cherchons des restos autour.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleUseMyLocation}
                disabled={isLocating}
                className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950 transition-colors hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLocating
                  ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Localisation en cours...
                      </>
                    )
                  : (
                      <>
                        <Navigation className="h-4 w-4" />
                        Utiliser ma position
                      </>
                    )}
              </button>

              {coords && (
                <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200">
                  Position enregistrée (
                  {coords.latitude.toFixed(4)}
                  ,
                  {' '}
                  {coords.longitude.toFixed(4)}
                  )
                </span>
              )}
            </div>

            <div className="space-y-2 pt-3">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Rayon de recherche</span>
                <span>
                  {(radius / 1000).toFixed(1)}
                  {' '}
                  km
                </span>
              </div>
              <input
                type="range"
                min={500}
                max={3000}
                step={250}
                value={radius}
                onChange={event => setRadius(Number(event.target.value))}
                className="w-full accent-cyan-500"
              />
              <p className="text-xs text-slate-500">
                Plus le rayon est grand, plus on a de choix (mais ça peut être
                un peu loin).
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleFindRestaurant}
                disabled={isLoading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-900/40 transition-transform hover:translate-y-[1px] hover:shadow-cyan-900/20 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoading
                  ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        L&apos;IA réfléchit à ton prochain resto...
                      </>
                    )
                  : (
                      <>
                        <UtensilsCrossed className="h-4 w-4" />
                        Trouver un resto pour ce midi
                      </>
                    )}
              </button>
            </div>

            {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}

            {!error && !mainRestaurant && !isLoading && (
              <p className="mt-3 text-sm text-slate-400">
                Astuce : lance la recherche quand tu arrives au boulot, puis
                laisse l&apos;IA décider pour le reste de l&apos;équipe.
              </p>
            )}
          </div>

          <div className="space-y-4">
            {mainRestaurant
              ? (
                  <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 p-5 shadow-lg shadow-emerald-900/40">
                    <h2 className="flex items-center gap-2 text-lg font-semibold">
                      <UtensilsCrossed className="h-5 w-5 text-emerald-400" />
                      Ta recommandation du jour
                    </h2>
                    <p className="mt-1 text-sm text-slate-300">
                      Une petite IA a parcouru les restos autour de toi et te
                      propose celui-ci en priorité.
                    </p>

                    <div className="mt-4 space-y-3">
                      <div>
                        <p className="text-base font-semibold">
                          {mainRestaurant.name}
                        </p>
                        <p className="text-sm text-slate-300">
                          {mainRestaurant.address}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-200">
                        <span className="rounded-full bg-slate-900/80 px-3 py-1">
                          Note
                          {' '}
                          {formatRating(
                            mainRestaurant.rating,
                            mainRestaurant.userRatingsTotal,
                          )}
                        </span>
                        <span className="rounded-full bg-slate-900/80 px-3 py-1">
                          Prix
                          {' '}
                          {formatPriceLevel(mainRestaurant.priceLevel)}
                        </span>
                      </div>

                      <a
                        href={buildGoogleMapsLink(mainRestaurant)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 transition-colors hover:bg-emerald-400"
                      >
                        <MapPin className="h-4 w-4" />
                        Ouvrir dans Google Maps
                      </a>
                    </div>
                  </div>
                )
              : (
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 text-sm text-slate-300">
                    <p>
                      Quand tu auras choisi ta position, on te suggérera un resto
                      sympa pour le déjeuner, directement à partir des données de
                      Google Maps.
                    </p>
                  </div>
                )}

            {alternatives.length > 0 && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
                <h3 className="mb-3 text-sm font-semibold text-slate-100">
                  Autres options autour
                </h3>
                <ul className="space-y-3 text-sm text-slate-200">
                  {alternatives.map(restaurant => (
                    <li
                      key={restaurant.id}
                      className="flex flex-col gap-1 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="truncate font-medium">
                            {restaurant.name}
                          </p>
                          <p className="truncate text-xs text-slate-400">
                            {restaurant.address}
                          </p>
                        </div>
                        <a
                          href={buildGoogleMapsLink(restaurant)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-full border border-slate-700 px-2 py-1 text-[10px] font-medium text-slate-100 hover:border-cyan-500"
                        >
                          <MapPin className="h-3 w-3" />
                          Itinéraire
                        </a>
                      </div>
                      <div className="flex gap-2 text-[11px] text-slate-300">
                        <span>
                          Note
                          {' '}
                          {formatRating(
                            restaurant.rating,
                            restaurant.userRatingsTotal,
                          )}
                        </span>
                        <span className="text-slate-500">•</span>
                        <span>
                          Prix
                          {' '}
                          {formatPriceLevel(restaurant.priceLevel)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
