import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
      <h1 className="text-4xl font-bold">Fade App</h1>
    </div>
  )
}
