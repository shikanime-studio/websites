import { Link } from '@tanstack/react-router'
import { UtensilsCrossed } from 'lucide-react'

import BetterAuthHeader from '../integrations/better-auth/header-user'

export default function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-transparent absolute top-0 w-full z-10">
      <div className="flex items-center gap-2">
        <UtensilsCrossed className="text-primary h-6 w-6" />
        <Link to="/" className="text-lg font-bold tracking-tight text-neutral-900 hover:opacity-80">
          Je Sais Pas Où Bouffer
        </Link>
      </div>

      <div>
        <BetterAuthHeader />
      </div>
    </header>
  )
}
