import type { Restaurant } from '../lib/restaurant'
import AlternativesList from './AlternativesList'
import RecommendationCard from './RecommendationCard'

interface RestaurantListProps {
  mainRestaurant: Restaurant
  alternatives: Restaurant[]
}

function buildSummary(restaurant: Restaurant) {
  const parts: string[] = []
  if (restaurant.rating != null) {
    const rating = new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(restaurant.rating)
    parts.push(`note ${rating}`)
  }
  if (restaurant.userRatingsTotal != null) {
    const count = new Intl.NumberFormat('fr-FR', { notation: 'compact' }).format(restaurant.userRatingsTotal)
    parts.push(`${count} avis`)
  }
  if (restaurant.priceLevel != null) {
    const euros = '€'.repeat(Math.max(1, Math.min(4, restaurant.priceLevel + 1)))
    parts.push(`prix ${euros}`)
  }
  return parts.join(' · ')
}

export default function RestaurantList({ mainRestaurant, alternatives }: RestaurantListProps) {
  const allRestaurants = [mainRestaurant, ...alternatives]

  return (
    <div className="space-y-6">
      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body p-4">
          <h3 className="card-title text-sm font-bold text-base-content/70 uppercase tracking-wider mb-2">
            Classement des propositions
          </h3>
          <ol className="space-y-3">
            {allRestaurants.map((restaurant, index) => (
              <li key={restaurant.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-base-200/50 transition-colors">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-content text-xs font-bold">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <p className="font-bold text-base-content truncate">{restaurant.name}</p>
                  <p className="text-xs text-base-content/60 truncate">
                    {buildSummary(restaurant)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <RecommendationCard restaurant={mainRestaurant} />
      <AlternativesList alternatives={alternatives} />
    </div>
  )
}
