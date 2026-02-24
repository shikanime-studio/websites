import type { Restaurant } from '../lib/restaurant'
import { MapPin, UtensilsCrossed } from 'lucide-react'

function buildGoogleMapsLink(restaurant: Restaurant) {
  const query = `${restaurant.name} ${restaurant.address}`.trim()
  const base = 'https://www.google.com/maps/search/?api=1'
  const params = new URLSearchParams({
    query,
    query_place_id: restaurant.placeId,
  })
  return `${base}&${params.toString()}`
}

export default function RecommendationCard({ restaurant }: { restaurant: Restaurant }) {
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
    const base = new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(rating)
    if (count == null) {
      return `${base}`
    }
    const formattedCount = new Intl.NumberFormat('fr-FR', { notation: 'compact' }).format(count)
    return `${base} (${formattedCount})`
  }
  return (
    <div className="card bg-base-100 border-primary/20 border shadow-xl">
      <div className="card-body p-6">
        <h2 className="card-title flex items-center gap-2 text-lg">
          <UtensilsCrossed className="text-primary h-5 w-5" />
          Ta recommandation du jour
        </h2>
        <div className="mt-4 space-y-3">
          <div>
            <p className="text-xl font-bold text-neutral-900">{restaurant.name}</p>
            <p className="text-sm text-neutral-500">{restaurant.address}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-600">
            <div className="badge badge-neutral gap-2">
              Note
              {formatRating(restaurant.rating, restaurant.userRatingsTotal)}
            </div>
            <div className="badge badge-outline gap-2">
              Prix
              {formatPriceLevel(restaurant.priceLevel)}
            </div>
          </div>
          <div className="card-actions justify-end mt-4">
            <a
              href={buildGoogleMapsLink(restaurant)}
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary btn-sm text-white"
            >
              <MapPin className="h-4 w-4" />
              Ouvrir dans Google Maps
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
