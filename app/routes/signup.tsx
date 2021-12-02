import { Form, useActionData, useTransition } from 'remix'
import type { MetaFunction, ActionFunction, HeadersFunction } from 'remix'

import { isString } from '@tool-belt/type-predicates'

import { api } from '~/api'
import Logo from '~/components/logo'
import { createUserSession, login } from '~/utils/session.server'

export const meta: MetaFunction = () => {
  return { title: 'Sign up | Calenduo', description: 'Sign up to Calenduo' }
}

export const headers: HeadersFunction = () => {
  return {
    'Cache-Control': `public, max-age=${60 * 10}, s-maxage=${
      60 * 60 * 24 * 30
    }`,
  }
}

function validateEmail(email: unknown) {
  if (typeof email !== 'string' || email.length < 3) {
    return `Email must be at least 3 characters long`
  }
}

function validatePassword(password: unknown) {
  if (typeof password !== 'string' || password.length < 6) {
    return `Passwords must be at least 6 characters long`
  }
}

type SignupForm = {
  email: string
  password: string
  firstName: string
  lastName: string
  birthDate: string
}

type ActionData = {
  error?: string
  fields?: SignupForm
}

export const action: ActionFunction = async ({
  request,
}): Promise<Response | ActionData> => {
  const formData = await request.formData()

  const email = formData.get('email')
  const password = formData.get('password')
  const firstName = formData.get('first-name')
  const lastName = formData.get('last-name')
  const birthDate = formData.get('birth-date')

  if (
    !isString(email) ||
    !isString(password) ||
    !isString(firstName) ||
    !isString(lastName) ||
    !isString(birthDate)
  ) {
    return { error: `Form not submitted correctly.` }
  }

  const fields = { email, password, firstName, lastName, birthDate }

  const emailError = validateEmail(email)
  if (emailError) {
    return { error: emailError, fields }
  }

  const passwordError = validatePassword(password)
  if (passwordError) {
    return { error: passwordError, fields }
  }

  try {
    await api.users.createUser({
      email,
      password,
      firstName,
      lastName,
      birthDate,
    })

    const accessToken = await login({ email, password })

    if (!accessToken) {
      return {
        fields,
        error: `Failed to login after creating user.`,
      }
    }

    return createUserSession(accessToken, '/dashboard')
  } catch (error) {
    console.error(error)
    return { error: `Error creating user.`, fields }
  }
}

export default function Login() {
  const transition = useTransition()
  const actionData = useActionData<ActionData>()

  return (
    <div className="flex items-center justify-center px-4 py-12 min-h-full sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <div className="flex justify-center">
            <Logo />
          </div>
          <h2 className="mt-6 text-center text-gray-900 text-3xl font-extrabold">
            Create an account
          </h2>
        </div>
        <Form method="post" className="mt-8 space-y-6">
          <div className="mt-10 sm:mt-0">
            <div>
              <div className="mt-5 md:col-span-2 md:mt-0">
                <div className="shadow overflow-hidden sm:rounded-md">
                  <div className="px-4 py-5 bg-white sm:p-6">
                    <div className="grid gap-6 grid-cols-6">
                      <div className="col-span-6 sm:col-span-3">
                        <label
                          htmlFor="first-name"
                          className="block text-gray-700 text-sm font-medium"
                        >
                          First name
                        </label>
                        <input
                          type="text"
                          name="first-name"
                          id="first-name"
                          autoComplete="given-name"
                          className="block mt-1 w-full border-gray-300 focus:border-indigo-500 rounded-md shadow-sm focus:ring-indigo-500 sm:text-sm"
                          defaultValue={actionData?.fields?.firstName}
                        />
                      </div>

                      <div className="col-span-6 sm:col-span-3">
                        <label
                          htmlFor="last-name"
                          className="block text-gray-700 text-sm font-medium"
                        >
                          Last name
                        </label>
                        <input
                          type="text"
                          name="last-name"
                          id="last-name"
                          autoComplete="family-name"
                          className="block mt-1 w-full border-gray-300 focus:border-indigo-500 rounded-md shadow-sm focus:ring-indigo-500 sm:text-sm"
                          defaultValue={actionData?.fields?.lastName}
                        />
                      </div>

                      <div className="col-span-6">
                        <label
                          htmlFor="email-address"
                          className="block text-gray-700 text-sm font-medium"
                        >
                          Email address
                        </label>
                        <input
                          type="email"
                          name="email"
                          id="email"
                          autoComplete="email"
                          className="block mt-1 w-full border-gray-300 focus:border-indigo-500 rounded-md shadow-sm focus:ring-indigo-500 sm:text-sm"
                          defaultValue={actionData?.fields?.email}
                        />
                      </div>

                      <div className="col-span-6">
                        <label
                          htmlFor="password"
                          className="block text-gray-700 text-sm font-medium"
                        >
                          Password
                        </label>
                        <input
                          type="password"
                          name="password"
                          id="password"
                          className="block mt-1 w-full border-gray-300 focus:border-indigo-500 rounded-md shadow-sm focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>

                      <div className="col-span-6">
                        <label
                          htmlFor="birth-date"
                          className="block text-gray-700 text-sm font-medium"
                        >
                          Date of birth
                        </label>
                        <input
                          type="date"
                          name="birth-date"
                          id="birth-date"
                          autoComplete="bday"
                          className="block mt-1 w-full border-gray-300 focus:border-indigo-500 rounded-md shadow-sm focus:ring-indigo-500 sm:text-sm"
                          defaultValue={actionData?.fields?.birthDate}
                        />
                      </div>

                      <div className="col-span-6">
                        <button
                          type="submit"
                          className="inline-flex justify-center px-4 py-2 w-full text-white text-sm font-medium bg-indigo-600 hover:bg-indigo-700 border border-transparent rounded-md focus:outline-none shadow-sm focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                          {transition.submission ? 'Signing up...' : 'Sign up'}
                        </button>
                      </div>

                      {!!actionData?.error && (
                        <div className="col-span-6 mt-2 text-center text-red-600 text-sm">
                          {actionData.error}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Form>
      </div>
    </div>
  )
}
