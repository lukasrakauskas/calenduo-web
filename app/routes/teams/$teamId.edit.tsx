import {
  Link,
  useTransition,
  Form,
  redirect,
  useActionData,
  json,
  useCatch,
  useParams,
  useLoaderData,
} from 'remix'
import type {
  MetaFunction,
  LoaderFunction,
  HeadersFunction,
  ActionFunction,
} from 'remix'
import { useRef, useState } from 'react'
import { api, Team } from '~/api'
import {
  getAccessToken,
  requireAccessToken,
  requireUser,
} from '~/utils/session.server'
import clsx from 'clsx'
import { getException } from '~/utils/exception.server'
import Modal from '~/components/modal'
import invariant from 'tiny-invariant'

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
    title: `${data.team.name} settings`,
    description: `Customise ${data.team.name} settings`,
  }
}

type LoaderData = { team: Team; isOwner: boolean }

export const loader: LoaderFunction = async ({ request, params }) => {
  const accessToken = await getAccessToken(request)
  const user = await requireUser(request)
  const teamId = Number(params.teamId ?? -1)

  try {
    const { data: team } = await api.teams.findTeamById(teamId, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    const data: LoaderData = { team, isOwner: user.id === team.ownerId }
    return json(data, {
      headers: {
        'Cache-Control': `public, max-age=${60 * 5}, s-maxage=${60 * 60 * 24}`,
        Vary: 'Cookie',
      },
    })
  } catch (error) {
    const exception = getException(error)

    if ([404, 401].includes(exception.statusCode)) {
      throw new Response(exception.message, { status: exception.statusCode })
    }

    throw error
  }
}

export const headers: HeadersFunction = ({ loaderHeaders }) => {
  return {
    'Cache-Control': loaderHeaders.get('Cache-Control') ?? '',
    Vary: loaderHeaders.get('Vary') ?? '',
  }
}

type FormData = {
  name: string
  slug: string
}

export const action: ActionFunction = async ({ request, params }) => {
  const formData = await request.formData()
  const accessToken = await requireAccessToken(request)
  const teamId = Number(params.teamId ?? -1)

  try {
    if (formData.get('_method') === 'delete') {
      await api.teams.deleteTeam(teamId, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      return redirect(`/teams`)
    } else {
      const { name, slug } = Object.fromEntries(formData)

      const errors: Partial<FormData> = {}
      if (!name) errors.name = 'Name is required'
      if (!slug) errors.slug = 'Slug is required'

      if (Object.keys(errors).length) {
        return errors
      }

      invariant(typeof name === 'string')
      invariant(typeof slug === 'string')

      await api.teams.updateTeam(
        teamId,
        { name, slug },
        { headers: { Authorization: `Bearer ${accessToken}` } },
      )
      return redirect('/teams')
    }
  } catch (error) {
    const exception = getException(error)

    // TODO: handle errors better in api
    if ([400, 409].includes(exception.statusCode)) {
      return { slug: exception.message }
    }

    throw error
  }
}

export default function Team() {
  const { team, isOwner } = useLoaderData<LoaderData>() ?? {}
  const errors = useActionData()
  const transition = useTransition()

  const deleteFormRef = useRef<HTMLFormElement>(null)
  const [slug, setSlug] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <div className="col-span-4 pb-6 max-w-7xl">
        <h1 className="text-gray-900 text-3xl font-bold">
          {team?.name} settings
        </h1>
      </div>
      <div className="col-span-3">
        <Form method="delete">
          <div className="border shadow sm:rounded-md sm:overflow-hidden">
            <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-gray-700 text-sm font-medium"
                >
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  className="block flex-1 mt-1 w-full border-gray-300 focus:border-indigo-500 rounded-md focus:ring-indigo-500 sm:text-sm"
                  placeholder="Your team name"
                  defaultValue={team?.name}
                />
                {errors?.name ? (
                  <p className="mt-2 text-red-500 text-sm">{errors.name}</p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="slug"
                  className={clsx(
                    errors?.slug && 'text-red-700',
                    'block text-gray-700 text-sm font-medium',
                  )}
                >
                  Slug
                </label>
                <input
                  type="text"
                  name="slug"
                  id="slug"
                  className={clsx(
                    errors?.slug && 'border-red-500',
                    'block flex-1 mt-1 w-full border-gray-300 focus:border-indigo-500 rounded-md focus:ring-indigo-500 sm:text-sm',
                  )}
                  placeholder="Your team slug"
                  onChange={e => setSlug(e.target.value)}
                  autoComplete="off"
                  defaultValue={team?.slug}
                />
                {errors?.slug ? (
                  <p className="mt-2 text-red-500 text-sm">{errors.slug}</p>
                ) : null}
                {!!slug ? (
                  <p className="mt-2 text-gray-500 text-sm">
                    http://calenduo.com/teams/{slug.toLowerCase()}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="flex gap-x-2 justify-end px-4 py-3 bg-gray-50 sm:px-6">
              <Link
                to="/teams"
                className="inline-flex justify-center mt-3 px-4 py-2 w-full text-gray-700 text-base font-medium hover:bg-gray-50 bg-white border border-gray-300 rounded-md focus:outline-none shadow-sm focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:ml-3 sm:mt-0 sm:w-auto sm:text-sm"
              >
                Cancel
              </Link>

              <button
                type="submit"
                className="inline-flex justify-center px-4 py-2 text-white text-sm font-medium bg-indigo-600 hover:bg-indigo-700 border border-transparent rounded-md focus:outline-none shadow-sm focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                disabled={!!transition.submission}
              >
                {transition.submission ? 'Update...' : 'Update team'}
              </button>
            </div>
          </div>
        </Form>
        {isOwner ? (
          <>
            <div className="col-span-3 py-5 max-w-7xl">
              <h2 className="text-red-900 text-2xl font-bold">Danger zone</h2>
            </div>
            <Form method="delete" ref={deleteFormRef}>
              <input type="hidden" name="_method" value="delete" />
              <div className="bg-white border border-red-500 shadow sm:rounded-md sm:overflow-hidden">
                <div className="flex gap-x-2 justify-between p-4 sm:px-6">
                  <div className="">
                    <div className="text-gray-900 text-sm font-medium">
                      Delete this team
                    </div>
                    <div className="text-gray-500 text-sm">
                      Once deleted, it will be gone forever. Please be certain.
                    </div>
                  </div>
                  <button
                    type="button"
                    className="inline-flex justify-center px-4 py-2 w-full text-white text-base font-medium bg-red-600 hover:bg-red-700 border border-transparent rounded-md focus:outline-none shadow-sm focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setIsModalOpen(true)}
                  >
                    Delete team
                  </button>
                </div>
              </div>
            </Form>
          </>
        ) : null}
      </div>
      <Modal
        open={isModalOpen}
        onSubmit={() => {
          deleteFormRef.current?.submit()
        }}
        onCancel={() => setIsModalOpen(false)}
        title={`Delete team ${team?.name}`}
        content={
          <>
            <p>Are you sure you want to delete this team?</p>
            <p>This action cannot be undone.</p>
          </>
        }
        submitLabel={transition.submission ? 'Deleting...' : 'Delete team'}
        disabled={!!transition.submission}
      />
    </>
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
