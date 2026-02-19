/* eslint-disable react-refresh/only-export-components */
import { createFileRoute } from '@tanstack/react-router'
import { Loader2, LogIn, UtensilsCrossed } from 'lucide-react'
import { useEffect, useState } from 'react'
import RestaurantList from '../components/RestaurantList'
import VoiceInput from '../components/VoiceInput'
import { useLocation } from '../hooks/use-location'
import { useRecommendation } from '../hooks/use-recommendation'
import { authClient } from '../lib/auth-client'

export const Route = createFileRoute('/')({ component: App })

function BackgroundMesh() {
  return (
    <div className="absolute inset-0 -z-10 h-full w-full bg-base-100">
      <div className="absolute top-0 z-[-2] h-screen w-screen bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,color-mix(in_oklch,var(--color-primary),transparent_85%),transparent)]"></div>
      <div className="absolute bottom-0 left-0 z-[-2] h-1/2 w-1/2 bg-[radial-gradient(circle_at_bottom_left,color-mix(in_oklch,var(--color-secondary),transparent_90%),transparent)]"></div>
    </div>
  )
}

function HeroSection() {
  return (
    <div className="space-y-6 max-w-3xl animate-in fade-in slide-in-from-top-8 duration-700 delay-150">
      <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1]">
        Laisse l&apos;IA choisir
        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mt-2">
          ton resto de midi
        </span>
      </h1>
      <p className="text-lg md:text-xl text-base-content/70 leading-relaxed max-w-2xl mx-auto font-medium">
        Tu ne sais jamais où manger ? Donne ta position, et notre IA trouve la pépite idéale pour toi et tes collègues.
      </p>
    </div>
  )
}

interface SearchSectionProps {
  query: string
  setQuery: (query: string) => void
  onFind: () => void
  isLoading: boolean
  isLocating: boolean
  error: string | null
  mainRestaurant: any
}

function SearchSection({ query, setQuery, onFind, isLoading, isLocating, error, mainRestaurant }: SearchSectionProps) {
  return (
    <div className="w-full max-w-xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
      <div className="bg-base-100/60 backdrop-blur-xl p-3 rounded-3xl shadow-2xl shadow-primary/5 border border-base-200 ring-1 ring-base-200">
        <div className="flex flex-col gap-3 p-2">
          <VoiceInput query={query} setQuery={setQuery} />

          <button
            type="button"
            onClick={onFind}
            disabled={isLoading || isLocating}
            className="btn btn-primary btn-lg w-full rounded-2xl text-lg font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.01] transition-all duration-300 border-none"
          >
            {isLoading || isLocating
              ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Recherche en cours...
                  </>
                )
              : (
                  <>
                    <UtensilsCrossed className="h-5 w-5" />
                    Trouver un resto
                  </>
                )}
          </button>
        </div>

        {error && (
          <div role="alert" className="alert alert-error mt-4 mx-2 mb-2 text-sm rounded-xl animate-in fade-in zoom-in duration-300">
            <span>{error}</span>
          </div>
        )}

        {!error && !mainRestaurant && !isLoading && !isLocating && (
          <div className="text-center py-3 text-xs font-medium text-base-content/40">
            Astuce : Dis ce qui te fait envie ou lance juste la recherche !
          </div>
        )}
      </div>
    </div>
  )
}

function AuthButton() {
  const { data: session } = authClient.useSession()

  const handleLogin = async () => {
    await authClient.signIn.social({
      provider: 'google',
      callbackURL: window.location.href,
    })
  }

  const handleLogout = async () => {
    await authClient.signOut()
    window.location.reload()
  }

  if (session?.user) {
    return (
      <div className="dropdown dropdown-end">
        { }
        <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar ring ring-primary ring-offset-base-100 ring-offset-2">
          <div className="w-10 rounded-full">
            <img src={session.user.image || ''} alt={session.user.name} />
          </div>
        </div>
        {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
        <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 mt-4">
          <li><button type="button" onClick={handleLogout}>Se déconnecter</button></li>
        </ul>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={handleLogin}
      className="btn btn-ghost btn-sm gap-2 normal-case"
    >
      <LogIn className="h-4 w-4" />
      Connexion
    </button>
  )
}

function App() {
  const [query, setQuery] = useState('')
  const { ensureLocation, isLocating, error: locationError } = useLocation()
  const { data, getRecommendation, isLoading, error: recommendationError } = useRecommendation()

  useEffect(() => {
    ensureLocation()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const mainRestaurant = data && 'restaurant' in data ? data.restaurant : undefined
  const alternatives = data && 'alternatives' in data ? (data.alternatives ?? []) : []

  async function handleFindRestaurant() {
    const currentCoords = await ensureLocation()
    if (currentCoords) {
      await getRecommendation(currentCoords, query)
    }
  }

  const error = locationError || recommendationError

  return (
    <div className="min-h-screen bg-base-100 text-base-content relative overflow-x-hidden selection:bg-primary/20 selection:text-primary">
      <BackgroundMesh />

      <div className="absolute top-4 right-4 z-50">
        <AuthButton />
      </div>

      <main className="container mx-auto px-4 py-16 md:py-24 max-w-4xl">
        <div className="flex flex-col items-center text-center space-y-12 mb-20">
          <HeroSection />
          <SearchSection
            query={query}
            setQuery={setQuery}
            onFind={handleFindRestaurant}
            isLoading={isLoading}
            isLocating={isLocating}
            error={error}
            mainRestaurant={mainRestaurant}
          />
        </div>

        {mainRestaurant && (
          <div className="animate-in fade-in slide-in-from-bottom-16 duration-700 delay-150">
            <RestaurantList
              mainRestaurant={mainRestaurant}
              alternatives={alternatives}
            />
          </div>
        )}
      </main>
    </div>
  )
}
