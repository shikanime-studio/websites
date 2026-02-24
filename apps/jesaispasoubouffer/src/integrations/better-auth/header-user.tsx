import { authClient } from '../../lib/auth-client'

export default function BetterAuthHeader() {
  const { data: session, isPending } = authClient.useSession()

  if (isPending) {
    return (
      <div className="h-8 w-8 animate-pulse bg-neutral-100 dark:bg-neutral-800" />
    )
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-2">
        {session.user.image
          ? (
              <img src={session.user.image} alt="" className="h-8 w-8 rounded-full" />
            )
          : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
                <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                  {session.user.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
            )}
        <button
          onClick={() => {
            void authClient.signOut()
          }}
          className="btn btn-sm btn-ghost"
        >
          Sign out
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => {
        void authClient.signIn.social({ provider: 'google' })
      }}
      className="btn btn-sm btn-neutral"
    >
      Sign in
    </button>
  )
}
