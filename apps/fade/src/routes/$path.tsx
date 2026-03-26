import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { AppShell } from './index'

export const Route = createFileRoute('/$path')({
  component: PathRouteComponent,
  validateSearch: z.object({
    modal: z.enum(['settings', 'fullscreen']).optional(),
  }),
})

function PathRouteComponent() {
  const navigate = Route.useNavigate()
  const search = Route.useSearch()
  const { path } = Route.useParams()

  return <AppShell navigate={navigate} search={search} selectedPath={path} />
}
