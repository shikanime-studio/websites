import { Link } from '@tanstack/react-router'
import { Home, Menu, UtensilsCrossed, X } from 'lucide-react'
import { useState } from 'react'

import BetterAuthHeader from '../integrations/better-auth/header-user.tsx'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <header className="flex items-center bg-slate-950/95 px-4 py-3 text-slate-50 shadow-md shadow-cyan-900/40 backdrop-blur">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="rounded-lg p-2 text-slate-200 transition-colors hover:bg-slate-800"
          aria-label="Ouvrir le menu"
        >
          <Menu size={22} />
        </button>
        <h1 className="ml-4 flex items-center gap-2 text-lg font-semibold tracking-tight">
          <UtensilsCrossed className="h-5 w-5 text-cyan-400" />
          <Link to="/" className="hover:text-cyan-300">
            jesaispasoubouffer
          </Link>
        </h1>
      </header>

      <aside
        className={`fixed top-0 left-0 z-50 flex h-full w-80 transform flex-col bg-slate-950 text-slate-50 shadow-2xl shadow-cyan-900/50 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <UtensilsCrossed className="h-4 w-4 text-cyan-400" />
            Menu
          </h2>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="rounded-lg p-2 text-slate-300 transition-colors hover:bg-slate-800"
            aria-label="Fermer le menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-3 text-sm">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-200 transition-colors hover:bg-slate-800"
            activeProps={{
              className:
                'flex items-center gap-3 rounded-lg px-3 py-2 bg-cyan-600 text-slate-950 transition-colors',
            }}
          >
            <Home size={18} />
            <span className="font-medium">Trouver un resto</span>
          </Link>
        </nav>

        <div className="border-t border-slate-800 bg-slate-900/80 px-4 py-3">
          <BetterAuthHeader />
        </div>
      </aside>
    </>
  )
}
