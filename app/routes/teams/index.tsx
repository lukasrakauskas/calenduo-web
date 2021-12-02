import { json, Link, useLoaderData } from 'remix'
import type { LoaderFunction, MetaFunction } from 'remix'

import { api, User } from '~/api'
import type { Team } from '~/api'
import { requireAccessToken, requireUser } from '~/utils/session.server'

export const meta: MetaFunction = () => {
  return {
    title: 'Teams | Calenduo',
    description: 'View your teams in Calenduo',
  }
}

type TeamsData = {
  user: User
  teams: Team[]
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
  const { teams, user } = useLoaderData<TeamsData>()

  return (
    <>
      <div className="col-span-3 pb-6 max-w-7xl">
        <h1 className="text-gray-900 text-3xl font-bold">Teams</h1>
      </div>
      <main className="col-span-3">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {teams.length === 0 ? (
            <p className="p-6 text-gray-900">
              You don&apos;t have any teams yet.{' '}
              <Link to="new" className="text-indigo-600 hover:underline">
                Create one
              </Link>
            </p>
          ) : (
            <table className="min-w-full divide-gray-200 divide-y">
              <tbody className="divide-gray-200 divide-y">
                {teams.map(team => (
                  <TeamTableItem team={team} user={user} key={team.id} />
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </>
  )
}

function TeamTableItem({ team, user }: { team: Team; user: User }) {
  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 w-10 h-10">
            <img
              className="w-10 h-10 rounded-full"
              src="https://placekitten.com/100/100"
              alt=""
            />
          </div>
          <div className="ml-4">
            <div className="text-gray-900 text-sm font-medium">{team.name}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-right whitespace-nowrap text-sm font-medium">
        <div className="flex justify-end space-x-4">
          <Link
            to={`${team.id}`}
            className="text-indigo-600 hover:text-indigo-900"
          >
            View
          </Link>
          {user.id === team.ownerId ? (
            <Link
              to={`${team.id}/edit`}
              className="text-indigo-600 hover:text-indigo-900"
            >
              Settings
            </Link>
          ) : null}
        </div>
      </td>
    </tr>
  )
}
