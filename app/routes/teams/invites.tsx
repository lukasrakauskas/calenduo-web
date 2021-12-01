import { json } from 'remix'
import type { LoaderFunction, MetaFunction } from 'remix'

import { api } from '~/api'
import { requireAccessToken, requireUser } from '~/utils/session.server'

export const meta: MetaFunction = () => {
  return {
    title: 'Invites to teams | Calenduo',
    description: 'Your invites on Calenduo',
  }
}

export const loader: LoaderFunction = async ({ request }) => {
  const accessToken = await requireAccessToken(request)
  const user = await requireUser(request)

  try {
    const { data: teams } = await api.teams.findAllTeams({
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    return json({ teams, user })
  } catch (error) {
    return { teams: [], user }
  }
}

export default function Teams() {
  return (
    <>
      <div className="col-span-3 pb-6 max-w-7xl">
        <h1 className="text-gray-900 text-3xl font-bold">Invites</h1>
      </div>
    </>
  )
}
