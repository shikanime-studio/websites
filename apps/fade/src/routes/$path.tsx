import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { AppShell } from '../components/AppShell'

export const Route = createFileRoute('/$path')({
  component: PathRouteComponent,
  validateSearch: z.object({
    modal: z.enum(['settings', 'fullscreen']).optional(),
    selected: z.string().optional(),
  }),
})

function PathRouteComponent() {
  const navigate = Route.useNavigate()
  const search = Route.useSearch()
  return <AppShell navigate={navigate} search={search} />
}
