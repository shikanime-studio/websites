import type { Restaurant } from '../lib/restaurant'
import { MapPin } from 'lucide-react'

function buildGoogleMapsLink(restaurant: Restaurant) {
  const query = `${restaurant.name} ${restaurant.address}`.trim()
  const base = 'https://www.google.com/maps/search/?api=1'
  const params = new URLSearchParams({
    query,
    query_place_id: restaurant.placeId,
  })
  return `${base}&${params.toString()}`
}

function formatPriceLevel(priceLevel?: number) {
  if (priceLevel == null)
    return 'N/A'
  return '€'.repeat(Math.max(1, Math.min(4, priceLevel + 1)))
}

export default function AlternativesList({ alternatives }: { alternatives: Restaurant[] }) {
  if (alternatives.length === 0)
    return null

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
    <div className="card bg-base-100 border-primary/10 border shadow-lg mt-8">
      <div className="card-body p-6">
        <h3 className="card-title text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-4">
          Autres options autour
        </h3>
        <ul className="space-y-4">
          {alternatives.map(restaurant => (
            <li
              key={restaurant.id}
              className="flex items-center justify-between gap-4 p-3 rounded-lg hover:bg-neutral-50 transition-colors border border-transparent hover:border-neutral-200"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-neutral-900">{restaurant.name}</p>
                <p className="truncate text-xs text-neutral-500">{restaurant.address}</p>
                <div className="flex gap-2 text-[11px] text-neutral-600 mt-1">
                  <span className="badge badge-sm badge-ghost">
                    ★
                    {' '}
                    {formatRating(restaurant.rating, restaurant.userRatingsTotal)}
                  </span>
                  <span className="badge badge-sm badge-ghost">
                    {formatPriceLevel(restaurant.priceLevel)}
                  </span>
                </div>
              </div>
              <a
                href={buildGoogleMapsLink(restaurant)}
                target="_blank"
                rel="noreferrer"
                className="btn btn-circle btn-ghost btn-sm text-primary"
              >
                <MapPin className="h-4 w-4" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
