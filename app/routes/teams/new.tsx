import { useState } from 'react'

import { Link, useTransition, Form, redirect, useActionData } from 'remix'
import type { MetaFunction, ActionFunction } from 'remix'

import clsx from 'clsx'
import invariant from 'tiny-invariant'

import { api } from '~/api'
import { getException } from '~/utils/exception.server'
import { requireAccessToken } from '~/utils/session.server'

export const meta: MetaFunction = () => {
  return {
    title: 'Create a team | Calenduo',
    description: 'Create a team on Calenduo',
  }
}

type FormData = {
  name: string
  slug: string
}

export const action: ActionFunction = async ({ request }) => {
  const accessToken = await requireAccessToken(request)

  const formData = await request.formData()
  const name = formData.get('name')
  const slug = formData.get('slug')

  const errors: Partial<FormData> = {}
  if (!name) errors.name = 'Name is required'
  if (!slug) errors.slug = 'Slug is required'

  if (Object.keys(errors).length) {
    return errors
  }

  invariant(typeof name === 'string')
  invariant(typeof slug === 'string')

  try {
    await api.teams.createTeam(
      { name, slug },
      { headers: { Authorization: `Bearer ${accessToken}` } },
    )
    return redirect('/teams')
  } catch (error) {
    const exception = getException(error)

    // TODO: handle errors better in api
    if ([400, 409].includes(exception.statusCode)) {
      return { slug: exception.message }
    }

    throw error
  }
}

export default function CreateTeam() {
  const errors = useActionData<Partial<FormData>>()
  const transition = useTransition()
  const [slug, setSlug] = useState('')

  return (
    <>
      <div className="col-span-4 pb-6 max-w-7xl">
        <h1 className="text-gray-900 text-3xl font-bold">Create a team</h1>
      </div>
      <div className="col-span-3">
        <Form method="post">
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
                {transition.submission ? 'Creating...' : 'Create team'}
              </button>
            </div>
          </div>
        </Form>
      </div>
    </>
  )
}
