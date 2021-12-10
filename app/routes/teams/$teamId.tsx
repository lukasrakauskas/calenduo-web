import { Link, json, useCatch, useParams, useLoaderData } from 'remix'
import type { MetaFunction, LoaderFunction } from 'remix'

import { api, Team, User } from '~/api'
import { getException } from '~/utils/exception.server'
import { requireAccessToken, requireUser } from '~/utils/session.server'

export const meta: MetaFunction = ({
  data,
}: {
  data: LoaderData | undefined
}) => {
  if (!data) {
    return {
      title: 'No team',
      description: 'No team found',
    }
  }
  return {
    title: `${data.team.name}`,
    description: `${data.team.name} page | Calenduo`,
  }
}

type LoaderData = {
  team: Team
  members: User[]
  isOwner: boolean
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const accessToken = await requireAccessToken(request)
  const user = await requireUser(request)
  const teamId = Number(params.teamId ?? -1)

  try {
    const headers = {
      Authorization: `Bearer ${accessToken}`,
    }
    const { data: team } = await api.teams.findTeamById(teamId, { headers })
    const { data: members } = await api.teams.findTeamMembers(teamId, {
      headers,
    })

    const data: LoaderData = {
      team,
      members,
      isOwner: user.id === team.ownerId,
    }
    return json(data)
  } catch (error) {
    const exception = getException(error)

    if ([404, 401].includes(exception.statusCode)) {
      throw new Response(exception.message, { status: exception.statusCode })
    }

    throw error
  }
}

export default function Team() {
  const { team, members, isOwner } = useLoaderData<LoaderData>()

  return (
    <>
      <div className="col-span-4 order-1 mx-4 pb-6 max-w-7xl sm:mx-0">
        <h1 className="text-gray-900 text-3xl font-bold">{team.name}</h1>

        <div className="flex space-x-2">
          <Link
            to="/teams"
            className="inline-flex justify-center mt-3 px-4 py-2 w-full text-gray-700 text-base font-medium hover:bg-gray-50 bg-white border border-gray-300 rounded-md focus:outline-none shadow-sm focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:ml-3 sm:mt-0 sm:w-auto sm:text-sm"
          >
            Back
          </Link>

          <Link
            to="edit"
            className="inline-flex justify-center px-4 py-2 text-white text-sm font-medium bg-indigo-600 hover:bg-indigo-700 border border-transparent rounded-md focus:outline-none shadow-sm focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Edit
          </Link>
        </div>
      </div>
      <div className="col-span-4 order-3 sm:col-span-3 sm:order-2">
        <div className="shadow sm:rounded-md sm:overflow-hidden">
          <dl>
            <div className="px-4 py-5 bg-white sm:grid sm:gap-4 sm:grid-cols-3 sm:px-6">
              <dt className="text-gray-500 text-sm font-medium">Name</dt>
              <dd className="mt-1 text-gray-900 text-sm sm:col-span-2 sm:mt-0">
                {team.name}
              </dd>
            </div>
            <div className="px-4 py-5 bg-gray-50 sm:grid sm:gap-4 sm:grid-cols-3 sm:px-6">
              <dt className="text-gray-500 text-sm font-medium">Slug</dt>
              <dd className="mt-1 text-gray-900 text-sm sm:col-span-2 sm:mt-0">
                {team.slug}
              </dd>
            </div>
            <div className="px-4 py-5 bg-white sm:grid sm:gap-4 sm:grid-cols-3 sm:px-6">
              <dt className="text-gray-500 text-sm font-medium">Members</dt>
              <dd className="mt-1 text-gray-900 text-sm sm:col-span-2 sm:mt-0">
                <ul className="border border-gray-200 rounded-md divide-gray-200 divide-y">
                  <Members members={members} isOwner={isOwner} />
                </ul>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </>
  )
}

function Members({ members, isOwner }: { members: User[]; isOwner: boolean }) {
  return (
    <>
      {members.map(member => (
        <Member key={member.id} member={member} isOwner={isOwner} />
      ))}
    </>
  )
}

function Member({ member, isOwner }: { member: User; isOwner: boolean }) {
  return (
    <li className="flex items-center justify-between pl-3 pr-4 py-3 text-sm">
      <div className="flex flex-1 items-center w-0">
        <span className="flex-1 ml-2 w-0 truncate">{member.email}</span>
      </div>
      <div className="flex flex-shrink-0 ml-4 space-x-2">
        <Link
          to={`/users/${member.id}`}
          className="hover:text-indigo-500 text-indigo-600 font-medium"
        >
          Profile
        </Link>
        {isOwner ? (
          <Link
            to={`/users/${member.id}`}
            className="hover:text-red-500 text-red-600 font-medium"
          >
            Remove
          </Link>
        ) : null}
      </div>
    </li>
  )
}

export function CatchBoundary() {
  const caught = useCatch()
  const params = useParams()
  switch (caught.status) {
    case 404: {
      return (
        <div className="error-container">
          Huh? What the heck is {params.teamId}?
        </div>
      )
    }
    case 401: {
      return (
        <div className="error-container">
          Sorry, but {params.teamId} is not your joke.
        </div>
      )
    }
    default: {
      throw new Error(`Unhandled error: ${caught.status}`)
    }
  }
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error)
  const { teamId } = useParams()
  return (
    <div>{`There was an error loading joke by the id ${teamId}. Sorry.`}</div>
  )
}
